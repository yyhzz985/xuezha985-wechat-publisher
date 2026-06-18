# 发现

本文件记录已接受且不能遗忘的 bug、review issue、风险或缺失需求。

## 开放发现

| ID | 严重度 | 状态 | 区域 | 证据 | 解决方式 | 验证 |
| --- | --- | --- | --- | --- | --- | --- |
| F001 | 中 | 已解决 | 项目文档 | 项目契约文件缺失于已跟踪 git 状态，且多个恢复文件未跟踪 | 在工作区新增或修复最小项目文档和 handoff 契约 | 见 `.ai/checks/latest.md` |
| F002 | 中 | 已解决 | 工作区卫生 | `cover-image/` 曾未跟踪 | 本地 commit `de4e51a` 已按“当前项目状态 git 备份”纳入 checkpoint | `git status` |
| F003 | 中 | 开放 | 发布流程 | 根目录 `main.js` 是生成文件但被跟踪；release 需要分散资产和 zip | 下次 public release 前增加 release/package 验证任务 | 无 |
| F004 | 中 | 开放 | 生产安全 | Worker config 指向 production D1，文档包含 deploy/migration 命令 | Worker deploy、migration、schema 或 data work 前必须明确批准 | 规则已加入 `AGENTS.md` |
| F005 | 中 | 已解决 | Git 持久化 | 契约文件曾是 working-tree files | 本地 commit `de4e51a` 已保存当前项目状态 | `git status` |
| F006 | 高 | 开放 | 官方上架命名 | 当前 `manifest.name` 是中文 `公众号一键排版上传`，官方 Manifest 文档倾向 Basic Latin/英文名称，且名称不能含 `Plugin` 或 `Obsidian` | 新对话先给出英文名候选并让主人确认，再改 manifest/README | 无 |
| F007 | 高 | 开放 | 移动端兼容 | 当前 `manifest.json` 为 `isDesktopOnly: false`，但 `ClipboardService` 存在 `runtimeRequire('electron').clipboard` fallback | 二选一：改 `isDesktopOnly: true`，或重写并验证移动端兼容 | 无 |
| F008 | 中 | 开放 | 官方上架文档 | README 需要更明确的英文/隐私/网络请求/免费与 Pro 边界说明 | 在 `OBS-PUBLISH-001` 中整理 README 和相关 docs | 无 |
| F009 | 中 | 开放 | License 文件 | `package.json` 声明 `MIT`，但官方上架前需要确认根目录 `LICENSE` 存在 | 补 `LICENSE` 并同步 README | 无 |

## 规则

- `开放`：已接受但尚未修复。
- `已解决`：已修复或已用验证处理。
- `已拒绝`：已考虑但有意不接受；记录原因。
- `阻塞`：成立，但受用户输入或外部依赖阻塞。
- 相关 `critical` 或 `high` finding 开放时，不要声称完成。
