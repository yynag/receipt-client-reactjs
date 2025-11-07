import { useState, useEffect, useCallback, lazy, Suspense } from "react";
import { Card, Row, Col, Select, Button, Spin, message } from "antd";
import { ReloadOutlined } from "@ant-design/icons";
import { cdkApi, type FilterOptions, type TrendData } from "../../api/cdk";
import { stockApi } from "../../api/stock";
import { useStore } from "../../store/hook";
import { getTranslation, type Language } from "../../translation";

const { Option } = Select;

// Lazy load ECharts component
const ReactECharts = lazy(() => import("echarts-for-react").then((module) => ({ default: module.default })));

export const TrendTab = ({ language = "zh" }: { language?: Language }) => {
  const { isAdmin } = useStore();
  const t = getTranslation(language);
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({
    used: [],
    app_ids: [],
    product_ids: [],
    user_ids: []
  });
  const [messageApi, contextHolder] = message.useMessage();
  const [trendData, setTrendData] = useState<TrendData[]>([]);
  const [dimension, setDimension] = useState<"year" | "month" | "today">("month");
  const [selectedUser, setSelectedUser] = useState<string>("");
  const [selectedAppId, setSelectedAppId] = useState<string>("");
  const [selectedProductId, setSelectedProductId] = useState<string>("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    stockApi
      .getFilterOptions()
      .then((options) => {
        setFilterOptions(options);
      })
      .catch((error) => {
        messageApi.error(t.stock.messages.getFilterOptionsError);
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
      date:
        dimension === "year"
          ? `${index + 1}${language === "zh" ? "月" : t.dashboard.trend.units.month}`
          : dimension === "month"
          ? `${index + 1}${language === "zh" ? "日" : t.dashboard.trend.units.day}`
          : `${index + 1}${language === "zh" ? "时" : t.dashboard.trend.units.hour}`,
      count
    }));
  };

  const getChartOption = () => {
    const data = trendData;

    return {
      title: {
        text:
          (language === "zh"
            ? `CDK兑换趋势 - ${dimension === "year" ? "今年" : dimension === "month" ? "当月" : "今日"}`
            : `${t.dashboard.trend.chart.titlePrefix}${
                dimension === "year"
                  ? t.dashboard.trend.dimensions.year
                  : dimension === "month"
                  ? t.dashboard.trend.dimensions.month
                  : t.dashboard.trend.dimensions.today
              }`),
        left: "center"
      },
      tooltip: {
        trigger: "axis",
        formatter: (params: Array<{ name: string; value: number }>) => {
          const point = params[0];
          return `${point.name}<br/>${t.dashboard.trend.chart.countLabel}: ${point.value}`;
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
        name: t.dashboard.trend.chart.countLabel
      },
      series: [
        {
          name: t.dashboard.trend.chart.countLabel,
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
      {contextHolder}
      <Card size="small" style={{ marginBottom: 16 }}>
        <Row gutter={[16, 16]} align="middle">
          <Col>
            <span>{t.dashboard.trend.labels.dimension}：</span>
            <Select value={dimension} onChange={setDimension} style={{ width: 120, marginLeft: 8 }}>
              <Option value="year">{t.dashboard.trend.dimensions.year}</Option>
              <Option value="month">{t.dashboard.trend.dimensions.month}</Option>
              <Option value="today">{t.dashboard.trend.dimensions.today}</Option>
            </Select>
          </Col>
          <Col hidden={!isAdmin}>
            <span>{t.dashboard.trend.labels.user}：</span>
            <Select
              value={selectedUser}
              onChange={setSelectedUser}
              style={{ width: 150, marginLeft: 8 }}
              placeholder={t.dashboard.trend.placeholders.allUsers}
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
            <span>{t.dashboard.trend.labels.app}：</span>
            <Select
              value={selectedAppId}
              onChange={setSelectedAppId}
              style={{ width: 150, marginLeft: 8 }}
              placeholder={t.dashboard.trend.placeholders.allApps}
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
            <span>{t.dashboard.trend.labels.product}：</span>
            <Select
              value={selectedProductId}
              onChange={setSelectedProductId}
              style={{ width: 150, marginLeft: 8 }}
              placeholder={t.dashboard.trend.placeholders.allProducts}
              allowClear
            >
              {filterOptions.product_ids
                .filter((product) => selectedAppId != "" && product.value.startsWith(selectedAppId))
                .map((product) => (
                  <Option key={product.value.split(".")[1]} value={product.value.split(".")[1]}>
                    {product.label.split(".")[1]}
                  </Option>
                ))}
            </Select>
          </Col>
          <Col>
            <Button type="primary" icon={<ReloadOutlined />} onClick={fetchTrendData} loading={loading}>
              {t.dashboard.trend.buttons.refresh}
            </Button>
          </Col>
        </Row>
      </Card>

      <Card>
        <Suspense
          fallback={<Spin size="large" style={{ display: "block", textAlign: "center", padding: "100px 0" }} />}
        >
          <ReactECharts option={getChartOption()} style={{ height: 400 }} notMerge={true} lazyUpdate={true} />
        </Suspense>
      </Card>
    </div>
  );
};
