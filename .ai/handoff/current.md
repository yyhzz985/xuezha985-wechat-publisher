# 当前交接

## 最新状态

官方社区新提交表单拒绝 `0.1.5` 的旧 `manifest.id`：`xuezha985-wechat-publisher`。截图错误为 `The plugin ID in your manifest.json is not allowed`。

`0.1.6` 已公开发布：

- `manifest.id`：`kenengba-wechat-publisher`
- `manifest.name`：`Kenengba WeChat Publisher`
- `manifest.version`：`0.1.6`
- `isDesktopOnly`：`true`
- view type：`kenengba-wechat-publisher-preview`
- package zip：`dist/kenengba-wechat-publisher-0.1.6.zip`
- zip SHA-256：`2909B853545D9BE36E0C978B70CC6911B956EEEACD0CC27A54F64AFDF2622076`
- Release：`https://github.com/yyhzz985/xuezha985-wechat-publisher/releases/tag/0.1.6`
- 远端 `main` / tag `0.1.6`：`85354ff44bae5272b170ba8f5ab074bdf4b96ccb`

已验证：

```powershell
npm test
npm run build
npm run package:plugin
npm run verify:release-assets
git diff --check
```

全部通过。主人已确认允许公开发布 `0.1.6`。本机 `git push` 到 GitHub HTTPS 持续失败，本轮使用 GitHub API 更新远端 `main` 和 tag，并创建 GitHub Release。尚未重新提交官方社区表单。

## 当前目标

`OBS-PUBLISH-001` 已完成。`0.1.5` 已公开发布，但官方社区新提交表单拒绝旧 `manifest.id`。`OBS-PUBLISH-008` 已完成，`0.1.6` 已公开发布，下一步需要主人重新提交官方社区表单。

## 项目状态

- 本项目是用于公众号 Markdown 预览、复制和 Pro 上传的 Obsidian 插件。
- Cloudflare Worker 处理 License 校验和 admin license 操作。
- 当前版本是 `0.1.6`。
- 当前官方展示名是 `Kenengba WeChat Publisher`。
- 当前 `manifest.json` 设置为 `isDesktopOnly: true`。
- 当前分支是 `main`，跟踪 `origin/main`。
- 已创建本地 checkpoint：`de4e51a`，commit message 为 `checkpoint: current project state`。
- 已创建计划 checkpoint：`0d5991c`，commit message 为 `checkpoint: official plugin submission plan`。
- 当前工作区有 `0.1.6` 发布后状态文档更新未提交；远端 `main` 和 tag `0.1.6` 已通过 GitHub API 更新。

## 本轮已完成

- 执行 `OBS-PUBLISH-001`：官方插件社区上架前合规整改准备。
- 用官方文档复核 manifest 命名、`isDesktopOnly` 和 release asset 要求。
- 查询当前 `obsidianmd/obsidian-releases` 社区插件名，发现已有 `WeChat Publisher`、`Markdown WeChat Publisher`、`Wechat Converter` 等近似名称，因此选择 `Kenengba WeChat Publisher`。
- 将 `manifest.name` 改为 `Kenengba WeChat Publisher`，将 `isDesktopOnly` 改为 `true`。
- 补齐根目录 `LICENSE`，与 `package.json` 的 `MIT` 声明一致。
- 补 README、`docs/install-guide.md`、`docs/plugin-help.md` 中的桌面端限制、隐私、网络请求、免费/Pro 边界和反馈入口。
- 新增 `scripts/verify-release-assets.ps1`，并让 `scripts/package-plugin.ps1` 在生成 zip 后自动运行它。
- 新增 `npm run verify:release-assets`。
- 新增 `tests/release-assets.test.ts`，并更新文档和 manifest 相关测试。
- 运行并通过 `npm test`、`npm run build`、`npm run package:plugin`、`npm run verify:release-assets`、`git diff --check`。
- 未 push、未创建 GitHub Release、未提交官方社区 PR、未 deploy。
- 主人随后明确说“公开”，进入公开发布阶段；由于远端已有 `0.1.4` release 和 tag，本轮将当前合规整改版本升为 `0.1.5`，避免复用旧 tag。
- 已 push 主仓库 `main` 和 tag `0.1.5`。
- 已创建 GitHub Release：`https://github.com/yyhzz985/xuezha985-wechat-publisher/releases/tag/0.1.5`。
- Release 已单独上传 `manifest.json`、`main.js`、`styles.css` 和 `xuezha985-wechat-publisher-0.1.5.zip`。
- 已创建 `obsidian-releases` fork 并推送 `add-xuezha985-wechat-publisher` 分支。
- 自动创建官方 PR 失败：GraphQL 返回 `yyhzz985 does not have the correct permissions to execute CreatePullRequest`；REST API 返回 404。

## 历史已完成

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

- `LICENSE`
- `AGENTS.md`
- `README.md`
- `docs/00-product.md`
- `docs/01-architecture.md`
- `docs/02-tech-stack.md`
- `docs/03-roadmap.md`
- `docs/04-decisions.md`
- `docs/05-standards.md`
- `docs/06-ui-style.md`
- `docs/07-project-map.md`
- `docs/install-guide.md`
- `docs/plugin-help.md`
- `main.js`
- `manifest.json`
- `package.json`
- `scripts/package-plugin.ps1`
- `scripts/verify-release-assets.ps1`
- `tasks/current.md`
- `tasks/backlog.md`
- `tasks/done.md`
- `tests/documentation.test.ts`
- `tests/license-settings.test.ts`
- `tests/release-assets.test.ts`
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
- `manifest.name` 使用 `Kenengba WeChat Publisher`，避免中文名和社区现有 `WeChat Publisher` 撞名风险。
- 当前保留 Electron clipboard fallback，因此 `isDesktopOnly` 设置为 `true`，不声明移动端兼容。
- GitHub Release 必须单独上传 `manifest.json`、`main.js`、`styles.css` 和 zip；zip 不能替代前三个文件。

## 当前目标

- G001：已完成。把旧项目恢复成文件化 handoff 契约。
- G002：已完成。准备 Obsidian 官方插件社区上架合规整改。
- G003：进行中。`0.1.6` 已公开发布，下一步需要主人重新提交官方社区表单。

## 开放发现

- F001：已解决。恢复前项目文档缺失。
- F002：已解决。`cover-image/` 曾未跟踪，已被本地 checkpoint 处理。
- F003：已解决。新增 release/package 验证脚本并接入 package 流程。
- F004：Worker 生产安全风险。
- F006：已解决。`manifest.name` 已改为 `Kenengba WeChat Publisher`。
- F007：已解决。`isDesktopOnly` 已改为 `true` 并同步文档。
- F008：已解决。README、安装文档和帮助文档已补隐私/网络请求说明。
- F009：已解决。根目录已补 `LICENSE`。
- F010：已解决。官方社区表单拒绝旧 `manifest.id`，本地已改为 `kenengba-wechat-publisher`。

## 阻塞 / 风险

- `0.1.6` 已公开发布；官方社区表单尚未重新提交。
- 本机 `git push` 到 GitHub HTTPS 失败，本轮远端发布通过 GitHub API 完成；本地 `origin/main` 可能仍显示旧跟踪状态。
- Worker deploy、migration、schema/data work 和 production config 变化都需要主人单独确认。
- 干净 Obsidian vault 手动 smoke test 尚未执行；如提审前需要人工验收，应单独安排。

## 验证

命令：

```powershell
npm test
npm run build
npm run package:plugin
npm run verify:release-assets
git diff --check
```

结果：

全部通过。

已知缺口：

- `npm test`：87 tests，87 pass。
- `npm run build`：通过。
- `npm run package:plugin`：通过，生成并验证 `dist/kenengba-wechat-publisher-0.1.6.zip`。
- `npm run verify:release-assets`：通过。
- `git diff --check`：通过，只有 Windows line ending 提示。
- `git push origin main`：多次失败，错误为 GitHub HTTPS 连接重置 / 443 连接失败；已改用 GitHub API 更新远端。
- `git push origin 0.1.5`：历史已通过。
- `gh release create 0.1.5 ...`：历史已通过。
- `git -C E:\AI_project\obsidian-releases push -u origin add-xuezha985-wechat-publisher`：历史已通过。
- 没有跑 Obsidian runtime smoke test。
- 没有跑 Worker dry-run。

## 下一步

1. 主人回到官方社区表单提交仓库 URL：`https://github.com/yyhzz985/xuezha985-wechat-publisher`。
2. 如果表单仍报错，把截图或错误文本发回。
3. 不要重复创建 Release，不要 deploy，不要改 Worker/D1/secrets。

## 交接提示

```text
继续本项目时，先读 AGENTS.md、tasks/current.md、tasks/backlog.md、.ai/goals.md、.ai/findings.md、.ai/checks/latest.md、.ai/handoff/current.md、docs/03-roadmap.md、docs/04-decisions.md 和 docs/05-standards.md。`0.1.6` 已公开发布，Release URL 为 https://github.com/yyhzz985/xuezha985-wechat-publisher/releases/tag/0.1.6；官方社区表单尚未重新提交。不要假设聊天历史。没有主人明确确认，不要重复创建 Release、提交官方社区、deploy、migrate、delete，也不要触碰 secrets。
```
