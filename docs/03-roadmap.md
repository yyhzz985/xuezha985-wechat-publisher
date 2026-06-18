# 路线图

## v1 稳定化

- 保持免费预览和复制稳定。
- 保持 Pro 上传在调用 WeChat API 前先经过 gate。
- 用测试覆盖 Markdown 渲染回归。
- 保持用户文档、帮助文档和 README 口径一致。
- 保持发布包可由 `npm run package:plugin` 复现。

## 第一优先级

完成 Obsidian 官方插件社区上架前合规整改准备。

当前状态：项目契约已通过本地 commit `de4e51a` 备份。下一步执行 `OBS-PUBLISH-001`，目标是让插件具备提审条件，但不直接发布。

## 官方社区上架准备

1. 确认官方社区展示名，优先使用英文 Basic Latin 名称。
2. 检查 `manifest.json`：`id`、`name`、`version`、`minAppVersion`、`description`、`author`、`isDesktopOnly`。
3. 决定桌面端 / 移动端策略。当前 `isDesktopOnly: false`，但剪贴板服务存在 Electron clipboard fallback。
4. 补齐 `LICENSE` 和 README 隐私 / 网络请求说明。
5. 增加 release/package 验证，确保 GitHub Release 单独包含 `manifest.json`、`main.js`、`styles.css`。
6. 跑 `npm test`、`npm run build`、`npm run package:plugin`。
7. 用户单独确认后，才允许创建 GitHub Release、push 或提交官方社区。

## 后续

- 增加发布 checklist，在 public release 前验证分散的 release assets 和 zip 内容。
- 增加 Worker runbook，覆盖本地 dry-run、生产 deploy、D1 migration 和 secret 处理。
- 只有重复视觉回归证明有必要时，才增加自动化 UI smoke checks。
- 只有经过单独产品和风险 review 后，才重新开放购买 / 支付流程。

## 不计划做

- 直接发布文章或群发。
- 没有单独安全设计时，把 secret 存在 Obsidian 正常插件数据之外。
- 支持无关的公开 WeChat publisher 插件。
- 用 web app framework 替换现有 Obsidian Plugin API UI。
- 在 `OBS-PUBLISH-001` 中直接提交官方社区或发布 GitHub Release。
