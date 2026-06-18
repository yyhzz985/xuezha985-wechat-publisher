# 下一步

## 建议的下一步

`0.1.5` 已公开发布。下一步是主人手动创建 `obsidian-releases` PR，因为 GitHub API 拒绝自动创建。

## 建议的第一个任务

1. 打开 compare 页面：`https://github.com/obsidianmd/obsidian-releases/compare/master...yyhzz985:obsidian-releases:add-xuezha985-wechat-publisher?expand=1`。
2. 标题使用 `Add plugin: Kenengba WeChat Publisher`。
3. PR 创建后等待官方 review。
4. 如果 review 要求修改，按 review 精确处理并重新验证。

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
主人要求：继续 E:\AI_project\ob-kenengba。`OBS-PUBLISH-001` 已完成本地合规整改和自动验证；公开发布阶段仍阻塞，必须单独确认。

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

当前状态：
1. `manifest.name` 已是 `Kenengba WeChat Publisher`。
2. `isDesktopOnly` 已是 `true`。
3. `LICENSE`、README 隐私/网络请求说明、免费/Pro 边界说明已补。
4. `scripts/verify-release-assets.ps1` 已接入 package 流程。
5. `npm test`、`npm run build`、`npm run package:plugin`、`npm run verify:release-assets` 已通过。
6. `main`、tag `0.1.5` 和 GitHub Release 已公开。
7. 官方 PR 分支已推送到 fork，但 PR 需要主人手动创建。

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
