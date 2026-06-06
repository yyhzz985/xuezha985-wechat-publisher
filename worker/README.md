# 公众号排版器 Pro 授权与自动发卡 Worker

这个 Worker 负责三件事：

- 校验插件里的 `License Key`。
- 接收面包多 Pay 付款成功通知，自动生成 Pro Key。
- 管理 Key 的设备绑定、禁用、延期、解绑。

插件仍然只让用户填写一个 `License Key`。公众号 AppSecret 和文章正文不会发到这个 Worker。

## 1. 创建 D1

```powershell
cd E:\AI_project\ob-kenengba\worker
npx wrangler d1 create wechat-publisher-license-db
```

把命令输出里的 `database_id` 填到 `wrangler.jsonc` 的 `d1_databases[0].database_id`。

## 2. 配置 Secrets

```powershell
npx wrangler secret put ADMIN_TOKEN
npx wrangler secret put LICENSE_HASH_SECRET
npx wrangler secret put MBD_APP_ID
npx wrangler secret put MBD_APP_KEY
npx wrangler secret put MBD_PRO_YEAR_AMOUNT_CENTS
npx wrangler secret put PUBLIC_BASE_URL
```

说明：

- `ADMIN_TOKEN`：你本地管理脚本调用 Worker Admin API 的口令。
- `LICENSE_HASH_SECRET`：用于 License 哈希和加密，随机长字符串即可。
- `MBD_APP_ID`、`MBD_APP_KEY`：面包多 Pay 控制台里获取。
- `MBD_PRO_YEAR_AMOUNT_CENTS`：Pro 年费金额，单位是分，例如 `9900`。
- `PUBLIC_BASE_URL`：Worker 公开地址，例如 `https://wechat-publisher-license.237219265.workers.dev`。

本地调试可以把这些写到 `worker/.dev.vars`，不要提交。

## 3. 初始化数据库并部署

```powershell
npx wrangler d1 migrations apply wechat-publisher-license-db --remote
npx wrangler deploy
```

部署后，在面包多 Pay 控制台设置 Webhook URL：

```text
https://你的-worker域名/v1/pay/mbd/webhook
```

## 4. 自动购买链路

插件里的“购买 Pro”会打开：

```text
https://wechat-publisher-license.237219265.workers.dev/buy
```

用户付款后：

1. 面包多发送 Webhook。
2. Worker 反查面包多订单，确认已支付、金额正确、未退款。
3. Worker 生成 `PRO-...`，写入 D1。
4. 用户在订单页复制 Key，回到插件里激活。

## 5. 管理 Key

先把 `ADMIN_TOKEN` 放到环境变量，或写入 `worker/.admin-token.local`。

批量发 Key：

```powershell
.\scripts\issue-license.ps1 -Count 100 -Days 365 -Note "2026-06 批次"
```

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

CSV 卡密文件会输出到当前目录，已被 `.gitignore` 忽略，不要提交。
