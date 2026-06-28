# 项目规范

## 事实来源

- 项目规则：`AGENTS.md`
- 产品文档：`docs/00-product.md`
- 架构：`docs/01-architecture.md`
- 技术栈：`docs/02-tech-stack.md`
- 当前任务：`tasks/current.md`
- backlog 和完成记录：`tasks/backlog.md`、`tasks/done.md`
- goals 和 findings：`.ai/goals.md`、`.ai/findings.md`
- handoff：`.ai/handoff/current.md`
- handoff 详情：`.ai/handoff/session-log.md`、`.ai/handoff/next.md`、`.ai/handoff/blockers.md`
- 最新验证：`.ai/checks/latest.md`

## 包和命令

| 区域 | 命令 / 规则 |
| --- | --- |
| Install | `npm install` |
| Dev | `npm run dev` 启动 esbuild watch，并写入根目录 `main.js` |
| Build | `npm run build` |
| Test | `npm test` |
| Package | `npm run package:plugin` |
| Release asset check | `npm run verify:release-assets` |
| Lint | 未知，当前没有 lint script |

## 编码约定

- TypeScript strict mode 已开启。
- 新代码放进现有层级：
  - View：UI 和事件绑定。
  - Controller：Obsidian 命令和工作流。
  - Service：业务流程和外部 API 逻辑。
  - Utils：纯工具函数。
  - Repository：存储和数据访问。
- 优先在被改行为附近添加回归测试。
- 不要手改生成的 `main.js`。
- 不要触碰 `node_modules/`、`dist/` 或本地 vault / 插件数据。

## 目录约定

| 路径 | 用途 | 说明 |
| --- | --- | --- |
| `src/main.ts` | Obsidian 插件组合根 | 组装 services、views、controller |
| `src/view/` | 插件 UI | 不放 WeChat API 业务规则 |
| `src/controller/` | 命令和编排 | 集中工作流 |
| `src/service/` | Markdown、上传、授权、剪贴板 | 主要行为测试在这里 |
| `src/repository/` | 设置和 vault 文件访问 | 不写业务决策 |
| `src/utils/` | 纯工具函数 | 保持确定性 |
| `worker/` / `scripts/license-server/` | License backend | 生产风险区 |
| `tests/` | 回归测试 | Node test runner |
| `docs/` | 项目和用户文档 | 保持用户侧文档口径一致 |
| `.ai/` | handoff 状态 | 不是产品运行时状态 |

## Agent 规则

- 先读 `AGENTS.md`。
- 写代码前读 `tasks/current.md`。
- 已接受的风险或 bug 更新到 `.ai/findings.md`。
- 验证后更新 `.ai/checks/latest.md`。
- 结束前更新 `.ai/handoff/current.md`。
- 如果源码变化，运行 `npm test` 和 `npm run build`，除非被阻塞并已记录。
- 如果发布资产变化，任何 public release 前都要验证包内容。
- 在 `git status` 不再显示契约文件为 untracked 前，不要声称文档恢复已在 git 中持久化。

## 官方上架规则

- `OBS-PUBLISH-001` 只做上架前准备，不做公开发布。
- GitHub Release、push、提交 `obsidian-releases` PR、正式上架都必须单独得到主人确认。
- release asset 不能只依赖 zip；GitHub Release 必须单独提供 `manifest.json`、`main.js`、`styles.css`。
- `npm run package:plugin` 会在生成 zip 后运行 `scripts/verify-release-assets.ps1`，检查 zip 根目录内容、manifest 元数据和 `versions.json` 映射。
- `manifest.json` 的 `version`、Git tag、release asset 内的 `manifest.json` 必须一致。
- `versions.json` 必须包含当前版本到最低 Obsidian 版本的映射。
- `manifest.id` 只允许小写英文字母和连字符；不要使用数字、`obsidian`，也不要以 `plugin` 结尾。
- 当前 `manifest.name` 为 `Kenengba WeChat Publisher`，使用 Basic Latin 英文展示名。
- 当前 `manifest.id` 为 `kenengba-wechat-publisher`。
- 当前本地准备版本为 `0.1.8`，`manifest.minAppVersion` 为 `1.7.2`；使用新 Obsidian API 时必须按 typings / 官方文档同步提升 `minAppVersion` 和 `versions.json`。
- 当前 `isDesktopOnly: true`；插件使用 Electron clipboard fallback，README 和帮助文档必须说明桌面端限制。
- 如果以后改回 `isDesktopOnly: false`，必须完成移动端兼容审计；如果保留 Electron / Node-only 依赖，继续保持 `true` 并同步文档。
- README 必须写清网络请求、数据保存位置、免费/Pro 边界和隐私说明。
- README 必须保留英文摘要，供 Obsidian 官方目录 review 识别插件用途。
- View 代码不要直接写 `innerHTML` 或 `outerHTML`；需要把生成 HTML 放入 DOM 时，优先使用 `sanitizeHTMLToDom` 封装。
- `PluginSettingTab` 内的章节标题使用 `new Setting(containerEl).setName(...).setHeading()`。

## 红线

- 未确认前，不删除、不批量移动。
- 未确认前，不做 git rollback/reset。
- 未确认前，不改 `.env`、`.dev.vars`、secret、token、credential 或 auth config。
- 未确认前，不改 D1 schema、不跑 migration、不编辑生产数据。
- 未确认前，不做 Cloudflare deploy、GitHub Release、BRAT upload、package publish 或公开发布。

## 未知项

- 没有项目级 lint 命令。
- 没有自动化 Obsidian UI smoke test。
- `cover-image/` 未跟踪，生命周期未知。
