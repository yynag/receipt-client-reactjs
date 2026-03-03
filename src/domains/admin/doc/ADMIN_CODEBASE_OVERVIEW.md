# Admin 子站代码导览

更新时间：2026-03-03
目录：`src/domains/admin`

## 1. 入口与路由

- 路由注册在 `src/main.tsx`
  - `path: /admin-1an3m`
  - `element: lazy(() => import('./domains/admin'))`
- 首页导航入口在 `src/domains/home/index.tsx` 的应用卡片中也指向 `/admin-1an3m`。

## 2. Admin 主体结构

- 根入口：`src/domains/admin/index.tsx`
  - `AdminEntry`：包裹 `StoreProvider`
  - `ThemedAdminApp`：注入 antd 主题（亮/暗）
  - `AdminPage`：页面壳（Header / Sider / Content / Footer）
  - `ContentPage`：按菜单 key 切换子页面
- 登录页：`src/domains/admin/login.tsx`
  - 调用 `userApi.login`
  - 登录成功后通过 `setUser` 写入全局 store

## 3. 全局状态与主题

- 文件：`src/domains/admin/store/index.tsx`
- 状态：
  - `theme: 'light' | 'dark'`
  - `user: { id, user_id, role, token } | null`
- 派生：
  - `isAdmin = state.user?.role === 'admin'`
- 关键动作：
  - `toggleTheme`
  - `setUser`
  - `logout`
- `useStore` Hook 在 `src/domains/admin/store/hook.tsx`。

## 4. 请求层与鉴权

- 公共请求：`src/domains/admin/api/shared.ts`
  - `baseUrl = https://receipt-api.nitro.xin`
  - `request()` 自动读取 `localStorage.user_token` 注入 `Authorization: Bearer ...`
  - 响应 401 时会清理 `user_token`
- 业务 API：
  - `api/user.ts`：登录、用户列表、创建、更新、删除
  - `api/cdk.ts`：CDK 列表、创建、删除、筛选项、统计、趋势
  - `api/stock.ts`：库存列表、删除、导入、筛选项、统计
  - `api/product.ts`：应用/商品列表
  - `api/external.ts`：Raw/批量 Raw 入库接口

## 5. 页面职责

### 5.1 仪表盘 `pages/dashboard`

- 入口：`pages/dashboard/index.tsx`
- 4 个 Tab：
  - `TrendTab.tsx`：兑换趋势折线图（year/month/pre_month/today）
  - `CDKStatsTab.tsx`：CDK 已使用/未使用统计（堆叠柱状）
  - `StockStatsTab.tsx`：库存已兑换/未兑换统计（堆叠柱状）
  - `StockCDKStatsTab.tsx`：CDK 与库存对比统计
- 图表库：`echarts-for-react`（懒加载）

### 5.2 CDK 管理 `pages/cdk/index.tsx`

- 表格：`ProTable<CDK>`
- 功能：
  - 列表分页、筛选
  - 单条删除
  - 批量复制 CDK code 到剪贴板
  - 批量删除
  - 新建 CDK（ModalForm，按 app/product/quantity）
- 新建弹窗中产品来源：`productApi.list()`

### 5.3 库存管理 `pages/stock/index.tsx`

- 表格：`ProTable<ListStock>`
- 功能：
  - 列表分页、筛选
  - 单条导出 JSON（zip）
  - 单条删除
  - 批量导出 JSON（zip）
  - 批量删除
  - 批量导入 Raw / iOS Excel
- Excel 解析：
  - 文件：`pages/stock/stock_excel.ts`
  - `parse_stock_excel(ArrayBuffer)` 转为后端需要字段

### 5.4 用户管理 `pages/user/index.tsx`

- 表格：`ProTable<ListUser>`
- 功能：
  - 列表分页、筛选（role）
  - 单条删除
  - 批量复制用户信息到剪贴板
  - 批量删除
  - 新建用户
  - 编辑用户

## 6. 样式与主题变量

- Admin 页面样式覆盖：`src/domains/admin/styles.css`
- 页面局部样式：
  - `pages/dashboard/styles.css`
  - `pages/user/styles.css`
  - `pages/cdk/styles.css`（当前未在页面中显式 import）
- 全局主题 token：`src/styles/tokens.css`
  - `body.dark` 下切换 admin 相关 CSS 变量

## 7. 当前已识别的风险点（待修复）

1. `StockPage` / `UserPage` 的 `ProTable rowKey` 使用了 `"ID"`，但数据字段主要是 `id`，可能影响选中与批量操作稳定性。  
2. `logout` 只清理了 `user`，未显式清理 `user_token`，存在状态不一致风险。  
3. `productApi.list` 的 URL 查询拼接逻辑可疑（`/products` 后直接拼 `&query`）。  
4. `stockApi.getList` 中 `used` 条件判断方式可能导致 `false/0` 过滤失效。  
5. `StockPage` 批量导入分片逻辑中 `end` 边界条件可疑，可能导致分片异常。  

## 8. 后续维护建议

- 统一检查 API 参数拼接与类型（`id/ID`, `created_at/CreatedAt`）。
- 对 `rowKey`、筛选参数、批量导入分片增加最小单元测试或至少集成回归清单。
- 将“登录态（store.user）”与“鉴权 token（localStorage.user_token）”做统一生命周期管理。
