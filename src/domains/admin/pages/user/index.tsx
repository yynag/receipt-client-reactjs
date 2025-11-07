import { useState, useEffect, useRef } from "react";
import { Button, message, Popconfirm, Tag, notification } from "antd";
import { PlusOutlined, DeleteOutlined, EditOutlined } from "@ant-design/icons";
import {
  ProTable,
  type ProColumns,
  type ActionType,
  ModalForm,
  ProFormSelect,
  ProFormText
} from "@ant-design/pro-components";
import { type ListUser, type UserFilterOptions, userApi } from "../../api/user";
import { getTranslation, formatMessage, type Language } from "../../translation";
import "./styles.css";

export const UserPage = ({ language = "zh" }: { language?: Language }) => {
  const [selectedRowKeys, setSelectedRowKeys] = useState<number[]>([]);
  const [allUsers, setAllUsers] = useState<ListUser[]>([]);
  const [filterOptions, setFilterOptions] = useState<UserFilterOptions>({
    roles: []
  });
  const actionRef = useRef<ActionType>(null);
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingUser, setEditingUser] = useState<ListUser | null>(null);
  const [messageApi, contextHolder] = message.useMessage();
  const t = getTranslation(language);

  useEffect(() => {
    const fetchFilterOptions = async () => {
      try {
        const options = await userApi.getFilterOptions();
        setFilterOptions(options);
      } catch (error) {
        console.error("获取筛选选项失败:", error);
        messageApi.error(t.user.messages.getFilterOptionsError);
      }
    };
    fetchFilterOptions();
  }, [messageApi]);

  const columns: ProColumns<ListUser>[] = [
    {
      title: "id",
      dataIndex: "id",
      key: "id",
      width: 100,
      ellipsis: true,
      copyable: true,
      search: false,
      hidden: true
    },
    {
      title: t.user.columns.createdAt,
      dataIndex: "created_at",
      key: "created_at",
      width: 160,
      valueType: "dateTime",
      search: false,
      sorter: true
    },
    {
      title: t.user.columns.user,
      dataIndex: "user_id",
      key: "user_id",
      width: 200,
      ellipsis: true,
      copyable: true,
      search: true,
      render: (text) => <span className="user-id-cell">{text}</span>
    },
    {
      title: t.user.columns.role,
      dataIndex: "role",
      key: "role",
      width: 120,
      valueType: "select",
      valueEnum: {
        admin: { text: t.user.roles.admin, status: "Processing" },
        instock: { text: t.user.roles.instock, status: "Default" }
      },
      render: (_, record: ListUser) => (
        <Tag color={record.role === "admin" ? "blue" : "green"}>
          {record.role === "admin" ? t.user.roles.admin : t.user.roles.instock}
        </Tag>
      )
    },
    {
      title: t.user.columns.total_amount,
      dataIndex: "total_amount",
      key: "total_amount",
      width: 60,
      valueType: "digit"
    },
    {
      title: t.user.columns.consumed_amount,
      dataIndex: "consumed_amount",
      key: "consumed_amount",
      width: 60,
      valueType: "digit"
    },
    {
      title: t.user.columns.actions,
      key: "action",
      width: 120,
      fixed: "right",
      search: false,
      render: (_, record: ListUser) => [
        <Button key="edit" type="link" size="small" icon={<EditOutlined />} onClick={() => handleEdit(record)}>
          {t.user.actions.edit}
        </Button>,
        <Popconfirm
          key="delete"
          title={t.user.actions.deleteConfirm}
          onConfirm={() => handleDelete(record.id)}
          okText={t.common.confirm}
          cancelText={t.common.cancel}
        >
          <Button type="link" danger size="small" icon={<DeleteOutlined />}>
            {t.user.actions.delete}
          </Button>
        </Popconfirm>
      ]
    }
  ];

  const handleEdit = (user: ListUser) => {
    setEditingUser(user);
    setEditModalVisible(true);
  };

  const handleDelete = async (id: number) => {
    try {
      await userApi.batchDelete([id]);
      messageApi.success(t.user.actions.deleteSuccess);
      actionRef.current?.reload();
    } catch {
      messageApi.error(t.user.actions.deleteError);
    }
  };

  const handleBatchDelete = async () => {
    if (selectedRowKeys.length === 0) {
      messageApi.warning("请选择要删除的用户");
      return;
    }

    try {
      await userApi.batchDelete(selectedRowKeys);
      messageApi.success(formatMessage(t.user.actions.batchDeleteSuccess, { count: selectedRowKeys.length }));
      setSelectedRowKeys([]);
      actionRef.current?.reload();
    } catch {
      messageApi.error(t.user.actions.batchDeleteError);
    }
  };

  const handleBatchCopy = async () => {
    if (selectedRowKeys.length === 0) {
      messageApi.warning(t.user.messages.selectToCopy);
      return;
    }

    try {
      const selectedUsers = allUsers.filter((item) => selectedRowKeys.includes(item.id));

      if (selectedUsers.length === 0) {
        messageApi.error(t.user.messages.notFound);
        return;
      }

      const copyText = selectedUsers
        .map((user) => `${user.user_id} (${user.role === "admin" ? t.user.roles.admin : t.common.instock})`)
        .join("\n");

      await navigator.clipboard.writeText(copyText);

      notification.success({
        message: t.user.actions.copySuccess,
        description: formatMessage(t.user.actions.copySuccessDesc, { count: selectedRowKeys.length }),
        placement: "topRight",
        duration: 3
      });
    } catch (error) {
      console.error("复制失败:", error);
      notification.error({
        message: t.user.actions.copyError,
        description: t.user.actions.copyErrorDesc,
        placement: "topRight",
        duration: 3
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
          console.log("请求参数:", params, sort, filter);

          const response = await userApi.getList({
            current: params.current || 1,
            page_size: params.pageSize || 20,
            keywords: params.user_id,
            role: params.role as "admin" | "instock"
          });

          setAllUsers(response.items);

          return {
            data: response.items,
            success: true,
            total: response.total
          };
        }}
        rowSelection={{
          selectedRowKeys,
          onChange: (keys) => setSelectedRowKeys(keys as number[])
        }}
        tableAlertRender={({ selectedRowKeys, onCleanSelected }) => (
          <span>
            {t.common.selected} <a style={{ fontWeight: 600 }}>{selectedRowKeys.length}</a> 项
            <a style={{ marginLeft: 8 }} onClick={onCleanSelected}>
              {t.common.cancelSelection}
            </a>
          </span>
        )}
        tableAlertOptionRender={() => (
          <>
            <a onClick={handleBatchCopy} style={{ marginRight: 16 }}>
              {t.user.actions.batchCopy}
            </a>
            <a onClick={handleBatchDelete}>{t.user.actions.batchDelete}</a>
          </>
        )}
        columnsState={{
          persistenceKey: "pro-table-user-list",
          persistenceType: "localStorage"
        }}
        toolBarRender={() => [
          <Button key="add" type="primary" icon={<PlusOutlined />} onClick={() => setCreateModalVisible(true)}>
            {t.user.actions.create}
          </Button>
        ]}
        pagination={{
          defaultPageSize: 20,
          showSizeChanger: true,
          pageSizeOptions: ["10", "20", "50", "100"]
        }}
        scroll={{ x: "max-content" }}
        headerTitle={t.user.listTitle}
      />

      <ModalForm
        title={t.user.createTitle}
        width="500px"
        open={createModalVisible}
        onOpenChange={setCreateModalVisible}
        onFinish={async (values) => {
          try {
            await userApi.create({
              user_id: values.user_id,
              password: values.password,
              role: values.role,
              amount: parseInt(values.amount)
            });
            messageApi.success(t.user.form.createSuccess);
            actionRef.current?.reload();
            return true;
          } catch {
            messageApi.error(t.user.form.createError);
            return false;
          }
        }}
        modalProps={{
          destroyOnClose: true
        }}
      >
        <ProFormText
          name="user_id"
          label={t.user.form.user}
          placeholder={t.user.form.userPlaceholder}
          rules={[
            { required: true, message: t.user.form.userRequired },
            {
              pattern: /^[a-zA-Z0-9@._-]+$/,
              message: t.user.form.userPattern
            }
          ]}
        />
        <ProFormText
          name="password"
          label={t.user.form.password}
          placeholder={t.user.form.passwordPlaceholder}
          rules={[{ required: true, message: t.user.form.passwordRequired }]}
        />
        <ProFormSelect
          name="role"
          label={t.user.form.role}
          placeholder={t.user.form.rolePlaceholder}
          options={filterOptions.roles}
          rules={[{ required: true, message: t.user.form.roleRequired }]}
        />
        <ProFormText
          name="amount"
          label={t.user.form.amount}
          fieldProps={{
            type: "number",
            min: 1,
            max: 1000000,
            step: 100
          }}
          rules={[
            { required: true, message: t.user.form.amountRequired },
            { pattern: /^\d+$/, message: t.user.form.amountMustIntRequired }
          ]}
        />
      </ModalForm>

      <ModalForm
        title={t.user.editTitle}
        width="500px"
        open={editModalVisible}
        onOpenChange={setEditModalVisible}
        initialValues={
          editingUser
            ? {
                user_id: editingUser.user_id,
                role: editingUser.role,
                amount: editingUser.total_amount
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
              amount: parseInt(values.amount)
            });
            messageApi.success(t.user.form.updateSuccess);
            actionRef.current?.reload();
            setEditModalVisible(false);
            setEditingUser(null);
            return true;
          } catch {
            messageApi.error(t.user.form.updateError);
            return false;
          }
        }}
        modalProps={{
          destroyOnClose: true
        }}
      >
        <ProFormText
          name="user_id"
          label={t.user.form.user}
          placeholder={t.user.form.userPlaceholder}
          rules={[
            { required: true, message: t.user.form.userRequired },
            {
              pattern: /^[a-zA-Z0-9@._-]+$/,
              message: t.user.form.userPattern
            }
          ]}
        />
        <ProFormText name="password" label={t.user.form.password} placeholder={t.user.form.passwordPlaceholder} />
        <ProFormSelect
          name="role"
          label={t.user.form.role}
          placeholder={t.user.form.rolePlaceholder}
          options={filterOptions.roles}
          rules={[{ required: true, message: t.user.form.roleRequired }]}
        />
        <ProFormText
          name="amount"
          label={t.user.form.amount}
          fieldProps={{
            type: "number",
            min: 1,
            max: 10000000,
            step: 100
          }}
          rules={[
            { required: true, message: t.user.form.amountRequired },
            { pattern: /^\d+$/, message: t.user.form.amountMustIntRequired }
          ]}
        />
      </ModalForm>
    </div>
  );
};
