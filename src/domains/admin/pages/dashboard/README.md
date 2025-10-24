# 仪表盘功能文档

## 功能概述

数据仪表盘包含三个主要标签页，提供全面的CDK和库存数据分析功能。

## 标签页功能

### 1. 兑换趋势
- **功能**：查看CDK使用量的时间趋势
- **筛选条件**：
  - 时间维度：月度、周度、日度
  - 用户筛选：可查看所有用户或特定用户的兑换趋势
- **图表类型**：曲线图，带面积填充效果
- **数据来源**：基于CDK的`updatedAt`字段和`used=true`的条件

### 2. CDK统计
- **功能**：查看当前CDK总量及使用状态分布
- **筛选条件**：
  - 应用ID（AppId）筛选
  - 产品ID（AppProductId）筛选
  - 归属人（UploaderId）筛选
- **图表类型**：圆饼图
- **统计指标**：
  - CDK总量
  - 已使用数量
  - 未使用数量

### 3. 库存统计
- **功能**：查看当前库存总量及出库状态分布
- **筛选条件**：
  - 应用ID（AppId）筛选
  - 产品ID（AppProductId）筛选
- **图表类型**：圆饼图
- **统计指标**：
  - 库存总量
  - 已出库数量
  - 库存中数量

## 技术实现

- **图表库**：ECharts + echarts-for-react
- **UI组件**：Ant Design Pro Components
- **数据管理**：模拟API接口，支持异步数据加载
- **响应式设计**：支持不同屏幕尺寸的自适应布局

## 文件结构

```
src/domains/admin/pages/dashboard/
├── index.tsx              # 主页面容器
├── TrendTab.tsx          # 兑换趋势标签页
├── CDKStatsTab.tsx       # CDK统计标签页
└── StockStatsTab.tsx     # 库存统计标签页
```

## API接口

### 扩展的API方法
- `getTrendData(userId?, dimension?)` - 获取趋势数据
- `getCDKStats(appId?, productId?, uploaderId?)` - 获取CDK统计
- `getStockStats(appId?, productId?)` - 获取库存统计

### 数据类型
- `TrendData` - 趋势数据结构
- `TrendResponse` - 趋势响应结构
- `CDKStatResponse` - CDK统计响应结构
- `StockStatResponse` - 库存统计响应结构

## 使用说明

1. 访问管理员后台，点击"仪表盘"菜单项
2. 使用顶部标签页切换不同功能视图
3. 在各标签页中使用筛选器过滤数据
4. 点击"刷新数据"按钮更新图表信息
5. 图表支持交互式操作，如鼠标悬停查看详细数据

## 特性亮点

- 🎨 **美观的图表设计**：使用ECharts提供专业的数据可视化
- 🔄 **实时数据更新**：支持手动刷新获取最新数据
- 📱 **响应式布局**：适配各种设备屏幕
- 🎯 **灵活的筛选**：多维度数据筛选功能
- 💫 **流畅的动画**：图表加载和切换带有平滑动画效果