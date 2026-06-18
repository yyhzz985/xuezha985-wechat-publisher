# AGENTS.md

## 项目用途

本项目是面向公众号写作者的 Obsidian 插件。它把 Markdown 笔记转换成微信公众号样式 HTML，提供实时预览、剪贴板复制，以及 Pro 专属的草稿箱和图片上传能力。

## 项目契约

每次有实质工作前后，都要保持这些文件最新：

```text
AGENTS.md
README.md
docs/00-product.md
docs/01-architecture.md
docs/02-tech-stack.md
docs/03-roadmap.md
docs/04-decisions.md
docs/05-standards.md
docs/06-ui-style.md
docs/07-project-map.md
tasks/current.md
tasks/backlog.md
tasks/done.md
.ai/goals.md
.ai/findings.md
.ai/handoff/current.md
.ai/handoff/session-log.md
.ai/handoff/next.md
.ai/handoff/blockers.md
.ai/checks/latest.md
```

如果规则变化，先更新本文件，再改变实际做法。

## 目录规则

```text
src/        Obsidian 插件源码。
  view/        UI、面板、设置页、通知。
  controller/  Obsidian 命令和工作流编排。
  service/     Markdown 渲染、剪贴板、WeChat API、授权逻辑。
  repository/  Obsidian 设置和 vault 文件访问。
  utils/       纯工具函数。
tests/      Node test runner 回归测试。
worker/     Cloudflare Worker 授权服务、D1 repository、迁移、脚本。
scripts/    本地打包辅助脚本。
docs/       产品、架构、规范、用户文档、开发日志。
tasks/      当前任务、backlog、完成记录、review。
.ai/        goals、findings、checks、handoff 状态，供 AI 接力。
dist/       生成的插件 zip 包。已被 git 忽略。
```

根目录 `main.js` 是生成的 Obsidian 插件 bundle，但仓库会跟踪它作为发布资产。不要手改它。源码变化后，运行构建或打包命令重新生成。

## 开发规则

- 项目文档默认使用中文，除非文件上下文本来就是英文。
- 写代码前先读 `tasks/current.md`。
- 一次只做一个当前任务。
- 不添加未要求的功能。
- 不重构无关代码。
- 每个实现改动都必须能追溯到当前任务。
- 保持现有五层结构：View -> Controller -> Service -> Utils / Repository。
- 外部 API 逻辑不要放进 View 文件。
- 业务规则不要放进 Repository 文件。
- 已接受的 bug、风险或缺失需求记录到 `.ai/findings.md`。
- 验证后更新 `.ai/checks/latest.md`。
- 会话结束前更新 `.ai/handoff/current.md`。

## 验证

在仓库根目录使用这些命令：

```powershell
npm test
npm run build
```

发布打包：

```powershell
npm run package:plugin
```

仅在任务明确批准后，才允许做 Worker dry-run：

```powershell
cd worker
npx wrangler deploy --dry-run
```

代码改动至少要跑 `npm test` 和 `npm run build` 后才能声称完成。文档-only 任务例外，但原因必须写入 `.ai/checks/latest.md`。

## 红线

以下操作必须先问用户：

- 删除文件或目录。
- 批量移动文件。
- 使用 `git reset`、`git checkout --` 或回滚命令。
- 修改 `.env`、`.dev.vars`、token、secret、账号凭据或认证配置。
- 修改 Cloudflare Worker 生产配置、CI/CD、部署配置或生产设置。
- 修改 D1 schema、运行迁移或批量编辑生产数据。
- 运行 `wrangler deploy`、发布 GitHub Release、上传 BRAT 资产、生产部署或发布 package。
- 安装全局依赖或修改系统配置。

不要把 AppSecret、License Key CSV 内容、admin token 或本地 secret 文件内容输出到日志或文档。

## 当前稳定化优先级

以 `tasks/current.md` 作为当前任务来源。只有项目文档契约保持最新，并且下一个任务明确批准后，才开始代码改动。
