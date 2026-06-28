# 已完成

| ID | 日期 | 任务 | 证据 | 验证 |
| --- | --- | --- | --- | --- |
| STAB-001 | 2026-06-18 | 只读恢复审计和文档契约 | 新增或修复 `AGENTS.md`、`docs/00-07`、`tasks/`、`.ai/` handoff/check 文件 | 见 `.ai/checks/latest.md` |
| DOC-001 | 2026-06-18 | 将 product-dev-workflow 项目契约文档中文化 | 翻译 `AGENTS.md`、`docs/00-07`、`tasks/` 和 `.ai/` 中的标题、字段、说明、任务描述和 handoff 内容 | `git diff --check` |
| CHECKPOINT-001 | 2026-06-18 | 保存当前项目状态本地 git 备份 | 本地 commit `de4e51a`：`checkpoint: current project state` | `git status` 后续确认 |
| PLAN-001 | 2026-06-18 | 整理官方插件社区上架开发计划 | 本地 commit `0d5991c`：`checkpoint: official plugin submission plan` | `git diff --check` |
| OBS-PUBLISH-001 | 2026-06-18 | 官方插件社区上架前合规整改准备 | `manifest.name` 改为 `Kenengba WeChat Publisher`；`isDesktopOnly` 改为 `true`；补 `LICENSE`、隐私/网络请求文档和 release asset 验证脚本 | `npm test`、`npm run build`、`npm run package:plugin`、`npm run verify:release-assets` 通过 |
| OBS-PUBLISH-007A | 2026-06-18 | 公开发布 `0.1.5` GitHub Release | 已 push `main` 和 tag `0.1.5`；Release 单独包含 `manifest.json`、`main.js`、`styles.css` 和 zip | Release manifest 下载验证通过；GitHub asset digest 与本地 zip hash 一致 |
| OBS-PUBLISH-008 | 2026-06-18 | 修复官方社区表单拒绝 `manifest.id` 并公开发布 `0.1.6` | `manifest.id` 改为 `kenengba-wechat-publisher`；远端 tag `0.1.6` 和 Release 已创建；Release 单独包含 `manifest.json`、`main.js`、`styles.css` 和 zip | `npm test`、`npm run build`、`npm run package:plugin`、`npm run verify:release-assets`、`git diff --check` 通过；Release asset digest 已核对 |
| OBS-PUBLISH-009A | 2026-06-18 | 公开发布 `0.1.7` 官方审查修复版 | `minAppVersion`、`innerHTML`、`SettingsTab` heading、README 英文摘要已修复；Release `0.1.7` 已创建，tag 指向 `afb44fa60d13a6782e0a947510af3293329f0b2a` | `npm test`、`npm run build`、`npm run package:plugin`、`npm run verify:release-assets` 通过；Release 单独资产和 digest 已核对 |
| OBS-PUBLISH-009B | 2026-06-18 | 完成 Obsidian 官方社区上架 | 官方插件公开页已 live，显示 `Add to Obsidian`；`0.1.7` review completed，无 error | 官方页面截图确认；当前客户端插件搜索未命中，按索引延迟观察 |
