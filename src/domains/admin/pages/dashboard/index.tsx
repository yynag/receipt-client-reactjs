import { Card, Tabs } from 'antd';
import { CDKStatsTab } from './CDKStatsTab';
import { StockCdkStatsTab } from './StockCDKStatsTab';
import { StockStatsTab } from './StockStatsTab';
import './styles.css';
import { TrendTab } from './TrendTab';

export const DashboardPage = () => {
  const tabItems = [
    {
      key: 'trend',
      label: '兑换趋势',
      children: <TrendTab />,
    },
    {
      key: 'cdk-stats',
      label: 'CDK统计',
      children: <CDKStatsTab />,
    },
    {
      key: 'stock-stats',
      label: '库存统计',
      children: <StockStatsTab />,
    },
    {
      key: 'stock-cdk-stats',
      label: 'CDK/库存',
      children: <StockCdkStatsTab />,
    },
  ];

  return (
    <div>
      <Card title="数据仪表盘" bordered={false}>
        <Tabs defaultActiveKey="trend" items={tabItems} />
      </Card>
    </div>
  );
};
