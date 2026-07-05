# Git 版本管理指南

## 安全机制

### 已配置的保护

| 保护项 | 机制 | 说明 |
|--------|------|------|
| 数据库文件 | `.gitignore` | `*.db` 不会进 git |
| 环境变量 | `.gitignore` | `.env` 不会进 git |
| node_modules | `.gitignore` | 依赖不进 git |
| 敏感信息扫描 | `pre-commit` hook | 每次提交自动扫描 IP/域名/密码 |

### Pre-commit Hook

已安装 `scripts/pre-commit` 到 `.git/hooks/pre-commit`，每次 `git commit` 自动执行：

- 扫描内网 IP（192.168.x.x / 10.0.x.x）
- 扫描真实域名
- 扫描密码/密钥模式（password= / secret= / token=）
- 阻止 .env / .db 文件被提交

如果误报，可以 `git commit --no-verify` 跳过（但请确认确实安全）。

## 版本号规则

采用语义化版本（Semantic Versioning）：

```
v<major>.<minor>.<patch>-<prerelease>

v0.1.0-alpha   ← 当前版本（0.x = 早期开发阶段）
v0.2.0-alpha   ← 新功能
v0.9.0-beta    ← 功能完整，待测试
v1.0.0         ← 第一个正式版
v1.1.0         ← 新增功能
v1.0.1         ← Bug 修复
```

- **major=0**: 还在开发阶段，API 可能随时变
- **alpha**: 功能不完整，可能有 Bug
- **beta**: 功能完整，需要测试反馈
- **正式版**: 经过验证，可以放心用

## 工作流

### 日常开发

```bash
# 1. 改代码
# 2. 查看改动
git status
git diff

# 3. 暂存
git add -A

# 4. 提交（pre-commit hook 自动扫描敏感信息）
git commit -m "feat: 新增XXX功能"
git commit -m "fix: 修复XXX问题"
git commit -m "docs: 更新文档"

# 5. 推送
git push origin main
```

### 发布新版本

```bash
# 1. 确认所有改动已提交
git status  # 应该是 clean

# 2. 打标签
git tag -a v0.2.0-alpha -m "v0.2.0-alpha - 新增XXX"

# 3. 推送标签
git push origin v0.2.0-alpha

# 4. 在 GitHub 上创建 Release（可选）
gh release create v0.2.0-alpha --notes "变更说明"
```

### 提交信息规范

```
<type>: <description>

类型：
  feat     新功能
  fix      Bug 修复
  docs     文档变更
  style    代码格式（不影响逻辑）
  refactor 重构
  test     测试
  chore    构建/工具变更
```

## 本地数据 vs Git 仓库

```
本地 (你的机器)                    Git 仓库 (GitHub)
┌─────────────────────┐           ┌─────────────────────┐
│ cmdb.db (SQLite)    │     ✗     │ seed.ts (示例数据)  │
│ 真实服务数据         │  不推送    │ 通用示例数据         │
│ 真实 IP/域名/端口    │           │ example.com 演示     │
├─────────────────────┤           ├─────────────────────┤
│ .env (本地配置)     │     ✗     │ .env.example (模板) │
│ 真实密码/密钥        │  不推送    │ 空值占位符           │
├─────────────────────┤           ├─────────────────────┤
│ 源代码              │     ✓     │ 源代码              │
│ (不含敏感信息)       │   推送    │ (不含敏感信息)       │
└─────────────────────┘           └─────────────────────┘
```

**原则：真实数据只存本地数据库，代码仓库永远只有示例数据。**
