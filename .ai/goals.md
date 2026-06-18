# 目标

当工作有 2 个以上依赖步骤，或可能跨多个对话 / agent 时，使用本文件。

## 当前目标

| ID | 状态 | 目标 | 证据 | 验证 |
| --- | --- | --- | --- | --- |
| G001 | 已完成 | 把旧项目恢复成文件化 handoff 契约 | `AGENTS.md`、`docs/00-07`、`tasks/`、`.ai/` docs 已在工作区新增或修复 | 见 `.ai/checks/latest.md` |
| G002 | 已完成 | 准备 Obsidian 官方插件社区上架合规整改 | `manifest.name`、`isDesktopOnly`、`LICENSE`、README 隐私/网络请求、release asset 验证已完成 | `npm test`、`npm run build`、`npm run package:plugin`、`npm run verify:release-assets` 通过 |
| G003 | 等待确认 | 公开发布并提交官方社区 | `0.1.5` 已 push 并创建 GitHub Release；官方社区新表单拒绝旧 `manifest.id`；本地已准备 `0.1.6` ID 修复 | `npm test`、`npm run build`、`npm run package:plugin`、`npm run verify:release-assets`、`git diff --check` 均通过；下一步需主人确认公开发布 |

## 规则

- `待处理`：尚未开始。
- `进行中`：当前重点。
- `已完成`：已完成且有证据。
- `阻塞`：没有用户输入或外部变化就无法继续。
- 最终完成需要验证证据。
