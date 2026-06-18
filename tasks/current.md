# 当前任务

## ID

OBS-PUBLISH-008

## 状态

本地已完成，等待主人确认公开发布：官方社区表单拒绝 `manifest.id`，本地已改为只含小写英文字母和连字符的 ID，并完成测试、构建、打包和 release 校验。

## 目标

修复 Obsidian 官方社区提交页提示的 `The plugin ID in your manifest.json is not allowed`，准备 `0.1.6` 版本重新提交。

## 当前结果

- 官方社区提交入口已打开：`https://community.obsidian.md/account/plugins/new`。
- 表单错误：`The plugin ID in your manifest.json is not allowed.`
- 根因：当前公开版 `0.1.5` 使用 `xuezha985-wechat-publisher`，其中 `985` 不符合官方表单当前对新插件 ID 的限制。
- 本地 `manifest.id` 已改为 `kenengba-wechat-publisher`。
- 本地版本已升为 `0.1.6`，避免复用已公开且 manifest 无效的 `0.1.5` Release。
- `src/view/PreviewView.ts` 的 view type 已同步为 `kenengba-wechat-publisher-preview`。
- README、安装文档、Worker README 示例、版本 metadata 和测试已同步。
- 未 push、未创建 tag、未创建 GitHub Release、未重新提交官方社区。

## 已完成验收

- `manifest.name`：`Kenengba WeChat Publisher`。
- `manifest.id`：`kenengba-wechat-publisher`。
- `manifest.version`：`0.1.6`。
- `isDesktopOnly`：`true`。
- `versions.json` 包含 `0.1.6` 到 `1.0.0` 的映射。
- release/package 验证脚本已收紧 ID 规则：只允许小写英文字母和连字符，不允许数字。
- `npm test` 已通过：87 tests，87 pass。
- `npm run build` 已通过。
- `npm run package:plugin` 已通过，生成 `dist/kenengba-wechat-publisher-0.1.6.zip`。
- `npm run verify:release-assets` 已通过。
- `git diff --check` 已通过。
- `dist/kenengba-wechat-publisher-0.1.6.zip` SHA-256：`2909B853545D9BE36E0C978B70CC6911B956EEEACD0CC27A54F64AFDF2622076`。

## 验证

```powershell
npm test
npm run build
npm run package:plugin
npm run verify:release-assets
git diff --check
```

## 下一步

1. 停下来问主人是否允许公开发布 `0.1.6`。
2. 主人确认后，才能 push、创建 tag、创建 GitHub Release，并重新到官方社区表单提交仓库 URL。
