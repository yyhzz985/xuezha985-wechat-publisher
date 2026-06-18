# 阻塞项

## 当前阻塞

- 公开发布阶段阻塞：GitHub Release、push、官方社区 PR 都需要主人单独确认。
- 干净 Obsidian vault 手动 smoke test 尚未执行；如主人要求提审前手动验收，需要另开当前任务。

## 操作前需要批准

- 删除或移动文件 / 目录。
- push。
- 创建 GitHub Release。
- 提交 `obsidian-releases` PR 或通过官方入口提审。
- Deploy Cloudflare Worker。
- 运行 D1 migrations 或编辑 production D1 data。
- 修改 Worker production config、secrets、auth 或 CI/CD。
- Publish GitHub Release、upload BRAT assets、deploy production 或 publish packages。

## 外部依赖

- WeChat API 行为和 IP whitelist 规则。
- Cloudflare account、D1 和 Worker secrets。
- 插件 UI 验证依赖 Obsidian runtime behavior。
- Obsidian 官方社区审核规则可能变化，新对话应重新核对官方 docs。
