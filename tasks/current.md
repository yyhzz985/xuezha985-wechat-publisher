# 当前任务

## ID

LIC-001

## 状态

已完成服务器侧修复和本地 `0.1.8` 准备，未公开发布：官方社区版插件 Pro 授权超时的根因是部分用户网络无法稳定访问 `workers.dev`。当前已在阿里云大陆轻量服务器部署主授权入口：

```text
https://pindoutool.cn/wechat-publisher-license/v1/licenses/verify
```

插件本地版本已升为 `0.1.8`，默认使用阿里云授权入口，旧 `workers.dev` 地址保留为 fallback。GitHub Release、push、官方社区更新仍未执行。

## 目标

让官方社区版插件在普通大陆网络下可以稳定完成 Pro 授权激活，不要求用户开代理。

## 触发

用户安装官方社区版 `Kenengba WeChat Publisher` 后，在插件设置里输入 Pro License Key 并点击 `校验授权`，弹出：

```text
授权校验失败：
net::ERR_CONNECTION_TIMED_OUT
```

## 已确认事实

- 原插件内置授权服务地址为 `https://wechat-publisher-license.237219265.workers.dev/v1/licenses/verify`。
- 用户网络和阿里云大陆服务器访问旧 `workers.dev` 授权服务都会超时。
- Worker 服务端校验逻辑不按 `pluginId` 拒绝旧卡；核心是按 `licenseKey` 哈希查 D1。
- 线上 D1 只读查询确认：
  - 年卡批次线上有 100 条。
  - 永久卡批次线上有 100 条。
  - 截图对应卡线上存在，`active=1`，`max_devices=1`，未绑定设备，过期时间为 2027-06-11。
- 本地最后年卡 CSV 有 100 条；本地永久卡 CSV 有 99 条，缺 `item=1`。
- 线上 D1 中缺失明文的永久卡 `item=1` 已绑定 1 台设备；阿里云授权库已用 device hash 建立 legacy entitlement，支持该已绑定设备继续使用。

## 已完成

- 在阿里云服务器 `116.62.173.189` 上新增 `/www/wwwroot/wechat-publisher-license/`。
- 部署 `scripts/license-server/license_server.py` 到服务器，通过 PM2 运行 `wechat-license`，监听 `127.0.0.1:3101`。
- 用本地 CSV 生成只含 hash 的 SQLite 授权库，导入 199 张本地有明文的卡。
- 从 D1 只读导出两批卡的 6 条已绑定设备记录，导入 5 条普通 activation 和 1 条 legacy device entitlement。
- 通过宝塔 Nginx extension 新增 `/wechat-publisher-license/` 反向代理，不改拼豆网站业务代码。
- 外网验证：
  - `GET https://pindoutool.cn/wechat-publisher-license/health` 返回 `{"ok":true}`。
  - 无效卡返回 `License 不存在`。
  - 已绑定有效卡校验返回 `active=true`、`plan=pro`、`usedDevices=1`、`maxDevices=1`。
- 插件 `0.1.8`：
  - 默认授权地址改为阿里云入口。
  - 旧 Worker 地址保留为 fallback。
  - 网络错误提示改为“授权服务器连接超时或不可达，请稍后重试或联系支持”。
  - 授权缓存宽限从 24 小时改为 30 天。
  - README、安装文档、帮助文档、架构、技术栈、决策和测试已同步。

## 当前判断

这不是“卡密没生成”“卡密没写进 D1”“卡密已绑定”或“官方社区插件 ID 变化导致卡密无效”。

根因是旧授权服务部署在 `workers.dev` 域名，部分大陆网络 / DNS 环境无法稳定访问。`0.1.8` 改为优先访问阿里云大陆服务器，能绕开用户无代理导致的激活失败。

## 验证

```powershell
npm test
npm run build
npm run package:plugin
npm run verify:release-assets
git diff --check -- . ':!main.js'
Get-FileHash -Algorithm SHA256 -LiteralPath dist\kenengba-wechat-publisher-0.1.8.zip
```

结果：

- `npm test`：92 tests，92 pass。
- `npm run build`：通过。
- `npm run package:plugin`：通过；因同版本标准 zip 已存在，本次生成 `dist\kenengba-wechat-publisher-0.1.8-20260628-142006.zip`。
- `npm run verify:release-assets`：通过。
- `git diff --check -- . ':!main.js'`：通过，仅有 Windows LF/CRLF 提示。
- `dist\kenengba-wechat-publisher-0.1.8.zip` SHA-256：`BC7A651579FB0D98457021A58C02725886F9F51263D36E85E8A3C9F53E9FFA11`。
- `dist\kenengba-wechat-publisher-0.1.8-20260628-142006.zip` SHA-256：`679362EB0BF0D65CC7F0B16F501D35A1F1F950FC828EC2FCCED40AEE38217DB8`。
- 阿里云服务器 PM2 服务在线。
- 阿里云 HTTPS 授权路径可从外网访问。

## 下一步

1. 等主人单独确认后，才允许 push、创建 GitHub Release、官方社区 `Check for new releases` 或其他公开发布动作。
2. 发布 `0.1.8` 时，GitHub Release 仍必须单独上传 `manifest.json`、`main.js`、`styles.css` 和 zip；zip 不能替代前三个文件。
3. 发布后让报错用户更新插件，再用原 Pro 授权码校验。
4. 后续发新卡前，必须补“发卡同步阿里云授权库”流程；否则新卡只写 D1，主授权入口无法识别。
