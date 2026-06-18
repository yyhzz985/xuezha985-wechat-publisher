# 当前任务

## ID

OBS-PUBLISH-001

## 状态

已完成：本地合规整改和验证通过；未执行公开发布。

## 目标

完成 Obsidian 官方插件社区上架前的合规整改准备，让插件具备提审条件，但不执行公开发布。

## 为什么现在做

官方社区上架前需要先清理 manifest、README、license、release assets、移动端/桌面端兼容性和隐私说明。直接发布会把命名、版本、外部请求、Release asset 漂移等风险带进审核。

## 范围

允许改：

- `manifest.json`、`versions.json`、`package.json` 中与版本、名称、描述、`minAppVersion`、`isDesktopOnly` 相关的字段。
- `README.md`、`docs/install-guide.md`、`docs/plugin-help.md` 中与官方上架、隐私、网络请求、免费/Pro 边界相关的说明。
- 发布检查脚本或文档，用来验证 `manifest.json`、`main.js`、`styles.css`、zip 和 GitHub Release asset 一致性。
- 必要的最小代码改动，仅限解决官方审核阻塞项，例如移动端兼容或 Electron API 使用。
- 对应测试和 `.ai/` 交接文档。

不会改：

- 不创建 GitHub Release。
- 不提交 `obsidian-releases` PR。
- 不 push。
- 不 deploy。
- 不修改 Worker production config。
- 不修改 D1 schema 或 data。
- 不读取或修改 secrets、credentials、License CSV、本地 vault data。
- 无关格式化或重构。
- `cover-image/` 生命周期。

## 依赖

- 新对话先读 `AGENTS.md`、`tasks/current.md`、`tasks/backlog.md`、`.ai/goals.md`、`.ai/findings.md`、`.ai/handoff/current.md`。
- 官方上架展示名已改为 `Kenengba WeChat Publisher`。
- `isDesktopOnly` 已改为 `true`，因为当前复制路径保留 Electron clipboard fallback，未声明移动端兼容。
- release/package 检查已做成 `scripts/verify-release-assets.ps1`，并接入 `npm run package:plugin`。

## 验收标准

- `manifest.json` 符合官方社区要求：`id`、`name`、`version`、`minAppVersion`、`description`、`author`、`isDesktopOnly` 明确且一致。
- 仓库根目录存在 `LICENSE`，并与 `package.json` 的 `MIT` 声明一致。
- `README.md` 说明插件用途、安装、使用、免费/Pro 边界、网络请求、隐私和反馈入口。
- 有 release asset 验证：确认 `manifest.json`、`main.js`、`styles.css` 会作为 GitHub Release 单独附件存在，zip 不能替代它们。
- `versions.json` 与 `manifest.json` 版本匹配。
- `npm test`、`npm run build`、`npm run package:plugin` 通过。
- 若保留 `isDesktopOnly: false`，完成移动端兼容审计；若改为 `true`，文档明确桌面端限制。
- `.ai/checks/latest.md` 和 `.ai/handoff/current.md` 更新。

## 所需证据

- 关键文件 diff。
- `npm test` 输出。
- `npm run build` 输出。
- `npm run package:plugin` 输出。
- release asset 验证结果。
- 已更新的 handoff。

## 验证

```powershell
npm test
npm run build
npm run package:plugin
```

如新增 release 检查脚本，也要运行该脚本。

## 交接说明

- 本任务只做到“可提审准备”。创建 GitHub Release、push、提交官方社区 PR、正式发布都需要主人单独确认。
- 本轮未创建 GitHub Release、未 push、未提交官方社区 PR、未 deploy。
- 下一步如果要公开发布，必须先由主人单独确认。

## 完成结果

- `manifest.name`：`Kenengba WeChat Publisher`。
- `isDesktopOnly`：`true`。
- 已补 `LICENSE`，与 `package.json` 的 `MIT` 一致。
- README、安装文档和插件内帮助已补隐私、网络请求、免费/Pro 边界、桌面端限制和反馈入口。
- 已新增 `scripts/verify-release-assets.ps1`，检查 manifest、`versions.json`、zip 内容和 GitHub Release 单独资产规则。
- 已运行 `npm test`、`npm run build`、`npm run package:plugin` 和 `npm run verify:release-assets`。
