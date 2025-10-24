import { useState, useEffect, useCallback } from "react";
import { Card, Row, Col, Select, Button } from "antd";
import { ReloadOutlined } from "@ant-design/icons";
import ReactECharts from "echarts-for-react";
import { cdkApi, type FilterOptions, type TrendData } from "../../api/cdk";

const { Option } = Select;

interface TrendTabProps {
  filterOptions: FilterOptions;
}

export const TrendTab = ({ filterOptions }: TrendTabProps) => {
  const [trendData, setTrendData] = useState<{
    monthly: TrendData[];
    weekly: TrendData[];
    daily: TrendData[];
  }>({
    monthly: [],
    weekly: [],
    daily: []
  });
  const [dimension, setDimension] = useState<'monthly' | 'weekly' | 'daily'>('monthly');
  const [selectedUser, setSelectedUser] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const fetchTrendData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await cdkApi.getTrendData(selectedUser || undefined, dimension);
      setTrendData(response);
    } catch (error) {
      console.error("获取趋势数据失败:", error);
    } finally {
      setLoading(false);
    }
  }, [dimension, selectedUser]);

  useEffect(() => {
    fetchTrendData();
  }, [fetchTrendData]);

  const getChartOption = () => {
    const data = dimension === 'monthly' ? trendData.monthly :
                 dimension === 'weekly' ? trendData.weekly :
                 trendData.daily;

    return {
      title: {
        text: `CDK兑换趋势 - ${dimension === 'monthly' ? '月度' : dimension === 'weekly' ? '周度' : '日度'}`,
        left: 'center'
      },
      tooltip: {
        trigger: 'axis',
        formatter: (params: Array<{ name: string; value: number }>) => {
          const point = params[0];
          return `${point.name}<br/>兑换量: ${point.value}`;
        }
      },
      xAxis: {
        type: 'category',
        data: data.map(item => item.date),
        axisLabel: {
          rotate: dimension === 'daily' ? 45 : 0
        }
      },
      yAxis: {
        type: 'value',
        name: '兑换量'
      },
      series: [
        {
          name: '兑换量',
          type: 'line',
          data: data.map(item => item.count),
          smooth: true,
          lineStyle: {
            width: 3,
            color: '#1890ff'
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
                { offset: 1, color: 'rgba(24, 144, 255, 0.1)' }
              ]
            }
          }
        }
      ],
      grid: {
        left: '3%',
        right: '4%',
        bottom: dimension === 'daily' ? '15%' : '3%',
        containLabel: true
      }
    };
  };

  return (
    <div>
      <Card size="small" style={{ marginBottom: 16 }}>
        <Row gutter={16} align="middle">
          <Col>
            <span>时间维度：</span>
            <Select
              value={dimension}
              onChange={setDimension}
              style={{ width: 120, marginLeft: 8 }}
            >
              <Option value="monthly">月度</Option>
              <Option value="weekly">周度</Option>
              <Option value="daily">日度</Option>
            </Select>
          </Col>
          <Col>
            <span>用户筛选：</span>
            <Select
              value={selectedUser}
              onChange={setSelectedUser}
              style={{ width: 150, marginLeft: 8 }}
              placeholder="全部用户"
              allowClear
            >
              {filterOptions.uploaderIds.map(user => (
                <Option key={user.value} value={user.value}>
                  {user.label}
                </Option>
              ))}
            </Select>
          </Col>
          <Col>
            <Button
              type="primary"
              icon={<ReloadOutlined />}
              onClick={fetchTrendData}
              loading={loading}
            >
              刷新数据
            </Button>
          </Col>
        </Row>
      </Card>
      
      <Card>
        <ReactECharts
          option={getChartOption()}
          style={{ height: 400 }}
          notMerge={true}
          lazyUpdate={true}
        />
      </Card>
    </div>
  );
};