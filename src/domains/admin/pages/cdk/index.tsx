import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { Button, message, Popconfirm, Tag, notification } from "antd";
import { PlusOutlined, DeleteOutlined } from "@ant-design/icons";
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
import { useStore } from "../../store/hook";
import { getTranslation, formatMessage, type Language } from "../../translation";

export const CDKPage = ({ language = "zh" }: { language?: Language }) => {
  const { user, isAdmin } = useStore();
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
  const t = getTranslation(language);

  useEffect(() => {
    const fetchFilterOptions = async () => {
      try {
        const options = await cdkApi.getFilterOptions();
        setFilterOptions(options);
      } catch (error) {
        console.error("获取筛选选项失败:", error);
        messageApi.error(t.cdk.messages.getFilterOptionsError);
      }
    };
    fetchFilterOptions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messageApi]);

  const handleDelete = useCallback(
    async (code: string) => {
      try {
        await cdkApi.batchDelete([code]);
        messageApi.success(t.cdk.actions.deleteSuccess);
        actionRef.current?.reload();
      } catch {
        messageApi.error(t.cdk.actions.deleteError);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
      .filter((item) => selectedAppId && item.value.includes(selectedAppId))
      .reduce((acc, item) => {
        const val = item.value.split(".")[1];
        const label = item.label.split(".")[1];
        acc[val] = { text: label };
        return acc;
      }, {} as Record<string, { text: string }>);

    return [
      {
        title: t.cdk.columns.id,
        dataIndex: "ID",
        key: "ID",
        width: 100,
        ellipsis: true,
        copyable: true,
        search: false,
        hidden: true
      },
      {
        title: t.cdk.columns.createdAt,
        dataIndex: "CreatedAt",
        key: "CreatedAt",
        width: 100,
        valueType: "dateTime",
        search: false,
        sorter: true
      },
      {
        title: t.cdk.columns.usedAt,
        dataIndex: "redeem_at",
        key: "redeem_at",
        width: 100,
        valueType: "dateTime",
        search: false,
        sorter: true
      },
      {
        title: "Code",
        dataIndex: "code",
        key: "code",
        width: 150,
        ellipsis: true,
        copyable: true,
        search: false
      },
      {
        title: "搜索",
        key: "search",
        search: true,
        hidden: true
      },
      {
        title: t.cdk.columns.status,
        dataIndex: "used",
        key: "used",
        width: 120,
        valueType: "select",
        valueEnum: {
          true: { text: t.cdk.status.used, status: "Success" },
          false: { text: t.cdk.status.unused, status: "Warning" }
        },
        render: (_, record: CDK) => (
          <Tag color={record.used ? "green" : "blue"}>{record.used ? t.cdk.status.used : t.cdk.status.unused}</Tag>
        )
      },
      {
        title: t.cdk.columns.usedUser,
        dataIndex: "used_user",
        key: "used_user",
        search: false,
        ellipsis: true,
        width: 100
      },
      {
        title: t.cdk.columns.creator,
        dataIndex: "user_id",
        key: "user_id",
        width: 100,
        valueType: "select",
        valueEnum: userOptions,
        hidden: !isAdmin,
        search: isAdmin
      },
      {
        title: t.cdk.columns.app,
        dataIndex: "app_id",
        key: "app_id",
        width: 60,
        valueType: "select",
        valueEnum: appOptions,
        fieldProps: {
          onChange: (value: string) => {
            setSelectedAppId(value);
          }
        }
      },
      {
        title: t.cdk.columns.appProduct,
        dataIndex: "app_product_id",
        key: "app_product_id",
        width: 60,
        valueType: "select",
        valueEnum: productOptions
      },
      {
        title: t.cdk.columns.actions,
        key: "action",
        width: 120,
        fixed: "right",
        search: false,
        render: (_, record) => [
          <Popconfirm
            key="delete"
            title={t.cdk.actions.deleteConfirm}
            onConfirm={() => handleDelete(record.code)}
            okText={t.common.confirm}
            cancelText={t.common.cancel}
          >
            <Button type="link" danger size="small" icon={<DeleteOutlined />}>
              {t.cdk.actions.delete}
            </Button>
          </Popconfirm>
        ]
      }
    ];

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterOptions, selectedAppId, handleDelete, user]);

  const handleBatchCopy = async () => {
    if (selectedRowKeys.length === 0) {
      messageApi.warning(t.cdk.messages.selectToCopy);
      return;
    }

    try {
      // 使用已存储的数据
      const selectedCDKs = allCDKs.filter((item) => selectedRowKeys.includes(item.ID));

      if (selectedCDKs.length === 0) {
        messageApi.error(t.cdk.messages.notFound);
        return;
      }

      // 复制到剪切板
      await copyText(selectedCDKs.map((cdk) => cdk.code));

      // 使用 antd 通知组件
      notification.success({
        message: t.cdk.actions.copySuccess,
        description: formatMessage(t.cdk.actions.copySuccessDesc, { count: selectedRowKeys.length }),
        placement: "topRight",
        duration: 3
      });
    } catch (error) {
      console.error("复制失败:", error);
      notification.error({
        message: t.cdk.actions.copyError,
        description: t.cdk.actions.copyErrorDesc,
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
      messageApi.success(formatMessage(t.cdk.actions.batchDeleteSuccess, { count: selectedRowKeys.length }));
      setSelectedRowKeys([]);
      actionRef.current?.reload();
    } catch {
      messageApi.error(t.cdk.actions.batchDeleteError);
    }
  };

  return (
    <div>
      {contextHolder}
      <ProTable<CDK>
        columns={columns}
        actionRef={actionRef}
        rowKey="ID"
        request={async (params) => {
          const response = await cdkApi.getList({
            page: params.current || 1,
            page_size: params.pageSize || 20,
            used: params.used !== undefined ? params.used === "true" : undefined,
            app_id: params.app_id,
            app_product_id: params.app_product_id,
            user_id: params.user_id,
            code_search: params.search
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
            {t.common.selected} <a style={{ fontWeight: 600 }}>{selectedRowKeys.length}</a> 项
            <a style={{ marginLeft: 8 }} onClick={onCleanSelected}>
              {t.common.cancelSelection}
            </a>
          </span>
        )}
        tableAlertOptionRender={() => (
          <>
            <a onClick={handleBatchCopy} style={{ marginRight: 16 }}>
              {t.cdk.actions.batchCopy}
            </a>
            <a onClick={handleBatchDelete}>{t.cdk.actions.batchDelete}</a>
          </>
        )}
        columnsState={{
          persistenceKey: "pro-table-cdk-list",
          persistenceType: "localStorage"
        }}
        toolBarRender={() => [
          <Button key="add" type="primary" icon={<PlusOutlined />} onClick={() => setCreateModalVisible(true)}>
            {t.cdk.actions.create}
          </Button>
        ]}
        pagination={{
          defaultPageSize: 20,
          showSizeChanger: true,
          pageSizeOptions: ["10", "20", "50", "100"]
        }}
        scroll={{ x: 1200 }}
        headerTitle={t.cdk.listTitle}
      />

      <ModalForm
        title={t.cdk.createTitle}
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
                messageApi.error(t.cdk.messages.getFilterOptionsError);
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
            messageApi.success(formatMessage(t.cdk.form.createSuccess, { count: values.quantity }));
            actionRef.current?.reload();
            await sleep(1000); // 等待1秒后关闭弹窗
            return true;
          } catch {
            messageApi.error(t.cdk.form.createError);
            return false;
          }
        }}
        modalProps={{
          destroyOnClose: true
        }}
      >
        <ProFormSelect
          name="appId"
          label={t.cdk.form.app}
          placeholder={t.cdk.form.appPlaceholder}
          options={createFilterOptions.app_ids}
          rules={[{ required: true, message: t.cdk.form.appRequired }]}
          onChange={(value: string) => {
            setSelectedAppIdCreate(value);
          }}
        />
        <ProFormSelect
          name="productId"
          label={t.cdk.form.appProduct}
          placeholder={t.cdk.form.appProductPlaceholder}
          options={createFilterOptions.product_ids
            .filter((item) => !selectedAppIdCreate || item.value.includes(selectedAppIdCreate))
            .map((item) => ({
              label: item.label.split(".")[1],
              value: item.value.split(".")[1]
            }))}
          rules={[{ required: true, message: t.cdk.form.appProductRequired }]}
          dependencies={[selectedAppIdCreate]}
        />
        <ProFormText
          name="quantity"
          label={t.cdk.form.quantity}
          placeholder={t.cdk.form.quantityPlaceholder}
          fieldProps={{
            type: "number",
            min: 1,
            max: 1000
          }}
          rules={[
            { required: true, message: t.cdk.form.quantityRequired },
            {
              type: "number",
              min: 1,
              max: 1000,
              message: t.cdk.form.quantityRange,
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
