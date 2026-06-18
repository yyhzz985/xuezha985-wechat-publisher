# 最新检查

## 日期

2026-06-18 Asia/Shanghai

## 范围

官方社区提交页拒绝旧 `manifest.id` 后的 `0.1.6` 公开发布。

## 命令

```powershell
npm test
npm run build
npm run package:plugin
npm run verify:release-assets
git diff --check
Get-FileHash -Algorithm SHA256 -LiteralPath dist\kenengba-wechat-publisher-0.1.6.zip
gh api repos/yyhzz985/xuezha985-wechat-publisher/git/refs/heads/main ...
gh release create 0.1.6 manifest.json main.js styles.css dist\kenengba-wechat-publisher-0.1.6.zip ...
gh release view 0.1.6 --repo yyhzz985/xuezha985-wechat-publisher --json tagName,isDraft,isPrerelease,url,assets,targetCommitish
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
- `git push origin main` 因 GitHub HTTPS 连接失败未成功；本次使用 GitHub API 发布等价内容，远端 `main` 和 tag `0.1.6` 指向 `85354ff44bae5272b170ba8f5ab074bdf4b96ccb`。
- GitHub Release：`https://github.com/yyhzz985/xuezha985-wechat-publisher/releases/tag/0.1.6`。
- Release 状态：非 draft、非 prerelease。
- Release assets：`manifest.json`、`main.js`、`styles.css`、`kenengba-wechat-publisher-0.1.6.zip`。
- Release zip digest：`sha256:2909b853545d9be36e0c978b70cc6911b956eeeacd0cc27a54f64afdf2622076`。

## 已知缺口

- 尚未重新提交官方社区表单；需要主人在网页表单中再次提交仓库 URL。
- 本地 `origin/main` 由于 `git push` 网络失败仍可能显示旧跟踪状态；远端已通过 GitHub API 更新。
- 未做干净 Obsidian vault 手动 smoke test。
- 未跑 Worker dry-run：Worker deployment/config work 属于红线区，且本任务不涉及 Worker 发布。
