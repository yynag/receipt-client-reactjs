import { useState, useEffect, useCallback } from "react";
import { Card, Row, Col, Select, Button, Statistic, Space } from "antd";
import { ReloadOutlined } from "@ant-design/icons";
import ReactECharts from "echarts-for-react";
import { type FilterOptions } from "../../api/cdk";
import { stockApi, type StockStatResponse } from "../../api/stock";

const { Option } = Select;

interface StockStatsTabProps {
  filterOptions: FilterOptions;
}

export const StockStatsTab = ({ filterOptions }: StockStatsTabProps) => {
  const [statsData, setStatsData] = useState<StockStatResponse | null>(null);
  const [selectedApp, setSelectedApp] = useState<string>("");
  const [selectedProduct, setSelectedProduct] = useState<string>("");
  const [selectedUser, setSelectedUser] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const fetchStatsData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await stockApi.getStockStatsMock(selectedApp || undefined, selectedProduct || undefined);
      setStatsData(response);
    } catch (error) {
      console.error("获取库存统计数据失败:", error);
    } finally {
      setLoading(false);
    }
  }, [selectedApp, selectedProduct]);

  useEffect(() => {
    fetchStatsData();
  }, [fetchStatsData]);

  const getPieChartOption = () => {
    if (!statsData) return {};

    return {
      title: {
        text: "库存状态分布",
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
          name: "库存状态",
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
              value: 335,
              name: "已售罄",
              itemStyle: {
                color: "#ff4d4f"
              }
            },
            {
              value: 310,
              name: "有库存",
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
    setSelectedUser("");
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
              {filterOptions.app_ids.map((app) => (
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
              {filterOptions.product_ids.map((product) => (
                <Option key={product.value} value={product.value}>
                  {product.label}
                </Option>
              ))}
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
              {filterOptions.user_ids.map((user) => (
                <Option key={user.value} value={user.value}>
                  {user.label}
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
              <Statistic title="库存总量" value={statsData.unused + statsData.used} valueStyle={{ color: "#1890ff" }} />
            </Card>
          </Col>
          <Col span={8}>
            <Card>
              <Statistic title="已出库" value={statsData.used} valueStyle={{ color: "#ff4d4f" }} />
            </Card>
          </Col>
          <Col span={8}>
            <Card>
              <Statistic title="库存中" value={statsData.unused} valueStyle={{ color: "#52c41a" }} />
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
