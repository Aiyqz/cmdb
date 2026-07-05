<div align="center">

# CMDB

### HomeLab 服务配置管理数据库

[![Version](https://img.shields.io/github/v/tag/Aiyqz/cmdb?label=version)](https://github.com/Aiyqz/cmdb/releases)
[![License](https://img.shields.io/github/license/Aiyqz/cmdb)](LICENSE)
[![i18n](https://img.shields.io/badge/i18n-%E4%B8%AD%E6%96%87%20%2F%20English-purple)]()
[![GitHub Stars](https://img.shields.io/github/stars/Aiyqz/cmdb?style=social)](https://github.com/Aiyqz/cmdb)

[中文](#cmdb) | [English](README.md)

</div>

---

一个轻量级的**配置管理数据库（CMDB）**，专为 HomeLab 和小型基础设施场景设计。统一管理服务清单、依赖关系、凭证配置和健康状态。

> **状态：** `v0.2.0-alpha` — 早期开发阶段，功能可能变动。

## 截图

> 📷 截图待补充，欢迎贡献！

## 功能特性

| | |
|---|---|
| **服务管理** | CRUD 管理所有基础设施服务（Web、数据库、Docker、代理、隧道等） |
| **依赖拓扑** | 基于 Cytoscape.js 的可视化服务依赖关系图 |
| **健康检查** | TCP/HTTP 定期检测，记录响应时间，支持趋势图表 |
| **凭证管理** | 集中管理 API Key、Token 等凭证，支持遮罩显示 |
| **配置管理** | 按服务存储自定义配置键值对 |
| **中英文双语** | 界面支持中英文切换，每个浏览器标签页独立（`?lng=xx`） |
| **深色/亮色主题** | 自动跟随系统偏好 |

## 技术栈

| 层级 | 技术 |
|------|------|
| 前端 | React 18 · TypeScript · Tailwind CSS · Vite · react-i18next |
| 后端 | Node.js · Fastify · Prisma ORM |
| 数据库 | SQLite（零配置，文件型） |
| 拓扑图 | Cytoscape.js · cytoscape-dagre |

## 快速开始

### 前置要求

- Node.js >= 18
- npm 或 pnpm

### 1. 克隆仓库

```bash
git clone https://github.com/Aiyqz/cmdb.git
cd cmdb
```

### 2. 启动后端

```bash
cd backend
npm install
npx prisma generate
npx prisma db push
npm run dev        # → http://localhost:3001
```

### 3. 启动前端

```bash
cd ../frontend
npm install
npm run dev        # → http://localhost:5173
```

打开 **http://localhost:5173** 即可访问。

### 生产构建

```bash
# 前端
cd frontend && npm run build    # 输出到 dist/

# 后端
cd backend && npm run build && npm start
```

## 项目结构

```
cmdb/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma     # 数据模型定义
│   │   └── seed.ts           # 示例种子数据（不含真实凭证）
│   ├── src/
│   │   ├── routes/           # API 路由（services/dependencies/credentials/configs/health）
│   │   └── index.ts          # Fastify 入口
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── i18n.ts           # 国际化配置
│   │   ├── locales/          # 翻译文件（zh.json, en.json）
│   │   ├── components/       # 可复用 UI 组件
│   │   ├── pages/            # 页面组件（Services/Health/Topology/ServiceDetail）
│   │   ├── hooks/            # 自定义 Hooks（useHealth）
│   │   └── lib/              # 工具函数（api.ts, types.ts）
│   └── package.json
├── scripts/
│   └── cleanup.sh            # 停止进程并清理
└── README.md
```

## API 端点

### 服务

| 方法 | 路径 | 描述 |
|------|------|------|
| GET | `/api/services` | 获取所有服务 |
| GET | `/api/services/:id` | 获取服务详情（含依赖关系） |
| POST | `/api/services` | 创建服务 |
| PUT | `/api/services/:id` | 更新服务 |
| DELETE | `/api/services/:id` | 删除服务 |

### 依赖关系

| 方法 | 路径 | 描述 |
|------|------|------|
| GET | `/api/dependencies` | 获取所有依赖关系 |
| POST | `/api/dependencies` | 创建依赖关系 |
| DELETE | `/api/dependencies/:id` | 删除依赖关系 |

### 凭证 & 配置

| 方法 | 路径 | 描述 |
|------|------|------|
| GET/POST | `/api/credentials` | 获取 / 创建凭证 |
| PUT/DELETE | `/api/credentials/:id` | 更新 / 删除凭证 |
| GET | `/api/configs` | 获取所有配置 |

### 健康检查

| 方法 | 路径 | 描述 |
|------|------|------|
| GET | `/api/health/status` | 获取所有服务健康状态 |
| POST | `/api/health/check` | 触发单个服务健康检查 |

## 数据安全 & Git 规范

- **本地数据库**（`dev.db`）已加入 `.gitignore`，不会提交到 Git
- **种子数据**（`seed.ts`）仅包含示例条目，不含真实凭证或域名
- **Pre-commit Hook** 会在每次提交前扫描敏感信息（IP 地址、域名、密码等）
- 真实服务数据仅存在于本地 SQLite 文件中

详见 [docs/git-workflow.md](docs/git-workflow.md)。

## Roadmap

- [ ] 用户认证 & 权限控制
- [ ] 凭证加密存储（AES-256）
- [ ] 定时健康检查（cron / node-schedule）
- [ ] WebSocket 实时状态推送
- [ ] Docker Compose 一键部署
- [ ] 服务变更审计日志
- [ ] 导入 / 导出（JSON）
- [ ] 移动端响应式布局

## 贡献指南

欢迎贡献！请按以下步骤操作：

1. Fork 本仓库
2. 创建功能分支（`git checkout -b feat/your-feature`）
3. 提交清晰的 commit 信息（`feat: add xxx` / `fix: correct xxx`）
4. 推送并发起 Pull Request

确保 pre-commit hook 检查通过（会自动扫描泄漏的凭证/IP 地址）。

## 开源协议

[MIT License](LICENSE) — © 2026 Zhang Yingqi

---

<div align="center">
  <sub>为 HomeLab 而生，由 HomeLab 驱动。</sub>
</div>
