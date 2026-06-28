# 目标

当工作有 2 个以上依赖步骤，或可能跨多个对话 / agent 时，使用本文件。

## 当前目标

| ID | 状态 | 目标 | 证据 | 验证 |
| --- | --- | --- | --- | --- |
| G001 | 已完成 | 把旧项目恢复成文件化 handoff 契约 | `AGENTS.md`、`docs/00-07`、`tasks/`、`.ai/` docs 已在工作区新增或修复 | 见 `.ai/checks/latest.md` |
| G002 | 已完成 | 准备 Obsidian 官方插件社区上架合规整改 | `manifest.name`、`isDesktopOnly`、`LICENSE`、README 隐私/网络请求、release asset 验证已完成 | `npm test`、`npm run build`、`npm run package:plugin`、`npm run verify:release-assets` 通过 |
| G003 | 已完成 | 公开发布并提交官方社区 | `0.1.7` 已完成 source errors 整改、公开发布并通过官方 review；官方插件页已 live，显示 `Add to Obsidian` | `npm test`、`npm run build`、`npm run package:plugin`、`npm run verify:release-assets` 通过；Release `0.1.7` 单独包含 `manifest.json`、`main.js`、`styles.css` 和 zip；官方 review completed |
| G004 | 进行中 | 修复官方社区版 Pro 授权激活超时 | 已在阿里云大陆服务器部署主授权入口，插件本地 `0.1.8` 已改为优先访问 `https://pindoutool.cn/wechat-publisher-license/v1/licenses/verify`，旧 `workers.dev` 保留为 fallback | `npm test`、`npm run build`、`npm run package:plugin`、`npm run verify:release-assets` 已通过；公开发布 `0.1.8` 前仍需主人确认 |

## 规则

- `待处理`：尚未开始。
- `进行中`：当前重点。
- `已完成`：已完成且有证据。
- `阻塞`：没有用户输入或外部变化就无法继续。
- 最终完成需要验证证据。
