# 路线图

## v1 稳定化

- 保持免费预览和复制稳定。
- 保持 Pro 上传在调用 WeChat API 前先经过 gate。
- 用测试覆盖 Markdown 渲染回归。
- 保持用户文档、帮助文档和 README 口径一致。
- 保持发布包可由 `npm run package:plugin` 复现。

## 第一优先级

稳定项目契约和 handoff 文档，让后续 AI 会话不再重复发现同一批规则、风险和命令。

当前状态：已在工作区以任务 `STAB-001` 完成；这些文件仍需要 commit 或以其他方式保存，才能在 clone 间持久存在。

## 后续

- 增加发布 checklist，在 public release 前验证分散的 BRAT 资产和 zip 内容。
- 增加 Worker runbook，覆盖本地 dry-run、生产 deploy、D1 migration 和 secret 处理。
- 用户确认后，再决定 `cover-image/` 应该被跟踪、忽略还是移动。
- 只有重复视觉回归证明有必要时，才增加自动化 UI smoke checks。
- 只有经过单独产品和风险 review 后，才重新开放购买 / 支付流程。
- 决定是否把文件化项目契约提交为本地 checkpoint。

## 不计划做

- 直接发布文章或群发。
- 没有单独安全设计时，把 secret 存在 Obsidian 正常插件数据之外。
- 支持无关的公开 WeChat publisher 插件。
- 用 web app framework 替换现有 Obsidian Plugin API UI。
