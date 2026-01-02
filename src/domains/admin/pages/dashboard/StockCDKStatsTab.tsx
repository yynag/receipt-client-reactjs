import { LeftOutlined, RightOutlined } from '@ant-design/icons';
import { Button, Card, Col, message, Row, Select, Space, Spin } from 'antd';
import { lazy, Suspense, useCallback, useEffect, useState } from 'react';
import { cdkApi, type AppProductCdkStatItem, type FilterOptions } from '../../api/cdk';
import { stockApi, type AppProductStockStatItem } from '../../api/stock';
import { useStore } from '../../store/hook';

const { Option } = Select;

// Lazy load ECharts component
const ReactECharts = lazy(() => import('echarts-for-react').then((module) => ({ default: module.default })));

export const StockCdkStatsTab = () => {
  const { isAdmin } = useStore();
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({
    used: [],
    app_ids: [],
    product_ids: [],
    user_ids: [],
  });
  const [messageApi, contextHolder] = message.useMessage();
  const [statsStockData, setStatsStockData] = useState<AppProductStockStatItem[] | null>(null);
  const [statsCdkData, setStatsCdkData] = useState<AppProductCdkStatItem[] | null>(null);
  const [selectedApp, setSelectedApp] = useState<string>('');
  const [selectedProduct, setSelectedProduct] = useState<string>('');
  const [selectedUser, setSelectedUser] = useState<string>('');
  const WINDOW_SIZE = 10;
  const [viewStart, setViewStart] = useState(0);
  const [refresh, setRefresh] = useState(false);

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchStatsData = useCallback(async () => {
    await Promise.all([
      stockApi
        .getStockAppProductStats(selectedApp || undefined, selectedProduct || undefined, selectedUser || undefined)
        .then((response) => {
          setStatsStockData(response);
        }),
      cdkApi
        .getCDKAppProductStats(selectedApp || undefined, selectedProduct || undefined, selectedUser || undefined)
        .then((response) => {
          setStatsCdkData(response);
        }),
    ]);
  }, [selectedApp, selectedProduct, selectedUser]);

  useEffect(() => {
    fetchStatsData();
  }, [selectedApp, selectedProduct, selectedUser, refresh]);

  useEffect(() => {
    const timer = setInterval(() => {
      setRefresh((prev) => !prev);
    }, 5000);

    return () => {
      clearInterval(timer);
    };
  }, []);

  // Reset scroll window when data or filters change
  useEffect(() => {
    setViewStart(0);
  }, [selectedApp, selectedProduct, selectedUser, statsStockData, statsCdkData]);

  const aggregate = () => {
    if (!statsCdkData) return { labels: [], usedData: [], unusedData: [] };

    const appLabel = (appId: string) => filterOptions.app_ids.find((a) => a.value === appId)?.label || appId;
    const productLabel = (appId: string, productId: string) =>
      filterOptions.product_ids.find((p) => p.value === `${appId}.${productId}`)?.label.split('.')[1] || productId;
    const filtered = statsCdkData.filter((item) => {
      if (selectedApp && item.app_id !== selectedApp) return false;
      if (selectedProduct && item.product_id !== selectedProduct) return false;
      if (selectedUser && item.user_id && item.user_id !== selectedUser) return false;
      return true;
    });

    const grouped = new Map<string, { cdk: number; stock: number }>();
    filtered.forEach((item) => {
      const label = `${appLabel(item.app_id)}\n${productLabel(item.app_id, item.product_id)}`;
      if (!grouped.has(label)) grouped.set(label, { cdk: 0, stock: 0 });
      const agg = grouped.get(label)!;
      const stock = statsStockData?.find(
        (it) => it.app_id === item.app_id && it.product_id === item.product_id && it.user_id == item.user_id,
      );
      agg.cdk += item.unused || 0;
      agg.stock += stock?.unused || 0;
    });

    const labels = Array.from(grouped.keys());
    const cdkData = labels.map((l) => grouped.get(l)!.cdk);
    const stockData = labels.map((l) => grouped.get(l)!.stock);
    return { labels, cdkData, stockData };
  };

  const getBarChartOption = () => {
    const { labels, cdkData, stockData } = aggregate();
    const windowSize = Math.min(labels.length, WINDOW_SIZE);
    const maxStart = Math.max(0, labels.length - windowSize);
    const start = Math.min(viewStart, maxStart);
    const end = Math.min(start + windowSize, labels.length);
    const pageLabels = labels.slice(start, end);
    const pageCdkData = cdkData?.slice(start, end);
    const pageStockData = stockData?.slice(start, end);
    const gridBottom = 80;

    return {
      animation: false,
      animationDuration: 0,
      animationDurationUpdate: 0,
      tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
      legend: { data: ['CDK', '凭证'] },
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
          name: 'CDK',
          type: 'bar',
          stack: 'total',
          animation: false,
          itemStyle: { color: '#ff4d4f' },
          barWidth: 36,
          label: { show: true, position: 'inside', color: '#fff', fontSize: 12 },
          data: pageCdkData,
        },
        {
          name: '凭证',
          type: 'bar',
          stack: 'total',
          animation: false,
          itemStyle: { color: '#1890ff' },
          barWidth: 36,
          label: { show: true, position: 'inside', color: '#fff', fontSize: 12 },
          data: pageStockData,
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
            <span>用户筛选：</span>
            <Select
              value={selectedUser}
              onChange={setSelectedUser}
              style={{ width: 150, marginLeft: 8 }}
              placeholder="全部用户"
              allowClear
            >
              {filterOptions.user_ids.map((user) => (
                <Option key={user.value} value={user.value}>
                  {user.label}
                </Option>
              ))}
            </Select>
          </Col>
        </Row>
      </Card>

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
