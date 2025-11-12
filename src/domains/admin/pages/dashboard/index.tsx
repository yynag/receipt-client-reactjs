import { Card, Tabs } from "antd";
import { TrendTab } from "./TrendTab";
import { CDKStatsTab } from "./CDKStatsTab";
import { StockStatsTab } from "./StockStatsTab";
import "./styles.css";
import { getTranslation, type Language } from "../../translation";

export const DashboardPage = ({ language = "zh" }: { language?: Language }) => {
  const t = getTranslation(language);
  
  const tabItems = [
    {
      key: "trend",
      label: t.dashboard.trendTab,
      children: <TrendTab language={language} />
    },
    {
      key: "cdk-stats",
      label: t.dashboard.cdkStatsTab,
      children: <CDKStatsTab language={language} />
    },
    {
      key: "stock-stats",
      label: t.dashboard.stockStatsTab,
      children: <StockStatsTab language={language} />
    }
  ];

  return (
    <div>
      <Card title={t.dashboard.title} bordered={false}>
        <Tabs defaultActiveKey="trend" items={tabItems} />
      </Card>
    </div>
  );
};
