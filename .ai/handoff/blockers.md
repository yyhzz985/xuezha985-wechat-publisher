# 阻塞项

## 当前阻塞

- `STAB-002` 阻塞，直到用户确认下一个稳定化目标。
- 契约文件可能仍未跟踪，直到用户要求 git checkpoint。

## 操作前需要批准

- 删除或移动文件 / 目录。
- 通过删除、移动、忽略或跟踪来处理 `cover-image/`。
- stage 或 commit recovered contract 文件。
- Deploy Cloudflare Worker。
- 运行 D1 migrations 或编辑 production D1 data。
- 修改 Worker production config、secrets、auth 或 CI/CD。
- Publish GitHub Release、upload BRAT assets、deploy production 或 publish packages。

## 外部依赖

- WeChat API 行为和 IP whitelist 规则。
- Cloudflare account、D1 和 Worker secrets。
- 插件 UI 验证依赖 Obsidian runtime behavior。
