# 最新检查

## 日期

2026-06-18 Asia/Shanghai

## 范围

文档-only 中文化：`AGENTS.md`、`docs/00-07`、`tasks/` 和 `.ai/` 中的 product-dev-workflow 项目契约文档。

## 命令

```powershell
git diff --check
```

## 结果

通过。

## 证据

- `git diff --check`：无输出，退出码 0。
- `git status --short --branch --untracked-files=all`：当前分支 `main...origin/main`；文档契约文件和 `cover-image/wechat-publisher/prompts/*.md` 仍未跟踪。

## 已知缺口

- `npm test` 未跑：本轮只改文档，用户只要求 `git diff --check`。
- `npm run build` 未跑：本轮只改文档，且 build 会重写已跟踪的生成文件 `main.js`。
- `npm run package:plugin` 未跑：未请求 release package。
- 未跑 Worker dry-run：Worker deployment/config work 属于红线区。
- `git diff --check` 不校验 untracked file content；当前契约文档仍可能是 untracked。
