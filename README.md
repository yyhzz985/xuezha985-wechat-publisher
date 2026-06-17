# 公众号一键排版上传

一个 Obsidian 插件，用来把当前笔记排版成接近「可能吧公众号排版器」风格的微信公众号 HTML，并支持复制到公众号后台；Pro 用户还可以一键上传到公众号草稿箱。

本插件的排版风格参考 [可能吧公众号排版器](https://mp.knb.im/)。我非常喜欢它简约、克制、高级的排版审美，所以把这套写作后的排版工作流搬进了 Obsidian。

GitHub 仓库地址：[https://github.com/yyhzz985/xuezha985-wechat-publisher](https://github.com/yyhzz985/xuezha985-wechat-publisher)

安装使用说明：[docs/install-guide.md](docs/install-guide.md)

## 功能

- 右侧实时预览公众号排版效果
- 一键复制为微信公众号 HTML
- 支持当前整篇笔记或选中文本
- 自动去掉 YAML frontmatter
- 支持标题、段落、粗体、斜体、引用、列表、图片、分割线、链接、代码块、表格、脚注
- 支持 Shiki 代码语法高亮、外站链接蓝色文字展示、图片说明小字和 emoji 短代码
- 本地图片预览按 Obsidian 当前笔记解析，不绑定固定附件目录
- 支持专有格式：全能导航、摘要、高亮、提示、说明、笔记、注意、危险、独白、多角色对话
- 专有容器兼容 `:::tip` 和 `::: tip` 两种写法
- 支持主题、字重、小标题风格、代码主题、阅读时间模块配置
- 免费功能：预览、排版设置、复制 HTML、复制网络图片链接
- Pro 功能：上传草稿箱、上传封面图、上传头像图、复制时自动上传本地图片

## 安装使用

按下面步骤下载安装到 Obsidian。

### 第一步：下载安装包

打开插件发布页：

[https://github.com/yyhzz985/xuezha985-wechat-publisher/releases](https://github.com/yyhzz985/xuezha985-wechat-publisher/releases)

下载最新版本里的 zip 文件，例如：

```text
xuezha985-wechat-publisher-0.1.3.zip
```

### 第二步：解压文件

解压 zip 后，里面应该只有 3 个文件：

```text
manifest.json
main.js
styles.css
```

如果解压后外面多了一层文件夹，也没关系，最终只需要这 3 个文件。

### 第三步：找到你的 Obsidian 库目录

打开 Obsidian，进入你要安装插件的那个库。

如果不知道库在哪：

1. 在 Obsidian 左侧文件列表里，任选一篇笔记
2. 右键点击笔记
3. 选择 `在系统资源管理器中显示`
4. 打开的文件夹就是你的 Obsidian 库里的某个位置
5. 回到这个库的根目录

库根目录里应该能看到 `.obsidian` 文件夹。如果看不到，需要先打开系统的“显示隐藏文件”。

### 第四步：创建插件目录

在你的 Obsidian 库里创建这个目录：

```text
.obsidian/plugins/xuezha985-wechat-publisher/
```

Windows 示例：

```text
D:\你的Obsidian库\.obsidian\plugins\xuezha985-wechat-publisher\
```

macOS 示例：

```text
/Users/你的用户名/你的Obsidian库/.obsidian/plugins/xuezha985-wechat-publisher/
```

### 第五步：放入插件文件

把解压出来的 3 个文件放进刚才创建的目录：

```text
.obsidian/plugins/xuezha985-wechat-publisher/manifest.json
.obsidian/plugins/xuezha985-wechat-publisher/main.js
.obsidian/plugins/xuezha985-wechat-publisher/styles.css
```

目录名必须是：

```text
xuezha985-wechat-publisher
```

不要改成中文，也不要多一层文件夹。

### 第六步：启用插件

1. 重启 Obsidian
2. 打开 `设置`
3. 进入 `第三方插件`
4. 如果还没关闭安全模式，先关闭安全模式
5. 在已安装插件列表里找到 `公众号一键排版上传`
6. 打开右侧开关启用插件

### 第七步：开始使用

1. 打开一篇 Markdown 笔记
2. 点击 Obsidian 左侧功能区的公众号预览图标
3. 右侧会出现公众号实时预览
4. 写完后点击右上角复制图标
5. 到微信公众号后台编辑器里粘贴即可

如果你有 Pro 激活码：

1. 点击右侧预览区右上角齿轮图标
2. 找到 `License Key`
3. 填入激活码
4. 点击 `校验授权`
5. 授权成功后，公众号接口配置区会解锁；配置 AppID / AppSecret 后即可使用上传草稿箱、上传封面图、上传头像图

### 常见安装问题

**1. Obsidian 里看不到插件**

检查这 3 个文件是不是放在正确目录：

```text
.obsidian/plugins/xuezha985-wechat-publisher/manifest.json
.obsidian/plugins/xuezha985-wechat-publisher/main.js
.obsidian/plugins/xuezha985-wechat-publisher/styles.css
```

最常见错误是多了一层目录，例如：

```text
.obsidian/plugins/xuezha985-wechat-publisher/xuezha985-wechat-publisher-0.1.3/manifest.json
```

这种是不对的。

**2. 提示无法加载第三方插件**

进入 `设置 -> 第三方插件`，关闭安全模式，然后再启用插件。

**3. 插件启用后没有右侧预览**

先打开一篇 Markdown 笔记，再点击左侧功能区的公众号预览图标。

**4. 上传草稿箱失败**

上传草稿箱是 Pro 功能，并且需要配置公众号 AppID、AppSecret、默认封面 media_id 和 IP 白名单。免费复制不需要这些配置；如果文章里有本地图片，免费复制不会上传本地图片。

### BRAT 安装方式

如果你已经安装 BRAT，也可以用 BRAT 添加仓库：

```text
https://github.com/yyhzz985/xuezha985-wechat-publisher
```

BRAT 适合自动更新；普通用户推荐优先使用上面的手动安装方式。

## 基础使用

1. 在 Obsidian 打开一篇 Markdown 笔记
2. 点击左侧功能区的公众号预览图标
3. 右侧会打开实时预览区
4. 右上角按钮从左到右依次是：
   - 复制到公众号
   - 上传到公众号草稿箱
   - 设置
   - 帮助
5. 写完后点击复制按钮，把内容粘贴到微信公众号后台

复制规则：

- 有选中文本：只复制选中文本
- 没有选中文本：复制整篇当前笔记
- 免费复制不需要公众号 AppID、AppSecret，也不需要 Pro 授权

图片规则：

- 网络图片链接会原样保留；只要微信后台能访问该链接，粘贴后就能显示
- 本地图片在 Obsidian 预览里可以显示，但免费复制不会上传本地文件，粘贴到公众号后台后不会显示
- Pro 复制和上传草稿箱会先上传本地图片，再替换成微信图片 URL
- 插件不提供图片目录配置；Obsidian 原生预览能解析到的图片，插件才会处理

## 常用 Markdown 写法

```markdown
# 一级标题
## 二级标题
### 三级标题
#### 四级标题

> 引用内容

- 无序列表
1. 有序列表

**加粗**
*斜体*
`行内代码`

![图片说明](https://example.com/image.png)
![本地图片](assets/image.png)
![[Obsidian图片.png]]
[链接文字](https://example.com)
:smile: :rocket: :sparkles:

带脚注的文字[^1]

[^1]: 这里是脚注内容。
```

代码块：

````markdown
```ts
console.log('hello');
```
````

代码块会使用 Shiki 自动语法高亮；Markdown 图片的说明文字会显示为图片下方的小字。

外站链接会改写为蓝色的 `文字（URL）` 形式；公众号内链会保留可点击链接。

## 专有格式

### 全文导航

独占一行输入：

```markdown
[TOC]
```

插件会根据二级标题生成全文导航。

### 摘要

```markdown
:::intro
这里写摘要。
:::
```

### 金句高亮

```markdown
:::highlight
这里写金句。
:::
```

### 提示框

```markdown
:::tip
这里写提示。
:::
```

也可以写成：

```markdown
::: tip
这里写提示。
:::
```

其他容器：

```markdown
:::info
这里写说明。
:::

:::note
这里写笔记。
:::

:::warning
这里写注意。
:::

:::danger
这里写危险提示。
:::
```

### 多角色对话

```markdown
:::chat
我: 对话内容
你: 对话内容
我: 继续说
:::
```

同名角色会保持一致的对话图标。

## 公众号草稿箱上传

草稿箱上传属于 Pro 功能。配置入口在右侧预览区右上角的设置按钮里。

未激活 Pro 时，公众号接口配置区默认锁定，不能填写 AppID / AppSecret。这样免费用户只用复制功能时，不会被要求配置公众号接口。

需要填写：

- `AppID`：公众号 AppID
- `AppSecret`：公众号 AppSecret
- `默认封面 media_id`：上传草稿时使用的封面素材 ID
- `原文链接`：可选
- `开启评论`：上传草稿时允许文章留言评论

上传头像图也属于 Pro 功能。手动填写头像 URL 是免费功能；点击“上传头像图”选择本地图片时，会调用微信公众号正文图片上传接口，所以需要 Pro 授权和公众号接口配置。

AppID 和 AppSecret 获取位置：

- 微信公众平台
- 设置与开发
- 账号设置或开发接口管理

IP 白名单配置：

- 微信公众平台
- 设置与开发
- 安全中心
- IP 白名单

插件从本机发起微信接口请求，所以白名单应填写当前电脑出口公网 IP。可以访问 [https://myip.ipip.net/](https://myip.ipip.net/) 查看。

注意：家用宽带公网 IP 可能变化。如果某天突然上传失败，先检查公网 IP 是否变了。

## Pro 激活

免费功能：

- 实时预览
- 复制到公众号，不要求 AppID / AppSecret
- 复制网络图片链接
- 排版工具栏
- 主题设置
- 手动填写头像 URL

Pro 功能：

- 上传到公众号草稿箱
- 上传封面图
- 上传头像图
- 复制时自动上传本地图片并替换成微信图片 URL

价格：

- 19 元 / 年
- 58 元 / 永久

购买后在设置里填写 `License Key`，点击 `校验授权` 即可。

联系渣姐微信 `237219265` 获取激活码。授权期间享受免费插件版本升级，后续计划添加多公众号账号切换管理。

## 安全说明

- AppSecret 明文保存在当前 Obsidian 库的插件数据里
- 文章内容不会发送到授权服务器
- 公众号 AppSecret 不会发送到授权服务器
- 授权服务器只校验 License Key、设备 ID、插件 ID、插件版本和功能名
- 一个 License Key 默认绑定 1 台设备
- 只有使用上传草稿箱、上传封面图、上传头像图或 Pro 本地图片上传时，插件才会调用微信公众号接口

## 开发

```powershell
npm install
npm run build
npm test
```

打包：

```powershell
npm run package:plugin
```

生成的 zip 在 `dist/` 目录。

## 开源许可证

本项目使用 MIT License。

简单说：你可以免费使用、复制、修改和分发这份源码；如果再次分发，需要保留原作者版权和许可声明。软件按原样提供，作者不对使用结果承担担保责任。
