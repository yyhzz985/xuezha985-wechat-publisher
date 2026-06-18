# 当前交接

## 当前目标

准备新对话执行 `OBS-PUBLISH-001`：Obsidian 官方插件社区上架前合规整改。

## 项目状态

- 本项目是用于公众号 Markdown 预览、复制和 Pro 上传的 Obsidian 插件。
- Cloudflare Worker 处理 License 校验和 admin license 操作。
- 当前版本是 `0.1.4`。
- 当前分支是 `main`，跟踪 `origin/main`。
- 已创建本地 checkpoint：`de4e51a`，commit message 为 `checkpoint: current project state`。
- 已创建计划 checkpoint：`0d5991c`，commit message 为 `checkpoint: official plugin submission plan`。
- 当前工作区 clean，分支 `main` 相对 `origin/main` ahead 2。

## 本轮已完成

- 将 `AGENTS.md`、`docs/00-07`、`tasks/` 和 `.ai/` 中的 product-dev-workflow 文档标题、字段、说明、任务描述和 handoff 内容改为中文。
- 保留文件名、路径、命令、变量名、API 名和包名为英文。
- 对 git status、根目录结构、docs、package/config、入口文件、测试、生成资产、Worker 风险和最近 commits 做了只读审计。
- 用户确认“可以补文档”后，审阅了现有未跟踪恢复文档。
- 修复了项目契约清单、规范、路线图、决策日志、项目地图、任务台账、findings、checks 和 handoff notes。
- 将 `STAB-001` 标记为完成，并将 `STAB-002` 设为阻塞，等待用户确认。
- 按主人要求创建本地 git 备份：`de4e51a`。
- 将当前任务改为 `OBS-PUBLISH-001`，用于官方插件社区上架前合规整改。
- 将上架拆成命名、`isDesktopOnly`、README/隐私、release asset 验证、本地验证、公开发布提交几个子任务。
- 记录公开发布红线：GitHub Release、push、官方 PR 都需要主人单独确认。
- 创建计划 checkpoint：`0d5991c`。

## 已变更文件

- `AGENTS.md`
- `docs/00-product.md`
- `docs/01-architecture.md`
- `docs/02-tech-stack.md`
- `docs/03-roadmap.md`
- `docs/04-decisions.md`
- `docs/05-standards.md`
- `docs/06-ui-style.md`
- `docs/07-project-map.md`
- `tasks/current.md`
- `tasks/backlog.md`
- `tasks/done.md`
- `.ai/goals.md`
- `.ai/findings.md`
- `.ai/checks/latest.md`
- `.ai/handoff/current.md`
- `.ai/handoff/blockers.md`
- `.ai/handoff/next.md`
- `.ai/handoff/session-log.md`

## 决策

- 先做 documentation-only recovery。
- 不改业务代码、依赖、deployment、D1、secret 或 release。
- 默认代码验证使用 `npm test` 和 `npm run build`。
- Worker deploy、D1 migration、public release、BRAT upload 和 publishing 都视为需要明确批准的动作。
- 官方社区上架先做合规整改准备，不直接发布。
- 当前最大审核风险是 `manifest.name` 中文名和 `isDesktopOnly: false` 与 Electron clipboard fallback 的组合。

## 当前目标

- G001：已完成。把旧项目恢复成文件化 handoff 契约。
- G002：进行中。准备 Obsidian 官方插件社区上架合规整改。
- G003：阻塞。公开发布和官方社区提交，等待主人单独确认。

## 开放发现

- F001：已解决。恢复前项目文档缺失。
- F002：`cover-image/` 未跟踪。
- F003：生成资产和分散资产存在 release workflow 漂移风险。
- F004：Worker 生产安全风险。
- F006：`manifest.name` 中文名可能不符合官方命名期望。
- F007：`isDesktopOnly: false` 与 Electron clipboard fallback 需要处理。
- F008：README 需要补英文/隐私/网络请求说明。
- F009：需要确认并补齐根目录 `LICENSE`。

## 阻塞 / 风险

- GitHub Release、push、官方社区 PR、正式发布都需要主人单独确认。
- Worker deploy、migration、schema/data work 和 production config 变化都需要主人单独确认。
- 新对话执行 `OBS-PUBLISH-001` 可以改文档、manifest、最小必要代码和测试，但不能公开发布。

## 验证

命令：

```powershell
git diff --check
```

结果：

上一轮通过。当前计划文档更新后需要重新运行 `git diff --check`。

已知缺口：

- `npm test` 未跑：当前只是开发计划整理。
- `npm run build` 已跳过，因为本轮是 documentation-only recovery，且 build 会重写已跟踪的生成文件 `main.js`。
- `npm run package:plugin` 已跳过，因为没有请求 release package。
- 没有跑 Obsidian runtime smoke test。
- 没有跑 Worker dry-run。

## 下一步

1. 新对话执行 `OBS-PUBLISH-001`。
2. 先给出官方展示名候选并让主人选定。
3. 再决定 `isDesktopOnly`：桌面端限制或移动端兼容整改。
4. 补 `LICENSE`、README 隐私/网络请求说明、release asset 验证。
5. 跑 `npm test`、`npm run build`、`npm run package:plugin`。
6. 到公开发布前停下，等待主人确认。

## 交接提示

```text
继续本项目时，先读 AGENTS.md、tasks/current.md、tasks/backlog.md、.ai/goals.md、.ai/findings.md、.ai/checks/latest.md、.ai/handoff/current.md、docs/03-roadmap.md、docs/04-decisions.md 和 docs/05-standards.md。执行 OBS-PUBLISH-001：官方插件社区上架前合规整改。不要假设聊天历史。没有主人明确确认，不要 push、创建 GitHub Release、提交官方社区 PR、deploy、migrate、delete，也不要触碰 secrets。
```
