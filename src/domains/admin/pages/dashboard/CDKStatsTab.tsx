import { useState, useEffect, useCallback, lazy, Suspense } from "react";
import { Card, Row, Col, Select, Button, Statistic, Space, Spin, message } from "antd";
import { ReloadOutlined } from "@ant-design/icons";
import { cdkApi, type FilterOptions, type CDKStatResponse } from "../../api/cdk";
import { useStore } from "../../store/hook";

const { Option } = Select;

// Lazy load ECharts component
const ReactECharts = lazy(() => import("echarts-for-react").then((module) => ({ default: module.default })));

export const CDKStatsTab = () => {
  const { isAdmin } = useStore();
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
        messageApi.error("获取筛选选项失败", error);
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
        text: "CDK使用情况分布",
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
          name: "CDK状态",
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
              name: "已使用",
              itemStyle: {
                color: "#ff4d4f"
              }
            },
            {
              value: statsData.unused,
              name: "未使用",
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
                .filter((product) => selectedApp != "" && product.value.startsWith(selectedApp))
                .map((product) => (
                  <Option key={product.value.split(".")[1]} value={product.value.split(".")[1]}>
                    {product.label.split(".")[1]}
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
              <Statistic title="CDK总量" value={statsData.used + statsData.unused} valueStyle={{ color: "#1890ff" }} />
            </Card>
          </Col>
          <Col span={8}>
            <Card>
              <Statistic title="已使用" value={statsData.used} valueStyle={{ color: "#52c41a" }} />
            </Card>
          </Col>
          <Col span={8}>
            <Card>
              <Statistic title="未使用" value={statsData.unused} valueStyle={{ color: "#faad14" }} />
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
