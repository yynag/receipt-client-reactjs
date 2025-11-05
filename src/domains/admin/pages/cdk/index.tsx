import { useState, useEffect, useRef, useMemo, useCallback } from "react";
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
import { type CDK, cdkApi, type FilterOptions } from "../../api/cdk";
import { sleep } from "../../api/shared";
import { stockApi } from "../../api/stock";

export const CDKPage = () => {
  const [selectedRowKeys, setSelectedRowKeys] = useState<number[]>([]);
  const [allCDKs, setAllCDKs] = useState<CDK[]>([]);
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({
    used: [],
    app_ids: [],
    product_ids: [],
    user_ids: []
  });
  const [createFilterOptions, setCreateFilterOptions] = useState<FilterOptions>({
    used: [],
    app_ids: [],
    product_ids: [],
    user_ids: []
  }); // 用于创建的，从Stock拿
  const [selectedAppIdCreate, setSelectedAppIdCreate] = useState<string>();
  const [selectedAppId, setSelectedAppId] = useState<string>();
  const actionRef = useRef<ActionType>(null);
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();

  useEffect(() => {
    const fetchFilterOptions = async () => {
      try {
        const options = await cdkApi.getFilterOptions();
        setFilterOptions(options);
      } catch (error) {
        console.error("获取筛选选项失败:", error);
        messageApi.error("获取筛选选项失败");
      }
    };
    fetchFilterOptions();
  }, [messageApi]);

  const handleDelete = useCallback(
    async (code: string) => {
      try {
        await cdkApi.batchDelete([code]);
        messageApi.success("删除成功");
        actionRef.current?.reload();
      } catch {
        messageApi.error("删除失败");
      }
    },
    [messageApi]
  );

  const columns: ProColumns<CDK>[] = useMemo(() => {
    const userOptions = filterOptions.user_ids.reduce((acc, item) => {
      acc[item.value] = { text: item.label };
      return acc;
    }, {} as Record<string, { text: string }>);

    const appOptions = filterOptions.app_ids.reduce((acc, item) => {
      acc[item.value] = { text: item.label };
      return acc;
    }, {} as Record<string, { text: string }>);

    const productOptions = filterOptions.product_ids
      .filter((item) => !selectedAppId || item.value.includes(selectedAppId))
      .reduce((acc, item) => {
        const val = item.value.split(".")[1];
        const label = item.label.split(".")[1];
        acc[val] = { text: label };
        return acc;
      }, {} as Record<string, { text: string }>);

    return [
      {
        title: "ID",
        dataIndex: "ID",
        key: "ID",
        width: 100,
        ellipsis: true,
        copyable: true,
        search: false,
        hidden: true
      },
      {
        title: "创建时间",
        dataIndex: "CreatedAt",
        key: "CreatedAt",
        width: 160,
        valueType: "dateTime",
        search: false,
        sorter: true
      },
      {
        title: "CDK Code",
        dataIndex: "code",
        key: "code",
        width: 200,
        ellipsis: true,
        copyable: true,
        search: false
      },
      {
        title: "使用状态",
        dataIndex: "used",
        key: "used",
        width: 120,
        valueType: "select",
        valueEnum: {
          true: { text: "已使用", status: "Success" },
          false: { text: "未使用", status: "Warning" }
        },
        render: (_, record: CDK) => (
          <Tag color={record.used ? "green" : "blue"}>{record.used ? "已使用" : "未使用"}</Tag>
        )
      },
      {
        title: "使用用户",
        dataIndex: "used_user",
        key: "used_user",
        search: false,
        ellipsis: true,
        width: 150
      },
      {
        title: "库存ID",
        dataIndex: "stock_id",
        key: "stock_id",
        width: 120,
        search: false,
        ellipsis: true
      },
      {
        title: "创建人",
        dataIndex: "user_id",
        key: "user_id",
        width: 120,
        valueType: "select",
        valueEnum: userOptions
      },
      {
        title: "App ID",
        dataIndex: "app_id",
        key: "app_id",
        width: 120,
        valueType: "select",
        valueEnum: appOptions,
        fieldProps: {
          onChange: (value: string) => {
            setSelectedAppId(value);
          }
        }
      },
      {
        title: "App产品ID",
        dataIndex: "app_product_id",
        key: "app_product_id",
        width: 140,
        valueType: "select",
        valueEnum: productOptions
      },
      {
        title: "操作",
        key: "action",
        width: 120,
        fixed: "right",
        search: false,
        render: (_, record) => [
          <Button
            key="edit"
            type="link"
            size="small"
            icon={<EditOutlined />}
            onClick={() => messageApi.info("编辑功能开发中")}
          >
            编辑
          </Button>,
          <Popconfirm
            key="delete"
            title="确定删除这个CDK吗？"
            onConfirm={() => handleDelete(record.code)}
            okText="确定"
            cancelText="取消"
          >
            <Button type="link" danger size="small" icon={<DeleteOutlined />}>
              删除
            </Button>
          </Popconfirm>
        ]
      }
    ];
  }, [filterOptions, selectedAppId, messageApi, handleDelete]);

  const handleBatchCopy = async () => {
    if (selectedRowKeys.length === 0) {
      messageApi.warning("请选择要复制的CDK");
      return;
    }

    try {
      // 使用已存储的数据
      const selectedCDKs = allCDKs.filter((item) => selectedRowKeys.includes(item.ID));

      if (selectedCDKs.length === 0) {
        messageApi.error("未找到选中的CDK数据");
        return;
      }

      // 复制到剪切板
      await copyText(selectedCDKs.map((cdk) => cdk.code));

      // 使用 antd 通知组件
      notification.success({
        message: "复制成功",
        description: `已复制 ${selectedRowKeys.length} 个CDK到剪切板`,
        placement: "topRight",
        duration: 3
      });
    } catch (error) {
      console.error("复制失败:", error);
      notification.error({
        message: "复制失败",
        description: "请重试",
        placement: "topRight",
        duration: 3
      });
    }
  };

  const copyText = async (codes: string[]) => {
    const copyText = codes.join("\n");
    navigator.clipboard.writeText(copyText);
  };

  const handleBatchDelete = async () => {
    if (selectedRowKeys.length === 0) {
      messageApi.warning("请选择要删除的CDK");
      return;
    }

    const codes = allCDKs.filter((item) => selectedRowKeys.includes(item.ID)).map((cdk) => cdk.code);

    try {
      await cdkApi.batchDelete(codes);
      messageApi.success(`成功删除 ${selectedRowKeys.length} 个CDK`);
      setSelectedRowKeys([]);
      actionRef.current?.reload();
    } catch {
      messageApi.error("批量删除失败");
    }
  };

  return (
    <div>
      {contextHolder}
      <ProTable<CDK>
        columns={columns}
        actionRef={actionRef}
        rowKey="ID"
        request={async (params, sort, filter) => {
          console.log("请求参数:", params, sort, filter);

          const response = await cdkApi.getList({
            page: params.current || 1,
            page_size: params.pageSize || 20,
            used: params.used !== undefined ? params.used === "true" : undefined,
            app_id: params.app_id,
            app_product_id: params.app_product_id,
            user_id: params.user_id
          });

          // 存储数据供复制功能使用
          setAllCDKs(response.items);

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
          persistenceKey: "pro-table-cdk-list",
          persistenceType: "localStorage"
        }}
        toolBarRender={() => [
          <Button key="add" type="primary" icon={<PlusOutlined />} onClick={() => setCreateModalVisible(true)}>
            新建
          </Button>
        ]}
        pagination={{
          defaultPageSize: 20,
          showSizeChanger: true,
          pageSizeOptions: ["10", "20", "50", "100"]
        }}
        scroll={{ x: 1200 }}
        headerTitle="CDK 列表"
      />

      <ModalForm
        title="新建CDK"
        width="600px"
        open={createModalVisible}
        onOpenChange={(open) => {
          if (open) {
            const fetchFilterOptions = async () => {
              try {
                const options = await stockApi.getFilterOptions();
                setCreateFilterOptions(options);
              } catch (error) {
                console.error("获取筛选选项失败:", error);
                messageApi.error("获取筛选选项失败");
              }
            };
            fetchFilterOptions();
          }
          setCreateModalVisible(open);
        }}
        onFinish={async (values) => {
          try {
            const codes = await cdkApi.create({
              app_id: values.appId,
              product_id: values.productId,
              amount: values.quantity
            });
            copyText(codes); // 复制到剪切板
            messageApi.success(`成功创建 ${values.quantity} 个CDK，并复制到剪切板`);
            actionRef.current?.reload();
            await sleep(1000); // 等待1秒后关闭弹窗
            return true;
          } catch {
            messageApi.error("创建CDK失败");
            return false;
          }
        }}
        modalProps={{
          destroyOnClose: true
        }}
      >
        <ProFormSelect
          name="appId"
          label="App ID"
          placeholder="请选择App ID"
          options={createFilterOptions.app_ids}
          rules={[{ required: true, message: "请选择App ID" }]}
          onChange={(value: string) => {
            setSelectedAppIdCreate(value);
          }}
        />
        <ProFormSelect
          name="productId"
          label="产品ID"
          placeholder="请选择产品ID"
          options={createFilterOptions.product_ids
            .filter((item) => !selectedAppIdCreate || item.value.includes(selectedAppIdCreate))
            .map((item) => ({
              label: item.label.split(".")[1],
              value: item.value.split(".")[1]
            }))}
          rules={[{ required: true, message: "请选择产品ID" }]}
          dependencies={[selectedAppIdCreate]}
        />
        <ProFormText
          name="quantity"
          label="添加数量"
          placeholder="请输入添加数量"
          fieldProps={{
            type: "number",
            min: 1,
            max: 1000
          }}
          rules={[
            { required: true, message: "请输入添加数量" },
            {
              type: "number",
              min: 1,
              max: 1000,
              message: "数量必须在1-1000之间",
              transform(value) {
                return Number(value);
              }
            }
          ]}
        />
      </ModalForm>
    </div>
  );
};
