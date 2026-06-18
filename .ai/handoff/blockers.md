# 阻塞项

## 当前阻塞

- 官方社区 PR 创建阻塞：`gh pr create` 被 GitHub GraphQL 拒绝，REST API 创建 PR 返回 404；需要主人手动打开 compare 页面提交。
- 干净 Obsidian vault 手动 smoke test 尚未执行；如官方 review 或主人要求，需要另开当前任务。

## 操作前需要批准

- 删除或移动文件 / 目录。
- 再次 push、改 tag 或覆盖 Release asset。
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
