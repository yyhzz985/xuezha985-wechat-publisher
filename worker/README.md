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

3. 插件已经内置当前授权地址，普通用户不用填写授权服务 URL。

当前内置地址是：

```text
https://wechat-publisher-license.237219265.workers.dev/v1/licenses/verify
```

## 手工发放 License

发一个 Key：

```powershell
.\scripts\issue-license.ps1 -Days 365 -Note "张三"
```

脚本会自动生成一个 `PRO-...`，写入 Cloudflare KV。你把输出里的 `License Key` 发给用户即可。

批量发 Key：

```powershell
.\scripts\issue-license.ps1 -Count 100 -Days 365 -Note "2026-06 批次"
```

用户在插件里填写：

- `License Key`：你发给他的 `PRO-...`

批量脚本会生成 `licenses-YYYYMMDD-HHMMSS.csv`。以后接发卡工具时，把 CSV 里的 `licenseKey` 列导入发卡工具即可。

有效期由 `-Days` 控制。`-Days 365` 就是一年；如果要一个月，用 `-Days 30`。

第一版只防普通用户误用，不做强 DRM。会改插件源码的人可以绕过本地限制。
