# 开发日志

## 2026-06-04 基线快照

- 初始化项目 Git 仓库前记录当前状态。
- 当前插件已经具备：公众号 HTML 预览、复制到公众号、可能吧风格设置、快捷格式工具栏。
- 本次后续目标：增加“上传到微信公众号草稿箱”第一版。
- 第一版边界：只使用默认封面 `media_id`，不自动上传本地图片，不直接发布。

## 2026-06-04 草稿箱上传第一版

- 已初始化 Git，并创建基线快照提交 `b9c15e5 chore: initial plugin snapshot`。
- 新增公众号接口设置：`AppID`、`AppSecret`、默认封面 `media_id`、原文链接、是否开启评论。
- 新增 `WeChatDraftService`：按微信官方流程先获取 `access_token`，再调用 `draft/add` 写入草稿箱。
- 新增右侧预览区同步图标和命令 `upload-wechat-draft`：上传当前整篇 Markdown，不受选区影响。
- 新增文章标题和摘要提取工具：标题取首个 H1/H2 或首行，摘要取首段正文。
- 测试：`npm test` 已通过，`npm run build` 已通过。
- Review 查 Bug：未写入真实公众号密钥；复制失败和上传失败提示已分离；草稿上传缺少配置时直接报错。
- 第一性原理分析：第一版只解决“把当前排版 HTML 放进草稿箱”，不自动上传正文图片、不直接群发，范围更小也更稳。

## 2026-06-05 专有格式和全能导航

- 新增右侧快捷工具栏按钮“全能导航”，点击后插入 `[TOC]`。
- 调整专有格式实际 HTML 样式：摘要、金句、提示、说明、笔记、注意、危险、说、对话更接近可能吧默认效果。
- 调整 `[TOC]` 渲染：标题为“全文导航”，列表使用绿色序号和进度线，移除原来的字数显示。
- 测试：新增快捷动作和专有格式渲染断言；`npm test` 已通过，`npm run build` 已通过。
- Review 查 Bug：样式仍走 `styleUtils`，没有把业务逻辑写进 View；导航按钮只插入已有标记，不新增复杂语法。
- 第一性原理分析：用户要的是写作后快速插入可能吧格式块，所以最简单稳定的实现是复用现有容器语法和 `[TOC]` 渲染，不新增设置项。

## 2026-06-05 多角色对话图标

- 调整 `:::chat` 渲染：同一个角色名在整篇文章里复用同一个对话图标。
- 不同角色按首次出现顺序分配不同图标样式，目前提供 6 种内联气泡图标。
- 测试：新增多角色、同名重复角色的图标一致性断言；`npm test` 已通过，`npm run build` 已通过。
- Review 查 Bug：角色映射只存在单次格式化过程内，不污染下次预览；图标为内联 HTML/CSS，不依赖外部资源。
- 第一性原理分析：用户需要“同名一致、不同人可区分”，所以用角色名到图标编号的稳定映射即可，不需要增加设置项或角色管理面板。

## 2026-06-05 对话默认模板和小图标修正

- 调整快捷工具栏“对话”按钮：无选区时默认插入两个人的对话 `我: 对话内容` 和 `你: 对话内容`。
- 调整对话小图标：使用内联小气泡外框、小尾巴和三点，允许 `overflow: visible`，避免小尾巴被裁剪。
- 测试：新增默认两人对话和小气泡尾巴断言；`npm test` 已通过，`npm run build` 已通过。
- Review 查 Bug：默认模板只改工具栏插入内容，不影响已有 `:::chat` 文章；小图标仍是纯内联 HTML/CSS，复制到公众号时不依赖插件 CSS。
- 第一性原理分析：用户要的是点击后马上能写双人对话，并且小图标像可能吧。最稳的做法是只改默认片段和已有渲染样式，不增加新语法。

## 2026-06-05 对话图标改为符号样式

- 根据反馈把 `:::chat` 的小对话图标改成 `💬` 和 `🗨️` 两种符号，不再使用手写 CSS 小气泡。
- 同名角色仍然固定同一个图标；角色超过两个时按两种符号循环。
- 测试：先新增 `💬` / `🗨️` 输出断言并看到旧实现失败，再修改实现；`npm test` 已通过，`npm run build` 已通过。
- Review 查 Bug：移除了旧的尾巴和三点样式，避免继续出现裁剪问题；图标是内联字符，复制到公众号时不会丢失外部 CSS。
- 第一性原理分析：用户明确给了目标图标，继续画近似图标反而复杂。直接输出目标符号最短、最稳、最容易维护。

## 2026-06-05 预览工具栏轻量化

- 调整右侧预览顶部工具栏比例：按钮从 30px 收到 24px，图标从 17px 收到 14px，行高和间距同步压缩。
- 上传、设置、复制按钮统一成简约图标按钮；“复制到公众号”从文字按钮改为单个复制图标，保留 `aria-label` 和悬浮提示。
- 默认状态移除边框和阴影；鼠标 hover 时才显示边框、浅背景和轻阴影。
- 测试：新增预览工具栏静态断言，先确认旧实现失败，再修改实现；`npm test` 已通过，`npm run build` 已通过。
- Review 查 Bug：只改 View 和 CSS，不影响 Markdown 转公众号 HTML；旧弹窗预览和右侧实时预览都同步改成图标复制按钮。
- 第一性原理分析：用户要的是写作工具栏更像可能吧，核心是“低干扰、hover 才强调”。所以只收缩尺寸和交互状态，不新增配置项。

## 2026-06-06 草稿箱正文图片上传 V2

- 新增 Obsidian 图片语法支持：`![[图片.png]]` 和 `![[图片.png|说明]]` 会先转成标准 Markdown 图片再排版。
- 上传草稿前自动扫描正文 HTML 里的本地图片，按当前笔记路径解析附件，读取二进制后调用微信公众号 `media/uploadimg`。
- 本地图片上传成功后，将正文 `<img src>` 替换成微信返回的图片 URL，再调用 `draft/add` 新建草稿。
- 网络图片暂时保持原样；当前版本只解决本地图片和 Obsidian 附件图片。
- 测试：新增 Obsidian 图片渲染断言、正文图片上传替换断言；`npm test` 已通过，`npm run build` 已通过。
- Review 查 Bug：上传前会直接暴露缺配置、读不到图片、图片格式不支持、微信接口失败；不做静默降级。图片读取在 Repository 层，上传流程仍在 Service 层。
- 第一性原理分析：草稿箱能不能真正常用，核心不是继续抠样式，而是正文图片必须变成微信可访问 URL。先处理本地图片，比一次性处理所有外链和压缩逻辑更小、更稳。

## 2026-06-06 封面图自动上传

- 在右侧预览设置面板和 Obsidian 插件设置页新增“上传封面图”按钮。
- 选择 JPG、PNG 或 GIF 后，插件调用微信公众号永久素材接口 `material/add_material?type=image`，拿到 `media_id` 后自动写回“默认封面 media_id”。
- 草稿上传仍要求 `AppID`、`AppSecret`、默认封面 `media_id` 三项完整；封面上传只要求 `AppID` 和 `AppSecret`。
- 新增 `WeChatDraftService.uploadCoverImage`、`PublisherController.uploadCoverImage`，View 只负责选文件和提示，保持五层职责不混杂。
- 测试：新增封面永久素材上传、设置入口和主入口接线断言；`npm test` 已通过，`npm run build` 已通过；构建产物已同步到 X-Note 插件目录。
- Review 查 Bug：没有把封面图当正文图片上传；没有静默降级；上传失败直接提示微信返回错误；只允许微信支持的图片格式。
- 第一性原理分析：用户卡在 `media_id` 获取上，最简单稳妥的方案不是继续解释后台入口，而是让插件直接上传封面图并写回配置。

## 2026-06-06 公众号 IP 白名单错误提示

- 针对微信 `40164 invalid ip ... not in whitelist` 错误，新增更清晰的中文提示。
- 插件会从微信原始错误里提取公网 IPv4，例如 `180.113.103.94`，并提示到“微信公众平台 > 设置与开发 > 基本配置 > IP 白名单”添加该 IP。
- 新增回归测试覆盖 `access_token` 阶段的 IP 白名单错误。
- 测试：`npm test` 已通过，`npm run build` 已通过；构建产物已同步到 X-Note 插件目录。
- Review 查 Bug：没有绕过微信安全规则，也没有伪造 `access_token`；只是把微信原始错误转成人能操作的提示。
- 第一性原理分析：这个问题的根因是调用接口的出口 IP 没进白名单，不是封面上传流程错误。最稳的处理是明确告诉用户要添加哪个 IP，而不是改上传逻辑。

## 2026-06-06 草稿箱头像外链图片修复

- 修复上传到草稿箱后开头头像不显示的问题。
- 根因：开头头像使用 `background-image: url(...)`，插件预览可以直接加载外链，但微信草稿箱会过滤正文里的外部图片资源。
- 上传草稿前现在会扫描 `<img src>` 和 CSS `url(...)` 图片资源：本地图片从 Obsidian 仓库读取，外链图片先下载，再统一调用微信 `media/uploadimg` 获取微信图床 URL。
- 已跳过 `mmbiz.qpic.cn` 这类微信图床图片，避免重复上传。
- 测试：新增外链正文图上传、头像背景图上传替换断言；`npm test` 已通过，`npm run build` 已通过；构建产物已同步到 X-Note 插件目录。
- Review 查 Bug：没有改排版 HTML 结构；上传失败会直接暴露外链下载或微信上传错误，不做静默降级。
- 第一性原理分析：草稿箱最终只认微信可用的正文图片 URL。与其只修头像特例，不如在草稿上传前统一处理正文图片源，范围仍然限制在图片上传链路内。

## 2026-06-06 头像本地上传与真实图片渲染

- 将开头时间模块里的头像从 CSS `background-image` 改成真实 `<img>` 标签，避免公众号草稿编辑器不显示背景图。
- 在右侧预览设置面板和 Obsidian 插件设置页新增“上传头像图”按钮。
- 头像图选择 JPG、PNG 或 GIF 后，插件调用微信公众号正文图片接口 `media/uploadimg`，拿到 URL 后自动写回“头像 URL”。
- 封面图仍走永久素材 `material/add_material` 拿 `media_id`，头像图走正文图片 URL，两条链路保持分开。
- 测试：新增头像 `img` 渲染、头像正文图片上传、设置入口和主入口接线断言；`npm test` 已通过，`npm run build` 已通过；构建产物已同步到 X-Note 插件目录。
- Review 查 Bug：不再依赖微信可能过滤的背景图；上传失败直接提示；View 只负责选文件和提示，Service 只负责微信接口。
- 第一性原理分析：用户要的是草稿箱里真实显示头像。最稳的做法是让头像成为微信正文能识别的图片，并提供本地上传生成微信可访问 URL，而不是继续调 CSS。

## 2026-06-06 上传提示和图标说明修复

- 修复右侧预览顶部“上传到公众号草稿箱”按钮的调用方式：`PublisherController.uploadDraft()` 现在返回 `Promise<void>`，按钮会等待上传流程结束。
- 上传成功仍由 `NoticeView.showDraftSuccess(mediaId)` 统一提示，上传失败仍走 `showDraftError`。
- 移除预览工具栏和弹窗复制按钮上的原生 `title`，只保留 `aria-label`，避免鼠标悬浮时同时出现两套文字说明。
- 上传按钮等待期间会临时禁用，避免重复点击造成重复上传。
- 测试：新增上传成功提示路径和单一 tooltip 来源断言；`npm test` 已通过，`npm run build` 已通过。
- Review 查 Bug：没有改微信上传业务；没有把提示逻辑放进 Service；只是让按钮路径可等待，并去掉重复 UI 属性。
- 第一性原理分析：用户遇到的是交互反馈问题，不是接口问题。最稳做法是保证按钮能等待 Controller 完成，同时消除重复提示来源。

## 2026-06-06 Pro 授权系统第一版

- 新增 Pro 授权设置：`licenseKey`、`licenseServerUrl`、`deviceId`、`entitlementCache`。首次启动会生成 `deviceId` 并保存，只是随机 UUID，不采集硬件指纹。
- 新增 `EntitlementService` 和 `LicenseHttpClient`：负责校验 `wechat_upload` 功能、读取 24 小时授权缓存、调用授权接口。
- 上传草稿箱、上传封面图、上传头像图三个入口接入 Pro 校验；预览、复制、格式工具栏和排版设置不拦截。
- 右侧预览设置面板和 Obsidian 插件设置页新增“Pro 授权”区域：License Key、授权服务 URL、授权状态、校验授权按钮。
- 新增独立 Cloudflare Worker 授权服务：`worker/src/index.ts`、`worker/wrangler.jsonc`、`worker/README.md`，接口为 `POST /v1/licenses/verify`，通过 KV 手工发放 License。
- 失败策略：24 小时内成功缓存允许继续上传；缓存过期且授权服务不可达时禁止上传并提示联网重试；License 不存在、过期、禁用时显示服务端原因。
- 测试：新增授权服务、设置归一化、Controller 拦截、设置入口、Worker 校验测试；`npm test` 已通过，`npm run build` 已通过；构建产物已同步到 X-Note 插件目录。
- Review 查 Bug：授权服务只接收 License、设备 ID、插件 ID、版本和功能名，不接收公众号 AppSecret 或文章内容；上传入口在调用微信接口前拦截，免费用户不会触发微信上传请求。
- 第一性原理分析：本地 Obsidian 插件无法防会改代码的人，第一版只防普通用户误用和未授权使用高级上传功能。最简单稳健的方案是“本地缓存 + 远端校验 + 上传入口统一拦截”，不做复杂 DRM。

## 2026-06-06 Worker 部署与发 Key 简化

- 检查 Wrangler：本机可运行 `wrangler 4.98.0`，但当前没有 Cloudflare 登录态，也没有 `CLOUDFLARE_API_TOKEN` 环境变量，所以不能直接创建线上资源。
- 将 `worker/wrangler.jsonc` 的 KV 配置改为只声明 `LICENSES` 绑定，让 Wrangler 部署时自动创建 KV 并写回 ID，减少手工复制配置。
- 新增 `worker/scripts/issue-license.ps1`：登录 Cloudflare 后运行脚本即可自动生成 `PRO-...`，并写入远端 KV。
- 更新 `worker/README.md`：说明插件里 `License Key` 填发给用户的 key，`授权服务 URL` 填 Worker 的 `/v1/licenses/verify` 地址。
- 验证：`npm test` 已通过；`npx wrangler deploy --dry-run` 已通过；`issue-license.ps1` PowerShell 语法检查已通过。
- Review 查 Bug：发 Key 脚本只写 License 记录，不接触微信公众号配置；脚本输出改为英文，避免 Windows PowerShell 中文编码导致脚本解析失败。
- 第一性原理分析：用户要的是能快速部署和发 key，不是理解 Cloudflare 所有概念。最简单稳的路径是 Wrangler 登录后“一键部署 + 一键发 key”，把 KV ID 手工配置步骤去掉。

## 2026-06-06 Worker 正式部署

- 完成 Cloudflare Wrangler OAuth 登录，账号为 `237219265@qq.com`。
- 已部署授权 Worker：`https://wechat-publisher-license.237219265.workers.dev`。
- Wrangler 自动创建 KV 命名空间 `wechat-publisher-license-licenses`，ID 已写入 `worker/wrangler.jsonc`：`dae49a951f8343469f185dfd3e5e1fd6`。
- 修复 `issue-license.ps1` 两个 Windows 兼容问题：旧版 .NET 没有 `RandomNumberGenerator.Fill`；`Set-Content -Encoding UTF8` 会写 BOM，导致 Worker `JSON.parse` 失败。
- 已发放并验证测试 Key：`PRO-UKVNJXQ1CSNTKBT7`，有效期至 `2027-06-06T06:52:13.321Z`。
- 验证：直接请求 `/v1/licenses/verify` 返回 `active:true`、`plan:pro`、`features:["wechat_upload"]`。
- Review 查 Bug：先发现 KV 内容 JSON 无效，再改用临时无 BOM JSON 文件上传；没有修改插件授权逻辑和微信上传逻辑。
- 第一性原理分析：Pro 授权链路真正可用的最低验证标准是“Worker 部署成功 + KV 有有效 key + 插件同款请求能返回 active:true”。本次已完成这个闭环。

## 2026-06-06 授权体验简化与批量发卡

- 将授权服务 URL 固定内置为 `https://wechat-publisher-license.237219265.workers.dev/v1/licenses/verify`，设置页和右侧预览设置面板不再展示“授权服务 URL”输入框。
- 用户侧 Pro 授权只需要填写一个 `License Key`；授权服务 URL 只作为插件内部配置保存，不让普通用户理解和填写。
- `SettingsRepository` 会把旧配置或空配置里的 `licenseServerUrl` 统一归一化为内置地址，避免旧版本数据导致授权失败。
- `issue-license.ps1` 新增 `-Count` 批量发卡参数，批量生成 `licenses-YYYYMMDD-HHMMSS.csv`，后续可把 `licenseKey` 列导入发卡工具。
- 有效期继续由脚本 `-Days` 控制；当前测试 Key 用的是 `-Days 365`，所以约等于一年。
- 验证：`npm test` 已通过，`npm run build` 已通过，构建产物已同步到 X-Note 插件目录并校验哈希一致。
- Review 查 Bug：旧的“请先填写授权服务 URL”用户提示已改为“授权服务未配置，请重新安装插件”；没有把授权服务器地址发给用户填写，减少误填风险。
- 第一性原理分析：用户真正要购买或激活 Pro，不是理解授权服务器。最简单稳定的交互是“用户只填 Key，插件自己知道去哪校验”，批量发卡也应该由脚本一次生成 CSV，而不是每次手工生成一个。

## 2026-06-06 批量发卡脚本性能修复

- 修复 `issue-license.ps1 -Count 100` 超时问题：旧实现每个 Key 调一次 `wrangler kv key put`，100 个 Key 会非常慢，并且超时后无法生成 CSV。
- 新实现改为先生成批量 JSON，再调用一次 `wrangler kv bulk put` 写入 Cloudflare KV，成功后再导出 CSV。
- 已生成 100 个 Pro Key：`worker/licenses-20260606-073236.csv`，共 100 行，有效期至 `2027-06-06T07:32:36.896Z` 附近。
- 抽查第一条 Key 调用 `/v1/licenses/verify` 返回 `active:true`、`plan:pro`、`features:["wechat_upload"]`。
- 将 `worker/licenses-*.csv` 加入 `.gitignore`，避免真实卡密误提交。
- Review 查 Bug：上一轮超时可能已经写入了一些没有 CSV 记录的 Key，本次不使用那些未知 Key；以后以成功生成的 CSV 为准。
- 第一性原理分析：批量发卡的目标是拿到一批可交付、可追踪的 Key。必须先保证“上传成功”和“CSV 留档”一致，所以一次性 bulk 写入成功后再导出 CSV，比循环单条写入更简单、更稳。
