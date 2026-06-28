# 下一步

## 建议的下一步

`0.1.7` 已完成整改、打包、公开发布和官方社区上架。当前任务是 `LIC-001`：修复 Pro 授权激活报 `net::ERR_CONNECTION_TIMED_OUT`。

当前已完成服务器侧修复和 GitHub Release `0.1.8` 发布：阿里云主授权入口为 `https://pindoutool.cn/wechat-publisher-license/v1/licenses/verify`，插件默认切到该入口，旧 `workers.dev` 保留为 fallback。尚未触发 Obsidian 社区后台扫描。

## 建议的第一个任务

1. 主人手动进入 Obsidian 社区后台，点击 `Check for new releases`，等待官方扫描 `0.1.8`。
2. 扫描完成后让报错用户更新插件，再用原 Pro 授权码校验。
3. 另开 `LIC-002` 补新发卡同步阿里云授权库。

## 未确认不要开始

- 任何新的 push、GitHub Release 修改、官方社区 PR、deploy、migration、secret、DNS、Worker production config、deletion 或 production data work。
- 大范围重构或依赖升级。

## 先读

1. `AGENTS.md`
2. `tasks/current.md`
3. `tasks/backlog.md`
4. `.ai/goals.md`
5. `.ai/findings.md`
6. `.ai/checks/latest.md`
7. `.ai/handoff/current.md`
8. `docs/03-roadmap.md`
9. `docs/04-decisions.md`
10. `docs/05-standards.md`
11. `docs/07-project-map.md`

## 新对话提示词

```text
主人要求：继续 E:\AI_project\ob-kenengba。当前任务是 `LIC-001`：修复官方社区版 Pro 授权激活超时。

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
1. `0.1.7` 已完成官方社区上架，官方公开页已 live。
2. 其他用户输入已发放的 Pro 授权码后，点击 `校验授权` 报 `net::ERR_CONNECTION_TIMED_OUT`。
3. 根因已确认：部分大陆网络无法稳定访问 `workers.dev` 授权入口，不是卡密数据问题。
4. 阿里云主授权入口已部署：`https://pindoutool.cn/wechat-publisher-license/v1/licenses/verify`。
5. 插件版本已升为 `0.1.8`，默认授权入口改为阿里云，旧 Worker 地址保留为 fallback。
6. 授权缓存宽限从 24 小时改为 30 天，网络错误提示已改为更友好的中文提示。
7. 已验证：`npm test`、`npm run build`、`npm run package:plugin`、`npm run verify:release-assets` 通过。
8. 已生成 `dist/kenengba-wechat-publisher-0.1.8.zip`，SHA-256 为 `BC7A651579FB0D98457021A58C02725886F9F51263D36E85E8A3C9F53E9FFA11`。
9. 已发布 GitHub Release：`https://github.com/yyhzz985/xuezha985-wechat-publisher/releases/tag/0.1.8`；远端 `main` 和 tag `0.1.8` 指向 `777c30e`。
10. 尚未触发 Obsidian 社区后台 `Check for new releases`。
11. 后续新发卡必须同步阿里云 SQLite 授权库，见 `LIC-002`。

红线：
- 不要 push。
- 不要创建或修改 GitHub Release。
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
