# 下一步

## 建议的下一步

在新对话执行 `OBS-PUBLISH-001`：官方插件社区上架前合规整改。

## 建议的第一个任务

先处理两个会影响官方审核的关键决策：

1. 给 `manifest.name` 选择合规英文展示名。
2. 决定 `isDesktopOnly` 策略：改为 `true`，或整改 Electron clipboard fallback 并验证移动端兼容。

## 未确认不要开始

- 任何 push、GitHub Release、官方社区 PR、deploy、migration、secret、deletion 或 production config work。
- 大范围重构或依赖升级。

## 先读

1. `AGENTS.md`
2. `tasks/current.md`
3. `.ai/findings.md`
4. `docs/07-project-map.md`
5. `docs/05-standards.md`
6. `docs/03-roadmap.md`
7. `docs/04-decisions.md`

## 新对话提示词

```text
主人要求：继续 E:\AI_project\ob-kenengba，执行 `OBS-PUBLISH-001`：Obsidian 官方插件社区上架前合规整改。

必须先读：
- AGENTS.md
- tasks/current.md
- tasks/backlog.md
- .ai/goals.md
- .ai/findings.md
- .ai/checks/latest.md
- .ai/handoff/current.md
- docs/03-roadmap.md
- docs/04-decisions.md
- docs/05-standards.md
- docs/07-project-map.md

工作目标：
1. 让插件具备提交 Obsidian 官方插件社区审核的准备条件。
2. 先处理 `manifest.name` 英文展示名和 `isDesktopOnly` 策略。
3. 补齐 `LICENSE`、README 隐私/网络请求说明、免费/Pro 边界说明。
4. 增加 release/package 验证，确保 GitHub Release 单独包含 `manifest.json`、`main.js`、`styles.css`，zip 不能替代它们。
5. 跑 `npm test`、`npm run build`、`npm run package:plugin`。
6. 更新 `.ai/checks/latest.md`、`.ai/findings.md`、`.ai/handoff/current.md` 和任务状态。

红线：
- 不要 push。
- 不要创建 GitHub Release。
- 不要提交 obsidian-releases PR。
- 不要 deploy。
- 不要修改 Worker production config、D1 schema/data、secrets、License CSV、本地 vault data。
- 不要删除文件或批量移动文件。
- 任何公开发布动作必须先停下来问主人。

沟通要求：
- 默认中文，先结论后理由。
- 文件名、路径、命令、变量名、API 名、包名保留英文。
- 只做当前任务相关改动，不做无关重构。
```
