# UI 风格简报

## 用户和工作流

- 用户：在 Obsidian 起草并发布到微信公众号的写作者。
- 主要工作流：写 Markdown，在右侧面板预览，复制 HTML 或上传草稿。
- 最重要界面：右侧预览面板，带紧凑 toolbar、设置面板和帮助面板。

## 视觉方向

- 调性：克制、写作工具导向，接近 possible-bar / 可能吧公众号排版器风格。
- 密度：控件紧凑，内容阅读性高。
- 颜色规则：避免吵闹装饰；HTML 输出使用可经受 WeChat 粘贴的受控内联样式。
- 字体排版：中文文章可读，标题节奏清楚，需要时使用小号辅助文字。

## 布局规则

- 预览是主界面。
- toolbar action 保持紧凑，优先 icon。
- 设置项应是直接控件，不写营销文案。
- 帮助内容来自 `docs/plugin-help.md`。
- 插件 UI 内不要引入嵌套 card 或大型宣传区块。

## 组件

| 组件 | 规则 |
| --- | --- |
| Buttons | toolbar action 优先使用带 accessible labels 的 icon button |
| Forms | AppID、AppSecret、media ID、License Key、author、avatar URL 使用明确 label |
| Navigation | 使用 Obsidian ribbon command 和右侧 preview view |
| Cards | 只用于真实设置组或渲染后的文章块 |
| Modals / Panels | 帮助和设置保持在预览上下文内 |
| Tables / Lists | 帮助文档可以渲染 Markdown table；文章输出必须保持 WeChat-compatible |

## 状态

- 空状态：提示用户打开或编写 Markdown 笔记。
- 加载中：异步上传运行时禁用上传按钮。
- 错误：展示具体 WeChat 或 License 错误。
- 成功：复制、上传、license validation 显示短通知。

## 响应式规则

- Obsidian desktop 是主要目标。
- 不假设面板很宽；toolbar 和设置必须能在窄右侧栏工作。
- `manifest.json` 当前是 `isDesktopOnly: true`，插件不声明移动端兼容。

## 资产

- 核心 UI 控件不要依赖远程资产。
- 文章 HTML 可以包含用户提供的网络图片。
- Pro 图片上传必须在草稿上传前把本地图片转换成 WeChat 可访问 URL。

## 可访问性

- icon button 保持 `aria-label` 或等价 accessible name。
- 避免重复 native `title` 和 custom tooltip 行为。
- 帮助内容应允许文本选择。

## 不使用

- 装饰性渐变背景。
- 插件 UI 内的大型 marketing hero layout。
- 对上传或 entitlement 错误做隐藏式静默失败。

## 现有 UI 说明

- toolbar 顺序是 copy、upload、settings、help。
- Help panel 来源是 `docs/plugin-help.md`。
- 预览和复制出的文章 HTML 与 Obsidian UI CSS 分离。
