# CMDB - HomeLab 服务配置管理数据库 / HomeLab Service CMDB

[English](#english) | [中文](#中文)

---

## 中文

[![Version](https://img.shields.io/badge/version-0.2.0--alpha-blue)](https://github.com/Aiyqz/cmdb/releases)
[![License](https://img.shields.io/badge/license-MIT-green)](LICENSE)
[![i18n](https://img.shields.io/badge/i18n-中文/English-purple)]()

一个轻量级的配置管理数据库（CMDB），专为 HomeLab 和小型基础设施场景设计。帮助你管理服务清单、依赖关系、凭证配置和健康状态。

### 功能

- **服务管理** - CRUD 管理所有基础设施服务（Web、数据库、Docker、代理、隧道等）
- **依赖拓扑** - 可视化服务间的依赖关系图（基于 Cytoscape.js）
- **健康检查** - 定期检测服务状态，记录响应时间，支持趋势图表
- **凭证管理** - 集中管理各服务的 API Key、Token 等凭证，支持遮罩显示
- **配置管理** - 存储服务的自定义配置项
- **中英文双语** - 界面支持中文/英文切换，每个浏览器标签页独立

### 技术栈

| 层级 | 技术 |
|------|------|
| 前端 | React 18 + TypeScript + Tailwind CSS + Vite + react-i18next |
| 后端 | Node.js + Fastify + Prisma ORM |
| 数据库 | SQLite（零配置，文件型） |
| 拓扑图 | Cytoscape.js + cytoscape-dagre |

### 快速开始

#### 前置要求

- Node.js >= 18
- npm 或 pnpm

#### 安装

```bash
# 克隆仓库
git clone https://github.com/Aiyqz/cmdb.git
cd cmdb

# 安装后端依赖
cd backend
npm install
npx prisma generate
npx prisma db push

# 安装前端依赖
cd ../frontend
npm install
```

#### 运行

```bash
# 终端 1：启动后端（端口 3001）
cd backend
npm run dev

# 终端 2：启动前端（端口 5173）
cd frontend
npm run dev
```

打开 http://localhost:5173 即可访问。

#### 生产构建

```bash
# 前端
cd frontend
npm run build    # 输出到 dist/

# 后端
cd backend
npm run build    # 输出到 dist/
npm start
```

### 项目结构

```
cmdb/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma     # 数据模型定义
│   │   └── seed.ts           # 示例数据
│   ├── src/
│   │   ├── lib/prisma.ts     # Prisma 客户端
│   │   ├── routes/
│   │   │   ├── services.ts       # 服务 CRUD
│   │   │   ├── dependencies.ts   # 依赖关系
│   │   │   ├── credentials.ts    # 凭证管理
│   │   │   ├── configs.ts        # 配置管理
│   │   │   └── health.ts         # 健康检查
│   │   └── index.ts          # Fastify 入口
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── i18n.ts           # 国际化配置
│   │   ├── locales/          # 翻译文件 (zh/en)
│   │   ├── lib/api.ts        # API 封装
│   │   ├── components/       # UI 组件
│   │   ├── pages/            # 页面组件
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── vite.config.ts
│   └── package.json
├── scripts/
│   └── cleanup.sh            # 一键清理
└── README.md
```

### API 端点

| 方法 | 路径 | 描述 |
|------|------|------|
| GET | `/api/services` | 获取所有服务 |
| GET | `/api/services/:id` | 获取服务详情 |
| POST | `/api/services` | 创建服务 |
| PUT | `/api/services/:id` | 更新服务 |
| DELETE | `/api/services/:id` | 删除服务 |
| GET | `/api/dependencies` | 获取所有依赖关系 |
| POST | `/api/dependencies` | 创建依赖关系 |
| DELETE | `/api/dependencies/:id` | 删除依赖关系 |
| GET | `/api/credentials` | 获取所有凭证 |
| POST | `/api/credentials` | 创建凭证 |
| PUT | `/api/credentials/:id` | 更新凭证 |
| DELETE | `/api/credentials/:id` | 删除凭证 |
| GET | `/api/configs` | 获取所有配置 |
| GET | `/api/health/status` | 获取健康状态 |
| POST | `/api/health/check` | 执行健康检查 |

### 清理

```bash
# 停止进程并清理依赖和数据库
./scripts/cleanup.sh
```

### Roadmap

- [ ] 用户认证 & 权限控制
- [ ] 凭证加密存储
- [ ] 自动健康检查（定时任务）
- [ ] WebSocket 实时状态推送
- [ ] Docker Compose 一键部署
- [ ] 服务变更历史审计
- [ ] 导入/导出功能

---

## English

[![Version](https://img.shields.io/badge/version-0.2.0--alpha-blue)](https://github.com/Aiyqz/cmdb/releases)
[![License](https://img.shields.io/badge/license-MIT-green)](LICENSE)
[![i18n](https://img.shields.io/badge/i18n-中文/English-purple)]()

A lightweight Configuration Management Database (CMDB) designed for HomeLab and small infrastructure scenarios. Helps you manage service inventory, dependencies, credentials, and health status.

### Features

- **Service Management** - CRUD for all infrastructure services (Web, Database, Docker, Proxy, Tunnel, etc.)
- **Dependency Topology** - Visualize service dependency graph (powered by Cytoscape.js)
- **Health Check** - Periodic service status detection with response time tracking and trend charts
- **Credential Management** - Centralized storage for API keys, tokens, etc. with mask/unmask toggle
- **Configuration Management** - Store custom config key-values per service
- **i18n** - Chinese/English UI, independent per browser tab

### Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 18 + TypeScript + Tailwind CSS + Vite + react-i18next |
| Backend | Node.js + Fastify + Prisma ORM |
| Database | SQLite (zero-config, file-based) |
| Topology | Cytoscape.js + cytoscape-dagre |

### Quick Start

#### Prerequisites

- Node.js >= 18
- npm or pnpm

#### Install

```bash
git clone https://github.com/Aiyqz/cmdb.git
cd cmdb

# Install backend dependencies
cd backend
npm install
npx prisma generate
npx prisma db push

# Install frontend dependencies
cd ../frontend
npm install
```

#### Run

```bash
# Terminal 1: start backend (port 3001)
cd backend
npm run dev

# Terminal 2: start frontend (port 5173)
cd frontend
npm run dev
```

Open http://localhost:5173 to access the app.

#### Production Build

```bash
# Frontend
cd frontend
npm run build    # output to dist/

# Backend
cd backend
npm run build    # output to dist/
npm start
```

### Project Structure

```
cmdb/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma     # Data model
│   │   └── seed.ts           # Seed data
│   ├── src/
│   │   ├── lib/prisma.ts     # Prisma client
│   │   ├── routes/
│   │   │   ├── services.ts       # Service CRUD
│   │   │   ├── dependencies.ts   # Dependencies
│   │   │   ├── credentials.ts    # Credentials
│   │   │   ├── configs.ts        # Configs
│   │   │   └── health.ts         # Health check
│   │   └── index.ts          # Fastify entry
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── i18n.ts           # i18n config
│   │   ├── locales/          # Translation files (zh/en)
│   │   ├── lib/api.ts        # API client
│   │   ├── components/       # UI components
│   │   ├── pages/            # Page components
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── vite.config.ts
│   └── package.json
├── scripts/
│   └── cleanup.sh
└── README.md
```

### API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/services` | List all services |
| GET | `/api/services/:id` | Get service detail |
| POST | `/api/services` | Create service |
| PUT | `/api/services/:id` | Update service |
| DELETE | `/api/services/:id` | Delete service |
| GET | `/api/dependencies` | List all dependencies |
| POST | `/api/dependencies` | Create dependency |
| DELETE | `/api/dependencies/:id` | Delete dependency |
| GET | `/api/credentials` | List all credentials |
| POST | `/api/credentials` | Create credential |
| PUT | `/api/credentials/:id` | Update credential |
| DELETE | `/api/credentials/:id` | Delete credential |
| GET | `/api/configs` | List all configs |
| GET | `/api/health/status` | Get health status |
| POST | `/api/health/check` | Trigger health check |

### Cleanup

```bash
./scripts/cleanup.sh
```

### Roadmap

- [ ] User auth & RBAC
- [ ] Encrypted credential storage
- [ ] Scheduled health checks (cron)
- [ ] WebSocket real-time status push
- [ ] One-click Docker Compose deployment
- [ ] Service change audit log
- [ ] Import / Export

---

## License

MIT
