# 发现

本文件记录已接受且不能遗忘的 bug、review issue、风险或缺失需求。

## 开放发现

| ID | 严重度 | 状态 | 区域 | 证据 | 解决方式 | 验证 |
| --- | --- | --- | --- | --- | --- | --- |
| F001 | 中 | 已解决 | 项目文档 | 项目契约文件缺失于已跟踪 git 状态，且多个恢复文件未跟踪 | 在工作区新增或修复最小项目文档和 handoff 契约 | 见 `.ai/checks/latest.md` |
| F002 | 中 | 开放 | 工作区卫生 | `git status` 显示未跟踪的 `cover-image/` | 后续询问用户是 track、ignore、move 还是 delete | 无 |
| F003 | 中 | 开放 | 发布流程 | 根目录 `main.js` 是生成文件但被跟踪；release 需要分散资产和 zip | 下次 public release 前增加 release/package 验证任务 | 无 |
| F004 | 中 | 开放 | 生产安全 | Worker config 指向 production D1，文档包含 deploy/migration 命令 | Worker deploy、migration、schema 或 data work 前必须明确批准 | 规则已加入 `AGENTS.md` |
| F005 | 中 | 开放 | Git 持久化 | 契约文件当前是 working-tree files，可能在 checkpoint 前仍未跟踪 | staging 或 commit 前先问；handoff 报告 `git status` | 无 |

## 规则

- `开放`：已接受但尚未修复。
- `已解决`：已修复或已用验证处理。
- `已拒绝`：已考虑但有意不接受；记录原因。
- `阻塞`：成立，但受用户输入或外部依赖阻塞。
- 相关 `critical` 或 `high` finding 开放时，不要声称完成。
