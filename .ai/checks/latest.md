# 最新检查

## 日期

2026-06-18 Asia/Shanghai

## 范围

官方社区提交页拒绝旧 `manifest.id` 后的本地修复：准备 `0.1.6`，将 `manifest.id` 改为 `kenengba-wechat-publisher`。

## 命令

```powershell
npm test
npm run build
npm run package:plugin
npm run verify:release-assets
git diff --check
Get-FileHash -Algorithm SHA256 -LiteralPath dist\kenengba-wechat-publisher-0.1.6.zip
```

## 结果

通过。

## 证据

- `npm test`：87 tests，87 pass，0 fail。
- `npm run build`：`tsc -noEmit -skipLibCheck && node esbuild.config.mjs production` 通过。
- `npm run package:plugin`：通过；生成并验证 `dist/kenengba-wechat-publisher-0.1.6.zip`。
- `npm run verify:release-assets`：通过；输出 GitHub Release 必须单独附加 `manifest.json`、`main.js`、`styles.css` 和 package zip。
- `git diff --check`：通过；只有 Windows line ending 提示，无 whitespace error。
- `dist/kenengba-wechat-publisher-0.1.6.zip` SHA-256：`2909B853545D9BE36E0C978B70CC6911B956EEEACD0CC27A54F64AFDF2622076`。
- 已确认当前官方社区已有 `wechat-publisher` 和 `markdown-wechat-publisher`，没有发现 `kenengba-wechat-publisher`。

## 已知缺口

- `0.1.6` 仍是本地准备状态：未 push、未创建 tag、未创建 GitHub Release、未重新提交官方社区表单。
- 需要主人明确确认后，才能公开发布 `0.1.6`。
- 未做干净 Obsidian vault 手动 smoke test。
- 未跑 Worker dry-run：Worker deployment/config work 属于红线区，且本任务不涉及 Worker 发布。
