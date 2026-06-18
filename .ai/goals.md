# 目标

当工作有 2 个以上依赖步骤，或可能跨多个对话 / agent 时，使用本文件。

## 当前目标

| ID | 状态 | 目标 | 证据 | 验证 |
| --- | --- | --- | --- | --- |
| G001 | 已完成 | 把旧项目恢复成文件化 handoff 契约 | `AGENTS.md`、`docs/00-07`、`tasks/`、`.ai/` docs 已在工作区新增或修复 | 见 `.ai/checks/latest.md` |
| G002 | 已完成 | 准备 Obsidian 官方插件社区上架合规整改 | `manifest.name`、`isDesktopOnly`、`LICENSE`、README 隐私/网络请求、release asset 验证已完成 | `npm test`、`npm run build`、`npm run package:plugin`、`npm run verify:release-assets` 通过 |
| G003 | 进行中 | 公开发布并提交官方社区 | `0.1.6` 已公开发布但官方自动审查 failed；`0.1.7` 已完成本地 source errors 整改并打包，等待主人确认是否公开发布 | `npm test`、`npm run build`、`npm run package:plugin`、`npm run verify:release-assets` 通过；`git diff --check -- . ':!main.js'` 通过；完整 `git diff --check` 因生成的 `main.js` trailing whitespace 未通过 |

## 规则

- `待处理`：尚未开始。
- `进行中`：当前重点。
- `已完成`：已完成且有证据。
- `阻塞`：没有用户输入或外部变化就无法继续。
- 最终完成需要验证证据。
