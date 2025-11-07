import { useState, useEffect, useCallback, lazy, Suspense } from "react";
import { Card, Row, Col, Select, Button, Statistic, Space, Spin, message } from "antd";
import { ReloadOutlined } from "@ant-design/icons";
import { cdkApi, type FilterOptions, type CDKStatResponse } from "../../api/cdk";
import { useStore } from "../../store/hook";
import { getTranslation, type Language } from "../../translation";

const { Option } = Select;

// Lazy load ECharts component
const ReactECharts = lazy(() => import("echarts-for-react").then((module) => ({ default: module.default })));

export const CDKStatsTab = ({ language = "zh" }: { language?: Language }) => {
  const { isAdmin } = useStore();
  const t = getTranslation(language);
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({
    used: [],
    app_ids: [],
    product_ids: [],
    user_ids: []
  });
  const [messageApi, contextHolder] = message.useMessage();
  const [statsData, setStatsData] = useState<CDKStatResponse | null>(null);
  const [selectedApp, setSelectedApp] = useState<string>("");
  const [selectedProduct, setSelectedProduct] = useState<string>("");
  const [selectedUploader, setSelectedUploader] = useState<string>("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    cdkApi
      .getFilterOptions()
      .then((options) => {
        setFilterOptions(options);
      })
      .catch((error) => {
        messageApi.error(t.cdk.messages.getFilterOptionsError);
        console.error(error);
      });
  }, [messageApi]);

  const fetchStatsData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await cdkApi.getCDKStats(
        selectedApp || undefined,
        selectedProduct || undefined,
        selectedUploader || undefined
      );
      setStatsData(response);
    } catch (error) {
      console.error("获取CDK统计数据失败:", error);
    } finally {
      setLoading(false);
    }
  }, [selectedApp, selectedProduct, selectedUploader]);

  useEffect(() => {
    fetchStatsData();
  }, [fetchStatsData]);

  const getPieChartOption = () => {
    if (!statsData) return {};

    return {
      title: {
        text: t.dashboard.cdkStats.chart.title,
        left: "center"
      },
      tooltip: {
        trigger: "item",
        formatter: "{a} <br/>{b}: {c} ({d}%)"
      },
      legend: {
        orient: "vertical",
        left: "left"
      },
      series: [
        {
          name: t.dashboard.cdkStats.chart.seriesName,
          type: "pie",
          radius: ["40%", "70%"],
          center: ["60%", "50%"],
          avoidLabelOverlap: false,
          itemStyle: {
            borderRadius: 10,
            borderColor: "#fff",
            borderWidth: 2
          },
          label: {
            show: false,
            position: "center"
          },
          emphasis: {
            label: {
              show: true,
              fontSize: "20",
              fontWeight: "bold"
            }
          },
          labelLine: {
            show: false
          },
          data: [
            {
              value: statsData.used,
              name: t.dashboard.cdkStats.chart.used,
              itemStyle: {
                color: "#ff4d4f"
              }
            },
            {
              value: statsData.unused,
              name: t.dashboard.cdkStats.chart.unused,
              itemStyle: {
                color: "#1890ff"
              }
            }
          ]
        }
      ]
    };
  };

  const handleReset = () => {
    setSelectedApp("");
    setSelectedProduct("");
    setSelectedUploader("");
  };

  return (
    <div>
      {contextHolder}
      <Card size="small" style={{ marginBottom: 16 }}>
        <Row gutter={[16, 16]} align="middle">
          <Col>
            <span>{t.dashboard.cdkStats.labels.app}：</span>
            <Select
              value={selectedApp}
              onChange={setSelectedApp}
              style={{ width: 150, marginLeft: 8 }}
              placeholder={t.dashboard.cdkStats.placeholders.allApps}
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
            <span>{t.dashboard.cdkStats.labels.product}：</span>
            <Select
              value={selectedProduct}
              onChange={setSelectedProduct}
              style={{ width: 150, marginLeft: 8 }}
              placeholder={t.dashboard.cdkStats.placeholders.allProducts}
              allowClear
            >
              {filterOptions.product_ids
                .filter((product) => selectedApp != "" && product.value.startsWith(selectedApp))
                .map((product) => (
                  <Option key={product.value.split(".")[1]} value={product.value.split(".")[1]}>
                    {product.label.split(".")[1]}
                  </Option>
                ))}
            </Select>
          </Col>
          <Col hidden={!isAdmin}>
            <span>{t.dashboard.cdkStats.labels.uploader}：</span>
            <Select
              value={selectedUploader}
              onChange={setSelectedUploader}
              style={{ width: 150, marginLeft: 8 }}
              placeholder={t.dashboard.cdkStats.placeholders.allUploaders}
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
              <Button onClick={handleReset}>{t.dashboard.cdkStats.buttons.reset}</Button>
              <Button type="primary" icon={<ReloadOutlined />} onClick={fetchStatsData} loading={loading}>
                {t.dashboard.cdkStats.buttons.refresh}
              </Button>
            </Space>
          </Col>
        </Row>
      </Card>

      {statsData && (
        <Row gutter={16} style={{ marginBottom: 16 }}>
          <Col span={8}>
            <Card>
              <Statistic title={t.dashboard.cdkStats.stats.total} value={statsData.used + statsData.unused} valueStyle={{ color: "#1890ff" }} />
            </Card>
          </Col>
          <Col span={8}>
            <Card>
              <Statistic title={t.dashboard.cdkStats.stats.used} value={statsData.used} valueStyle={{ color: "#52c41a" }} />
            </Card>
          </Col>
          <Col span={8}>
            <Card>
              <Statistic title={t.dashboard.cdkStats.stats.unused} value={statsData.unused} valueStyle={{ color: "#faad14" }} />
            </Card>
          </Col>
        </Row>
      )}

      <Card>
        <Suspense
          fallback={<Spin size="large" style={{ display: "block", textAlign: "center", padding: "100px 0" }} />}
        >
          <ReactECharts option={getPieChartOption()} style={{ height: 400 }} notMerge={true} lazyUpdate={true} />
        </Suspense>
      </Card>
    </div>
  );
};
