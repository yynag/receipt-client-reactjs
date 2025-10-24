import { useState, useEffect } from "react";
import { Card, Spin, Tabs } from "antd";
import { TrendTab } from "./TrendTab";
import { CDKStatsTab } from "./CDKStatsTab";
import { StockStatsTab } from "./StockStatsTab";
import { cdkApi, type FilterOptions } from "../../api/cdk";

export const DashboardPage = () => {
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({
    used: [],
    appIds: [],
    productIds: [],
    uploaderIds: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFilterOptions();
  }, []);

  const fetchFilterOptions = async () => {
    try {
      const options = await cdkApi.getFilterOptions();
      setFilterOptions(options);
    } catch (error) {
      console.error("获取筛选选项失败:", error);
    } finally {
      setLoading(false);
    }
  };

  const tabItems = [
    {
      key: "trend",
      label: "兑换趋势",
      children: <TrendTab filterOptions={filterOptions} />
    },
    {
      key: "cdk-stats",
      label: "CDK统计",
      children: <CDKStatsTab filterOptions={filterOptions} />
    },
    {
      key: "stock-stats",
      label: "库存统计",
      children: <StockStatsTab filterOptions={filterOptions} />
    }
  ];

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "100px 0" }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div style={{ padding: "24px" }}>
      <Card title="数据仪表盘" bordered={false}>
        <Tabs defaultActiveKey="trend" items={tabItems} />
      </Card>
    </div>
  );
};
