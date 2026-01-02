import { LeftOutlined, ReloadOutlined, RightOutlined } from '@ant-design/icons';
import { Button, Card, Col, message, Row, Select, Space, Spin, Statistic } from 'antd';
import { lazy, Suspense, useCallback, useEffect, useState } from 'react';
import { cdkApi, type AppProductCdkStatItem, type FilterOptions } from '../../api/cdk';
import { useStore } from '../../store/hook';

const { Option } = Select;

// Lazy load ECharts component
const ReactECharts = lazy(() => import('echarts-for-react').then((module) => ({ default: module.default })));

export const CDKStatsTab = () => {
  const { isAdmin } = useStore();
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({
    used: [],
    app_ids: [],
    product_ids: [],
    user_ids: [],
  });
  const [messageApi, contextHolder] = message.useMessage();
  const [statsData, setStatsData] = useState<AppProductCdkStatItem[] | null>(null);
  const [selectedApp, setSelectedApp] = useState<string>('');
  const [selectedProduct, setSelectedProduct] = useState<string>('');
  const [selectedUploader, setSelectedUploader] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const WINDOW_SIZE = 10;
  const [viewStart, setViewStart] = useState(0);

  useEffect(() => {
    cdkApi
      .getFilterOptions()
      .then((options) => {
        setFilterOptions(options);
      })
      .catch((error) => {
        messageApi.error('获取筛选选项失败');
        console.error(error);
      });
  }, [messageApi]);

  const fetchStatsData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await cdkApi.getCDKAppProductStats(
        selectedApp || undefined,
        selectedProduct || undefined,
        selectedUploader || undefined,
      );
      setStatsData(response);
    } catch (error) {
      console.error('获取CDK统计数据失败:', error);
    } finally {
      setLoading(false);
    }
  }, [selectedApp, selectedProduct, selectedUploader]);

  useEffect(() => {
    fetchStatsData();
  }, [fetchStatsData]);

  // Reset scroll window when data or filters change
  useEffect(() => {
    setViewStart(0);
  }, [selectedApp, selectedProduct, selectedUploader, statsData]);

  const aggregate = () => {
    if (!statsData) return { labels: [], usedData: [], unusedData: [] };
    const appLabel = (appId: string) => filterOptions.app_ids.find((a) => a.value === appId)?.label || appId;
    const productLabel = (appId: string, productId: string) =>
      filterOptions.product_ids.find((p) => p.value === `${appId}.${productId}`)?.label.split('.')[1] || productId;
    const filtered = statsData.filter((item) => {
      if (selectedApp && item.app_id !== selectedApp) return false;
      if (selectedProduct && item.product_id !== selectedProduct) return false;
      if (selectedUploader && item.user_id && item.user_id !== selectedUploader) return false;
      return true;
    });
    const grouped = new Map<string, { used: number; unused: number }>();
    filtered.forEach((item) => {
      const label = `${appLabel(item.app_id)}\n${productLabel(item.app_id, item.product_id)}`;
      if (!grouped.has(label)) grouped.set(label, { used: 0, unused: 0 });
      const agg = grouped.get(label)!;
      agg.used += item.used || 0;
      agg.unused += item.unused || 0;
    });
    const labels = Array.from(grouped.keys());
    const usedData = labels.map((l) => grouped.get(l)!.used);
    const unusedData = labels.map((l) => grouped.get(l)!.unused);
    return { labels, usedData, unusedData };
  };

  const getBarChartOption = () => {
    const { labels, usedData, unusedData } = aggregate();
    const windowSize = Math.min(labels.length, WINDOW_SIZE);
    const maxStart = Math.max(0, labels.length - windowSize);
    const start = Math.min(viewStart, maxStart);
    const end = Math.min(start + windowSize, labels.length);
    const pageLabels = labels.slice(start, end);
    const pageUsedData = usedData.slice(start, end);
    const pageUnusedData = unusedData.slice(start, end);
    const gridBottom = 80;

    return {
      animation: false,
      animationDuration: 0,
      animationDurationUpdate: 0,
      tooltip: { trigger: 'axis', axisPointer: { type: 'line', lineStyle: { width: 1 } } },
      legend: { data: ['已使用', '未使用'] },
      grid: { left: 40, right: 20, bottom: gridBottom, top: 30, containLabel: true },
      xAxis: {
        type: 'category',
        data: pageLabels,
        axisLabel: { interval: 0, rotate: 0, fontSize: 14, lineHeight: 18, margin: 12 },
        axisTick: { alignWithLabel: true },
      },
      yAxis: { type: 'value' },
      series: [
        {
          name: '已使用',
          type: 'bar',
          stack: 'total',
          animation: false,
          itemStyle: { color: '#ff4d4f' },
          barWidth: 36,
          label: { show: true, position: 'inside', color: '#fff', fontSize: 12 },
          data: pageUsedData,
        },
        {
          name: '未使用',
          type: 'bar',
          stack: 'total',
          animation: false,
          itemStyle: { color: '#1890ff' },
          barWidth: 36,
          label: { show: true, position: 'inside', color: '#fff', fontSize: 12 },
          data: pageUnusedData,
        },
      ],
    };
  };

  const totalLabels = () => aggregate().labels.length;
  const handlePrev = () => {
    const total = totalLabels();
    const windowSize = Math.min(total, WINDOW_SIZE);
    setViewStart((s) => Math.max(0, s - windowSize));
  };
  const handleNext = () => {
    const total = totalLabels();
    const windowSize = Math.min(total, WINDOW_SIZE);
    const maxStart = Math.max(0, total - windowSize);
    setViewStart((s) => Math.min(maxStart, s + windowSize));
  };

  const handleReset = () => {
    setSelectedApp('');
    setSelectedProduct('');
    setSelectedUploader('');
  };

  return (
    <div>
      {contextHolder}
      <Card size="small" style={{ marginBottom: 16 }}>
        <Row gutter={[16, 16]} align="middle">
          <Col>
            <span>应用筛选：</span>
            <Select
              value={selectedApp}
              onChange={setSelectedApp}
              style={{ width: 150, marginLeft: 8 }}
              placeholder="全部应用"
              allowClear
            >
              {filterOptions.app_ids.map((app) => (
                <Option key={app.value} value={app.value}>
                  {app.label}
                </Option>
              ))}
            </Select>
          </Col>
          <Col>
            <span>商品筛选：</span>
            <Select
              value={selectedProduct}
              onChange={setSelectedProduct}
              style={{ width: 150, marginLeft: 8 }}
              placeholder="全部商品"
              allowClear
            >
              {filterOptions.product_ids
                .filter((product) => selectedApp != '' && product.value.startsWith(selectedApp))
                .map((product) => (
                  <Option key={product.value.split('.')[1]} value={product.value.split('.')[1]}>
                    {product.label.split('.')[1]}
                  </Option>
                ))}
            </Select>
          </Col>
          <Col hidden={!isAdmin}>
            <span>归属人筛选：</span>
            <Select
              value={selectedUploader}
              onChange={setSelectedUploader}
              style={{ width: 150, marginLeft: 8 }}
              placeholder="全部归属人"
              allowClear
            >
              {filterOptions.user_ids.map((uploader) => (
                <Option key={uploader.value} value={uploader.value}>
                  {uploader.label}
                </Option>
              ))}
            </Select>
          </Col>
          <Col>
            <Space>
              <Button onClick={handleReset}>重置</Button>
              <Button type="primary" icon={<ReloadOutlined />} onClick={fetchStatsData} loading={loading}>
                刷新数据
              </Button>
            </Space>
          </Col>
        </Row>
      </Card>

      {statsData && (
        <Row gutter={16} style={{ marginBottom: 16 }}>
          <Col span={8}>
            <Card>
              <Statistic
                title="CDK总量"
                value={statsData.reduce((sum, i) => sum + (i.used || 0) + (i.unused || 0), 0)}
                valueStyle={{ color: '#1890ff' }}
              />
            </Card>
          </Col>
          <Col span={8}>
            <Card>
              <Statistic
                title="已使用"
                value={statsData.reduce((sum, i) => sum + (i.used || 0), 0)}
                valueStyle={{ color: '#52c41a' }}
              />
            </Card>
          </Col>
          <Col span={8}>
            <Card>
              <Statistic
                title="未使用"
                value={statsData.reduce((sum, i) => sum + (i.unused || 0), 0)}
                valueStyle={{ color: '#faad14' }}
              />
            </Card>
          </Col>
        </Row>
      )}

      <Card>
        <Suspense
          fallback={<Spin size="large" style={{ display: 'block', textAlign: 'center', padding: '100px 0' }} />}
        >
          <ReactECharts option={getBarChartOption()} style={{ height: 400 }} notMerge={true} lazyUpdate={true} />
        </Suspense>
        <div
          className="dashboard-pager"
          style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 12, marginTop: 8 }}
        >
          <span style={{ fontSize: 12, color: '#888' }}>
            {(() => {
              const total = totalLabels();
              const totalPages = Math.max(1, Math.ceil(total / WINDOW_SIZE));
              const current = Math.min(totalPages, Math.floor(viewStart / WINDOW_SIZE) + 1);
              return `第 ${current} / ${totalPages} 页`;
            })()}
          </span>
          <Space>
            <Button icon={<LeftOutlined />} onClick={handlePrev} disabled={viewStart <= 0}>
              上一页
            </Button>
            <Button
              icon={<RightOutlined />}
              onClick={handleNext}
              disabled={(() => {
                const total = totalLabels();
                const windowSize = Math.min(total, WINDOW_SIZE);
                return viewStart + windowSize >= total;
              })()}
            >
              下一页
            </Button>
          </Space>
        </div>
      </Card>
    </div>
  );
};
