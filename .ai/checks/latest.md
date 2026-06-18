# 最新检查

## 日期

2026-06-18 Asia/Shanghai

## 范围

官方社区 `0.1.6` 自动审查 failed 后的 `0.1.7` 本地整改与打包验证。

## 命令

```powershell
npm test
npm run build
npm run package:plugin
npm run verify:release-assets
git diff --check -- . ':!main.js'
git diff --check
Get-FileHash -Algorithm SHA256 -LiteralPath dist\kenengba-wechat-publisher-0.1.7.zip
```

## 结果

核心验证通过。完整 `git diff --check` 未通过，原因是生成的 `main.js` 第 25 行存在依赖 bundle 内容产生的 trailing whitespace；排除生成 bundle 后源码 / 文档 diff check 通过。

## 证据

- `npm test`：91 tests，91 pass，0 fail。
- `npm run build`：`tsc -noEmit -skipLibCheck && node esbuild.config.mjs production` 通过。
- `npm run package:plugin`：通过；生成并验证 `dist/kenengba-wechat-publisher-0.1.7.zip`。
- `npm run verify:release-assets`：通过；输出 GitHub Release 必须单独附加 `manifest.json`、`main.js`、`styles.css` 和 package zip。
- `git diff --check -- . ':!main.js'`：通过；只有 Windows line ending 提示，无 whitespace error。
- `git diff --check`：失败；`main.js:25: trailing whitespace.`。该文件是 esbuild 生成的 bundle，source files 已通过排除生成 bundle 的检查。
- `dist/kenengba-wechat-publisher-0.1.7.zip` SHA-256：`2505BA66290817D35B0F654990A27617737A84B72974234F0DA3B2E6AEE4DA78`。
- 本地已确认 `src/view/PreviewModal.ts` 和 `src/view/PreviewView.ts` 不再直接写 `innerHTML` / `outerHTML`。
- 本地已确认 `src/view/SettingsTab.ts` 使用 `Setting.setHeading()`。
- 本地已确认 `manifest.minAppVersion` 为 `1.7.2`，`versions.json` 映射 `0.1.7` 到 `1.7.2`。
- README 已新增 `English summary`。

## 已知缺口

- 尚未公开发布 `0.1.7`；公开发布需要主人再次确认。
- 官方社区当前可见的最新审查仍是 `0.1.6` failed，需发布 `0.1.7` 后点击 `Check for new releases` 或重新触发审核。
- 本地 `origin/main` 由于 `git push` 网络失败仍可能显示旧跟踪状态；远端已通过 GitHub API 更新。
- 未做干净 Obsidian vault 手动 smoke test。
- 未跑 Worker dry-run：Worker deployment/config work 属于红线区，且本任务不涉及 Worker 发布。
