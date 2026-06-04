import test from 'node:test';
import assert from 'node:assert/strict';
import { WeChatDraftService, type WeChatHttpClient } from '../src/service/WeChatDraftService';
import { DEFAULT_SETTINGS } from '../src/settings';

test('uploads formatted article to wechat draft box', async () => {
	const requests: Array<{ url: string; method: string; body?: unknown }> = [];
	const httpClient: WeChatHttpClient = {
		async requestJson(request) {
			requests.push(request);
			if (request.url.includes('/cgi-bin/token')) {
				return { access_token: 'ACCESS_TOKEN', expires_in: 7200 };
			}
			return { errcode: 0, errmsg: 'ok', media_id: 'DRAFT_MEDIA_ID' };
		},
	};
	const service = new WeChatDraftService(httpClient);

	const result = await service.uploadDraft(
		{
			html: '<section>正文</section>',
			plainText: '正文',
		},
		'# 标题\n\n第一段摘要内容。',
		{
			...DEFAULT_SETTINGS,
			authorName: '作者',
			wechatAppId: 'APPID',
			wechatAppSecret: 'SECRET',
			wechatThumbMediaId: 'THUMB_MEDIA_ID',
			wechatSourceUrl: 'https://example.com/source',
			wechatNeedOpenComment: true,
		},
	);

	assert.equal(result.mediaId, 'DRAFT_MEDIA_ID');
	assert.equal(requests.length, 2);
	assert.match(requests[0].url, /\/cgi-bin\/token\?grant_type=client_credential&appid=APPID&secret=SECRET/);
	assert.equal(requests[0].method, 'GET');
	assert.match(requests[1].url, /\/cgi-bin\/draft\/add\?access_token=ACCESS_TOKEN/);
	assert.equal(requests[1].method, 'POST');
	assert.deepEqual(requests[1].body, {
		articles: [
			{
				article_type: 'news',
				title: '标题',
				author: '作者',
				digest: '第一段摘要内容。',
				content: '<section>正文</section>',
				content_source_url: 'https://example.com/source',
				thumb_media_id: 'THUMB_MEDIA_ID',
				need_open_comment: 1,
				only_fans_can_comment: 0,
			},
		],
	});
});

test('requires wechat api settings before upload', async () => {
	const service = new WeChatDraftService({
		async requestJson() {
			throw new Error('should not request');
		},
	});

	await assert.rejects(
		() => service.uploadDraft({ html: '<p>正文</p>', plainText: '正文' }, '# 标题', DEFAULT_SETTINGS),
		/请先填写公众号 AppID、AppSecret 和默认封面 media_id/,
	);
});
