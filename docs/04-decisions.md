# 决策

## 当前决策

| ID | 日期 | 决策 | 理由 | 状态 |
| --- | --- | --- | --- | --- |
| D001 | 2026-06-18 | 保持本项目为 Obsidian 插件，不做 standalone web app | 核心痛点是留在写作工作区内完成排版 | 生效 |
| D002 | 2026-06-18 | 免费复制独立于 AppID、AppSecret 和 License | 免费用户只需要可粘贴 HTML | 生效 |
| D003 | 2026-06-18 | 上传草稿、上传封面、上传头像、Pro 本地图片上传都先 gate，再调用 WeChat API | 避免意外 API 调用，并明确 Pro 边界 | 生效 |
| D004 | 2026-06-18 | 继续跟踪生成的 `main.js`，但禁止手改 | Obsidian 发布资产需要它，但 source of truth 是 `src/` | 生效 |
| D005 | 2026-06-18 | 当前保持 Worker payment endpoints 关闭 | 当前购买路径是手动发放 license | 生效 |
| D006 | 2026-06-18 | deploy、release、migration、publishing 必须明确批准 | 这些动作会影响公开或生产状态 | 生效 |
| D007 | 2026-06-18 | 把 docs、tasks 和 `.ai/` 文件作为项目 handoff 契约 | 后续 AI 会话必须从仓库文件恢复，不依赖聊天记忆 | 生效 |
| D008 | 2026-06-18 | 官方社区上架拆成“合规整改准备”和“公开发布提交”两步 | 第一阶段可改文档和代码准备；GitHub Release、push、官方 PR 属于公开动作，需要主人单独确认 | 生效 |
| D009 | 2026-06-18 | `manifest.name` 使用 `Kenengba WeChat Publisher` | 官方文档建议使用英文 Basic Latin 名称，且当前社区已有 `WeChat Publisher` 等近似名称，需要避免撞名 | 生效 |
| D010 | 2026-06-18 | `isDesktopOnly` 改为 `true` | 插件复制路径存在 Electron clipboard fallback，当前没有完成移动端兼容验证 | 生效 |
| D011 | 2026-06-18 | `npm run package:plugin` 后自动运行 release asset 验证 | GitHub Release 需要单独上传 `manifest.json`、`main.js`、`styles.css`，zip 不能替代它们 | 生效 |
| D012 | 2026-06-18 | `manifest.id` 使用 `kenengba-wechat-publisher` | 官方社区提交页拒绝带数字的 `xuezha985-wechat-publisher`；新 ID 只含小写英文字母和连字符，并避开已有 `wechat-publisher` 撞名 | 生效 |

## 已拒绝选项

| 选项 | 拒绝原因 |
| --- | --- |
| 把业务逻辑放进 View 文件 | UI 改动会有破坏 WeChat 输出或授权行为的风险 |
| 给本地图片使用固定附件目录 | Obsidian 已经能解析当前笔记图片上下文 |
| 静默跳过上传失败 | 用户需要直接看到 WeChat 错误，才能修 AppID、AppSecret、IP 白名单或图片格式 |
| 普通修复中自动跑 production deploy | 违反生产安全边界 |
| 直接用旧的 `0.1.4` 状态提审官方社区 | 旧状态缺少英文展示名、桌面端策略说明、README 隐私说明和 release asset 验证 |

## 决策说明

长历史记录保留在 `docs/DEVELOPMENT_LOG.md`。本文件是给后续 agent 使用的当前决策索引。
