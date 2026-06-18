# 任务池

| ID | 状态 | 任务 | 依赖 | 验收标准 | 说明 |
| --- | --- | --- | --- | --- | --- |
| OBS-PUBLISH-001 | 已完成 | 官方插件社区上架前合规整改准备 | 当前任务 | manifest、README、license、release assets、桌面端策略、验证证据齐全 | 未 push、未 Release、未官方 PR |
| OBS-PUBLISH-002 | 已完成 | 选择官方社区展示名 | `OBS-PUBLISH-001` | `manifest.name` 使用 `Kenengba WeChat Publisher`，并同步 README | 已避开当前社区已有 `WeChat Publisher` 等近似名称 |
| OBS-PUBLISH-003 | 已完成 | 决定 `isDesktopOnly` 策略 | `OBS-PUBLISH-001` | `isDesktopOnly: true`，文档说明桌面端限制 | 当前 `ClipboardService` 保留 Electron clipboard fallback |
| OBS-PUBLISH-004 | 已完成 | 补齐 `LICENSE` 和 README 隐私说明 | `OBS-PUBLISH-001` | 根目录有 `LICENSE`，README 写清网络请求、数据流和免费/Pro 边界 | 未读取 secret |
| OBS-PUBLISH-005 | 已完成 | 增加 release/package 验证 checklist 或脚本 | `OBS-PUBLISH-001` | `scripts/verify-release-assets.ps1` 检查 `manifest.json`、`main.js`、`styles.css`、zip、版本 metadata | 没有做 public release |
| OBS-PUBLISH-006 | 待处理 | 干净 vault smoke test | `OBS-PUBLISH-001` | 在干净 Obsidian vault 中手动安装并确认启用、预览、复制路径 | 自动验证已完成；不 deploy |
| OBS-PUBLISH-007 | 已取代 | 创建 GitHub Release 并提交官方社区 | `OBS-PUBLISH-001`、用户已确认“公开” | Release tag 与 `manifest.json` version 一致，assets 单独包含 `manifest.json`、`main.js`、`styles.css`；官方 PR 分支已推送 | `0.1.5` 已公开，但官方社区新表单拒绝带数字的 `manifest.id`，改由 `OBS-PUBLISH-008` 处理 |
| OBS-PUBLISH-008 | 等待确认 | 修复官方社区表单拒绝 `manifest.id` | `OBS-PUBLISH-007` | `manifest.id` 只含小写英文字母和连字符；`0.1.6` 本地构建、测试、打包验证通过；公开发布前得到主人确认 | 当前本地 ID 为 `kenengba-wechat-publisher`，已验证，未 push，未创建新 release |
| STAB-004 | 待处理 | 创建 Worker operations runbook | 无 | 记录 Worker dry-run、deploy、secrets、D1 migration 和 issue-license 流程 | 不改生产配置 |
| STAB-006 | 待处理 | 降低用户文档漂移 | 无 | README、install guide、plugin help 和 Worker README 有清晰归属规则 | 可并入 `OBS-PUBLISH-004` |
| STAB-007 | 待处理 | 必要时增加 Obsidian UI smoke 验证 | 重复 UI 回归 | 有轻量手动或自动 smoke 路径 | 可并入 `OBS-PUBLISH-006` |

## 现在不做

- 不做代码重构。
- 不升级依赖。
- 不 deploy，不 public release。
- 不做 D1 migration。
- 不删除文件。
- 不修改 secrets、License CSV 或生产数据。
