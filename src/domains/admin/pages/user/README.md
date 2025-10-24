# 用户管理

用户管理功能位于 `src/domains/admin/pages/user` 目录下，提供完整的用户增删查改功能。

## 功能特性

- ✅ 用户列表展示（分页）
- ✅ 用户搜索（按用户ID搜索）
- ✅ 角色筛选（管理员/库存管理）
- ✅ 新建用户（弹窗表单）
- ✅ 编辑用户（弹窗表单）
- ✅ 删除用户（单个/批量）
- ✅ 批量复制用户信息到剪切板
- ✅ 列表状态持久化（localStorage）
- ✅ 响应式设计

## 数据模型

```typescript
interface User {
  id: string;          // 用户唯一标识
  createdAt: string;   // 创建时间
  user_id: string;     // 用户ID（邮箱/手机号等）
  role: "admin" | "stock";  // 用户角色
}
```

## 组件结构

```
user/
├── index.tsx          # 主页面组件
├── styles.css         # 页面样式
└── README.md          # 说明文档
```

## API接口

- `getFilterOptions()` - 获取筛选选项
- `getList(params)` - 获取用户列表（支持分页、搜索、筛选）
- `create(data)` - 创建新用户
- `update(id, data)` - 更新用户信息
- `delete(id)` - 删除单个用户
- `batchDelete(ids)` - 批量删除用户

## 使用说明

1. 访问管理后台，点击左侧菜单"用户管理"
2. 在搜索框中输入用户ID进行搜索
3. 使用角色下拉框筛选用户
4. 点击"新建"按钮创建用户
5. 点击操作列的"编辑"/"删除"按钮管理用户
6. 勾选多行后可进行批量操作

## 表单验证

- 用户ID：必填，支持字母、数字、@、.、_、-字符
- 角色：必填，选择"管理员"或"库存管理"