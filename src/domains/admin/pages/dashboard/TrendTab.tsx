import { ReloadOutlined } from '@ant-design/icons';
import { Button, Card, Col, message, Row, Select, Spin } from 'antd';
import { lazy, Suspense, useCallback, useEffect, useState } from 'react';
import { cdkApi, type FilterOptions, type TrendData } from '../../api/cdk';
import { stockApi } from '../../api/stock';
import { useStore } from '../../store/hook';

const { Option } = Select;

// Lazy load ECharts component
const ReactECharts = lazy(() => import('echarts-for-react').then((module) => ({ default: module.default })));

type Dimension = 'year' | 'month' | 'pre_month' | 'today';

const DateMap: Record<Dimension, string> = {
  year: '年',
  month: '月',
  pre_month: '月',
  today: '日',
};

const DimensionMap: Record<Dimension, string> = {
  year: '今年',
  month: '当月',
  pre_month: '上月',
  today: '今日',
};

export const TrendTab = () => {
  const { isAdmin } = useStore();
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({
    used: [],
    app_ids: [],
    product_ids: [],
    user_ids: [],
  });
  const [messageApi, contextHolder] = message.useMessage();
  const [trendData, setTrendData] = useState<TrendData[]>([]);
  const [dimension, setDimension] = useState<Dimension>('month');
  const [selectedUser, setSelectedUser] = useState<string>('');
  const [selectedAppId, setSelectedAppId] = useState<string>('');
  const [selectedProductId, setSelectedProductId] = useState<string>('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    stockApi
      .getFilterOptions()
      .then((options) => {
        setFilterOptions(options);
      })
      .catch((error) => {
        messageApi.error('获取筛选选项失败');
        console.error(error);
      });
  }, [messageApi]);

  const fetchTrendData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await cdkApi.getTrendData(
        dimension,
        selectedUser || undefined,
        selectedAppId || undefined,
        selectedProductId || undefined,
      );
      setTrendData(buildTrendData(dimension, response));
    } catch (error) {
      console.error('获取趋势数据失败:', error);
    } finally {
      setLoading(false);
    }
  }, [dimension, selectedUser, selectedAppId, selectedProductId]);

  useEffect(() => {
    fetchTrendData();
  }, [fetchTrendData]);

  const buildTrendData = (dimension: Dimension, data: number[]): TrendData[] => {
    return data.map((count, index) => ({
      date: `${index + 1}${DateMap[dimension]}`,
      count,
    }));
  };

  const getChartOption = () => {
    const data = trendData;
    return {
      title: {
        text: `CDK兑换趋势 - ${DimensionMap[dimension]}`,
        left: 'center',
      },
      tooltip: {
        trigger: 'axis',
        formatter: (params: Array<{ name: string; value: number }>) => {
          const point = params[0];
          return `${point.name}<br/>兑换量: ${point.value}`;
        },
      },
      xAxis: {
        type: 'category',
        data: data.map((item) => item.date),
        axisLabel: {
          rotate: dimension === 'today' ? 45 : 0,
        },
      },
      yAxis: {
        type: 'value',
        name: '兑换量',
      },
      series: [
        {
          name: '兑换量',
          type: 'line',
          data: data.map((item) => item.count),
          smooth: true,
          lineStyle: {
            width: 3,
            color: '#1890ff',
          },
          areaStyle: {
            color: {
              type: 'linear',
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [
                { offset: 0, color: 'rgba(24, 144, 255, 0.3)' },
                { offset: 1, color: 'rgba(24, 144, 255, 0.1)' },
              ],
            },
          },
        },
      ],
      grid: {
        left: '3%',
        right: '4%',
        bottom: dimension === 'today' ? '15%' : '3%',
        containLabel: true,
      },
    };
  };

  return (
    <div>
      {contextHolder}
      <Card size="small" style={{ marginBottom: 16 }}>
        <Row gutter={[16, 16]} align="middle">
          <Col>
            <span>时间维度：</span>
            <Select value={dimension} onChange={setDimension} style={{ width: 120, marginLeft: 8 }}>
              <Option value="year">今年</Option>
              <Option value="month">当月</Option>
              <Option value="pre_month">上月</Option>
              <Option value="today">今日</Option>
            </Select>
          </Col>
          <Col hidden={!isAdmin}>
            <span>用户：</span>
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
          <Col>
            <span>应用：</span>
            <Select
              value={selectedAppId}
              onChange={setSelectedAppId}
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
            <span>应用商品：</span>
            <Select
              value={selectedProductId}
              onChange={setSelectedProductId}
              style={{ width: 150, marginLeft: 8 }}
              placeholder="全部商品"
              allowClear
            >
              {filterOptions.product_ids
                .filter((product) => selectedAppId != '' && product.value.startsWith(selectedAppId))
                .map((product) => (
                  <Option key={product.value.split('.')[1]} value={product.value.split('.')[1]}>
                    {product.label.split('.')[1]}
                  </Option>
                ))}
            </Select>
          </Col>
          <Col>
            <Button type="primary" icon={<ReloadOutlined />} onClick={fetchTrendData} loading={loading}>
              刷新数据
            </Button>
          </Col>
        </Row>
      </Card>

      <Card>
        <Suspense
          fallback={<Spin size="large" style={{ display: 'block', textAlign: 'center', padding: '100px 0' }} />}
        >
          <ReactECharts option={getChartOption()} style={{ height: 400 }} notMerge={true} lazyUpdate={true} />
        </Suspense>
      </Card>
    </div>
  );
};
