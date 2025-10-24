import { useState, useEffect, useRef } from "react";
import { Button, message, Popconfirm, Tag, notification, Upload, Modal, Drawer, Descriptions } from "antd";
import {
  DeleteOutlined,
  ExportOutlined,
  ImportOutlined,
  EyeOutlined,
  DownloadOutlined,
  UploadOutlined
} from "@ant-design/icons";
import { ProTable, type ProColumns, type ActionType } from "@ant-design/pro-components";
import { type ListStock, stockApi, type FilterOptions, type Stock } from "../../api/stock";
import JSZip from "jszip";
import { saveAs } from "file-saver";
import type { UploadFile } from "antd/es/upload/interface";

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

  useEffect(() => {
    fetchFilterOptions();
  }, []);

  const fetchFilterOptions = async () => {
    try {
      const options = await stockApi.getFilterOptions();
      setFilterOptions(options);
    } catch (error) {
      console.error("获取筛选选项失败:", error);
      message.error("获取筛选选项失败");
    }
  };

  const columns: ProColumns<ListStock>[] = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
      width: 120,
      ellipsis: true,
      copyable: true,
      search: false
    },
    {
      title: "创建日期时间",
      dataIndex: "createdAt",
      key: "createdAt",
      width: 160,
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
        transform: (value) => {
          return {
            startTime: value?.[0],
            endTime: value?.[1]
          };
        }
      }
    },
    {
      title: "App ID",
      dataIndex: "appId",
      key: "appId",
      width: 120,
      valueType: "select",
      request: async () => filterOptions.app_ids
    },
    {
      title: "产品ID",
      dataIndex: "productId",
      key: "productId",
      width: 140,
      valueType: "select",
      request: async () => filterOptions.product_ids
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
      render: (_, record: ListStock) => (
        <Tag color={record.used ? "green" : "orange"}>{record.used ? "已使用" : "未使用"}</Tag>
      )
    },
    {
      title: "用户ID",
      dataIndex: "userId",
      key: "userId",
      width: 120,
      search: false,
      ellipsis: true,
      render: (_, record: ListStock) => record.user_id || "-"
    },
    {
      title: "操作",
      key: "action",
      width: 200,
      fixed: "right",
      search: false,
      render: (_, record: ListStock) => [
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
          onConfirm={() => handleDelete(record.id)}
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

  const handleDelete = async (id: number) => {
    try {
      await stockApi.batchDelete([id]);
      message.success("删除成功");
      actionRef.current?.reload();
    } catch {
      message.error("删除失败");
    }
  };

  const handleSingleExport = async (stock: ListStock) => {
    try {
      const zip = new JSZip();
      const fileName = `stock_${stock.id}_${Date.now()}.json`;
      const jsonContent = JSON.stringify(stock, null, 2);

      zip.file(fileName, jsonContent);

      const content = await zip.generateAsync({ type: "blob" });
      saveAs(content, `stock_export_${stock.id}.zip`);

      message.success("导出成功");
    } catch (error) {
      console.error("导出失败:", error);
      message.error("导出失败");
    }
  };

  const handleBatchExport = async () => {
    if (selectedRowKeys.length === 0) {
      message.warning("请选择要导出的库存项");
      return;
    }

    try {
      const zip = new JSZip();
      const selectedStocks = allStocks.filter((item) => selectedRowKeys.includes(item.id));

      selectedStocks.forEach((stock) => {
        const fileName = `stock_${stock.id}.json`;
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
      message.error("批量导出失败");
    }
  };

  const handleBatchDelete = async () => {
    if (selectedRowKeys.length === 0) {
      message.warning("请选择要删除的库存项");
      return;
    }

    try {
      await stockApi.batchDelete(selectedRowKeys);
      message.success(`成功删除 ${selectedRowKeys.length} 个库存项`);
      setSelectedRowKeys([]);
      actionRef.current?.reload();
    } catch {
      message.error("批量删除失败");
    }
  };

  const handleShowDetail = async (stock: ListStock) => {
    setDetailDrawerVisible(true);
    setDetailLoading(true);

    try {
      const detailData = await stockApi.getStockDetail(stock.id);
      setStockDetail(detailData);
      setDetailLoading(false);
    } catch (error) {
      console.error("获取库存详情失败:", error);
      message.error("获取库存详情失败");
      setDetailLoading(false);
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
      message.error("导入失败，请检查文件格式");
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
    <div>
      <ProTable<ListStock>
        columns={columns}
        actionRef={actionRef}
        rowKey="id"
        request={async (params, sort, filter) => {
          console.log("请求参数:", params, sort, filter);

          const response = await stockApi.getListMock({
            page: params.current || 1,
            page_size: params.pageSize || 20,
            start_date: params.startTime,
            end_date: params.endTime,
            used: params.used !== undefined ? params.used === "true" : undefined,
            app_id: params.appId,
            product_id: params.productId
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
            <Descriptions.Item label="ID">{stockDetail.id}</Descriptions.Item>
            <Descriptions.Item label="创建时间">{stockDetail.createdAt}</Descriptions.Item>
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
                <pre
                  style={{
                    background: "#f5f5f5",
                    padding: "10px",
                    borderRadius: "4px",
                    fontSize: "12px",
                    maxHeight: "300px",
                    overflow: "auto"
                  }}
                >
                  {JSON.stringify(stockDetail.raw_data, null, 2)}
                </pre>
              </Descriptions.Item>
            )}
          </Descriptions>
        )}
      </Drawer>
    </div>
  );
};
