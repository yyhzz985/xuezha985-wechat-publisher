# 下一步

## 建议的下一步

`0.1.6` 已公开发布，但官方社区自动审查 failed。`0.1.7` 已完成本地整改和打包。下一步必须先等主人确认是否公开发布 `0.1.7`。

## 建议的第一个任务

1. 主人确认是否允许公开发布 `0.1.7`。
2. 如果允许，先创建本地 checkpoint。
3. 更新远端 `main`、tag `0.1.7` 和 GitHub Release assets。
4. 在官方社区页面点击 `Check for new releases`，或按页面要求重新触发审核。
5. 如果官方 review 仍 failed，按新的错误精确修复，不要顺手改 Worker、D1、secrets 或生产配置。

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
6. `main`、tag `0.1.5` 和 GitHub Release 已公开，但官方社区表单拒绝该版本的旧 `manifest.id`。
7. `0.1.6` 已公开发布：`https://github.com/yyhzz985/xuezha985-wechat-publisher/releases/tag/0.1.6`，但官方自动审查 failed。
8. 本地 `manifest.id` 为 `kenengba-wechat-publisher`，`manifest.version` 为 `0.1.7`，`manifest.minAppVersion` 为 `1.7.2`。
9. 本地已修复 `innerHTML`、`SettingsTab` heading 和 README 英文摘要问题。
10. `npm test`、`npm run build`、`npm run package:plugin`、`npm run verify:release-assets` 已通过。
11. 完整 `git diff --check` 只因生成的 `main.js` 第 25 行 trailing whitespace 失败；`git diff --check -- . ':!main.js'` 已通过。

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
