import { useState, useEffect, useRef } from 'react';
import { Button, message, Popconfirm, Tag, notification } from 'antd';
import { PlusOutlined, DeleteOutlined, EditOutlined } from '@ant-design/icons';
import {
  ProTable,
  type ProColumns,
  type ActionType,
  ModalForm,
  ProFormSelect,
  ProFormText,
} from '@ant-design/pro-components';
import { type ListUser, type UserFilterOptions, userApi } from '../../api/user';
import './styles.css';

export const UserPage = () => {
  const [selectedRowKeys, setSelectedRowKeys] = useState<number[]>([]);
  const [allUsers, setAllUsers] = useState<ListUser[]>([]);
  const [filterOptions, setFilterOptions] = useState<UserFilterOptions>({
    roles: [],
  });
  const actionRef = useRef<ActionType>(null);
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingUser, setEditingUser] = useState<ListUser | null>(null);
  const [messageApi, contextHolder] = message.useMessage();

  useEffect(() => {
    const fetchFilterOptions = async () => {
      try {
        const options = await userApi.getFilterOptions();
        setFilterOptions(options);
      } catch (error) {
        console.error('获取筛选选项失败:', error);
        messageApi.error('获取筛选选项失败');
      }
    };
    fetchFilterOptions();
  }, [messageApi]);

  const columns: ProColumns<ListUser>[] = [
    {
      title: 'id',
      dataIndex: 'id',
      key: 'id',
      width: 100,
      ellipsis: true,
      copyable: true,
      search: false,
      hidden: true,
    },
    {
      title: '创建时间',
      dataIndex: 'created_at',
      key: 'created_at',
      width: 160,
      valueType: 'dateTime',
      search: false,
      sorter: true,
    },
    {
      title: '用户',
      dataIndex: 'user_id',
      key: 'user_id',
      width: 200,
      ellipsis: true,
      copyable: true,
      search: true,
      render: (text) => <span className="user-id-cell">{text}</span>,
    },
    {
      title: '角色',
      dataIndex: 'role',
      key: 'role',
      width: 120,
      valueType: 'select',
      valueEnum: {
        admin: { text: 'Admin', status: 'Processing' },
        instock: { text: 'Instock', status: 'Default' },
      },
      render: (_, record: ListUser) => (
        <Tag color={record.role === 'admin' ? 'blue' : 'green'}>
          {record.role === 'admin' ? 'Admin' : 'Instock'}
        </Tag>
      ),
    },
    {
      title: '额度',
      dataIndex: 'total_amount',
      key: 'total_amount',
      width: 60,
      valueType: 'digit',
    },
    {
      title: '额度使用量',
      dataIndex: 'consumed_amount',
      key: 'consumed_amount',
      width: 60,
      valueType: 'digit',
    },
    {
      title: '操作',
      key: 'action',
      width: 120,
      fixed: 'right',
      search: false,
      render: (_, record: ListUser) => [
        <Button key="edit" type="link" size="small" icon={<EditOutlined />} onClick={() => handleEdit(record)}>
          编辑
        </Button>,
        <Popconfirm
          key="delete"
          title="确定删除这个用户吗？"
          onConfirm={() => handleDelete(record.id)}
          okText="确定"
          cancelText="取消"
        >
          <Button type="link" danger size="small" icon={<DeleteOutlined />}>
            删除
          </Button>
        </Popconfirm>,
      ],
    },
  ];

  const handleEdit = (user: ListUser) => {
    setEditingUser(user);
    setEditModalVisible(true);
  };

  const handleDelete = async (id: number) => {
    try {
      await userApi.batchDelete([id]);
      messageApi.success('删除成功');
      actionRef.current?.reload();
    } catch {
      messageApi.error('删除失败');
    }
  };

  const handleBatchDelete = async () => {
    if (selectedRowKeys.length === 0) {
      messageApi.warning('请选择要删除的用户');
      return;
    }

    try {
      await userApi.batchDelete(selectedRowKeys);
      messageApi.success(`成功删除 ${selectedRowKeys.length} 个用户`);
      setSelectedRowKeys([]);
      actionRef.current?.reload();
    } catch {
      messageApi.error('批量删除失败');
    }
  };

  const handleBatchCopy = async () => {
    if (selectedRowKeys.length === 0) {
      messageApi.warning('请选择要复制的用户');
      return;
    }

    try {
      const selectedUsers = allUsers.filter((item) => selectedRowKeys.includes(item.id));

      if (selectedUsers.length === 0) {
        messageApi.error('未找到选中的用户数据');
        return;
      }

      const copyText = selectedUsers
        .map((user) => `${user.user_id} (${user.role === 'admin' ? 'Admin' : 'Instock'})`)
        .join('\n');

      await navigator.clipboard.writeText(copyText);

      notification.success({
        message: '复制成功',
        description: `已复制 ${selectedRowKeys.length} 个用户信息到剪切板`,
        placement: 'topRight',
        duration: 3,
      });
    } catch (error) {
      console.error('复制失败:', error);
      notification.error({
        message: '复制失败',
        description: '请重试',
        placement: 'topRight',
        duration: 3,
      });
    }
  };

  return (
    <div className="user-management-page">
      {contextHolder}
      <ProTable<ListUser>
        columns={columns}
        actionRef={actionRef}
        rowKey="ID"
        request={async (params, sort, filter) => {
          console.log('请求参数:', params, sort, filter);

          const response = await userApi.getList({
            current: params.current || 1,
            page_size: params.pageSize || 20,
            keywords: params.user_id,
            role: params.role as 'admin' | 'instock',
          });

          setAllUsers(response.items);

          return {
            data: response.items,
            success: true,
            total: response.total,
          };
        }}
        rowSelection={{
          selectedRowKeys,
          onChange: (keys) => setSelectedRowKeys(keys as number[]),
        }}
        tableAlertRender={({ selectedRowKeys, onCleanSelected }) => (
          <span>
            已选择 <a style={{ fontWeight: 600 }}>{selectedRowKeys.length}</a> 项
            <a style={{ marginLeft: 8 }} onClick={onCleanSelected}>
              取消选择
            </a>
          </span>
        )}
        tableAlertOptionRender={() => (
          <>
            <a onClick={handleBatchCopy} style={{ marginRight: 16 }}>
              复制到剪切板
            </a>
            <a onClick={handleBatchDelete}>批量删除</a>
          </>
        )}
        columnsState={{
          persistenceKey: 'pro-table-user-list',
          persistenceType: 'localStorage',
        }}
        toolBarRender={() => [
          <Button key="add" type="primary" icon={<PlusOutlined />} onClick={() => setCreateModalVisible(true)}>
            新建
          </Button>,
        ]}
        pagination={{
          defaultPageSize: 20,
          showSizeChanger: true,
          pageSizeOptions: ['10', '20', '50', '100'],
        }}
        scroll={{ x: 'max-content' }}
        headerTitle="用户列表"
      />

      <ModalForm
        title="新建用户"
        width="500px"
        open={createModalVisible}
        onOpenChange={setCreateModalVisible}
        onFinish={async (values) => {
          try {
            await userApi.create({
              user_id: values.user_id,
              password: values.password,
              role: values.role,
              amount: parseInt(values.amount),
            });
            messageApi.success('创建用户成功');
            actionRef.current?.reload();
            return true;
          } catch {
            messageApi.error('创建用户失败');
            return false;
          }
        }}
        modalProps={{
          destroyOnClose: true,
        }}
      >
        <ProFormText
          name="user_id"
          label="用户"
          placeholder="请输入用户ID（邮箱或手机号）"
          rules={[
            { required: true, message: '请输入用户ID' },
            {
              pattern: /^[a-zA-Z0-9@._-]+$/,
              message: '用户ID只能包含字母、数字、@、.、_、-',
            },
          ]}
        />
        <ProFormText
          name="password"
          label="密码"
          placeholder="请输入用户密码"
          rules={[{ required: true, message: '请输入用户密码' }]}
        />
        <ProFormSelect
          name="role"
          label="角色"
          placeholder="请选择角色"
          options={filterOptions.roles}
          rules={[{ required: true, message: '请选择角色' }]}
        />
        <ProFormText
          name="amount"
          label="额度"
          fieldProps={{
            type: 'number',
            min: 1,
            max: 1000000,
            step: 100,
          }}
          rules={[
            { required: true, message: '请输入额度' },
            { pattern: /^\d+$/, message: '必须是整数' },
          ]}
        />
      </ModalForm>

      <ModalForm
        title="编辑用户"
        width="500px"
        open={editModalVisible}
        onOpenChange={setEditModalVisible}
        initialValues={
          editingUser
            ? {
                user_id: editingUser.user_id,
                role: editingUser.role,
                amount: editingUser.total_amount,
              }
            : undefined
        }
        onFinish={async (values) => {
          if (!editingUser) return false;

          try {
            await userApi.update(editingUser.id, {
              user_id: values.user_id,
              role: values.role,
              password: values.password,
              amount: parseInt(values.amount),
            });
            messageApi.success('更新用户成功');
            actionRef.current?.reload();
            setEditModalVisible(false);
            setEditingUser(null);
            return true;
          } catch {
            messageApi.error('更新用户失败');
            return false;
          }
        }}
        modalProps={{
          destroyOnClose: true,
        }}
      >
        <ProFormText
          name="user_id"
          label="用户"
          placeholder="请输入用户ID（邮箱或手机号）"
          rules={[
            { required: true, message: '请输入用户ID' },
            {
              pattern: /^[a-zA-Z0-9@._-]+$/,
              message: '用户ID只能包含字母、数字、@、.、_、-',
            },
          ]}
        />
        <ProFormText name="password" label="密码" placeholder="请输入用户密码" />
        <ProFormSelect
          name="role"
          label="角色"
          placeholder="请选择角色"
          options={filterOptions.roles}
          rules={[{ required: true, message: '请选择角色' }]}
        />
        <ProFormText
          name="amount"
          label="额度"
          fieldProps={{
            type: 'number',
            min: 1,
            max: 10000000,
            step: 100,
          }}
          rules={[
            { required: true, message: '请输入额度' },
            { pattern: /^\d+$/, message: '必须是整数' },
          ]}
        />
      </ModalForm>
    </div>
  );
};
