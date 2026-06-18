# Kenengba WeChat Publisher 安装使用说明

插件仓库：

[https://github.com/yyhzz985/xuezha985-wechat-publisher](https://github.com/yyhzz985/xuezha985-wechat-publisher)

插件下载页：

[https://github.com/yyhzz985/xuezha985-wechat-publisher/releases](https://github.com/yyhzz985/xuezha985-wechat-publisher/releases)

当前版本只声明支持 Obsidian 桌面版，暂不声明支持 iOS 或 Android。

## 1. 下载安装包

打开下载页，下载最新版本里的 zip 文件，例如：

```text
kenengba-wechat-publisher-0.1.7.zip
```

不要下载 GitHub 页面上的 `Source code`，那个是源码包，不是 Obsidian 插件安装包。

## 2. 解压安装包

解压 zip 后，里面应该只有 3 个文件：

```text
manifest.json
main.js
styles.css
```

如果解压后多了一层文件夹，也没关系，最终只需要把这 3 个文件放进 Obsidian 插件目录。

## 3. 找到 Obsidian 库目录

打开 Obsidian，进入你要安装插件的那个库。

如果不知道库在哪里：

1. 在 Obsidian 左侧文件列表里，任选一篇笔记
2. 右键点击笔记
3. 选择 `在系统资源管理器中显示`
4. 回到这个库的根目录

库根目录里应该能看到 `.obsidian` 文件夹。如果看不到，需要先打开系统的“显示隐藏文件”。

## 4. 创建插件目录

在 Obsidian 库里创建这个目录：

```text
.obsidian/plugins/kenengba-wechat-publisher/
```

Windows 示例：

```text
D:\你的Obsidian库\.obsidian\plugins\kenengba-wechat-publisher\
```

macOS 示例：

```text
/Users/你的用户名/你的Obsidian库/.obsidian/plugins/kenengba-wechat-publisher/
```

目录名必须是：

```text
kenengba-wechat-publisher
```

不要改成中文，也不要多套一层目录。

## 5. 放入插件文件

把解压出来的 3 个文件放进刚才创建的目录：

```text
.obsidian/plugins/kenengba-wechat-publisher/manifest.json
.obsidian/plugins/kenengba-wechat-publisher/main.js
.obsidian/plugins/kenengba-wechat-publisher/styles.css
```

## 6. 启用插件

1. 重启 Obsidian
2. 打开 `设置`
3. 进入 `第三方插件`
4. 如果还没关闭安全模式，先关闭安全模式
5. 找到 `Kenengba WeChat Publisher`
6. 打开右侧开关启用插件

## 7. 使用插件

1. 打开一篇 Markdown 笔记
2. 点击 Obsidian 左侧功能区的公众号预览图标
3. 右侧会出现公众号实时预览
4. 写完后点击右上角复制图标
5. 到微信公众号后台编辑器里粘贴即可

当前版本支持代码语法高亮、外站链接文字原色且 URL 蓝色展示、图片说明小字和 emoji 短代码。

右上角按钮从左到右依次是：

```text
复制 -> 上传草稿箱 -> 设置 -> 帮助
```

## 8. Pro 激活

免费功能可以预览和复制排版 HTML，不需要公众号 AppID / AppSecret。

免费复制时，网络图片链接会保留；本地图片只会在 Obsidian 预览里显示，手动粘贴到公众号后台后不会显示。要让本地图片粘贴后也显示，需要 Pro 上传图片能力。

Pro 功能包括：

- 上传到公众号草稿箱
- 上传封面图
- 上传头像图
- 复制时自动上传本地图片并替换成微信图片 URL

有 Pro 激活码后：

1. 点击右侧预览区右上角齿轮图标
2. 找到 `License Key`
3. 填入激活码
4. 点击 `校验授权`
5. 授权成功后，公众号接口配置区会解锁；配置 AppID / AppSecret 后即可使用上传功能

未激活 Pro 时，公众号接口配置区会被锁定，不能填写 AppID / AppSecret。手动填写头像 URL 仍是免费功能；点击“上传头像图”选择本地图片是 Pro 功能。

## 9. 隐私与网络请求

- 免费预览和免费复制不会调用授权服务器，也不要求公众号 AppID / AppSecret
- 插件设置保存在当前 Obsidian 库的插件数据里，包括 `License Key`、设备 ID、授权缓存、公众号 AppID 和 AppSecret
- AppSecret 明文保存在当前 Obsidian 库的插件数据里，请只在可信设备和可信 vault 中填写
- 授权校验会请求 `https://wechat-publisher-license.237219265.workers.dev/v1/licenses/verify`
- 授权服务器只接收 `License Key`、设备 ID、插件 ID、插件版本和功能名，不接收文章正文或公众号 AppSecret
- Pro 上传草稿箱、上传封面图、上传头像图或本地图片上传会请求 `https://api.weixin.qq.com`
- 上传草稿箱时，文章 HTML、标题摘要、封面 media_id、评论设置和原文链接会发送给微信官方接口

## 10. 常见问题

### Obsidian 里看不到插件

检查这 3 个文件是不是放在正确目录：

```text
.obsidian/plugins/kenengba-wechat-publisher/manifest.json
.obsidian/plugins/kenengba-wechat-publisher/main.js
.obsidian/plugins/kenengba-wechat-publisher/styles.css
```

最常见错误是多了一层目录，例如：

```text
.obsidian/plugins/kenengba-wechat-publisher/kenengba-wechat-publisher-0.1.7/manifest.json
```

这种目录结构是不对的。

### 提示无法加载第三方插件

进入 `设置 -> 第三方插件`，关闭安全模式，然后再启用插件。

### 插件启用后没有右侧预览

先打开一篇 Markdown 笔记，再点击左侧功能区的公众号预览图标。

### 上传草稿箱失败

上传草稿箱是 Pro 功能，并且需要配置公众号 AppID、AppSecret、默认封面 media_id 和 IP 白名单。

如果只是复制排版到公众号后台，不需要配置公众号 API。

### 复制成功，但图片没显示

先看图片类型：

- 网络图片链接：只要微信后台能访问，复制后仍会显示
- 本地图片：免费复制不会上传本地文件，所以粘贴到公众号后台后不会显示

解决方式：

- 使用 Pro 的复制或上传草稿箱功能，让插件自动把本地图片上传到微信公众号
- 或者先把图片放到可公开访问的图床，再在 Markdown 里使用网络图片链接
