# 当前交接

## 最新状态

2026-06-28 `LIC-001`：官方社区版插件 Pro 授权激活报 `net::ERR_CONNECTION_TIMED_OUT`。根因已确认：部分大陆网络无法稳定访问 `workers.dev` 授权入口，不是卡密不存在、D1 未写入、卡密已绑定或 `manifest.id` 改名导致。

已完成服务器侧修复和本地 `0.1.8` 准备：

- 阿里云大陆服务器已部署主授权入口：`https://pindoutool.cn/wechat-publisher-license/v1/licenses/verify`。
- PM2 进程 `wechat-license` 在线，监听 `127.0.0.1:3101`，通过宝塔 Nginx extension 反向代理到 HTTPS 路径。
- 阿里云 SQLite 授权库已导入本地最后两批 199 张有明文的卡，并从 D1 只读导入 5 条普通 activation 和 1 条 legacy device entitlement。
- 插件本地版本已升到 `0.1.8`，默认授权地址改为阿里云入口，旧 `workers.dev` 地址保留为 fallback。
- 授权缓存宽限从 24 小时改为 30 天；网络错误提示改为“授权服务器连接超时或不可达，请稍后重试或联系支持”。
- 已生成 `dist/kenengba-wechat-publisher-0.1.8.zip`，SHA-256：`BC7A651579FB0D98457021A58C02725886F9F51263D36E85E8A3C9F53E9FFA11`。
- 已推送远端 `main` 和 tag `0.1.8`，均指向 `777c30ea4586343111b363890b16d9c71affec7e`。
- 已创建 GitHub Release：`https://github.com/yyhzz985/xuezha985-wechat-publisher/releases/tag/0.1.8`。
- Release 已单独上传 `manifest.json`、`main.js`、`styles.css` 和 `kenengba-wechat-publisher-0.1.8.zip`。
- Obsidian 官方社区后台 `Check for new releases` 尚未触发；Chrome 连接尝试超时，需主人手动点击。

官方社区上架已完成。`0.1.7` 已完成整改、公开发布和官方 review；公开页已 live，显示 `Add to Obsidian`。此前截图显示 `0.1.6` source errors 主要是：

- `manifest.minAppVersion` 低于实际使用的 Obsidian API。
- `src/view/PreviewModal.ts`、`src/view/PreviewView.ts` 直接写 `innerHTML`。
- `src/view/SettingsTab.ts` 直接创建 HTML heading。
- README 缺少英文说明。

已完成 `OBS-PUBLISH-009` 整改并发布 `0.1.7`：

- `manifest.version`：`0.1.7`
- `manifest.minAppVersion`：`1.7.2`
- `versions.json`：`0.1.7` -> `1.7.2`
- 新增 `src/utils/domUtils.ts`，用 `sanitizeHTMLToDom` 渲染 HTML fragment。
- `PreviewModal.ts`、`PreviewView.ts` 已移除直接 `innerHTML` 写入。
- `SettingsTab.ts` 已改用 `new Setting(...).setName(...).setHeading()`。
- README 已新增 `English summary`。
- 已生成 `dist/kenengba-wechat-publisher-0.1.7.zip`，SHA-256：`2505BA66290817D35B0F654990A27617737A84B72974234F0DA3B2E6AEE4DA78`。
- GitHub Release：`https://github.com/yyhzz985/xuezha985-wechat-publisher/releases/tag/0.1.7`。
- 远端 tag `0.1.7` 指向 commit：`afb44fa60d13a6782e0a947510af3293329f0b2a`。
- Release 单独包含 `manifest.json`、`main.js`、`styles.css` 和 `kenengba-wechat-publisher-0.1.7.zip`。
- 官方 review：`0.1.7` / commit `afb44fa` / `Completed`，无 `Error`。
- 官方公开页：显示 `Kenengba WeChat Publisher` 和 `Add to Obsidian`。
- Obsidian 客户端内置插件搜索暂未命中，按索引 / 缓存延迟观察。

已验证：

```powershell
npm test
npm run build
npm run package:plugin
npm run verify:release-assets
git diff --check -- . ':!main.js'
```

结果：

- `npm test`：91 tests，91 pass。
- `npm run build`：通过。
- `npm run package:plugin`：通过。
- `npm run verify:release-assets`：通过。
- `git diff --check -- . ':!main.js'`：通过。
- 完整 `git diff --check`：未通过，仅因生成的 `main.js:25` trailing whitespace。

`0.1.7` 已公开发布。后续新的 push、tag、Release 修改、官方社区提交、deploy 仍必须先等主人确认。

## 当前目标

`G004` 进行中：服务器侧修复和 GitHub Release `0.1.8` 已完成，等待官方社区后台扫描。`G003` 已完成：公开发布并提交官方社区。

## 项目状态

- 本项目是用于公众号 Markdown 预览、复制和 Pro 上传的 Obsidian 插件。
- 当前本地版本是 `0.1.8`；GitHub Release 已发布，官方社区当前公开版本可能仍是 `0.1.7`，待后台扫描。
- 当前官方展示名是 `Kenengba WeChat Publisher`。
- 当前 `manifest.id` 是 `kenengba-wechat-publisher`。
- 当前 `manifest.minAppVersion` 是 `1.7.2`。
- 当前 `isDesktopOnly: true`。
- 当前默认授权入口是 `https://pindoutool.cn/wechat-publisher-license/v1/licenses/verify`，旧 Worker 入口是 fallback。
- 当前分支是 `main`，本地仍可能显示 `main...origin/main [ahead ...]`，因为此前 `git push` 到 GitHub HTTPS 失败，`0.1.6` 和 `0.1.7` 均通过 GitHub API 更新远端。

## 本轮完成

- 确认阿里云服务器 `116.62.173.189`、备案域名 `pindoutool.cn` 可用于大陆主授权入口；`license.pindoutool.cn` 当前未解析，因此先使用主域名路径。
- 部署 Python 授权服务到 `/www/wwwroot/wechat-publisher-license/`，用 PM2 运行 `wechat-license`。
- 生成只存 hash 的 SQLite 授权库；未把明文卡密、设备 ID、secret 写入文档。
- 通过宝塔 Nginx extension 增加 `/wechat-publisher-license/` 反向代理，不改拼豆网站业务代码。
- 将插件本地版本升到 `0.1.8`，默认授权入口改为阿里云，旧 Worker 地址保留为 fallback。
- 将授权缓存宽限从 24 小时改为 30 天，改善网络不可达时的已授权用户体验。
- 更新 README、安装文档、帮助文档、架构、技术栈、路线图、决策、项目地图、Worker README 和测试。
- 新增 `scripts/license-server/`，用于生成阿里云 SQLite 授权库和部署服务端代码。

## 变更文件

- `README.md`
- `.gitignore`
- `scripts/license-server/import_licenses.py`
- `scripts/license-server/license_server.py`
- `src/main.ts`
- `src/service/EntitlementService.ts`
- `src/settings.ts`
- `tests/entitlement-service.test.ts`
- `tests/license-settings.test.ts`
- `docs/02-tech-stack.md`
- `docs/01-architecture.md`
- `docs/03-roadmap.md`
- `docs/04-decisions.md`
- `docs/05-standards.md`
- `docs/07-project-map.md`
- `docs/DEVELOPMENT_LOG.md`
- `docs/install-guide.md`
- `main.js`
- `manifest.json`
- `package.json`
- `package-lock.json`
- `versions.json`
- `worker/README.md`
- `tests/documentation.test.ts`
- `tests/license-worker.test.ts`
- `tasks/current.md`
- `tasks/backlog.md`
- `.ai/goals.md`
- `.ai/findings.md`
- `.ai/checks/latest.md`
- `.ai/handoff/current.md`

## 关键决策

- 不把域名接到 Cloudflare；用户目标是国内无代理可用，`workers.dev` 和 Cloudflare 路径在当前问题里不可靠。
- 不改 Worker production config、D1 schema/data、secrets、License CSV 或本地 vault data；只做 D1 只读导出和阿里云新库导入。
- 不使用 `license.pindoutool.cn`，因为当前未解析；先用已备案并已解析的 `pindoutool.cn/wechat-publisher-license/`。
- 新发卡必须同步阿里云授权库；否则 `0.1.8` 主入口无法识别只写入 D1 的新卡。
- `0.1.8` GitHub Release 已在主人确认后发布；官方社区后台扫描还需要手动触发。

## 活跃目标

- `G004`：进行中。服务器侧修复和 GitHub Release `0.1.8` 已完成，等待官方社区扫描。

## 开放问题

- 官方社区线上用户仍可能停在 `0.1.7`，还会继续访问旧 `workers.dev` 授权入口；需要后台扫描并更新到 `0.1.8` 后才会解决用户侧首次激活超时。
- 本地永久卡 CSV 缺少线上 D1 的永久卡 `item=1` 明文；已用 legacy device entitlement 支持其已绑定设备继续使用，但不能支持该卡在新设备重新激活。
- 后续新发卡同步阿里云授权库的流程尚未补齐，见 `LIC-002`。

## 阻塞 / 风险

- 阻塞：Chrome 自动进入 Obsidian 社区后台时连接超时；需要主人手动进入后台点击 `Check for new releases`。
- 风险：本机 GitHub HTTPS push 之前持续失败，后续如果要改远端，可能仍需使用 GitHub API。
- 风险：阿里云服务现在是主授权入口，后续服务器续费、Nginx、PM2、SQLite 备份都需要纳入运维检查。
- 风险：官方 review 仍给 artifact attestation、zip extra file、clipboard access、README 英文占比、TypeScript lint 等 warning / recommendation；当前无 `Error`，不阻断上架。

## 验证

```powershell
npm test
npm run build
npm run package:plugin
npm run verify:release-assets
git diff --check -- . ':!main.js'
Get-FileHash -Algorithm SHA256 -LiteralPath dist\kenengba-wechat-publisher-0.1.8.zip
```

结果见 `.ai/checks/latest.md`。当前确认 `npm test`、`npm run build`、`npm run package:plugin`、`npm run verify:release-assets` 均通过；标准名 zip hash 为 `BC7A651579FB0D98457021A58C02725886F9F51263D36E85E8A3C9F53E9FFA11`，本次重打包时间戳 zip hash 为 `679362EB0BF0D65CC7F0B16F501D35A1F1F950FC828EC2FCCED40AEE38217DB8`。

## 下一步

1. 主人手动进入 Obsidian 社区后台，点击 `Check for new releases`，让官方扫描 `0.1.8`。
2. 扫描完成后让报错用户更新插件，再用原 Pro 授权码校验。
3. 单独处理 `LIC-002`：新发卡同步阿里云授权库。

## 接力提示词

```text
主人要求：继续 E:\AI_project\ob-kenengba。当前任务是 `LIC-001`：修复官方社区版 Pro 授权激活超时。必须先读 AGENTS.md、tasks/current.md、tasks/backlog.md、.ai/goals.md、.ai/findings.md、.ai/checks/latest.md、.ai/handoff/current.md、docs/03-roadmap.md、docs/04-decisions.md、docs/05-standards.md、docs/07-project-map.md。

当前 `0.1.7` 已完成官方社区上架，官方公开页已 live。`LIC-001` 已完成服务器侧修复和本地 `0.1.8` 准备：阿里云主授权入口为 `https://pindoutool.cn/wechat-publisher-license/v1/licenses/verify`，旧 `workers.dev` 保留 fallback；`npm test`、`npm run build`、`npm run package:plugin`、`npm run verify:release-assets` 已通过；`dist/kenengba-wechat-publisher-0.1.8.zip` SHA-256 为 `BC7A651579FB0D98457021A58C02725886F9F51263D36E85E8A3C9F53E9FFA11`。尚未 push、尚未创建 GitHub Release、尚未更新官方社区。公开发布 `0.1.8`、tag、Release、官方社区 `Check for new releases`、deploy、DNS、Worker config、D1 schema/data 或 secrets 变更都必须先问主人。
```

## 历史记录（0.1.6 发布后，保留供追溯）

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

全部通过。主人已确认允许公开发布 `0.1.6`。本机 `git push` 到 GitHub HTTPS 持续失败，本轮使用 GitHub API 更新远端 `main` 和 tag，并创建 GitHub Release。当时官方社区表单提交流程未完成；该状态已由后续 `0.1.7` 官方上架取代。

## 当前目标

`OBS-PUBLISH-001` 已完成。`0.1.5` 已公开发布，但官方社区新提交表单拒绝旧 `manifest.id`。`OBS-PUBLISH-008` 已完成，`0.1.6` 已公开发布；该历史状态已由后续 `0.1.7` 官方上架取代。

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
- G003：已完成。`0.1.7` 已完成官方上架。

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

- `0.1.6` 发布后的未提交通道状态已由后续 `0.1.7` 官方上架取代。
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
继续本项目时，先读 AGENTS.md、tasks/current.md、tasks/backlog.md、.ai/goals.md、.ai/findings.md、.ai/checks/latest.md、.ai/handoff/current.md、docs/03-roadmap.md、docs/04-decisions.md 和 docs/05-standards.md。`0.1.7` 已完成官方上架，Release URL 为 https://github.com/yyhzz985/xuezha985-wechat-publisher/releases/tag/0.1.7；官方公开页已 live。不要假设聊天历史。没有主人明确确认，不要重复创建 Release、提交官方社区、deploy、migrate、delete，也不要触碰 secrets。
```
