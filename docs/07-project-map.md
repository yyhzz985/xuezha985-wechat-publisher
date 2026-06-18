# 项目地图

## 入口文件

| 入口 | 用途 |
| --- | --- |
| `src/main.ts` | Obsidian 插件组合根 |
| `manifest.json` | Obsidian 插件 metadata |
| `esbuild.config.mjs` | 把 `src/main.ts` bundle 到根目录 `main.js` |
| `main.js` | Obsidian 使用的生成插件 bundle |
| `styles.css` | Obsidian 加载的插件 CSS |
| `worker/src/index.ts` | Cloudflare Worker 请求路由 |

## 主要目录

| 路径 | 用途 |
| --- | --- |
| `src/` | 插件源码 |
| `tests/` | 回归测试 |
| `worker/` | License service、D1 migration、admin script |
| `docs/` | 用户文档、产品文档、开发历史 |
| `scripts/` | 打包脚本 |
| `tasks/` | 当前工作和 backlog |
| `.ai/` | goals、findings、checks、handoff |
| `dist/` | 生成的 zip 包，已忽略 |
| `cover-image/` | 未跟踪的封面 prompt 资产，归属未知 |

## 重要文件

| 文件 | 重要性 |
| --- | --- |
| `package.json` | scripts、package metadata、依赖列表 |
| `package-lock.json` | npm dependency lock |
| `src/controller/PublisherController.ts` | 中央 Obsidian 命令和工作流 controller |
| `src/service/WeChatFormatService.ts` | 核心 Markdown 到 WeChat HTML renderer |
| `src/service/WeChatDraftService.ts` | WeChat token、图片上传、草稿上传逻辑 |
| `src/service/EntitlementService.ts` | Pro feature gate 和 license cache |
| `src/repository/SettingsRepository.ts` | Obsidian 插件设置持久化 |
| `worker/wrangler.jsonc` | Worker name 和 D1 binding |
| `worker/migrations/0001_license_orders.sql` | 当前 D1 schema |
| `docs/DEVELOPMENT_LOG.md` | 历史实现日志 |
| `docs/plugin-help.md` | 插件内帮助面板来源 |

## 数据 / 状态文件

| 路径 | 数据 |
| --- | --- |
| 用户 vault 中的 Obsidian plugin data | 设置、AppSecret、License Key、entitlement cache |
| Cloudflare D1 | License hashes、activations、order/payment placeholders |
| `worker/.admin-token.local` | 本地 admin token，已被 git 忽略 |
| `worker/.dev.vars*` / `worker/.env*` | 本地 Worker secrets，已被 git 忽略 |
| `worker/licenses-*.csv` | 生成的 License CSV，已被 git 忽略 |

## 验证命令

```powershell
npm test
npm run build
```

发布打包：

```powershell
npm run package:plugin
```

## 未确认不要触碰

- `worker/wrangler.jsonc` production D1 binding
- Worker migrations 和 production D1 data
- secret files、env files、AppSecret、License CSV、admin token
- public release assets、GitHub Release、BRAT upload
- 用户 vault plugin data
- 删除、批量移动、git reset 或 rollback

## 给下一个 AI 的说明

- 仓库当前跟踪生成的根目录 `main.js`。
- `dist/` 已忽略。
- 当前分支是 `main`，跟踪 `origin/main`。
- `AGENTS.md`、`docs/00-07`、`tasks/` 和 `.ai/` 中的文档契约文件当前是工作区文件，在用户创建 git checkpoint 前可能仍然是 untracked。
- `cover-image/wechat-publisher/prompts/*.md` 也未跟踪；没有用户决策前，不要删除、移动、忽略或跟踪它。
