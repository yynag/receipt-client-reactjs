import { Card, Tabs } from "antd";
import { TrendTab } from "./TrendTab";
import { CDKStatsTab } from "./CDKStatsTab";
import { StockStatsTab } from "./StockStatsTab";

export const DashboardPage = () => {
  const tabItems = [
    {
      key: "trend",
      label: "兑换趋势",
      children: <TrendTab />
    },
    {
      key: "cdk-stats",
      label: "CDK统计",
      children: <CDKStatsTab />
    },
    {
      key: "stock-stats",
      label: "库存统计",
      children: <StockStatsTab />
    }
  ];

  return (
    <div>
      <Card title="数据仪表盘" bordered={false}>
        <Tabs defaultActiveKey="trend" items={tabItems} />
      </Card>
    </div>
  );
};
