# 技术栈

## 选型原则

- 保持插件兼容 Obsidian。
- 优先 local-first 行为。
- WeChat HTML 兼容性优先用明确测试锁定。
- 不为一次性修复引入新框架。
- Worker deploy、D1 schema 和 secret 属于生产风险区。

## 栈

| 层级 | 选择 | 原因 | 更简单替代 |
| --- | --- | --- | --- |
| 语言 | TypeScript | 现有代码库和 Obsidian 插件生态 | JavaScript，不值得切换 |
| 插件 UI | Obsidian Plugin API + DOM APIs | 原生插件集成 | Web framework，不需要 |
| Markdown 渲染 | `markdown-it` + custom rules | 精确控制 HTML 输出 | Obsidian renderer，对 WeChat HTML 控制较弱 |
| 代码高亮 | Shiki core | 在生成 HTML 中提供稳定语法高亮 | 普通转义代码块 |
| 构建 | esbuild + TypeScript check | 现有快速 bundle 路径 | 仅 `tsc`，不能 bundle 插件 |
| 测试 | Node test runner with `tsx` | 已有回归测试 | 只做手动 Obsidian 检查，太弱 |
| License backend | Cloudflare Worker + D1 | 小型托管 API 和设备绑定 | 静态 license 列表，控制更弱 |
| 打包 | PowerShell `scripts/package-plugin.ps1` | 创建 Obsidian 安装 zip | 手动 zip，容易出错 |

## 包和运行时

| 项目 | 值 |
| --- | --- |
| 包管理器 | `npm` |
| 锁文件 | `package-lock.json`, lockfileVersion 3 |
| 已观察 Node | `v22.22.1` |
| 已观察 npm | `10.9.4` |
| 根 package | `obsidian-xuezha985-wechat-publisher` |
| 当前版本 | `0.1.4` |

## 依赖

运行时依赖：

- `markdown-it`
- `markdown-it-emoji`
- `shiki`

开发依赖：

- `typescript`
- `tsx`
- `esbuild`
- `obsidian`
- `builtin-modules`
- Node and markdown-it types

## 验证命令

```powershell
npm test
npm run build
```

发布打包：

```powershell
npm run package:plugin
```

Worker dry-run，仅在任务明确批准后：

```powershell
cd worker
npx wrangler deploy --dry-run
```

## 明确不选

- 不为插件面板添加前端框架。
- 不给插件本体添加数据库。
- 不把自动支付作为当前购买路径。
- 不把包管理器从 `npm` 换走。

## 未知项

- 当前没有专门的 lint 命令。
- 仓库没有自动化的 Obsidian UI 浏览器级验证。
