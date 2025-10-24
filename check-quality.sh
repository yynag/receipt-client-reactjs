#!/bin/bash

# 代码质量检查脚本
echo "🔍 开始代码质量检查..."

echo "1. 📝 运行ESLint检查..."
npm run lint
if [ $? -ne 0 ]; then
    echo "❌ ESLint检查失败"
    exit 1
fi
echo "✅ ESLint检查通过"

echo "2. 🔧 运行TypeScript类型检查..."
npm run type-check
if [ $? -ne 0 ]; then
    echo "❌ TypeScript类型检查失败"
    exit 1
fi
echo "✅ TypeScript类型检查通过"

echo "3. 🏗️ 运行构建检查..."
npm run build
if [ $? -ne 0 ]; then
    echo "❌ 构建失败"
    exit 1
fi
echo "✅ 构建成功"

echo "🎉 所有代码质量检查通过！"