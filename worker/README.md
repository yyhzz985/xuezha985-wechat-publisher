# 公众号排版插件 Pro 授权 Worker

这个 Worker 只做 License 校验，不接收公众号 AppSecret，也不接收文章正文。

## 部署

1. 登录 Cloudflare：

```bash
npx wrangler login
```

2. 部署 Worker。

`wrangler.jsonc` 里只写了 `LICENSES` 绑定，没有手填 KV ID。Wrangler 会在部署时自动创建 KV，并把 ID 写回配置。

```bash
npx wrangler deploy
```

3. 把部署后的地址填入插件设置里的“授权服务 URL”，路径必须是：

```text
https://你的-worker域名/v1/licenses/verify
```

## 手工发放 License

最简单方式是运行脚本：

```powershell
.\scripts\issue-license.ps1 -Days 365 -Note "张三"
```

脚本会自动生成一个 `PRO-...`，写入 Cloudflare KV。你把输出里的 `License Key` 发给用户即可。

用户在插件里填写：

- `License Key`：你发给他的 `PRO-...`
- `授权服务 URL`：你的 Worker 校验地址，例如 `https://wechat-publisher-license.你的账号.workers.dev/v1/licenses/verify`

第一版只防普通用户误用，不做强 DRM。会改插件源码的人可以绕过本地限制。
