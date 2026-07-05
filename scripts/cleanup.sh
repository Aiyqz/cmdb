#!/bin/bash
# CMDB 一键清理脚本
# Usage: ./scripts/cleanup.sh [project-path]

PROJECT_DIR="${1:-$(cd "$(dirname "$0")/.." && pwd)}"

echo "🗑️  CMDB 一键清理脚本"
echo "⚠️  项目路径: $PROJECT_DIR"
echo "⚠️  这将停止后端/前端进程并删除 node_modules 和数据库文件！"
read -p "确定要继续吗？(y/N) " confirm
if [ "$confirm" != "y" ] && [ "$confirm" != "Y" ]; then
    echo "已取消"
    exit 0
fi

# 停止正在运行的进程（通过端口查找）
echo "停止后端进程 (port 3001)..."
lsof -ti:3001 2>/dev/null | xargs kill -9 2>/dev/null

echo "停止前端进程 (port 5173)..."
lsof -ti:5173 2>/dev/null | xargs kill -9 2>/dev/null

# 清理依赖和数据库
echo "清理 node_modules..."
rm -rf "$PROJECT_DIR/backend/node_modules"
rm -rf "$PROJECT_DIR/frontend/node_modules"

echo "清理数据库..."
rm -f "$PROJECT_DIR/backend/prisma/cmdb.db"
rm -f "$PROJECT_DIR/backend/prisma/cmdb.db-journal"

echo "清理构建产物..."
rm -rf "$PROJECT_DIR/backend/dist"
rm -rf "$PROJECT_DIR/frontend/dist"

echo "✅ 清理完成"
echo "如需完全删除项目，请手动执行: rm -rf $PROJECT_DIR"
