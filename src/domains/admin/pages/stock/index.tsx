import { DeleteOutlined, DownloadOutlined, ExportOutlined, UploadOutlined } from '@ant-design/icons';
import { Button, Input, InputNumber, message, Modal, notification, Popconfirm, Spin, Tag, Upload } from 'antd';
import type { UploadFile } from 'antd/es/upload/interface';
import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { stockApi, type FilterOptions, type ListStock } from '../../api/stock';

import { ProTable, type ActionType, type ProColumns } from '@ant-design/pro-components';
import { saveAs } from 'file-saver';
import JSZip from 'jszip';
import { externalApi } from '../../api/external';
import { useStore } from '../../store/hook';
import { parse_stock_excel } from './stock_excel';

export const StockPage = () => {
  const { isAdmin } = useStore();
  const [selectedRowKeys, setSelectedRowKeys] = useState<number[]>([]);
  const [allStocks, setAllStocks] = useState<ListStock[]>([]);
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({
    used: [],
    app_ids: [],
    product_ids: [],
    user_ids: [],
  });
  const actionRef = useRef<ActionType>(null);
  const [importModalVisible, setImportModalVisible] = useState(false);
  const [batchImportModalVisible, setBatchImportModalVisible] = useState(false);
  const [importIosVisible, setImportIosVisible] = useState(false);
  // const [detailDrawerVisible, setDetailDrawerVisible] = useState(false);
  // const [stockDetail, setStockDetail] = useState<Stock | null>(null);
  // const [detailLoading, setDetailLoading] = useState(false);
  const [uploadFileList, setUploadFileList] = useState<UploadFile[]>([]);
  const [batchUploadFileList, setBatchUploadFileList] = useState<UploadFile[]>([]);
  const [importing, setImporting] = useState(false);
  const [batchImporting, setBatchImporting] = useState(false);
  const [batchUploadCount, setBatchUploadCount] = useState<number>(50);
  const [country, setCountry] = useState<string>('us');
  const [messageApi, contextHolder] = message.useMessage();
  const [selectedAppId, setSelectedAppId] = useState<string>();

  useEffect(() => {
    const fetchFilterOptions = async () => {
      try {
        const options = await stockApi.getFilterOptions();
        setFilterOptions(options);
      } catch (error) {
        console.error('获取筛选选项失败:', error);
        messageApi.error('获取筛选选项失败');
      }
    };
    fetchFilterOptions();
  }, [messageApi]);

  const handleDelete = useCallback(
    async (id: number) => {
      try {
        await stockApi.batchDelete([id]);
        messageApi.success('删除成功');
        actionRef.current?.reload();
      } catch {
        messageApi.error('删除失败');
      }
    },
    [messageApi],
  );

  const handleSingleExport = useCallback(
    async (stock: ListStock) => {
      try {
        const zip = new JSZip();
        const fileName = `stock_${stock.id}_${Date.now()}.json`;
        const jsonContent = JSON.stringify(stock, null, 2);

        zip.file(fileName, jsonContent);

        const content = await zip.generateAsync({ type: 'blob' });
        saveAs(content, `stock_export_${stock.id}.zip`);

        messageApi.success('导出成功');
      } catch (error) {
        console.error('导出失败:', error);
        messageApi.error('导出失败');
      }
    },
    [messageApi],
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
    const userOptions = filterOptions.user_ids.reduce(
      (acc, item) => {
        acc[item.value] = { text: item.label };
        return acc;
      },
      {} as Record<string, { text: string }>,
    );

    const appOptions = filterOptions.app_ids.reduce(
      (acc, item) => {
        acc[item.value] = { text: item.label };
        return acc;
      },
      {} as Record<string, { text: string }>,
    );

    const productOptions = filterOptions.product_ids
      .filter((item) => selectedAppId && item.value.includes(selectedAppId))
      .reduce(
        (acc, item) => {
          const val = item.value.split('.')[1];
          const label = item.label.split('.')[1];
          acc[val] = { text: label };
          return acc;
        },
        {} as Record<string, { text: string }>,
      );
    return [
      {
        title: 'ID',
        dataIndex: 'id',
        key: 'id',
        width: 50,
        ellipsis: true,
        search: true,
        hidden: false,
      },
      {
        title: 'CDK',
        key: 'cdk',
        width: 50,
        search: true,
        hidden: true,
      },
      {
        title: '凭证创建时间',
        dataIndex: 'receipt_created_at',
        key: 'receipt_created_at',
        width: 90,
        valueType: 'dateTime',
        search: false,
      },
      {
        title: '入库时间',
        dataIndex: 'created_at',
        key: 'created_at',
        width: 90,
        valueType: 'dateTime',
        search: false,
      },
      {
        title: '使用时间',
        dataIndex: 'receipt_used_at',
        key: 'receipt_used_at',
        width: 90,
        valueType: 'dateTime',
        search: false,
      },
      {
        title: '日期范围',
        dataIndex: 'dateRange',
        key: 'dateRange',
        hideInTable: true,
        valueType: 'dateRange',
        search: {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          transform: (value: any) => {
            return {
              startTime: value?.[0],
              endTime: value?.[1],
            };
          },
        },
      },
      {
        title: '应用',
        dataIndex: 'app_id',
        key: 'app_id',
        width: 80,
        valueType: 'select',
        valueEnum: appOptions,
        fieldProps: {
          onChange: (value: string) => {
            setSelectedAppId(value);
          },
        },
      },
      {
        title: '应用商品',
        dataIndex: 'product_id',
        key: 'product_id',
        width: 80,
        valueType: 'select',
        valueEnum: productOptions,
      },
      {
        title: '创建人',
        dataIndex: 'user_id',
        key: 'user_id',
        width: 80,
        valueType: 'select',
        valueEnum: userOptions,
        hidden: !isAdmin,
        search: isAdmin,
      },
      {
        title: '使用状态',
        dataIndex: 'used',
        key: 'used',
        width: 30,
        valueType: 'select',
        valueEnum: {
          true: { text: '已使用', status: 'Success' },
          false: { text: '未使用', status: 'Warning' },
        },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        render: (_: any, record: ListStock) => (
          <Tag color={record.used ? 'green' : 'orange'}>{record.used ? '已使用' : '未使用'}</Tag>
        ),
      },
      {
        title: '使用数据',
        dataIndex: 'used_data',
        key: 'used_data',
        ellipsis: true,
        search: false,
        valueType: 'text',
        onCell: () => ({
          style: {
            maxWidth: 200,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          },
        }),
      },
      {
        title: '操作',
        key: 'action',
        width: 180,
        fixed: 'right',
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
              导出JSON
            </Button>
          ),
          // <Button key="detail" type="link" size="small" icon={<EyeOutlined />} onClick={() => handleShowDetail(record)}>
          //   详情
          // </Button>,
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
          </Popconfirm>,
        ],
      },
    ];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterOptions, handleDelete, handleSingleExport, selectedAppId]);

  const handleBatchImport = async (type: string, list?: string[]) => {
    if (!list) {
      setBatchImportModalVisible(true);
      return;
    }
    const steps = Math.floor(list.length / batchUploadCount) + 1; // 基本每份大小
    const result = [];
    for (let i = 0; i < steps; i++) {
      const start = i * batchUploadCount;
      const end =
        i === batchUploadCount - 1
          ? list.length // 最后一份拿剩余全部
          : (i + 1) * batchUploadCount;

      result.push(list.slice(start, end));
    }

    messageApi.info('开始导入，会自动跳过重复...');

    for (const batch of result) {
      await externalApi
        .importFromRaws(type, batch)
        .catch((e: Error) => {
          messageApi.error(`导入出现错误：${e.message}`);
        })
        .finally(() => {
          messageApi.success(`成功处理：${batch.length}条`);
        });
    }

    setBatchImportModalVisible(false);
    setBatchUploadFileList([]);
  };

  const handleBatchExport = async () => {
    if (selectedRowKeys.length === 0) {
      messageApi.warning('请选择要导出的库存项');
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

      const content = await zip.generateAsync({ type: 'blob' });
      saveAs(content, `stock_batch_export_${Date.now()}.zip`);

      notification.success({
        message: '批量导出成功',
        description: `已导出 ${selectedRowKeys.length} 个库存项`,
        placement: 'topRight',
        duration: 3,
      });
    } catch (error) {
      console.error('批量导出失败:', error);
      messageApi.error('批量导出失败');
    }
  };

  const handleBatchDelete = async () => {
    if (selectedRowKeys.length === 0) {
      messageApi.warning('请选择要删除的库存项');
      return;
    }

    try {
      await stockApi.batchDelete(selectedRowKeys);
      messageApi.success(`成功删除 ${selectedRowKeys.length} 个库存项`);
      setSelectedRowKeys([]);
      actionRef.current?.reload();
    } catch {
      messageApi.error('批量删除失败');
    }
  };

  const handleImport = async (file: File) => {
    try {
      setImporting(true);
      const text = await file.text();
      await stockApi.importFromLiNiuJson(text);

      notification.success({
        message: '导入成功',
        description: '成功导入数据',
        placement: 'topRight',
        duration: 3,
      });

      setImportModalVisible(false);
      setUploadFileList([]);
      actionRef.current?.reload();
    } catch (error) {
      console.error('导入失败:', error);
      messageApi.error('导入失败，请检查文件格式');
    } finally {
      setImporting(false);
    }
  };

  const uploadProps = {
    accept: '.json',
    beforeUpload: (file: File) => {
      handleImport(file);
      return false;
    },
    fileList: uploadFileList,
    onRemove: () => {
      setUploadFileList([]);
    },
  };

  const batchUploadProps = {
    multiple: true,
    accept: '.json,.xlsx',
    beforeUpload: (file: File) => {
      // 阻止自动上传，加入列表
      setBatchUploadFileList((prev) => [
        ...prev,
        {
          uid: `${Date.now()}-${file.name}-${Math.random()}`,
          name: file.name,
          status: 'done',
          originFileObj: file,
          type: file.type,
        } as UploadFile,
      ]);
      return false;
    },
    fileList: batchUploadFileList,
    onRemove: (file: UploadFile) => {
      setBatchUploadFileList((prev) => prev.filter((f) => f.uid !== file.uid));
    },
  };

  const handleConfirmBatchImport = async () => {
    if (batchUploadFileList.length === 0) {
      messageApi.warning('请先选择要导入的 JSON 文件');
      return;
    }
    setBatchImporting(true);
    try {
      const result: string[] = [];
      let fileType = '';
      for (const uf of batchUploadFileList) {
        const file = uf.originFileObj as File | undefined;
        if (!file) continue;
        if (file?.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
          fileType = 'ios_excel';
          const data = await file.arrayBuffer();
          const rows = parse_stock_excel(data);
          if (rows.length === 0) {
            messageApi.error('Excel 文件解析失败');
            return;
          }
          result.push(
            ...rows.map((row) => {
              return JSON.stringify({ ...row, country });
            }),
          );
        } else {
          fileType = 'android_json';
          const text = (await file.text()).trim();
          if (text.charAt(0) === '#') {
            // 特殊处理
            const sharp2 = text.indexOf('#', 1);
            const country = text.substring(1, sharp2);
            const lines = text
              .substring(sharp2 + 1, text.length)
              .split('\n')
              .map((a) => {
                const b = JSON.parse(a.trim());
                b['country'] = country;
                return JSON.stringify(b);
              });
            result.push(...lines);
          } else if (text.charAt(0) === '[') {
            // 数组
            const parsed = JSON.parse(text) as Array<unknown>;
            result.push(...parsed.map((it) => JSON.stringify(it)));
          } else if (text.charAt(0) === '{') {
            // 对象
            result.push(text);
          } else {
            throw new Error('不支持的文件格式');
          }
        }
      }
      await handleBatchImport(fileType, result);
      messageApi.success('批量导入成功');
    } catch (e) {
      messageApi.error('批量导入失败: ' + e);
    } finally {
      setBatchImporting(false);
    }
  };

  return (
    <Suspense fallback={<Spin size="large" style={{ display: 'block', textAlign: 'center', padding: '100px 0' }} />}>
      {contextHolder}
      <div>
        <ProTable<ListStock>
          columns={columns}
          search={{
            defaultCollapsed: false,
          }}
          actionRef={actionRef}
          rowKey="ID"
          request={async (params) => {
            const response = await stockApi.getList({
              id: params.id,
              cdk: params.cdk,
              page: params.current || 1,
              page_size: params.pageSize || 20,
              start_date: params.startTime,
              end_date: params.endTime,
              used: params.used,
              app_id: params.app_id,
              product_id: params.product_id,
              user_id: params.user_id,
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
            // <Button key="import" icon={<ImportOutlined />} onClick={() => setImportModalVisible(true)}>
            //   {t.stock.actions.importJson}
            // </Button>,
            <Button key="batch-import-fm" icon={<UploadOutlined />} onClick={() => setBatchImportModalVisible(true)}>
              批量导入Raw
            </Button>,
            <Button key="batch-import-ios" icon={<UploadOutlined />} onClick={() => setImportIosVisible(true)}>
              批量导入iOS购买凭证
            </Button>,
            isAdmin && (
              <Button
                key="batch-export"
                icon={<DownloadOutlined />}
                onClick={handleBatchExport}
                disabled={selectedRowKeys.length === 0}
              >
                批量导出
              </Button>
            ),
          ]}
          pagination={{
            defaultPageSize: 20,
            showSizeChanger: true,
            pageSizeOptions: ['10', '20', '50', '100'],
          }}
          scroll={{ x: 'max-content' }}
          headerTitle="库存列表"
          size="small"
          options={{
            density: true,
            fullScreen: true,
            reload: true,
            setting: true,
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
          <div style={{ padding: '20px 0' }}>
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

        <Modal
          title="批量导入Raw"
          open={batchImportModalVisible}
          onCancel={() => {
            setBatchImportModalVisible(false);
            setBatchUploadFileList([]);
          }}
          onOk={handleConfirmBatchImport}
          confirmLoading={batchImporting}
          okText="开始导入"
          cancelText="取消"
          width="640px"
        >
          <div style={{ padding: '12px 0' }}>
            <div style={{ marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
              <span>单次批量上传个数</span>
              <InputNumber
                min={1}
                style={{ width: 160 }}
                value={batchUploadCount}
                onChange={(val) => setBatchUploadCount(typeof val === 'number' ? val : 50)}
              />
            </div>
            <Upload.Dragger {...batchUploadProps} disabled={batchImporting}>
              <p className="ant-upload-drag-icon">
                <UploadOutlined />
              </p>
              <p className="ant-upload-text">点击或拖拽 JSON 文件到此处</p>
              <p className="ant-upload-hint">可一次选择多个文件，内容将自动解析</p>
              <p className="ant-upload-hint">特殊处理：一个JSON文件里，凭证按行分割，最前面加个 #mm# 或者 #tr#</p>
            </Upload.Dragger>
          </div>
        </Modal>

        <Modal
          title="导入iOS购买凭证Excel文件"
          open={importIosVisible}
          onCancel={() => {
            setImportIosVisible(false);
            setBatchUploadFileList([]);
          }}
          onOk={handleConfirmBatchImport}
          confirmLoading={batchImporting}
          okText="开始导入"
          cancelText="取消"
          width="640px"
        >
          <div style={{ padding: '12px 0' }}>
            <div style={{ marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
              <span>单次批量上传个数</span>
              <InputNumber
                min={1}
                style={{ width: 160 }}
                value={batchUploadCount}
                onChange={(val) => setBatchUploadCount(typeof val === 'number' ? val : 50)}
              />
              <span>出库国家</span>
              <Input style={{ width: 160 }} value={country} onChange={(val) => setCountry(val.target.value)} />
            </div>
            <Upload.Dragger {...batchUploadProps} disabled={batchImporting}>
              <p className="ant-upload-drag-icon">
                <UploadOutlined />
              </p>
              <p className="ant-upload-text">点击或拖拽 Excel 文件到此处</p>
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
