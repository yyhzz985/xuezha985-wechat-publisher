# 当前任务

## ID

OBS-PUBLISH-007

## 状态

进行中：GitHub Release 已公开；官方社区 PR 分支已推到 fork，自动创建 PR 被 GitHub API 权限拦住。

## 目标

公开发布 `0.1.5`，并向 Obsidian 官方插件社区提交上架 PR。

## 当前结果

- 主人已明确说“公开”。
- 已 push 主仓库 `main` 和 tag `0.1.5`。
- 已创建 GitHub Release：`https://github.com/yyhzz985/xuezha985-wechat-publisher/releases/tag/0.1.5`。
- Release 单独包含 `manifest.json`、`main.js`、`styles.css` 和 `xuezha985-wechat-publisher-0.1.5.zip`。
- 已创建 fork：`https://github.com/yyhzz985/obsidian-releases`。
- 已推送 PR 分支：`add-xuezha985-wechat-publisher`。
- 自动创建 PR 失败：GitHub GraphQL 返回 `yyhzz985 does not have the correct permissions to execute CreatePullRequest`；REST API 返回 404。
- 可手动打开创建页：`https://github.com/obsidianmd/obsidian-releases/compare/master...yyhzz985:obsidian-releases:add-xuezha985-wechat-publisher?expand=1`。

## 已完成验收

- `manifest.name`：`Kenengba WeChat Publisher`。
- `isDesktopOnly`：`true`。
- 当前 release 版本：`0.1.5`。
- `versions.json` 包含 `0.1.5` 到 `1.0.0` 的映射。
- `LICENSE` 已存在，`package.json` 声明 `MIT`。
- README、安装文档和插件内帮助已写清用途、安装、使用、免费/Pro 边界、网络请求、隐私和反馈入口。
- Release asset 已验证：GitHub Release 单独包含 `manifest.json`、`main.js`、`styles.css` 和 zip。

## 验证

```powershell
npm test
npm run build
npm run package:plugin
npm run verify:release-assets
git diff --check
```

结果：全部通过。

## 下一步

1. 主人手动打开 compare 页面创建 `obsidian-releases` PR。
2. PR 创建后等待官方 review。
3. 如果官方 review 要求修改，按 review 精确修复；不要顺手改 Worker、D1、secrets 或生产配置。
