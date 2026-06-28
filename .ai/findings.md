# 发现

本文件记录已接受且不能遗忘的 bug、review issue、风险或缺失需求。

## 开放发现

| ID | 严重度 | 状态 | 区域 | 证据 | 解决方式 | 验证 |
| --- | --- | --- | --- | --- | --- | --- |
| F001 | 中 | 已解决 | 项目文档 | 项目契约文件缺失于已跟踪 git 状态，且多个恢复文件未跟踪 | 在工作区新增或修复最小项目文档和 handoff 契约 | 见 `.ai/checks/latest.md` |
| F002 | 中 | 已解决 | 工作区卫生 | `cover-image/` 曾未跟踪 | 本地 commit `de4e51a` 已按“当前项目状态 git 备份”纳入 checkpoint | `git status` |
| F003 | 中 | 已解决 | 发布流程 | 根目录 `main.js` 是生成文件但被跟踪；release 需要分散资产和 zip | 已新增 `scripts/verify-release-assets.ps1` 并接入 `npm run package:plugin` | `npm run package:plugin`、`npm run verify:release-assets` |
| F004 | 中 | 开放 | 生产安全 | Worker config 指向 production D1，文档包含 deploy/migration 命令 | Worker deploy、migration、schema 或 data work 前必须明确批准 | 规则已加入 `AGENTS.md` |
| F005 | 中 | 已解决 | Git 持久化 | 契约文件曾是 working-tree files | 本地 commit `de4e51a` 已保存当前项目状态 | `git status` |
| F006 | 高 | 已解决 | 官方上架命名 | 旧 `manifest.name` 是中文 `公众号一键排版上传`，官方 Manifest 文档倾向 Basic Latin/英文名称，且名称不能含 `Plugin` 或 `Obsidian` | `manifest.name` 已改为 `Kenengba WeChat Publisher`，并同步 README / docs / tests | `npm test`、`npm run verify:release-assets` |
| F007 | 高 | 已解决 | 移动端兼容 | 旧 `manifest.json` 为 `isDesktopOnly: false`，但 `ClipboardService` 存在 `runtimeRequire('electron').clipboard` fallback | 已改为 `isDesktopOnly: true`，文档说明桌面端限制 | `npm test`、`npm run build` |
| F008 | 中 | 已解决 | 官方上架文档 | README 需要更明确的隐私/网络请求/免费与 Pro 边界说明 | 已整理 README、`docs/install-guide.md` 和 `docs/plugin-help.md` | `npm test` |
| F009 | 中 | 已解决 | License 文件 | `package.json` 声明 `MIT`，但官方上架前需要确认根目录 `LICENSE` 存在 | 已补 `LICENSE` 并保留 README MIT 说明 | `npm test`、`npm run verify:release-assets` |
| F010 | 高 | 已解决 | 官方社区提交 | 官方社区提交页提示 `The plugin ID in your manifest.json is not allowed`；旧 `manifest.id` 为 `xuezha985-wechat-publisher`，包含数字 | 本地改为 `kenengba-wechat-publisher`，版本升为 `0.1.6`，release 校验脚本收紧为只允许小写英文字母和连字符 | `npm test`、`npm run build`、`npm run package:plugin`、`npm run verify:release-assets`、`git diff --check` |
| F011 | 高 | 已解决 | 官方自动审查 | 官方社区 `0.1.6` Review 标记 failed；source errors 包括低报 `minAppVersion`、直接写 `innerHTML`、`SettingsTab` heading 规则，README 还提示缺少英文说明 | `0.1.7` 已修复并公开发布：`minAppVersion: 1.7.2`、`sanitizeHTMLToDom`、`Setting.setHeading()`、README `English summary`；官方 review 已 completed | `npm test`、`npm run build`、`npm run package:plugin`、`npm run verify:release-assets` 通过；Release `0.1.7` 单独资产已核对；官方页面显示 live |
| F012 | 高 | 开放 | Pro 授权服务 | 官方社区版用户点击 `校验授权` 报 `net::ERR_CONNECTION_TIMED_OUT`；本机和阿里云大陆服务器访问 `workers.dev` 授权接口均超时；卡密和 D1 数据正常 | 已部署阿里云主授权入口，插件本地 `0.1.8` 默认切到 `https://pindoutool.cn/wechat-publisher-license/v1/licenses/verify`，旧 Worker 地址保留为 fallback，并改进网络错误提示；用户侧生效仍需公开发布 `0.1.8` | `npm test`、`npm run build`、`npm run package:plugin`、`npm run verify:release-assets` 通过；阿里云 health、无效卡、已绑定有效卡校验通过 |

## 规则

- `开放`：已接受但尚未修复。
- `已解决`：已修复或已用验证处理。
- `已拒绝`：已考虑但有意不接受；记录原因。
- `阻塞`：成立，但受用户输入或外部依赖阻塞。
- 相关 `critical` 或 `high` finding 开放时，不要声称完成。
