# 最新检查

## 日期

2026-06-28 Asia/Shanghai

## 范围

`LIC-001`：官方社区版插件 Pro 授权激活 `net::ERR_CONNECTION_TIMED_OUT` 的正式修复准备。

## 命令

```powershell
npm test
npm run build
npm run package:plugin
npm run verify:release-assets
git diff --check -- . ':!main.js'
Get-FileHash -Algorithm SHA256 -LiteralPath dist\kenengba-wechat-publisher-0.1.8.zip
```

## 结果

已完成服务器侧修复和本地 `0.1.8` 发版准备；未 push、未创建 GitHub Release、未更新 Obsidian 官方社区版本。

- `npm test`：92 tests，92 pass。
- `npm run build`：通过。
- `npm run package:plugin`：通过；因 `dist\kenengba-wechat-publisher-0.1.8.zip` 已存在，脚本按规则生成 `dist\kenengba-wechat-publisher-0.1.8-20260628-142006.zip`，没有覆盖旧包。
- `npm run verify:release-assets`：通过。
- `git diff --check -- . ':!main.js'`：通过。
- `dist\kenengba-wechat-publisher-0.1.8.zip` SHA-256：`BC7A651579FB0D98457021A58C02725886F9F51263D36E85E8A3C9F53E9FFA11`。
- `dist\kenengba-wechat-publisher-0.1.8-20260628-142006.zip` SHA-256：`679362EB0BF0D65CC7F0B16F501D35A1F1F950FC828EC2FCCED40AEE38217DB8`。

## 证据

- 阿里云大陆服务器新增授权服务，公网入口为 `https://pindoutool.cn/wechat-publisher-license/v1/licenses/verify`。
- `GET https://pindoutool.cn/wechat-publisher-license/health` 返回 `{"ok":true}`。
- 无效卡 POST 返回 `License 不存在`。
- 已绑定有效卡按同设备校验返回 `active=true`、`plan=pro`、`usedDevices=1`、`maxDevices=1`。
- 插件本地 `0.1.8` 默认授权地址已改为阿里云入口，旧 `https://wechat-publisher-license.237219265.workers.dev/v1/licenses/verify` 保留为 fallback。
- 授权缓存宽限从 24 小时改为 30 天。
- 网络错误提示改为“授权服务器连接超时或不可达，请稍后重试或联系支持”。

## 已知缺口

- 当前 Obsidian 官方社区线上用户仍在 `0.1.7`，必须公开发布 `0.1.8` 后才会拿到新授权入口。
- 本地永久卡 CSV 缺少线上 D1 的永久卡 `item=1` 明文；阿里云库已为该卡的已绑定设备建立 legacy entitlement，可支持该设备继续用，但无法支持该卡在新设备重新激活，除非找回明文或换发。
- 后续新发卡不能只写 Cloudflare D1；必须同步写入阿里云 SQLite 主授权库，见 `LIC-002`。
