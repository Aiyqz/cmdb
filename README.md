<div align="center">

# CMDB

### HomeLab Service Configuration Management Database

[![Version](https://img.shields.io/github/v/tag/Aiyqz/cmdb?label=version)](https://github.com/Aiyqz/cmdb/releases)
[![License](https://img.shields.io/github/license/Aiyqz/cmdb)](LICENSE)
[![i18n](https://img.shields.io/badge/i18n-中文%20%2F%20English-purple)]()
[![GitHub Stars](https://img.shields.io/github/stars/Aiyqz/cmdb?style=social)](https://github.com/Aiyqz/cmdb)

[English](#cmdb) | [中文](README_zh.md)

</div>

---

A lightweight **Configuration Management Database (CMDB)** designed for HomeLab and small infrastructure. Manage service inventory, dependencies, credentials, and health status — all in one place.

> **Status:** `v0.2.0-alpha` — Early development. Features may change.

## Screenshots

> 📷 Screenshots coming soon. Feel free to contribute!

## Features

| | |
|---|---|
| **Service CRUD** | Manage all infrastructure services (Web, Database, Docker, Proxy, Tunnel, etc.) |
| **Dependency Topology** | Visual service dependency graph powered by Cytoscape.js |
| **Health Monitoring** | Periodic TCP/HTTP health checks with response time tracking and trend charts |
| **Credential Vault** | Centralized API keys/tokens storage with mask/unmask toggle |
| **Config Store** | Key-value config storage per service |
| **i18n** | Chinese/English UI — independent per browser tab (`?lng=xx`) |
| **Dark/Light Theme** | Auto-detects system preference |

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 18 · TypeScript · Tailwind CSS · Vite · react-i18next |
| Backend | Node.js · Fastify · Prisma ORM |
| Database | SQLite (zero-config, file-based) |
| Topology | Cytoscape.js · cytoscape-dagre |

## Quick Start

### Prerequisites

- Node.js >= 18
- npm or pnpm

### 1. Clone

```bash
git clone https://github.com/Aiyqz/cmdb.git
cd cmdb
```

### 2. Start Backend

```bash
cd backend
npm install
npx prisma generate
npx prisma db push
npm run dev        # → http://localhost:3001
```

### 3. Start Frontend

```bash
cd ../frontend
npm install
npm run dev        # → http://localhost:5173
```

Open **http://localhost:5173** to access the dashboard.

### Production Build

```bash
# Frontend
cd frontend && npm run build    # output: dist/

# Backend
cd backend && npm run build && npm start
```

## Project Structure

```
cmdb/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma     # Data model
│   │   └── seed.ts           # Seed data (example only, no real credentials)
│   ├── src/
│   │   ├── routes/           # API routes (services, dependencies, credentials, configs, health)
│   │   └── index.ts          # Fastify entry point
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── i18n.ts           # i18n config
│   │   ├── locales/          # Translation files (zh.json, en.json)
│   │   ├── components/       # Reusable UI components
│   │   ├── pages/            # Page components (Services, Health, Topology, ServiceDetail)
│   │   ├── hooks/            # Custom hooks (useHealth)
│   │   └── lib/              # Utilities (api.ts, types.ts)
│   └── package.json
├── scripts/
│   └── cleanup.sh            # Stop processes & clean up
└── README.md
```

## API Endpoints

### Services

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/services` | List all services |
| GET | `/api/services/:id` | Get service detail (with dependencies) |
| POST | `/api/services` | Create service |
| PUT | `/api/services/:id` | Update service |
| DELETE | `/api/services/:id` | Delete service |

### Dependencies

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/dependencies` | List all dependencies |
| POST | `/api/dependencies` | Create dependency |
| DELETE | `/api/dependencies/:id` | Delete dependency |

### Credentials & Configs

| Method | Path | Description |
|--------|------|-------------|
| GET/POST | `/api/credentials` | List / Create credential |
| PUT/DELETE | `/api/credentials/:id` | Update / Delete credential |
| GET | `/api/configs` | List all configs |

### Health

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/health/status` | Get all services health status |
| POST | `/api/health/check` | Trigger health check for a service |

## Data Privacy & Git Workflow

- **Local database** (`dev.db`) is in `.gitignore` — never committed
- **Seed data** (`seed.ts`) contains only example entries — no real credentials or domains
- **Pre-commit hook** scans for sensitive patterns (IP addresses, domains, passwords) before every commit
- Real service data lives only in your local SQLite file

See [docs/git-workflow.md](docs/git-workflow.md) for details.

## Roadmap

- [ ] User authentication & RBAC
- [ ] Encrypted credential storage (AES-256)
- [ ] Scheduled health checks (cron / node-schedule)
- [ ] WebSocket real-time status push
- [ ] One-click Docker Compose deployment
- [ ] Service change audit log
- [ ] Import / Export (JSON)
- [ ] Mobile responsive layout

## Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch (`git checkout -b feat/your-feature`)
3. Commit with a clear message (`feat: add xxx` / `fix: correct xxx`)
4. Push and open a Pull Request

Make sure the pre-commit hook passes (it scans for leaked credentials/IPs).

## License

[MIT License](LICENSE) — © 2026 Zhang Yingqi

---

<div align="center">
  <sub>Built for HomeLab, by HomeLab.</sub>
</div>
