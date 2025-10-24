import { useState, useEffect, useRef } from "react";
import { Button, message, Popconfirm, Tag, notification, Upload, Modal, Drawer, Descriptions } from "antd";
import {
  PlusOutlined,
  DeleteOutlined,
  ExportOutlined,
  ImportOutlined,
  EyeOutlined,
  DownloadOutlined,
  UploadOutlined
} from "@ant-design/icons";
import { ProTable, type ProColumns, type ActionType, ModalForm, ProFormSelect } from "@ant-design/pro-components";
import { type Stock, stockApi, type FilterOptions } from "../../api/stock";
import JSZip from "jszip";
import { saveAs } from "file-saver";
import type { UploadFile } from "antd/es/upload/interface";

export const StockPage = () => {
  const [selectedRowKeys, setSelectedRowKeys] = useState<string[]>([]);
  const [allStocks, setAllStocks] = useState<Stock[]>([]);
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({
    used: [],
    appIds: [],
    productIds: [],
    deviceIds: []
  });
  const actionRef = useRef<ActionType>(null);
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [importModalVisible, setImportModalVisible] = useState(false);
  const [detailDrawerVisible, setDetailDrawerVisible] = useState(false);
  const [selectedStock, setSelectedStock] = useState<Stock | null>(null);
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

  const columns: ProColumns<Stock>[] = [
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
      title: "创建时间范围",
      dataIndex: "dateRange",
      key: "dateRange",
      hideInTable: true,
      valueType: "dateRange",
      search: {
        transform: (value) => {
          return {
            startTime: value?.[0],
            endTime: value?.[1],
          };
        },
      }
    },
    {
      title: "App ID",
      dataIndex: "appId",
      key: "appId",
      width: 120,
      valueType: "select",
      request: async () => filterOptions.appIds
    },
    {
      title: "设备ID",
      dataIndex: "deviceId",
      key: "deviceId",
      width: 120,
      valueType: "select",
      request: async () => filterOptions.deviceIds
    },
    {
      title: "产品ID",
      dataIndex: "productId",
      key: "productId",
      width: 140,
      valueType: "select",
      request: async () => filterOptions.productIds
    },
    {
      title: "使用状态",
      dataIndex: "used",
      key: "used",
      width: 120,
      valueType: "select",
      valueEnum: {
        true: { text: '已使用', status: 'Success' },
        false: { text: '未使用', status: 'Warning' }
      },
      render: (_, record: Stock) => (
        <Tag color={record.used ? "green" : "orange"}>
          {record.used ? "已使用" : "未使用"}
        </Tag>
      )
    },
    {
      title: "用户ID",
      dataIndex: "userId",
      key: "userId",
      width: 120,
      search: false,
      ellipsis: true,
      render: (_, record: Stock) => record.userId || '-'
    },
    {
      title: "操作",
      key: "action",
      width: 200,
      fixed: "right",
      search: false,
      render: (_, record: Stock) => [
        <Button
          key="export"
          type="link"
          size="small"
          icon={<ExportOutlined />}
          onClick={() => handleSingleExport(record)}
        >
          导出JSON
        </Button>,
        <Button
          key="detail"
          type="link"
          size="small"
          icon={<EyeOutlined />}
          onClick={() => handleShowDetail(record)}
        >
          详情
        </Button>,
        <Popconfirm
          key="delete"
          title="确定删除这个库存项吗？"
          onConfirm={() => handleDelete()}
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

  const handleDelete = async () => {
    try {
      await stockApi.delete();
      message.success("删除成功");
      actionRef.current?.reload();
    } catch {
      message.error("删除失败");
    }
  };

  const handleSingleExport = async (stock: Stock) => {
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
      const selectedStocks = allStocks.filter(item => selectedRowKeys.includes(item.id));
      
      selectedStocks.forEach(stock => {
        const fileName = `stock_${stock.id}.json`;
        const jsonContent = JSON.stringify(stock, null, 2);
        zip.file(fileName, jsonContent);
      });
      
      const content = await zip.generateAsync({ type: "blob" });
      saveAs(content, `stock_batch_export_${Date.now()}.zip`);
      
      notification.success({
        message: '批量导出成功',
        description: `已导出 ${selectedRowKeys.length} 个库存项`,
        placement: 'topRight',
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
      await stockApi.batchDelete();
      message.success(`成功删除 ${selectedRowKeys.length} 个库存项`);
      setSelectedRowKeys([]);
      actionRef.current?.reload();
    } catch {
      message.error("批量删除失败");
    }
  };

  const handleShowDetail = (stock: Stock) => {
    setSelectedStock(stock);
    setDetailDrawerVisible(true);
  };

  const handleImport = async (file: File) => {
    try {
      setImporting(true);
      const text = await file.text();
      const jsonData = JSON.parse(text);
      
      const items = Array.isArray(jsonData) ? jsonData : [jsonData];
      const result = await stockApi.importFromJson(items);
      
      notification.success({
        message: '导入成功',
        description: `成功导入 ${result.success} 条数据`,
        placement: 'topRight',
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
      return false; // 阻止自动上传
    },
    fileList: uploadFileList,
    onRemove: () => {
      setUploadFileList([]);
    }
  };

  return (
    <div>
      <ProTable<Stock>
        columns={columns}
        actionRef={actionRef}
        rowKey="id"
        request={async (params, sort, filter) => {
          console.log("请求参数:", params, sort, filter);
          
          const response = await stockApi.getList({
            current: params.current || 1,
            pageSize: params.pageSize || 20,
            search: params.search,
            startTime: params.startTime,
            endTime: params.endTime,
            used: params.used !== undefined ? params.used === 'true' : undefined,
            appId: params.appId,
            productId: params.productId
          });

          // 存储数据供批量操作使用
          setAllStocks(response.items);

          return {
            data: response.items,
            success: true,
            total: response.total,
          };
        }}
        rowSelection={{
          selectedRowKeys,
          onChange: (keys) => setSelectedRowKeys(keys as string[]),
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
          persistenceKey: 'pro-table-stock-list',
          persistenceType: 'localStorage',
        }}
        toolBarRender={() => [
          <Button
            key="import"
            icon={<ImportOutlined />}
            onClick={() => setImportModalVisible(true)}
          >
            导入JSON
          </Button>,
          <Button
            key="batch-export"
            icon={<DownloadOutlined />}
            onClick={handleBatchExport}
            disabled={selectedRowKeys.length === 0}
          >
            批量导出
          </Button>,
          <Button
            key="add"
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setCreateModalVisible(true)}
          >
            新建
          </Button>,
        ]}
        pagination={{
          defaultPageSize: 20,
          showSizeChanger: true,
          pageSizeOptions: ['10', '20', '50', '100'],
        }}
        scroll={{ x: 'max-content' }}
        headerTitle="库存列表"
      />

      <ModalForm
        title="新建库存"
        width="600px"
        open={createModalVisible}
        onOpenChange={setCreateModalVisible}
        onFinish={async (values) => {
          try {
            await stockApi.create({
              appId: values.appId,
              deviceId: values.deviceId,
              productId: values.productId,
              rawData: {}
            });
            message.success("创建成功");
            actionRef.current?.reload();
            return true;
          } catch {
            message.error("创建失败");
            return false;
          }
        }}
        modalProps={{
          destroyOnClose: true,
        }}
      >
        <ProFormSelect
          name="appId"
          label="App ID"
          placeholder="请选择App ID"
          options={filterOptions.appIds}
          rules={[{ required: true, message: "请选择App ID" }]}
        />
        <ProFormSelect
          name="deviceId"
          label="设备ID"
          placeholder="请选择设备ID"
          options={filterOptions.deviceIds}
          rules={[{ required: true, message: "请选择设备ID" }]}
        />
        <ProFormSelect
          name="productId"
          label="产品ID"
          placeholder="请选择产品ID"
          options={filterOptions.productIds}
          rules={[{ required: true, message: "请选择产品ID" }]}
        />
      </ModalForm>

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
            <p className="ant-upload-hint">仅支持JSON格式文件</p>
          </Upload.Dragger>
        </div>
      </Modal>

      <Drawer
        title="库存详情"
        placement="right"
        width={600}
        open={detailDrawerVisible}
        onClose={() => setDetailDrawerVisible(false)}
      >
        {selectedStock && (
          <Descriptions column={1} bordered>
            <Descriptions.Item label="ID">{selectedStock.id}</Descriptions.Item>
            <Descriptions.Item label="创建时间">{selectedStock.createdAt}</Descriptions.Item>
            <Descriptions.Item label="更新时间">{selectedStock.updatedAt}</Descriptions.Item>
            <Descriptions.Item label="App ID">{selectedStock.appId}</Descriptions.Item>
            <Descriptions.Item label="设备ID">{selectedStock.deviceId}</Descriptions.Item>
            <Descriptions.Item label="产品ID">{selectedStock.productId}</Descriptions.Item>
            <Descriptions.Item label="使用状态">
              <Tag color={selectedStock.used ? "green" : "orange"}>
                {selectedStock.used ? "已使用" : "未使用"}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="用户ID">
              {selectedStock.userId || '-'}
            </Descriptions.Item>
            <Descriptions.Item label="原始数据">
              <pre style={{ background: '#f5f5f5', padding: '10px', borderRadius: '4px', fontSize: '12px' }}>
                {JSON.stringify(selectedStock.rawData, null, 2)}
              </pre>
            </Descriptions.Item>
          </Descriptions>
        )}
      </Drawer>
    </div>
  );
};