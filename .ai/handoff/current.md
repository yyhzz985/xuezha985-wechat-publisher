# 当前交接

## 当前目标

完成 product-dev-workflow 项目契约文档中文化；`STAB-002` 继续保持阻塞，直到用户确认第一个代码级稳定化目标。

## 项目状态

- 本项目是用于公众号 Markdown 预览、复制和 Pro 上传的 Obsidian 插件。
- Cloudflare Worker 处理 License 校验和 admin license 操作。
- 当前版本是 `0.1.4`。
- 当前分支是 `main`，跟踪 `origin/main`。
- `AGENTS.md`、`docs/00-07`、`tasks/` 和 `.ai/` 中的契约文件是工作区文件，在创建 git checkpoint 前可能仍未跟踪。
- `cover-image/wechat-publisher/prompts/*.md` 未跟踪，且尚无已批准的生命周期决策。

## 本轮已完成

- 将 `AGENTS.md`、`docs/00-07`、`tasks/` 和 `.ai/` 中的 product-dev-workflow 文档标题、字段、说明、任务描述和 handoff 内容改为中文。
- 保留文件名、路径、命令、变量名、API 名和包名为英文。
- 对 git status、根目录结构、docs、package/config、入口文件、测试、生成资产、Worker 风险和最近 commits 做了只读审计。
- 用户确认“可以补文档”后，审阅了现有未跟踪恢复文档。
- 修复了项目契约清单、规范、路线图、决策日志、项目地图、任务台账、findings、checks 和 handoff notes。
- 将 `STAB-001` 标记为完成，并将 `STAB-002` 设为阻塞，等待用户确认。

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

## 当前目标

- G001：已完成。把旧项目恢复成文件化 handoff 契约。
- G002：阻塞。用户确认后，选择并执行第一个代码级稳定化任务。

## 开放发现

- F001：已解决。恢复前项目文档缺失。
- F002：`cover-image/` 未跟踪。
- F003：生成资产和分散资产存在 release workflow 漂移风险。
- F004：Worker 生产安全风险。
- F005：契约文件是 working-tree files，在 checkpoint 前可能仍未跟踪。

## 阻塞 / 风险

- 触碰 `cover-image/` 前需要用户决策。
- stage 或 commit 契约文件前需要用户请求。
- deploy、release、migration 或 production config 变化前需要用户确认。
- 尚未批准任何代码级稳定化任务。

## 验证

命令：

```powershell
git diff --check
```

结果：

通过。`git diff --check` 无输出，退出码 0。

已知缺口：

- `npm test` 未跑：本轮只改文档，用户只要求 `git diff --check`。
- `npm run build` 已跳过，因为本轮是 documentation-only recovery，且 build 会重写已跟踪的生成文件 `main.js`。
- `npm run package:plugin` 已跳过，因为没有请求 release package。
- 没有跑 Obsidian runtime smoke test。
- 没有跑 Worker dry-run。

## 下一步

1. 询问用户选择或批准第一个代码级稳定化目标。
2. 建议目标：为生成资产和分散 release 资产增加 release/package verification。
3. stage 或 commit 恢复后的契约前，单独询问。
4. 在用户决定生命周期前，保持 `cover-image/` 不动。

## 交接提示

```text
继续本项目时，先读 AGENTS.md、docs/、tasks/current.md、tasks/backlog.md、.ai/goals.md、.ai/findings.md、.ai/checks/latest.md 和 .ai/handoff/current.md。不要假设聊天历史。没有用户明确确认，不要 deploy、publish、migrate、delete，也不要触碰 secrets。
```
