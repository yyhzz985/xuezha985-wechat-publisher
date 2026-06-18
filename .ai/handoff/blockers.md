# 阻塞项

## 当前阻塞

- 官方社区表单尚未重新提交：`0.1.6` 已公开发布，主人需要在网页表单中再次提交仓库 URL。
- 官方社区表单曾拒绝 `0.1.5`：旧 `manifest.id` 为 `xuezha985-wechat-publisher`，包含数字；本地已改为 `kenengba-wechat-publisher`。
- 本机 `git push` 到 GitHub HTTPS 失败，本轮远端发布通过 GitHub API 完成；本地 `origin/main` 可能仍显示旧跟踪状态。
- 干净 Obsidian vault 手动 smoke test 尚未执行；如官方 review 或主人要求，需要另开当前任务。

## 操作前需要批准

- 删除或移动文件 / 目录。
- 再次 push、改 tag、覆盖 Release asset 或重新创建 Release。
- 修改已发布 GitHub Release。
- 提交新的 `obsidian-releases` PR 或通过官方入口提审。
- Deploy Cloudflare Worker。
- 运行 D1 migrations 或编辑 production D1 data。
- 修改 Worker production config、secrets、auth 或 CI/CD。
- Publish GitHub Release、upload BRAT assets、deploy production 或 publish packages。

## 外部依赖

- WeChat API 行为和 IP whitelist 规则。
- Cloudflare account、D1 和 Worker secrets。
- 插件 UI 验证依赖 Obsidian runtime behavior。
- Obsidian 官方社区审核规则可能变化，新对话应重新核对官方 docs。
