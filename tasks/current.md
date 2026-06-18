# 当前任务

## ID

OBS-PUBLISH-009

## 状态

本地已完成：官方自动审查失败项已修复并打包为 `0.1.7`；等待主人确认是否公开发布 `0.1.7`。

## 目标

修复 Obsidian 官方社区 `0.1.6` 自动审查失败项，让下一版具备再次提交审核的准备条件。

## 触发

官方社区页面显示 `0.1.6` failed，主要阻断项：

- `manifest.minAppVersion` 低于实际使用的 Obsidian API。
- `src/view/PreviewModal.ts` 和 `src/view/PreviewView.ts` 直接写 `innerHTML`。
- `src/view/SettingsTab.ts` 直接创建 HTML heading。
- README 被提示缺少英文说明。

## 本地整改

- 版本已升为 `0.1.7`。
- `manifest.minAppVersion` 已升为 `1.7.2`，匹配 `WorkspaceLeaf.loadIfDeferred()` 和 `Workspace.revealLeaf()` 的 `@since 1.7.2`。
- 新增 `src/utils/domUtils.ts`，用 Obsidian 官方 `sanitizeHTMLToDom` 渲染 HTML fragment。
- `PreviewModal.ts`、`PreviewView.ts` 已移除直接 `innerHTML` 写入。
- `SettingsTab.ts` 已改用 `new Setting(...).setName(...).setHeading()`。
- README 已新增 `English summary`。
- README、安装文档、Worker README 示例、版本 metadata 和测试已同步到 `0.1.7`。
- 新增 `tests/official-review.test.ts`，覆盖官方审查阻断项。

## 本地验收

- `manifest.name`：`Kenengba WeChat Publisher`。
- `manifest.id`：`kenengba-wechat-publisher`。
- `manifest.version`：`0.1.7`。
- `manifest.minAppVersion`：`1.7.2`。
- `isDesktopOnly`：`true`。
- `versions.json` 包含 `0.1.7` 到 `1.7.2` 的映射。
- `npm test` 已通过：91 tests，91 pass。
- `npm run build` 已通过。
- `npm run package:plugin` 已通过，生成 `dist/kenengba-wechat-publisher-0.1.7.zip`。
- `npm run verify:release-assets` 已通过。
- `git diff --check -- . ':!main.js'` 已通过；完整 `git diff --check` 仍会报告生成的 `main.js` 第 25 行 trailing whitespace。
- `dist/kenengba-wechat-publisher-0.1.7.zip` SHA-256：`2505BA66290817D35B0F654990A27617737A84B72974234F0DA3B2E6AEE4DA78`。

## 验证

```powershell
npm test
npm run build
npm run package:plugin
npm run verify:release-assets
git diff --check -- . ':!main.js'
Get-FileHash -Algorithm SHA256 -LiteralPath dist\kenengba-wechat-publisher-0.1.7.zip
```

## 下一步

1. 停下来等主人确认是否公开发布 `0.1.7`。
2. 如果确认，发布前先创建本地 checkpoint，再更新远端 `main` / tag / GitHub Release assets。
3. 发布后回到官方社区页面点击 `Check for new releases` 或重新提交审核。
4. 不要 deploy，不要改 Worker/D1/secrets，不要提交官方入口，直到主人明确确认。
