# 任务池

| ID | 状态 | 任务 | 依赖 | 验收标准 | 说明 |
| --- | --- | --- | --- | --- | --- |
| STAB-002 | 阻塞 | 选择第一个代码级稳定化目标 | 用户确认 | `tasks/current.md` 写明一个已批准目标，并包含范围和验证 | 当前任务 |
| STAB-003 | 待处理 | 增加 release/package 验证 checklist 或测试 | `STAB-002` 批准 | release 前检查 package 内容和版本 metadata | 没有确认不做 public release |
| STAB-004 | 待处理 | 创建 Worker operations runbook | 无 | 记录 Worker dry-run、deploy、secrets、D1 migration 和 issue-license 流程 | 不改生产配置 |
| STAB-005 | 待处理 | 解决 `cover-image/` 生命周期 | 用户决策 | 目录只有在确认后才被跟踪、忽略、移动或删除 | 当前状态是 untracked |
| STAB-006 | 待处理 | 降低用户文档漂移 | 无 | README、install guide、plugin help 和 Worker README 有清晰归属规则 | 避免大范围重写 |
| STAB-007 | 待处理 | 必要时增加 Obsidian UI smoke 验证 | 重复 UI 回归 | 有轻量手动或自动 smoke 路径 | 只有证明必要时才做 |

## 现在不做

- 不做代码重构。
- 不升级依赖。
- 不 deploy，不 public release。
- 不做 D1 migration。
- 不删除或清理 untracked files。
