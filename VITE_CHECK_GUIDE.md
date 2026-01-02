# Vite 代码质量检查指南

## 📋 可用的检查命令

### 🔍 基础检查命令

```bash
# TypeScript 类型检查
npm run type-check

# ESLint 代码规范检查
npm run lint

# ESLint 自动修复
npm run lint:fix

# 完整构建检查（包含类型检查）
npm run build

# Bundle 分析（会打开浏览器显示分析结果）
npm run build:analyze

# 🚀 一键运行所有检查
npm run check
```

## 🎯 各检查命令详解

### 1. `npm run type-check`

- **作用**：仅运行 TypeScript 类型检查，不生成文件
- **输出**：无输出表示类型检查通过
- **用途**：快速检查类型错误

### 2. `npm run lint`

- **作用**：运行 ESLint 检查代码规范
- **输出**：显示代码规范问题
- **用途**：确保代码风格一致性和潜在问题

### 3. `npm run lint:fix`

- **作用**：自动修复可以修复的 ESLint 问题
- **输出**：修复后的状态报告
- **用途**：快速修复常见的代码格式问题

### 4. `npm run build`

- **作用**：完整的生产构建流程
- **包含**：
  - TypeScript 类型检查 (`tsc -b`)
  - Vite 构建打包
- **输出**：`dist/` 文件夹中的构建产物
- **用途**：最终的发布前检查

### 5. `npm run build:analyze`

- **作用**：构建并分析 Bundle 大小
- **特色**：
  - 自动打开浏览器显示可视化分析结果
  - 显示每个模块的大小和依赖关系
- **输出**：构建产物 + `dist/stats.html` 分析报告
- **用途**：优化打包体积，发现大模块

### 6. `npm run check`

- **作用**：一键运行所有主要检查
- **包含**：ESLint → TypeScript → 构建检查
- **输出**：详细的检查过程和结果
- **用途**：提交代码前的完整检查

## 📊 Bundle 分析结果解读

运行 `npm run build:analyze` 后，你会看到：

### Chunk 分包策略

- `vendor-*.js`：React 等核心库 (≈12KB)
- `antd-*.js`：Ant Design 相关组件 (≈1.8MB)
- `charts-*.js`：ECharts 图表库 (≈1.1MB)
- `index-*.js`：业务代码 (≈262KB)

### 优化建议

- ✅ 已实现代码分割，按模块分离
- ⚠️ Ant Design 和 ECharts 较大，但按需加载
- 📈 总体大小合理，符合企业级应用标准

## 🛠 开发流程建议

### 日常开发

```bash
# 开启开发服务器
npm run dev

# 随时检查类型（快速）
npm run type-check

# 随时修复格式问题
npm run lint:fix
```

### 提交前

```bash
# 完整检查，确保无问题
npm run check
```

### 发布前

```bash
# 分析打包体积，确认无异常
npm run build:analyze

# 正式构建
npm run build
```

## 🚨 常见问题解决

### TypeScript 错误

- 检查类型定义文件
- 确认导入导出正确
- 使用 `npm run type-check` 快速定位

### ESLint 错误

- 使用 `npm run lint:fix` 自动修复
- 手动处理无法自动修复的问题
- 参考 `.eslintrc.cjs` 配置

### 构建错误

- 通常是 TypeScript 编译错误
- 检查依赖是否正确安装
- 确认 Vite 配置正确

## 📈 性能指标

### 当前项目状态

- ✅ **类型检查**：无错误
- ✅ **代码规范**：符合规范
- ✅ **构建成功**：正常打包
- ✅ **代码分割**：合理的分包策略
- ⚡ **启动速度**：快速热更新

### Bundle 大小分析

- 总大小：≈3.2MB (gzipped: ≈1MB)
- 首屏加载：vendor + core + styles ≈ 500KB
- 按需加载：图表库等在需要时加载

## 🔧 自定义配置

### 添加新的检查项

可以在 `package.json` 中添加更多脚本：

```json
{
  "scripts": {
    "test": "vitest",
    "coverage": "vitest --coverage",
    "size-limit": "size-limit",
    "pre-commit": "npm run check"
  }
}
```

### Vite 配置优化

当前已配置：

- 代码分割 (manualChunks)
- Bundle 分析插件
- 构建优化

可根据需要进一步调整 `vite.config.ts`。

---

🎉 **现在你可以使用这些命令来确保代码质量和构建正确性！**
