# 公众号排版插件 Pro 授权 Worker

这个 Worker 只做 License 校验，不接收公众号 AppSecret，也不接收文章正文。

## 部署

1. 创建 KV：

```bash
wrangler kv namespace create LICENSES
```

2. 把返回的 KV namespace id 写入 `wrangler.jsonc`。

3. 部署：

```bash
wrangler deploy
```

4. 把部署后的地址填入插件设置里的“授权服务 URL”，路径必须是：

```text
https://你的-worker域名/v1/licenses/verify
```

## 手工发放 License

```bash
wrangler kv key put "license:PRO-123" "{\"active\":true,\"plan\":\"pro\",\"features\":[\"wechat_upload\"],\"expiresAt\":\"2027-01-01T00:00:00.000Z\",\"note\":\"手工发放\"}" --binding LICENSES
```

第一版只防普通用户误用，不做强 DRM。会改插件源码的人可以绕过本地限制。
