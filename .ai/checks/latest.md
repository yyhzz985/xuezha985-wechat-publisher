# 最新检查

## 日期

2026-06-18 Asia/Shanghai

## 范围

公开发布：`0.1.5` Release 已创建，官方社区 PR 分支已推送。

## 命令

```powershell
npm test
npm run build
npm run package:plugin
npm run verify:release-assets
git diff --check
git push origin main
git push origin 0.1.5
gh release create 0.1.5 ...
git -C E:\AI_project\obsidian-releases push -u origin add-xuezha985-wechat-publisher
```

## 结果

通过。

## 证据

- `npm test`：87 tests，87 pass，0 fail。
- `npm run build`：`tsc -noEmit -skipLibCheck && node esbuild.config.mjs production` 通过。
- `npm run package:plugin`：通过；生成并验证 `dist/xuezha985-wechat-publisher-0.1.5.zip`。
- `npm run verify:release-assets`：通过；输出 GitHub Release 必须单独附加 `manifest.json`、`main.js`、`styles.css` 和 package zip。
- `git diff --check`：通过；只有 Windows line ending 提示，无 whitespace error。
- `git push origin main`：通过。
- `git push origin 0.1.5`：通过。
- GitHub Release：`https://github.com/yyhzz985/xuezha985-wechat-publisher/releases/tag/0.1.5`。
- Release assets：`manifest.json`、`main.js`、`styles.css`、`xuezha985-wechat-publisher-0.1.5.zip` 均已单独上传。
- `obsidian-releases` fork 分支已推送：`yyhzz985:add-xuezha985-wechat-publisher`。
- 自动创建官方 PR 失败：GraphQL 返回 `yyhzz985 does not have the correct permissions to execute CreatePullRequest`；REST API 返回 404。

## 已知缺口

- 未提交 `obsidian-releases` PR：需要主人手动打开 compare 页面创建。
- 未做干净 Obsidian vault 手动 smoke test。
- 未跑 Worker dry-run：Worker deployment/config work 属于红线区，且本任务不涉及 Worker 发布。
