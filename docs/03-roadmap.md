# 路线图

## v1 稳定化

- 保持免费预览和复制稳定。
- 保持 Pro 上传在调用 WeChat API 前先经过 gate。
- 用测试覆盖 Markdown 渲染回归。
- 保持用户文档、帮助文档和 README 口径一致。
- 保持发布包可由 `npm run package:plugin` 复现。

## 第一优先级

完成 Obsidian 官方插件社区上架前合规整改准备。

当前状态：`OBS-PUBLISH-001` 已完成本地合规整改和自动验证。`0.1.5` 已公开，但官方社区新提交表单拒绝旧 `manifest.id`；`OBS-PUBLISH-008` 已完成，`0.1.6` 已公开发布并使用 `kenengba-wechat-publisher` ID。下一步是主人在官方社区表单中重新提交仓库 URL。

## 官方社区上架准备

1. 已确认官方社区展示名：`Kenengba WeChat Publisher`。
2. 已检查 `manifest.json`：`id`、`name`、`version`、`minAppVersion`、`description`、`author`、`isDesktopOnly`。当前 `id` 为 `kenengba-wechat-publisher`，只含小写英文字母和连字符。
3. 已决定桌面端策略：`isDesktopOnly: true`。
4. 已补齐 `LICENSE` 和 README 隐私 / 网络请求说明。
5. 已增加 release/package 验证，确保 GitHub Release 需要单独包含 `manifest.json`、`main.js`、`styles.css`。
6. 已跑 `npm test`、`npm run build`、`npm run package:plugin`。
7. 用户单独确认后，才允许创建 GitHub Release、push 或提交官方社区。

## 后续

- 公开发布前复跑 `npm run verify:release-assets`，并确认 GitHub Release 单独资产齐全。
- 增加 Worker runbook，覆盖本地 dry-run、生产 deploy、D1 migration 和 secret 处理。
- 只有重复视觉回归证明有必要时，才增加自动化 UI smoke checks。
- 只有经过单独产品和风险 review 后，才重新开放购买 / 支付流程。

## 不计划做

- 直接发布文章或群发。
- 没有单独安全设计时，把 secret 存在 Obsidian 正常插件数据之外。
- 支持无关的公开 WeChat publisher 插件。
- 用 web app framework 替换现有 Obsidian Plugin API UI。
- 在 `OBS-PUBLISH-001` 中直接提交官方社区或发布 GitHub Release。
