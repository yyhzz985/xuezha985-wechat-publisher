# 任务池

| ID | 状态 | 任务 | 依赖 | 验收标准 | 说明 |
| --- | --- | --- | --- | --- | --- |
| OBS-PUBLISH-001 | 进行中 | 官方插件社区上架前合规整改准备 | 当前任务 | manifest、README、license、release assets、移动端/桌面端策略、验证证据齐全 | 不包含 push、Release、官方 PR |
| OBS-PUBLISH-002 | 待处理 | 选择官方社区展示名 | `OBS-PUBLISH-001` | `manifest.name` 使用合规英文名，并同步 README | 当前中文名可能不符合官方命名规则 |
| OBS-PUBLISH-003 | 待处理 | 决定 `isDesktopOnly` 策略 | `OBS-PUBLISH-001` | 桌面端限制或移动端兼容审计二选一完成 | 当前 `ClipboardService` 有 Electron clipboard fallback |
| OBS-PUBLISH-004 | 待处理 | 补齐 `LICENSE` 和 README 隐私说明 | `OBS-PUBLISH-001` | 根目录有 `LICENSE`，README 写清网络请求、数据流和免费/Pro 边界 | 不读取 secret |
| OBS-PUBLISH-005 | 待处理 | 增加 release/package 验证 checklist 或脚本 | `OBS-PUBLISH-001` | release 前检查 `manifest.json`、`main.js`、`styles.css`、zip、版本 metadata | 没有确认不做 public release |
| OBS-PUBLISH-006 | 待处理 | 本地完整验证和干净 vault smoke test | `OBS-PUBLISH-002`、`OBS-PUBLISH-003`、`OBS-PUBLISH-004`、`OBS-PUBLISH-005` | `npm test`、`npm run build`、`npm run package:plugin` 通过，并记录手动安装结果 | 不 deploy |
| OBS-PUBLISH-007 | 阻塞 | 创建 GitHub Release 并提交官方社区 | `OBS-PUBLISH-006`、用户明确确认 | Release tag 与 `manifest.json` version 一致，assets 单独包含 `manifest.json`、`main.js`、`styles.css` | 公开发布动作，必须单独确认 |
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
