# 当前任务

## ID

STAB-002

## 状态

阻塞：等待用户确认下一个稳定化目标。

## 目标

在 `STAB-001` 文档恢复之后，选择第一个代码级稳定化任务。

## 为什么现在做

项目契约现在已写入工作区文件。下一次变更应保持窄范围，并且在开始源码改动前得到明确批准。

## 范围

批准后才会改：

- 一个已批准的窄范围稳定化区域。
- 该区域的测试。
- 相关 docs、checks、findings 和 handoff 文件。

不会改：

- Deployment or release state.
- Worker production config.
- D1 schema or data.
- Secrets, credentials, License CSV, or local vault data.
- 无关格式化或重构。
- `cover-image/` 生命周期。

## 依赖

- 用户确认下一个稳定化目标。
- 先读 `AGENTS.md`、`docs/`、`.ai/findings.md` 和 `.ai/handoff/current.md`。

## 验收标准

- 用户批准的目标已记录到本文件。
- 目标对应明确 bug、风险或流程缺口。
- 源码改动最小，并有测试覆盖。
- 代码任务中 `npm test` 和 `npm run build` 通过，除非有已记录的阻塞。
- 任务后更新 `.ai/checks/latest.md` 和 `.ai/handoff/current.md`。

## 所需证据

- 用户对目标的确认。
- 文件 diff 限定在已批准目标内。
- 验证命令输出。
- 已更新的 handoff。

## 验证

代码任务：

```powershell
npm test
npm run build
```

文档-only 任务，需要在 `.ai/checks/latest.md` 记录跳过 build 的原因。

## 交接说明

- 建议的下一个稳定化目标：正式化 release/package 验证，避免生成的 `main.js`、`manifest.json`、`versions.json`、README docs 和 package zip 漂移。
- 没有用户确认，不开始代码任务。
