import { useState, useEffect, useRef, Suspense, useMemo, useCallback } from "react";
import { Button, message, Popconfirm, Tag, notification, Upload, Modal, Drawer, Descriptions, Spin } from "antd";
import {
  DeleteOutlined,
  ExportOutlined,
  ImportOutlined,
  EyeOutlined,
  DownloadOutlined,
  UploadOutlined
} from "@ant-design/icons";
import type { UploadFile } from "antd/es/upload/interface";
import { type ListStock, stockApi, type FilterOptions, type Stock } from "../../api/stock";

import JSZip from "jszip";
import { saveAs } from "file-saver";
import { ProTable, type ActionType, type ProColumns } from "@ant-design/pro-components";

export const StockPage = () => {
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
  const [detailDrawerVisible, setDetailDrawerVisible] = useState(false);
  const [stockDetail, setStockDetail] = useState<Stock | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [uploadFileList, setUploadFileList] = useState<UploadFile[]>([]);
  const [importing, setImporting] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();
  const [selectedAppId, setSelectedAppId] = useState<string>();

  useEffect(() => {
    const fetchFilterOptions = async () => {
      try {
        const options = await stockApi.getFilterOptions();
        setFilterOptions(options);
      } catch (error) {
        console.error("获取筛选选项失败:", error);
        messageApi.error("获取筛选选项失败");
      }
    };
    fetchFilterOptions();
  }, [messageApi]);

  const handleDelete = useCallback(
    async (id: number) => {
      try {
        await stockApi.batchDelete([id]);
        messageApi.success("删除成功");
        actionRef.current?.reload();
      } catch {
        messageApi.error("删除失败");
      }
    },
    [messageApi]
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

        messageApi.success("导出成功");
      } catch (error) {
        console.error("导出失败:", error);
        messageApi.error("导出失败");
      }
    },
    [messageApi]
  );

  const handleShowDetail = useCallback(
    async (stock: ListStock) => {
      setDetailDrawerVisible(true);
      setDetailLoading(true);

      try {
        const detailData = await stockApi.getStockDetail(stock.ID);
        setStockDetail(detailData);
        setDetailLoading(false);
      } catch (error) {
        console.error("获取库存详情失败:", error);
        messageApi.error("获取库存详情失败");
        setDetailLoading(false);
      }
    },
    [messageApi]
  );

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
        width: 120,
        ellipsis: true,
        copyable: true,
        search: false,
        hidden: true
      },
      {
        title: "创建日期时间",
        dataIndex: "CreatedAt",
        key: "CreatedAt",
        width: 140,
        valueType: "dateTime",
        search: false,
        sorter: true
      },
      {
        title: "日期范围",
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
        title: "App ID",
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
        title: "产品ID",
        dataIndex: "product_id",
        key: "product_id",
        width: 100,
        valueType: "select",
        valueEnum: productOptions
      },
      {
        title: "使用状态",
        dataIndex: "used",
        key: "used",
        width: 100,
        valueType: "select",
        valueEnum: {
          true: { text: "已使用", status: "Success" },
          false: { text: "未使用", status: "Warning" }
        },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        render: (_: any, record: ListStock) => (
          <Tag color={record.used ? "green" : "orange"}>{record.used ? "已使用" : "未使用"}</Tag>
        )
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
        title: "操作",
        key: "action",
        width: 180,
        fixed: "right",
        search: false,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        render: (_: any, record: ListStock) => [
          <Button
            key="export"
            type="link"
            size="small"
            icon={<ExportOutlined />}
            onClick={() => handleSingleExport(record)}
          >
            导出JSON
          </Button>,
          <Button key="detail" type="link" size="small" icon={<EyeOutlined />} onClick={() => handleShowDetail(record)}>
            详情
          </Button>,
          <Popconfirm
            key="delete"
            title="确定删除这个库存项吗？"
            onConfirm={() => handleDelete(record.ID)}
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
  }, [filterOptions, handleDelete, handleShowDetail, handleSingleExport, selectedAppId]);

  const handleBatchExport = async () => {
    if (selectedRowKeys.length === 0) {
      messageApi.warning("请选择要导出的库存项");
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
        message: "批量导出成功",
        description: `已导出 ${selectedRowKeys.length} 个库存项`,
        placement: "topRight",
        duration: 3
      });
    } catch (error) {
      console.error("批量导出失败:", error);
      messageApi.error("批量导出失败");
    }
  };

  const handleBatchDelete = async () => {
    if (selectedRowKeys.length === 0) {
      messageApi.warning("请选择要删除的库存项");
      return;
    }

    try {
      await stockApi.batchDelete(selectedRowKeys);
      messageApi.success(`成功删除 ${selectedRowKeys.length} 个库存项`);
      setSelectedRowKeys([]);
      actionRef.current?.reload();
    } catch {
      messageApi.error("批量删除失败");
    }
  };

  const handleImport = async (file: File) => {
    try {
      setImporting(true);
      const text = await file.text();
      await stockApi.importFromLiNiuJson(text);

      notification.success({
        message: "导入成功",
        description: `成功导入数据`,
        placement: "topRight",
        duration: 3
      });

      setImportModalVisible(false);
      setUploadFileList([]);
      actionRef.current?.reload();
    } catch (error) {
      console.error("导入失败:", error);
      messageApi.error("导入失败，请检查文件格式");
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

  return (
    <Suspense fallback={<Spin size="large" style={{ display: "block", textAlign: "center", padding: "100px 0" }} />}>
      {contextHolder}
      <div>
        <ProTable<ListStock>
          columns={columns}
          actionRef={actionRef}
          rowKey="ID"
          request={async (params, sort, filter) => {
            console.log("请求参数:", params, sort, filter);

            const response = await stockApi.getList({
              page: params.current || 1,
              page_size: params.pageSize || 20,
              start_date: params.startTime,
              end_date: params.endTime,
              used: params.used !== undefined ? params.used === "true" : undefined,
              app_id: params.app_id,
              product_id: params.product_id
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
              已选择 <a style={{ fontWeight: 600 }}>{selectedRowKeys.length}</a> 项
              <a style={{ marginLeft: 8 }} onClick={onCleanSelected}>
                取消选择
              </a>
            </span>
          )}
          tableAlertOptionRender={() => (
            <>
              <a onClick={handleBatchExport} style={{ marginRight: 16 }}>
                批量导出
              </a>
              <a onClick={handleBatchDelete}>批量删除</a>
            </>
          )}
          columnsState={{
            persistenceKey: "pro-table-stock-list",
            persistenceType: "localStorage"
          }}
          toolBarRender={() => [
            <Button key="import" icon={<ImportOutlined />} onClick={() => setImportModalVisible(true)}>
              导入JSON
            </Button>,
            <Button
              key="batch-export"
              icon={<DownloadOutlined />}
              onClick={handleBatchExport}
              disabled={selectedRowKeys.length === 0}
            >
              批量导出
            </Button>
          ]}
          pagination={{
            defaultPageSize: 20,
            showSizeChanger: true,
            pageSizeOptions: ["10", "20", "50", "100"]
          }}
          scroll={{ x: "max-content" }}
          headerTitle="库存列表"
          size="small"
          options={{
            density: true,
            fullScreen: true,
            reload: true,
            setting: true
          }}
        />

        <Modal
          title="导入JSON文件"
          open={importModalVisible}
          onCancel={() => {
            setImportModalVisible(false);
            setUploadFileList([]);
          }}
          footer={null}
          width="600px"
        >
          <div style={{ padding: "20px 0" }}>
            <p>请上传JSON格式的库存文件，支持单个对象或数组格式。</p>
            <Upload.Dragger {...uploadProps} disabled={importing}>
              <p className="ant-upload-drag-icon">
                <UploadOutlined />
              </p>
              <p className="ant-upload-text">点击或拖拽文件到此区域上传</p>
              <p className="ant-upload-hint">仅支持犁牛插件序列化的JSON格式文件</p>
            </Upload.Dragger>
          </div>
        </Modal>

        <Drawer
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
              <Descriptions.Item label="App ID">{stockDetail.app_id}</Descriptions.Item>
              <Descriptions.Item label="设备ID">{stockDetail.device_id}</Descriptions.Item>
              <Descriptions.Item label="产品ID">{stockDetail.product_id}</Descriptions.Item>
              <Descriptions.Item label="使用状态">
                <Tag color={stockDetail.used ? "green" : "orange"}>{stockDetail.used ? "已使用" : "未使用"}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="用户ID">{stockDetail.user_id || "-"}</Descriptions.Item>
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
        </Drawer>
      </div>
    </Suspense>
  );
};
