import { useState, useEffect, useCallback } from "react";
import { Card, Row, Col, Select, Button, Statistic, Space } from "antd";
import { ReloadOutlined } from "@ant-design/icons";
import ReactECharts from "echarts-for-react";
import { cdkApi, type FilterOptions, type CDKStatResponse } from "../../api/cdk";

const { Option } = Select;

interface CDKStatsTabProps {
  filterOptions: FilterOptions;
}

export const CDKStatsTab = ({ filterOptions }: CDKStatsTabProps) => {
  const [statsData, setStatsData] = useState<CDKStatResponse | null>(null);
  const [selectedApp, setSelectedApp] = useState<string>("");
  const [selectedProduct, setSelectedProduct] = useState<string>("");
  const [selectedUploader, setSelectedUploader] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const fetchStatsData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await cdkApi.getCDKStatsMock(
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
                color: "#52c41a"
              }
            },
            {
              value: statsData.unused,
              name: "未使用",
              itemStyle: {
                color: "#faad14"
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
              {filterOptions.appIds.map((app) => (
                <Option key={app.value} value={app.value}>
                  {app.label}
                </Option>
              ))}
            </Select>
          </Col>
          <Col>
            <span>产品筛选：</span>
            <Select
              value={selectedProduct}
              onChange={setSelectedProduct}
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
            <span>归属人筛选：</span>
            <Select
              value={selectedUploader}
              onChange={setSelectedUploader}
              style={{ width: 150, marginLeft: 8 }}
              placeholder="全部归属人"
              allowClear
            >
              {filterOptions.userIds.map((uploader) => (
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
        <ReactECharts option={getPieChartOption()} style={{ height: 400 }} notMerge={true} lazyUpdate={true} />
      </Card>
    </div>
  );
};
