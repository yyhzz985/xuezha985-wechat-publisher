# 公众号排版器 Pro 授权 Worker

这个 Worker 负责手动激活码授权，不接收公众号 AppSecret，也不接收文章正文。

当前公开购买入口已关闭：`/buy`、`/v1/orders/create`、`/v1/pay/mbd/webhook` 都只返回“购买入口暂未开放”。现在的发卡方式是后台脚本批量生成 License Key，再手动发给用户。

## 1. 数据库

```powershell
cd E:\AI_project\ob-kenengba\worker
npx wrangler d1 migrations apply wechat-publisher-license-db --remote
```

D1 数据库绑定在 `wrangler.jsonc` 里，表结构包括：

- `licenses`：保存 License 哈希、套餐、有效期、设备数、状态。
- `license_activations`：保存设备绑定。
- `license_events`：记录发卡、激活、拒绝、解绑、禁用等事件。
- `orders`、`payment_events`：预留给以后自动收款发卡。

## 2. Secrets

线上 Worker 必须配置：

```powershell
npx wrangler secret put ADMIN_TOKEN
npx wrangler secret put LICENSE_HASH_SECRET
```

- `ADMIN_TOKEN`：本地管理脚本调用 Worker Admin API 的口令。
- `LICENSE_HASH_SECRET`：License 哈希盐，随机长字符串即可。

本地脚本可以把 Admin Token 写到 `worker/.admin-token.local`，这个文件已被 `.gitignore` 忽略，不要提交。

## 3. 部署

```powershell
cd E:\AI_project\ob-kenengba\worker
npx wrangler deploy --dry-run
npx wrangler deploy
```

当前线上地址：

```text
https://wechat-publisher-license.237219265.workers.dev
```

插件内置校验接口：

```text
https://wechat-publisher-license.237219265.workers.dev/v1/licenses/verify
```

## 4. 手动发卡

年卡 100 条：

```powershell
.\scripts\issue-license.ps1 -Count 100 -LicenseType year -Note "manual"
```

永久卡 100 条：

```powershell
.\scripts\issue-license.ps1 -Count 100 -LicenseType lifetime -Note "manual"
```

脚本会直接写入线上 D1，并在当前目录导出 CSV：

- `licenses-year-YYYYMMDD-HHMMSS.csv`
- `licenses-lifetime-YYYYMMDD-HHMMSS.csv`

CSV 字段：

- `licenseKey`
- `expiresAt`
- `licenseType`
- `price`
- `maxDevices`
- `note`

年卡固定 365 天，价格字段 `19`。永久卡用 36500 天表示，价格字段 `58`。默认一个 Key 绑定一台设备。

## 5. 管理 Key

解绑设备：

```powershell
.\scripts\issue-license.ps1 -Action reset-device -LicenseKey "PRO-xxxx"
```

禁用 Key：

```powershell
.\scripts\issue-license.ps1 -Action disable -LicenseKey "PRO-xxxx"
```

延期：

```powershell
.\scripts\issue-license.ps1 -Action extend -LicenseKey "PRO-xxxx" -Days 365
```

## 6. 抽查校验

抽查时会把 Key 绑定到测试设备。抽查完成后要立刻执行 `reset-device`，否则这条 Key 会被占用。

```powershell
$body = @{
  licenseKey = "PRO-xxxx"
  deviceId = "codex-check"
  pluginId = "xuezha985-wechat-publisher"
  pluginVersion = "0.1.4"
  feature = "wechat_upload"
} | ConvertTo-Json

Invoke-RestMethod `
  -Method Post `
  -Uri "https://wechat-publisher-license.237219265.workers.dev/v1/licenses/verify" `
  -ContentType "application/json" `
  -Body $body

.\scripts\issue-license.ps1 -Action reset-device -LicenseKey "PRO-xxxx"
```
