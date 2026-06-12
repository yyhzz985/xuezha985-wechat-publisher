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
- 已发放并验证测试 Key：`PRO-***`，有效期至 `2027-06-06T06:52:13.321Z`。
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

## 2026-06-06 自动收款发卡与 D1 授权

- 将授权 Worker 从 KV 版升级为 D1 版，新增 `licenses`、`license_activations`、`orders`、`payment_events`、`license_events` 表。
- License 数据库存储改为 `SHA-256(secret + licenseKey)`，并使用 D1 记录设备绑定；默认一个 Key 绑定 1 台设备。
- 新增面包多 Pay 自动发卡链路：`/buy` 购买页、`/v1/orders/create` 创建订单、`/v1/pay/mbd/webhook` 接收通知、`/order/:orderNo` 展示支付结果和 License Key。
- Webhook 不直接信任支付通知；收到通知后会再查面包多订单，确认已支付、金额正确、订单未处理过才发 Key。
- 新增 Worker Admin API 和 `worker/scripts/issue-license.ps1` 管理脚本，支持批量发 Key、禁用 Key、延长有效期、重置设备绑定。
- 插件端 Pro 设置继续只让用户填写 `License Key`，新增“购买 Pro”按钮，打开 Worker 购买页；授权状态显示 `设备 used/max`。
- 删除危险的“清空本地存储/清空本地设置”入口，保留“恢复排版默认”，只重置主题、字重、小标题风格、代码主题和时间模块，不动公众号 API、头像、封面和 License。
- 插件默认头像改为 `https://xuezha985.oss-cn-beijing.aliyuncs.com/img/IMG_6890.JPG`。
- 将 `worker/.admin-token.local`、`worker/.dev.vars*`、`worker/.env*` 加入 `.gitignore`，避免把本地密钥提交到仓库。
- 已对远端 D1 执行 `0001_license_orders.sql` 迁移，保留已有 103 个 License 和 4 个设备绑定，只新增订单、支付事件等自动发卡表。
- 测试：新增 D1 授权、设备绑定、订单创建、Webhook 幂等、Pro 购买入口、危险清理入口移除等断言；`npm test` 已通过，`npm run build` 已通过。
- 部署说明：已复用 Cloudflare D1 数据库 `wechat-publisher-license-db`，`database_id` 为 `d05e216a-2d98-4bc8-bb3b-780771bcc5e0`；正式部署 D1 版 Worker 前，还需要按 `worker/README.md` 配置 `ADMIN_TOKEN`、`LICENSE_HASH_SECRET`、`MBD_APP_ID`、`MBD_APP_KEY`、`MBD_PRO_YEAR_AMOUNT_CENTS`、`PUBLIC_BASE_URL`。
- Review 查 Bug：自动发卡不会把公众号 AppSecret 或文章正文发到授权服务；免费用户仍可预览和复制；上传草稿、上传封面、上传头像会先校验 Pro，失败时不会调用微信接口。
- 第一性原理分析：用户要的是“自动收款后自动发 Key，插件只填 Key”。所以前台不做复杂商城，插件也不暴露授权服务 URL；订单、授权、设备绑定都放到 Worker + D1，范围最小且便于以后接发卡工具。

## 2026-06-11 手动 Pro 激活码与帮助说明

- 插件端删除“购买 Pro”入口：右侧预览设置面板和 Obsidian 插件设置页只保留 `License Key`、授权状态和校验按钮。
- 右侧预览顶部新增帮助按钮，使用 `circle-help` 图标；帮助面板和设置面板互斥打开，打开后同样把预览区挤到左侧。
- 帮助内容新增风格来源、快速使用、支持语法、专有格式、排版设置、复制到公众号、上传到草稿箱、公众号 API 配置和 Pro 激活码说明；开头明确说明排版风格参考可能吧公众号排版器 `https://mp.knb.im/`。
- Pro 说明固定为 `19元/年`、`58元/永久`，期间享受免费插件版本升级，后续计划添加多公众号账号切换管理，联系渣姐微信 `237219265` 获取激活码。
- 授权状态显示抽出为 `licenseDisplayUtils`，36500 天这类长期卡在插件里显示为“永久授权”，不再显示 2126 年这种远期日期。
- Worker 公开购买入口已关闭：`/buy`、`/v1/orders/create`、`/v1/pay/mbd/webhook` 都返回“购买入口暂未开放”；后台授权校验、设备绑定和 Admin 发卡接口继续保留。
- `worker/scripts/issue-license.ps1` 新增 `-LicenseType year|lifetime`：年卡固定 365 天、价格字段 `19`；永久卡固定 36500 天、价格字段 `58`。
- 已生成线上 D1 可激活年卡 100 条：`worker/licenses-year-20260611-064545.csv`，CSV 行数 100，第一条抽查有效期至 `2027-06-11T06:45:45.199Z`。
- 已生成线上 D1 可激活永久卡 100 条：`worker/licenses-lifetime-20260611-064736.csv`，CSV 行数 100，第一条抽查有效期至 `2126-05-18T06:47:36.065Z`。
- 抽查结果：年卡和永久卡样例在设备 A 激活成功，设备 B 使用同一个 Key 被拒绝并提示“该 License 已绑定其他设备，请联系解绑”；抽查后已执行 `reset-device` 重置绑定。
- 验证：`npm test` 58 项通过；`npm run build` 通过；`npx wrangler deploy --dry-run` 通过；`npx wrangler deploy` 已部署到 `https://wechat-publisher-license.237219265.workers.dev`，版本 ID `befb850e-b6a5-4e29-b2f6-ef08eca38034`。
- 构建产物已同步到 `D:\【仓库】obsidian笔记\X-Note\.obsidian\plugins\wechat-publisher`，只覆盖 `main.js`、`manifest.json`、`styles.css`，未触碰 `data.json`。
- Review 查 Bug：免费功能仍可预览和复制；上传草稿、上传封面、上传头像仍在微信接口前校验 Pro；AppSecret 和文章正文不会发到授权服务器；CSV 已被 `.gitignore` 忽略，不进入提交。
- 第一性原理分析：当前目标是先稳定手动发卡，而不是把没准备好的支付入口暴露给用户。最直接路径是插件只留 Key 激活，Worker 只保留校验和后台发卡，购买说明放到帮助面板里。

## 2026-06-11 修复 Obsidian 插件 ID 撞名

- 根因：插件 ID 使用了 `wechat-publisher`，这个 ID 和公开的 RanceLee 微信公众号发布插件撞名，Obsidian 插件目录被公开插件覆盖后会加载成“发布草稿/未配置账号/石墨灰”的另一套 UI。
- 修复：将本插件 `manifest.json` 改为独立 ID `kenengba-wechat-publisher`，名称改为 `可能吧公众号排版器`，避免以后再被公开插件覆盖。
- 构建产物已同步到新目录 `D:\【仓库】obsidian笔记\X-Note\.obsidian\plugins\kenengba-wechat-publisher`，并保留公开插件原目录不删除。
- 从旧 `wechat-publisher/data.json` 只迁移本插件需要的字段到新目录：排版设置、公众号 API、License、设备 ID、头像和封面配置；没有迁移公开插件的账号和草稿记录。
- 已更新 `D:\【仓库】obsidian笔记\X-Note\.obsidian\community-plugins.json`：移除 `wechat-publisher`，启用 `kenengba-wechat-publisher`。
- 验证：先新增撞名回归测试并确认失败，再修改 manifest；`npm test` 59 项通过；`npm run build` 通过；`npx wrangler deploy --dry-run` 通过。
- Review 查 Bug：没有删除公开插件目录；没有输出或提交公众号 AppSecret、License Key、CSV 卡密；只改插件标识和安装目录，不改排版渲染逻辑。
- 第一性原理分析：问题不是样式代码变了，而是 Obsidian 加载了同名公开插件。最稳修复是让本插件拥有唯一 ID，而不是继续覆盖同名目录。

## 2026-06-11 隔离预览 View Type 撞名

- 继续排查后发现：公开插件也注册了 `wechat-publisher-preview`，只改 `manifest.id` 还不够，Obsidian 右侧 workspace 可能继续把旧 view type 还原成公开插件 UI。
- 修复：将本插件预览视图类型改为 `kenengba-wechat-publisher-preview`，并更新 X-Note 的 `workspace.json`，右侧面板现在指向新 view type。
- 关闭正在运行的 Obsidian 后再写入 `community-plugins.json`，避免 Obsidian 退出时把启用列表写回旧的 `wechat-publisher`。
- 目标库当前只启用 `kenengba-wechat-publisher`，公开插件目录仍保留但不启用，避免触碰用户目录删除红线。
- 验证：`npm test` 59 项通过，`npm run build` 通过，`npx wrangler deploy --dry-run` 通过；构建产物已同步到 X-Note 的 `kenengba-wechat-publisher` 插件目录。
- Review 查 Bug：新插件构建包里没有“未命名草稿/未配置账号/石墨灰/发布草稿”这套公开插件文案；旧文案只存在未启用的公开插件目录里。
- 第一性原理分析：Obsidian 识别插件不只看目录和 manifest，也会按 workspace 里的 view type 恢复右侧面板。要彻底避免串台，插件 ID、命令归属和 view type 都必须唯一。

## 2026-06-11 预览顶部功能图标顺序调整

- 将右侧预览顶部功能图标顺序调整为：复制、上传、设置、帮助。
- 只调整 `PreviewView` 里四个按钮的创建顺序，不修改按钮样式、事件逻辑、上传逻辑和设置面板逻辑。
- 新增顺序回归测试，锁定 `copyButton -> syncButton -> settingsButton -> helpButton`，避免后续改回乱序。
- 验证：`preview-toolbar-style.test.ts` 已先失败后通过；全量验证在本次构建同步前执行。
- Review 查 Bug：复制按钮仍绑定 `copy()`，上传按钮仍绑定 `uploadDraftFromButton()`，设置和帮助仍互斥打开原有面板。
- 第一性原理分析：用户要的是认知顺序，不是新功能。最小修复是改 DOM 创建顺序，而不是改 CSS 排序或重做工具栏结构。

## 2026-06-11 清理 X-Note 旧公开插件启用状态

- 用户截图显示左侧出现两个公众号相关图标，右侧又打开“发布草稿/未配置账号/石墨灰”的公开插件 UI。
- 排查确认：`D:\【仓库】obsidian笔记\X-Note\.obsidian\community-plugins.json` 同时启用了 `kenengba-wechat-publisher` 和旧 `wechat-publisher`，`workspace.json` 也同时保留了两个预览 view。
- 处理：关闭 Obsidian 后，用无 BOM JSON 写回启用列表，移除旧 `wechat-publisher`，只保留 `kenengba-wechat-publisher`；同时从 `workspace.json` 移除旧 `wechat-publisher-preview` 和旧左侧栏入口记录。
- 保留旧公开插件目录，未删除目录或文件，避免触碰删除红线。
- 验证：重启 Obsidian 后再次检查，启用列表没有 `wechat-publisher`，workspace 没有旧 view 和旧命令，只剩 `kenengba-wechat-publisher-preview`。
- Review 查 Bug：这次没有改插件代码；修复点限定在目标 Obsidian 库配置，避免影响排版、上传、授权逻辑。
- 第一性原理分析：两个左侧图标不是按钮顺序问题，而是两个插件同时启用。要消除错误 UI，必须禁用旧插件并清掉 workspace 中旧 view，而不是继续调整新插件代码。

## 2026-06-11 删除旧公开插件并修改默认作者

- 用户明确允许删除错误旧版后，删除 X-Note 里的旧公开插件目录：`D:\【仓库】obsidian笔记\X-Note\.obsidian\plugins\wechat-publisher`。
- 保留新版插件目录 `kenengba-wechat-publisher`，并确认启用列表只保留新版插件。
- 将插件默认作者从空值 fallback 的旧名字改为 `momo`：新安装默认值和空作者名 fallback 都统一显示 `momo`。
- 同步修改当前 X-Note 插件数据里的 `authorName` 为 `momo`，不触碰头像、公众号 API、License 等配置。
- 验证：删除前校验目标路径位于 `.obsidian\plugins` 下且目录名精确为 `wechat-publisher`；删除后确认旧目录不存在、新目录存在。
- Review 查 Bug：本次只删除用户明确指定的旧公开插件目录，未删除 vault 其他文件；作者名变更只影响默认值和当前库配置。
- 第一性原理分析：旧插件反复回弹的根源是旧目录仍可被 Obsidian/BRAT 重新启用。既然用户已允许删除，最直接稳定的做法是移除旧目录，只保留唯一新版插件。

## 2026-06-12 插件展示名与作者修改

- 将 Obsidian 插件列表展示名从 `可能吧公众号排版器` 改为 `公众号一键排版上传`。
- 将插件 manifest 作者从 `Local` 改为 `xuezha985`。
- 保持插件 ID `kenengba-wechat-publisher` 不变，避免 Obsidian 把它识别为新插件而丢失已有配置。
- 更新 manifest 元数据测试，锁定展示名和作者。
- Review 查 Bug：只改 manifest 展示信息和对应测试，不改排版、上传、授权、数据迁移逻辑。
- 第一性原理分析：用户要改的是插件列表里显示的名字和作者，最小稳定路径是改 manifest 元数据，不改目录名和插件 ID。
