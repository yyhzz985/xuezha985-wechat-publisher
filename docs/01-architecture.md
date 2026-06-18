# 架构

## 输出优先

当 Markdown 笔记变成以下输出时，用户得到价值：

- Obsidian 右侧预览。
- 复制到剪贴板的 WeChat 兼容 HTML。
- Pro 专属 WeChat 草稿，本地图片已上传并替换为 WeChat 图片 URL。
- 包含 `manifest.json`、`main.js` 和 `styles.css` 的发布包。

## 取：检索 / 输出

| 场景 | 使用者 | 触发时机 | 输出 |
| --- | --- | --- | --- |
| 实时预览 | 写作者 | 打开预览或编辑当前笔记 | 渲染后的右侧预览 |
| 复制 HTML | 写作者 | 点击复制或执行命令 | 给 WeChat 编辑器使用的剪贴板 HTML |
| 上传草稿 | Pro 写作者 | 点击上传草稿 | WeChat 草稿 `media_id` |
| License 校验 | 插件 | 用户校验或使用 Pro 上传 | 授权状态 |
| 插件打包 | 维护者 | 发布准备 | `dist/` 里的 zip 包 |

## 存：存储 / 状态

| 层级 | 存放内容 | 规则 |
| --- | --- | --- |
| raw | Obsidian vault 中的用户 Markdown 笔记 | 除明确格式化动作外，不改源笔记 |
| settings | 通过 `SettingsRepository` 保存的 Obsidian 插件数据 | 可能包含 AppSecret 和 License Key；不要记录 secret |
| processed | 运行时格式化 HTML 和已跟踪的 `main.js` bundle | 从源码生成；不要手改生成 bundle |
| license | `worker/` schema 下的 Cloudflare D1 表 | schema 和生产数据改动需要明确批准 |
| docs | README、docs、tasks、`.ai/` handoff | 文档是项目连续性的来源 |

## 进：输入

| 来源 | 触发 | 格式 | 流向 |
| --- | --- | --- | --- |
| 当前 Markdown view | Obsidian command、ribbon icon、编辑器变化 | Markdown text | `PublisherController` |
| 插件设置 | 设置页或预览面板 | `PluginSettings` | Service 和渲染流程 |
| 本地图片 | 预览、复制、上传中的图片引用 | Vault file bytes | `ObsidianImageRepository` |
| WeChat API 响应 | 上传和 token 请求 | JSON / bytes | `WeChatDraftService` |
| License 校验请求 | 用户校验或 Pro gated action | JSON | Worker `LicenseService` |

## 数据流

```text
Markdown note
-> PublisherController
-> WeChatFormatService
-> formatted HTML
-> PreviewView / ClipboardService / WeChatDraftService
-> Obsidian preview, clipboard, or WeChat draft
```

```text
License Key + device ID
-> EntitlementService
-> Worker /v1/licenses/verify
-> D1Repository + LicenseService
-> cached entitlement in plugin settings
```

## 模块边界

| 层级 | 职责 |
| --- | --- |
| View | `src/view/*`：渲染面板、绑定 UI 事件、展示设置和通知 |
| Controller | `src/controller/PublisherController.ts`：命令、当前笔记选择、工作流编排 |
| Service | `src/service/*`：Markdown 格式化、剪贴板、WeChat 上传、授权、预览图片改写 |
| Utils | `src/utils/*`：文本、样式、链接、图片、元数据的纯工具函数 |
| Repository / Model / DB | `src/repository/*` 和 `worker/src/repository/*`：设置、vault 文件、D1 访问 |

## 技术栈影响

- Obsidian 需要打包后的 `main.js` 和 `manifest.json`。
- WeChat 粘贴兼容性更适合使用内联 HTML/CSS，而不是外部样式。
- Shiki 会被打进 bundle，因此渲染改动可能影响 bundle 大小。
- Worker 代码在同一个仓库，但依赖生产 D1 和 secret。

## 版本边界

v1 做：

- preview and copy formatted WeChat HTML
- support core Markdown, custom containers, TOC, footnotes, images, links, emoji, and code blocks
- gate WeChat upload functions behind Pro entitlement
- manually package plugin release assets

v1 不做：

- directly publish or mass-send WeChat articles
- 把自动支付作为当前购买路径开放
- manage multiple公众号 accounts
- silently bypass WeChat API or IP whitelist errors

## 决策

- 保持 Obsidian 插件 local-first。
- 免费复制不依赖 AppID、AppSecret 或 License。
- Pro 上传在调用 WeChat API 前先做校验。
- Worker payment endpoints 保持关闭，除非明确重新开放。
- release/deploy 操作必须先得到用户明确确认。
