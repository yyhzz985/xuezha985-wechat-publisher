# 路线图

## v1 稳定化

- 保持免费预览和复制稳定。
- 保持 Pro 上传在调用 WeChat API 前先经过 gate。
- 用测试覆盖 Markdown 渲染回归。
- 保持用户文档、帮助文档和 README 口径一致。
- 保持发布包可由 `npm run package:plugin` 复现。

## 第一优先级

完成 Obsidian 官方插件社区上架前合规整改准备。

当前状态：`OBS-PUBLISH-001` 已完成本地合规整改和自动验证。`0.1.5` 已公开，但官方社区新提交表单拒绝旧 `manifest.id`；`OBS-PUBLISH-008` 已完成，`0.1.6` 已公开发布并使用 `kenengba-wechat-publisher` ID。官方自动审查随后对 `0.1.6` 标记 failed；`OBS-PUBLISH-009` 已修复 source errors，并公开发布 `0.1.7`。官方插件页已 live，显示 `Add to Obsidian`，`0.1.7` review 已 completed。`LIC-001` 已准备 `0.1.8`：授权主入口迁到阿里云大陆服务器，旧 Worker 仅作为 fallback。

## 官方社区上架准备

1. 已确认官方社区展示名：`Kenengba WeChat Publisher`。
2. 已检查 `manifest.json`：`id`、`name`、`version`、`minAppVersion`、`description`、`author`、`isDesktopOnly`。当前 `id` 为 `kenengba-wechat-publisher`，只含小写英文字母和连字符；当前本地 `version` 为 `0.1.8`，`minAppVersion` 为 `1.7.2`。
3. 已决定桌面端策略：`isDesktopOnly: true`。
4. 已补齐 `LICENSE` 和 README 隐私 / 网络请求说明。
5. 已增加 release/package 验证，确保 GitHub Release 需要单独包含 `manifest.json`、`main.js`、`styles.css`。
6. 已跑 `npm test`、`npm run build`、`npm run package:plugin`。
7. `0.1.7` 已在用户单独确认后创建 GitHub Release，并完成官方社区上架；后续新的 Release 修改、push 或提交官方社区仍需单独确认。
8. 官方 source review 阻断项已纳入本地测试：不能低报 `minAppVersion`，不能在 view 代码直接写 `innerHTML` / `outerHTML`，`SettingsTab` 章节标题使用 `Setting.setHeading()`，README 保留英文摘要。

## 后续

- `LIC-001`：修复官方社区版 Pro 授权校验在部分用户网络下访问 `workers.dev` 超时的问题。当前已部署阿里云大陆授权入口 `https://pindoutool.cn/wechat-publisher-license/v1/licenses/verify`，并准备 `0.1.8` 使用该入口；公开发布仍需主人单独确认。
- 等待 Obsidian 客户端内置插件搜索索引刷新；官方公开页已可安装。
- 如有需要，单独处理 review warning / recommendation。
- 增加 Worker runbook，覆盖本地 dry-run、生产 deploy、D1 migration 和 secret 处理。
- 只有重复视觉回归证明有必要时，才增加自动化 UI smoke checks。
- 只有经过单独产品和风险 review 后，才重新开放购买 / 支付流程。

## 不计划做

- 直接发布文章或群发。
- 没有单独安全设计时，把 secret 存在 Obsidian 正常插件数据之外。
- 支持无关的公开 WeChat publisher 插件。
- 用 web app framework 替换现有 Obsidian Plugin API UI。
- 在未单独确认时提交官方社区 PR、修改 GitHub Release 或部署生产服务。
