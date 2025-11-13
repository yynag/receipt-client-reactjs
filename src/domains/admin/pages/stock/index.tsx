import { useState, useEffect, useRef, Suspense, useMemo, useCallback } from "react";
import { Button, message, Popconfirm, Tag, notification, Upload, Modal, Spin } from "antd";
import { DeleteOutlined, ExportOutlined, DownloadOutlined, UploadOutlined } from "@ant-design/icons";
import type { UploadFile } from "antd/es/upload/interface";
import { type ListStock, stockApi, type FilterOptions } from "../../api/stock";

import JSZip from "jszip";
import { saveAs } from "file-saver";
import { ProTable, type ActionType, type ProColumns } from "@ant-design/pro-components";
import { useStore } from "../../store/hook";
import { getTranslation, formatMessage, type Language } from "../../translation";
import { externalApi } from "../../api/external";

export const StockPage = ({ language = "zh" }: { language?: Language }) => {
  const { isAdmin } = useStore();
  const [selectedRowKeys, setSelectedRowKeys] = useState<number[]>([]);
  const [allStocks, setAllStocks] = useState<ListStock[]>([]);
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({
    used: [],
    app_ids: [],
    product_ids: [],
    user_ids: []
  });
  const actionRef = useRef<ActionType>(null);
  const [importModalVisible, setImportModalVisible] = useState(false);
  const [batchImportModalVisible, setBatchImportModalVisible] = useState(false);
  // const [detailDrawerVisible, setDetailDrawerVisible] = useState(false);
  // const [stockDetail, setStockDetail] = useState<Stock | null>(null);
  // const [detailLoading, setDetailLoading] = useState(false);
  const [uploadFileList, setUploadFileList] = useState<UploadFile[]>([]);
  const [batchUploadFileList, setBatchUploadFileList] = useState<UploadFile[]>([]);
  const [importing, setImporting] = useState(false);
  const [batchImporting, setBatchImporting] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();
  const [selectedAppId, setSelectedAppId] = useState<string>();
  const t = getTranslation(language);

  useEffect(() => {
    const fetchFilterOptions = async () => {
      try {
        const options = await stockApi.getFilterOptions();
        setFilterOptions(options);
      } catch (error) {
        console.error("获取筛选选项失败:", error);
        messageApi.error(t.stock.messages.getFilterOptionsError);
      }
    };
    fetchFilterOptions();
  }, [messageApi, t.stock.messages.getFilterOptionsError]);

  const handleDelete = useCallback(
    async (id: number) => {
      try {
        await stockApi.batchDelete([id]);
        messageApi.success(t.stock.actions.deleteSuccess);
        actionRef.current?.reload();
      } catch {
        messageApi.error(t.stock.actions.deleteError);
      }
    },
    [messageApi, t.stock.actions.deleteError, t.stock.actions.deleteSuccess]
  );

  const handleSingleExport = useCallback(
    async (stock: ListStock) => {
      try {
        const zip = new JSZip();
        const fileName = `stock_${stock.ID}_${Date.now()}.json`;
        const jsonContent = JSON.stringify(stock, null, 2);

        zip.file(fileName, jsonContent);

        const content = await zip.generateAsync({ type: "blob" });
        saveAs(content, `stock_export_${stock.ID}.zip`);

        messageApi.success(t.stock.actions.exportSuccess);
      } catch (error) {
        console.error("导出失败:", error);
        messageApi.error(t.stock.actions.exportError);
      }
    },
    [messageApi, t.stock.actions.exportError, t.stock.actions.exportSuccess]
  );

  // const handleShowDetail = useCallback(
  //   async (stock: ListStock) => {
  //     setDetailDrawerVisible(true);
  //     setDetailLoading(true);

  //     try {
  //       const detailData = await stockApi.getStockDetail(stock.ID);
  //       setStockDetail(detailData);
  //       setDetailLoading(false);
  //     } catch (error) {
  //       console.error("获取库存详情失败:", error);
  //       messageApi.error("获取库存详情失败");
  //       setDetailLoading(false);
  //     }
  //   },
  //   [messageApi]
  // );

  const columns: ProColumns<ListStock>[] = useMemo(() => {
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
        title: "ID",
        dataIndex: "ID",
        key: "ID",
        width: 120,
        ellipsis: true,
        copyable: true,
        search: false,
        hidden: true
      },
      {
        title: t.stock.columns.createdAt,
        dataIndex: "CreatedAt",
        key: "CreatedAt",
        width: 140,
        valueType: "dateTime",
        search: false
      },
      {
        title: t.stock.columns.receiptCreatedAt,
        dataIndex: "receipt_created_at",
        key: "receipt_created_at",
        width: 140,
        valueType: "dateTime",
        search: false
      },
      {
        title: t.stock.columns.dateRange,
        dataIndex: "dateRange",
        key: "dateRange",
        hideInTable: true,
        valueType: "dateRange",
        search: {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          transform: (value: any) => {
            return {
              startTime: value?.[0],
              endTime: value?.[1]
            };
          }
        }
      },
      {
        title: t.stock.columns.app,
        dataIndex: "app_id",
        key: "app_id",
        width: 100,
        valueType: "select",
        valueEnum: appOptions,
        fieldProps: {
          onChange: (value: string) => {
            setSelectedAppId(value);
          }
        }
      },
      {
        title: t.stock.columns.appProduct,
        dataIndex: "product_id",
        key: "product_id",
        width: 100,
        valueType: "select",
        valueEnum: productOptions
      },
      {
        title: t.stock.columns.status,
        dataIndex: "used",
        key: "used",
        width: 100,
        valueType: "select",
        valueEnum: {
          true: { text: t.stock.status.used, status: "Success" },
          false: { text: t.stock.status.unused, status: "Warning" }
        },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        render: (_: any, record: ListStock) => (
          <Tag color={record.used ? "green" : "orange"}>
            {record.used ? t.stock.status.used : t.stock.status.unused}
          </Tag>
        )
      },
      {
        title: t.stock.columns.creator,
        dataIndex: "user_id",
        key: "user_id",
        width: 80,
        valueType: "select",
        valueEnum: userOptions,
        hidden: !isAdmin,
        search: isAdmin
      },
      {
        title: t.stock.columns.actions,
        key: "action",
        width: 180,
        fixed: "right",
        search: false,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        render: (_: any, record: ListStock) => [
          isAdmin && (
            <Button
              key="export"
              type="link"
              size="small"
              icon={<ExportOutlined />}
              onClick={() => handleSingleExport(record)}
            >
              {t.stock.actions.exportJson}
            </Button>
          ),
          // <Button key="detail" type="link" size="small" icon={<EyeOutlined />} onClick={() => handleShowDetail(record)}>
          //   详情
          // </Button>,
          <Popconfirm
            key="delete"
            title={t.stock.actions.deleteConfirm}
            onConfirm={() => handleDelete(record.ID)}
            okText={t.common.confirm}
            cancelText={t.common.cancel}
          >
            <Button type="link" danger size="small" icon={<DeleteOutlined />}>
              {t.stock.actions.delete}
            </Button>
          </Popconfirm>
        ]
      }
    ];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterOptions, handleDelete, handleSingleExport, selectedAppId]);

  const handleBatchImport = async (list?: string[]) => {
    if (!list) {
      setBatchImportModalVisible(true);
      return;
    }
    for (const item of list) {
      await externalApi.importFromFM(item);
    }
    setBatchImportModalVisible(false);
    setBatchUploadFileList([]);
  };

  const handleBatchExport = async () => {
    if (selectedRowKeys.length === 0) {
      messageApi.warning(t.stock.messages.selectToExport);
      return;
    }

    try {
      const zip = new JSZip();
      const selectedStocks = allStocks.filter((item) => selectedRowKeys.includes(item.ID));

      selectedStocks.forEach((stock) => {
        const fileName = `stock_${stock.ID}.json`;
        const jsonContent = JSON.stringify(stock, null, 2);
        zip.file(fileName, jsonContent);
      });

      const content = await zip.generateAsync({ type: "blob" });
      saveAs(content, `stock_batch_export_${Date.now()}.zip`);

      notification.success({
        message: t.stock.actions.batchExportSuccess,
        description: formatMessage(t.stock.actions.batchExportSuccessDesc, { count: selectedRowKeys.length }),
        placement: "topRight",
        duration: 3
      });
    } catch (error) {
      console.error("批量导出失败:", error);
      messageApi.error(t.stock.actions.batchExportError);
    }
  };

  const handleBatchDelete = async () => {
    if (selectedRowKeys.length === 0) {
      messageApi.warning(t.stock.messages.selectToDelete);
      return;
    }

    try {
      await stockApi.batchDelete(selectedRowKeys);
      messageApi.success(formatMessage(t.stock.actions.batchDeleteSuccess, { count: selectedRowKeys.length }));
      setSelectedRowKeys([]);
      actionRef.current?.reload();
    } catch {
      messageApi.error(t.stock.actions.batchDeleteError);
    }
  };

  const handleImport = async (file: File) => {
    try {
      setImporting(true);
      const text = await file.text();
      await stockApi.importFromLiNiuJson(text);

      notification.success({
        message: t.stock.actions.importSuccess,
        description: t.stock.actions.importSuccessDesc,
        placement: "topRight",
        duration: 3
      });

      setImportModalVisible(false);
      setUploadFileList([]);
      actionRef.current?.reload();
    } catch (error) {
      console.error("导入失败:", error);
      messageApi.error(t.stock.actions.importError);
    } finally {
      setImporting(false);
    }
  };

  const uploadProps = {
    accept: ".json",
    beforeUpload: (file: File) => {
      handleImport(file);
      return false;
    },
    fileList: uploadFileList,
    onRemove: () => {
      setUploadFileList([]);
    }
  };

  const batchUploadProps = {
    multiple: true,
    accept: ".json",
    beforeUpload: (file: File) => {
      // 阻止自动上传，加入列表
      setBatchUploadFileList((prev) => [
        ...prev,
        {
          uid: `${Date.now()}-${file.name}-${Math.random()}`,
          name: file.name,
          status: "done",
          originFileObj: file
        } as UploadFile
      ]);
      return false;
    },
    fileList: batchUploadFileList,
    onRemove: (file: UploadFile) => {
      setBatchUploadFileList((prev) => prev.filter((f) => f.uid !== file.uid));
    }
  };

  const handleConfirmBatchImport = async () => {
    if (batchUploadFileList.length === 0) {
      messageApi.warning("请先选择要导入的 JSON 文件");
      return;
    }
    console.error(11111);
    setBatchImporting(true);
    try {
      const result: string[] = [];
      for (const uf of batchUploadFileList) {
        const file = uf.originFileObj as File | undefined;
        if (!file) continue;
        const text = (await file.text()).trim();
        if (text.charAt(0) === "#") {
          // 特殊处理
          const lines = text
            .substring(1, text.length)
            .split("\n")
            .map((a) => a.trim());
          result.push(...lines);
        } else if (text.charAt(0) === "[") {
          // 数组
          const parsed = JSON.parse(text) as Array<unknown>;
          result.push(...parsed.map((it) => JSON.stringify(it)));
        } else if (text.charAt(0) === "{") {
          // 对象
          result.push(text);
        } else {
          throw new Error("不支持的文件格式");
        }
      }
      await handleBatchImport(result);
      messageApi.success("批量导入成功");
    } catch (e) {
      messageApi.error("批量导入失败: " + e);
    } finally {
      setBatchImporting(false);
    }
  };

  return (
    <Suspense fallback={<Spin size="large" style={{ display: "block", textAlign: "center", padding: "100px 0" }} />}>
      {contextHolder}
      <div>
        <ProTable<ListStock>
          columns={columns}
          actionRef={actionRef}
          rowKey="ID"
          request={async (params) => {
            const response = await stockApi.getList({
              page: params.current || 1,
              page_size: params.pageSize || 20,
              start_date: params.startTime,
              end_date: params.endTime,
              used: params.used,
              app_id: params.app_id,
              product_id: params.product_id,
              user_id: params.user_id
            });

            // 存储数据供批量操作使用
            setAllStocks(response.items);

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
              <a onClick={handleBatchExport} style={{ marginRight: 16 }}>
                {t.stock.actions.batchExport}
              </a>
              <a onClick={handleBatchDelete}>{t.stock.actions.batchDelete}</a>
            </>
          )}
          columnsState={{
            persistenceKey: "pro-table-stock-list",
            persistenceType: "localStorage"
          }}
          toolBarRender={() => [
            // <Button key="import" icon={<ImportOutlined />} onClick={() => setImportModalVisible(true)}>
            //   {t.stock.actions.importJson}
            // </Button>,
            <Button key="batch-import-fm" icon={<UploadOutlined />} onClick={() => handleBatchImport()}>
              批量导入FM
            </Button>,
            isAdmin && (
              <Button
                key="batch-export"
                icon={<DownloadOutlined />}
                onClick={handleBatchExport}
                disabled={selectedRowKeys.length === 0}
              >
                {t.stock.actions.batchExport}
              </Button>
            )
          ]}
          pagination={{
            defaultPageSize: 20,
            showSizeChanger: true,
            pageSizeOptions: ["10", "20", "50", "100"]
          }}
          scroll={{ x: "max-content" }}
          headerTitle={t.stock.listTitle}
          size="small"
          options={{
            density: true,
            fullScreen: true,
            reload: true,
            setting: true
          }}
        />

        <Modal
          title={t.stock.importTitle}
          open={importModalVisible}
          onCancel={() => {
            setImportModalVisible(false);
            setUploadFileList([]);
          }}
          footer={null}
          width="600px"
        >
          <div style={{ padding: "20px 0" }}>
            <p>{t.stock.upload.formatInfo}</p>
            <Upload.Dragger {...uploadProps} disabled={importing}>
              <p className="ant-upload-drag-icon">
                <UploadOutlined />
              </p>
              <p className="ant-upload-text">{t.stock.upload.dragText}</p>
              <p className="ant-upload-hint">{t.stock.upload.dragHint}</p>
            </Upload.Dragger>
          </div>
        </Modal>

        <Modal
          title="批量导入FM"
          open={batchImportModalVisible}
          onCancel={() => {
            setBatchImportModalVisible(false);
            setBatchUploadFileList([]);
          }}
          onOk={handleConfirmBatchImport}
          confirmLoading={batchImporting}
          okText="开始导入"
          cancelText={t.common.cancel}
          width="640px"
        >
          <div style={{ padding: "12px 0" }}>
            <Upload.Dragger {...batchUploadProps} disabled={batchImporting}>
              <p className="ant-upload-drag-icon">
                <UploadOutlined />
              </p>
              <p className="ant-upload-text">点击或拖拽 JSON 文件到此处</p>
              <p className="ant-upload-hint">可一次选择多个文件，内容将自动解析</p>
              <p className="ant-upload-hint">特殊处理：一个JSON文件里，凭证按行分割，最前面加个 #</p>
            </Upload.Dragger>
          </div>
        </Modal>

        {/* <Drawer
          title="库存详情"
          placement="right"
          width={600}
          open={detailDrawerVisible}
          onClose={() => {
            setDetailDrawerVisible(false);
            setStockDetail(null);
          }}
          loading={detailLoading}
        >
          {stockDetail && (
            <Descriptions column={1} bordered>
              <Descriptions.Item label="ID">{stockDetail.ID}</Descriptions.Item>
              <Descriptions.Item label="创建时间">{stockDetail.CreatedAt}</Descriptions.Item>
              <Descriptions.Item label="更新时间">{stockDetail.updatedAt}</Descriptions.Item>
              <Descriptions.Item label="应用">{stockDetail.app_id}</Descriptions.Item>
              <Descriptions.Item label="设备ID">{stockDetail.device_id}</Descriptions.Item>
              <Descriptions.Item label="应用商品">{stockDetail.product_id}</Descriptions.Item>
              <Descriptions.Item label="使用状态">
                <Tag color={stockDetail.used ? "green" : "orange"}>{stockDetail.used ? "已使用" : "未使用"}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="用户">{stockDetail.user_id || "-"}</Descriptions.Item>
              {stockDetail.raw_data && (
                <Descriptions.Item label="原始数据">
                  <div
                    style={{
                      background: "#f5f5f5",
                      padding: "10px",
                      borderRadius: "4px",
                      fontSize: "12px",
                      maxHeight: "200px",
                      overflow: "auto",
                      whiteSpace: "pre-wrap",
                      wordBreak: "break-all"
                    }}
                  >
                    {JSON.stringify(stockDetail.raw_data, null, 2)}
                  </div>
                </Descriptions.Item>
              )}
            </Descriptions>
          )}
        </Drawer> */}
      </div>
    </Suspense>
  );
};
