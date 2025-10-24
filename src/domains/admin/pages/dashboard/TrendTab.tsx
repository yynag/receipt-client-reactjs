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
  const [trendData, setTrendData] = useState<TrendData[]>([]);
  const [dimension, setDimension] = useState<"year" | "month" | "today">("today");
  const [selectedUser, setSelectedUser] = useState<string>("");
  const [selectedAppId, setSelectedAppId] = useState<string>("");
  const [selectedProductId, setSelectedProductId] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const fetchTrendData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await cdkApi.getTrendDataMock(
        dimension,
        selectedUser || undefined,
        selectedAppId || undefined,
        selectedProductId || undefined
      );
      setTrendData(buildTrendData(dimension, response));
    } catch (error) {
      console.error("获取趋势数据失败:", error);
    } finally {
      setLoading(false);
    }
  }, [dimension, selectedUser, selectedAppId, selectedProductId]);

  useEffect(() => {
    fetchTrendData();
  }, [fetchTrendData]);

  const buildTrendData = (dimension: string, data: number[]): TrendData[] => {
    return data.map((count, index) => ({
      date: dimension === "yearly" ? `${index + 1}月` : dimension === "monthly" ? `${index + 1}日` : `${index + 1}时`,
      count
    }));
  };

  const getChartOption = () => {
    const data = trendData;

    return {
      title: {
        text: `CDK兑换趋势 - ${dimension === "year" ? "今年" : dimension === "month" ? "当月" : "今日"}`,
        left: "center"
      },
      tooltip: {
        trigger: "axis",
        formatter: (params: Array<{ name: string; value: number }>) => {
          const point = params[0];
          return `${point.name}<br/>兑换量: ${point.value}`;
        }
      },
      xAxis: {
        type: "category",
        data: data.map((item) => item.date),
        axisLabel: {
          rotate: dimension === "today" ? 45 : 0
        }
      },
      yAxis: {
        type: "value",
        name: "兑换量"
      },
      series: [
        {
          name: "兑换量",
          type: "line",
          data: data.map((item) => item.count),
          smooth: true,
          lineStyle: {
            width: 3,
            color: "#1890ff"
          },
          areaStyle: {
            color: {
              type: "linear",
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [
                { offset: 0, color: "rgba(24, 144, 255, 0.3)" },
                { offset: 1, color: "rgba(24, 144, 255, 0.1)" }
              ]
            }
          }
        }
      ],
      grid: {
        left: "3%",
        right: "4%",
        bottom: dimension === "today" ? "15%" : "3%",
        containLabel: true
      }
    };
  };

  return (
    <div>
      <Card size="small" style={{ marginBottom: 16 }}>
        <Row gutter={[16, 16]} align="middle">
          <Col>
            <span>时间维度：</span>
            <Select value={dimension} onChange={setDimension} style={{ width: 120, marginLeft: 8 }}>
              <Option value="year">今年</Option>
              <Option value="month">当月</Option>
              <Option value="today">今日</Option>
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
              {filterOptions.userIds.map((user) => (
                <Option key={user.value} value={user.value}>
                  {user.label}
                </Option>
              ))}
            </Select>
          </Col>
          <Col>
            <span>AppID：</span>
            <Select
              value={selectedAppId}
              onChange={setSelectedAppId}
              style={{ width: 150, marginLeft: 8 }}
              placeholder="全部应用"
              allowClear
            >
              {filterOptions.appIds.map((app) => (
                <Option key={app.value} value={app.value}>
                  {app.label}
                </Option>
              ))}
            </Select>
          </Col>
          <Col>
            <span>App商品ID：</span>
            <Select
              value={selectedProductId}
              onChange={setSelectedProductId}
              style={{ width: 150, marginLeft: 8 }}
              placeholder="全部产品"
              allowClear
            >
              {filterOptions.productIds.map((product) => (
                <Option key={product.value} value={product.value}>
                  {product.label}
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
        <ReactECharts option={getChartOption()} style={{ height: 400 }} notMerge={true} lazyUpdate={true} />
      </Card>
    </div>
  );
};
