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

test('uploads local article images before adding draft', async () => {
	const requests: Array<{
		url: string;
		method: string;
		body?: unknown;
		bodyBytes?: ArrayBuffer;
		headers?: Record<string, string>;
	}> = [];
	const remoteRequests: string[] = [];
	let uploadedImageIndex = 0;
	const httpClient: WeChatHttpClient = {
		async requestJson(request) {
			requests.push(request);
			if (request.url.includes('/cgi-bin/token')) {
				return { access_token: 'ACCESS_TOKEN', expires_in: 7200 };
			}
			if (request.url.includes('/cgi-bin/media/uploadimg')) {
				uploadedImageIndex += 1;
				return {
					errcode: 0,
					errmsg: 'ok',
					url: uploadedImageIndex === 1
						? 'https://mmbiz.qpic.cn/photo.png'
						: 'https://mmbiz.qpic.cn/remote.png',
				};
			}
			return { errcode: 0, errmsg: 'ok', media_id: 'DRAFT_MEDIA_ID' };
		},
		async requestBytes(request) {
			remoteRequests.push(request.url);
			return {
				data: new Uint8Array([7, 8, 9]).buffer,
				mimeType: 'image/png',
			};
		},
	};
	const resolvedImages: string[] = [];
	const service = new WeChatDraftService(httpClient, {
		async resolve(src, sourcePath) {
			resolvedImages.push(`${sourcePath}:${src}`);
			return {
				fileName: 'photo.png',
				mimeType: 'image/png',
				data: new Uint8Array([1, 2, 3]).buffer,
			};
		},
	});

	await service.uploadDraft(
		{
			html: '<section><img src="attachments/photo.png"><img src="https://example.com/remote.png"><img src="attachments/photo.png"></section>',
			plainText: '正文',
		},
		'# 标题\n\n正文',
		{
			...DEFAULT_SETTINGS,
			wechatAppId: 'APPID',
			wechatAppSecret: 'SECRET',
			wechatThumbMediaId: 'THUMB_MEDIA_ID',
		},
		{ sourcePath: 'folder/note.md' },
	);

	assert.deepEqual(resolvedImages, ['folder/note.md:attachments/photo.png']);
	assert.deepEqual(remoteRequests, ['https://example.com/remote.png']);
	assert.equal(requests.length, 4);
	assert.match(requests[1].url, /\/cgi-bin\/media\/uploadimg\?access_token=ACCESS_TOKEN/);
	assert.equal(requests[1].method, 'POST');
	assert.match(requests[1].headers?.['Content-Type'] ?? '', /^multipart\/form-data; boundary=/);
	assert.ok(requests[1].bodyBytes instanceof ArrayBuffer);
	assert.match(requests[2].url, /\/cgi-bin\/media\/uploadimg\?access_token=ACCESS_TOKEN/);
	assert.deepEqual(requests[3].body, {
		articles: [
			{
				article_type: 'news',
				title: '标题',
				author: DEFAULT_SETTINGS.authorName,
				digest: '正文',
				content: '<section><img src="https://mmbiz.qpic.cn/photo.png"><img src="https://mmbiz.qpic.cn/remote.png"><img src="https://mmbiz.qpic.cn/photo.png"></section>',
				content_source_url: '',
				thumb_media_id: 'THUMB_MEDIA_ID',
				need_open_comment: 1,
				only_fans_can_comment: 0,
			},
		],
	});
});

test('does not upload browser or obsidian resource image urls', async () => {
	const requests: Array<{ url: string; method: string; body?: unknown }> = [];
	const resolvedImages: string[] = [];
	const service = new WeChatDraftService(
		{
			async requestJson(request) {
				requests.push(request);
				if (request.url.includes('/cgi-bin/token')) {
					return { access_token: 'ACCESS_TOKEN', expires_in: 7200 };
				}
				if (request.url.includes('/cgi-bin/media/uploadimg')) {
					return { errcode: 0, errmsg: 'ok', url: 'https://mmbiz.qpic.cn/photo.png' };
				}
				return { errcode: 0, errmsg: 'ok', media_id: 'DRAFT_MEDIA_ID' };
			},
		},
		{
			async resolve(src) {
				resolvedImages.push(src);
				return {
					fileName: 'photo.png',
					mimeType: 'image/png',
					data: new Uint8Array([1, 2, 3]).buffer,
				};
			},
		},
	);

	await service.uploadDraft(
		{
			html: '<section><img src="blob:http://localhost/image"><img src="app://vault/image.png"><img src="attachments/photo.png"></section>',
			plainText: '正文',
		},
		'# 标题\n\n正文',
		{
			...DEFAULT_SETTINGS,
			wechatAppId: 'APPID',
			wechatAppSecret: 'SECRET',
			wechatThumbMediaId: 'THUMB_MEDIA_ID',
		},
	);

	assert.deepEqual(resolvedImages, ['attachments/photo.png']);
	assert.equal(requests.filter((request) => request.url.includes('/cgi-bin/media/uploadimg')).length, 1);
});

test('prepares article images for copy without creating a draft', async () => {
	const requests: Array<{
		url: string;
		method: string;
		body?: unknown;
		bodyBytes?: ArrayBuffer;
		headers?: Record<string, string>;
	}> = [];
	const resolvedImages: string[] = [];
	const service = new WeChatDraftService(
		{
			async requestJson(request) {
				requests.push(request);
				if (request.url.includes('/cgi-bin/token')) {
					return { access_token: 'ACCESS_TOKEN', expires_in: 7200 };
				}
				if (request.url.includes('/cgi-bin/media/uploadimg')) {
					return { errcode: 0, errmsg: 'ok', url: 'https://mmbiz.qpic.cn/photo.png' };
				}
				throw new Error('should not create draft');
			},
		},
		{
			async resolve(src, sourcePath) {
				resolvedImages.push(`${sourcePath}:${src}`);
				return {
					fileName: 'photo.png',
					mimeType: 'image/png',
					data: new Uint8Array([1, 2, 3]).buffer,
				};
			},
		},
	);

	const article = await service.prepareArticleImages(
		{
			html: '<section><img src="attachments/photo.png"></section>',
			plainText: '正文',
		},
		{
			...DEFAULT_SETTINGS,
			wechatAppId: 'APPID',
			wechatAppSecret: 'SECRET',
			wechatThumbMediaId: '',
		},
		{ sourcePath: 'folder/note.md' },
	);

	assert.deepEqual(resolvedImages, ['folder/note.md:attachments/photo.png']);
	assert.equal(article.html, '<section><img src="https://mmbiz.qpic.cn/photo.png"></section>');
	assert.equal(requests.some((request) => request.url.includes('/cgi-bin/draft/add')), false);
	assert.equal(requests.filter((request) => request.url.includes('/cgi-bin/media/uploadimg')).length, 1);
});

test('uploads reading avatar images before adding draft', async () => {
	const requests: Array<{
		url: string;
		method: string;
		body?: unknown;
		bodyBytes?: ArrayBuffer;
		headers?: Record<string, string>;
	}> = [];
	const remoteRequests: string[] = [];
	const httpClient: WeChatHttpClient = {
		async requestJson(request) {
			requests.push(request);
			if (request.url.includes('/cgi-bin/token')) {
				return { access_token: 'ACCESS_TOKEN', expires_in: 7200 };
			}
			if (request.url.includes('/cgi-bin/media/uploadimg')) {
				return { errcode: 0, errmsg: 'ok', url: 'https://mmbiz.qpic.cn/avatar.jpg' };
			}
			return { errcode: 0, errmsg: 'ok', media_id: 'DRAFT_MEDIA_ID' };
		},
		async requestBytes(request) {
			remoteRequests.push(request.url);
			return {
				data: new Uint8Array([9, 8, 7]).buffer,
				mimeType: 'image/jpeg',
			};
		},
	};
	const service = new WeChatDraftService(httpClient);

	await service.uploadDraft(
		{
			html: '<section><img class="reading-time__avatar" src="https://example.com/avatar.jpg"></section>',
			plainText: '正文',
		},
		'# 标题\n\n正文',
		{
			...DEFAULT_SETTINGS,
			wechatAppId: 'APPID',
			wechatAppSecret: 'SECRET',
			wechatThumbMediaId: 'THUMB_MEDIA_ID',
		},
	);

	assert.deepEqual(remoteRequests, ['https://example.com/avatar.jpg']);
	assert.match(requests[1].url, /\/cgi-bin\/media\/uploadimg\?access_token=ACCESS_TOKEN/);
	assert.match(JSON.stringify(requests[2].body), /https:\/\/mmbiz\.qpic\.cn\/avatar\.jpg/);
	assert.equal(JSON.stringify(requests[2].body).includes('https://example.com/avatar.jpg'), false);
});

test('uploads avatar image as article image url', async () => {
	const requests: Array<{
		url: string;
		method: string;
		bodyBytes?: ArrayBuffer;
		headers?: Record<string, string>;
	}> = [];
	const httpClient: WeChatHttpClient = {
		async requestJson(request) {
			requests.push(request);
			if (request.url.includes('/cgi-bin/token')) {
				return { access_token: 'ACCESS_TOKEN', expires_in: 7200 };
			}
			return { errcode: 0, errmsg: 'ok', url: 'https://mmbiz.qpic.cn/avatar.jpg' };
		},
	};
	const service = new WeChatDraftService(httpClient);

	const result = await service.uploadAvatarImage(
		{
			fileName: 'avatar.jpg',
			mimeType: 'image/jpeg',
			data: new Uint8Array([1, 2, 3]).buffer,
		},
		{
			...DEFAULT_SETTINGS,
			wechatAppId: 'APPID',
			wechatAppSecret: 'SECRET',
		},
	);

	assert.deepEqual(result, {
		url: 'https://mmbiz.qpic.cn/avatar.jpg',
	});
	assert.equal(requests.length, 2);
	assert.match(requests[1].url, /\/cgi-bin\/media\/uploadimg\?access_token=ACCESS_TOKEN/);
	assert.equal(requests[1].method, 'POST');
	assert.match(requests[1].headers?.['Content-Type'] ?? '', /^multipart\/form-data; boundary=/);
	assert.ok(requests[1].bodyBytes instanceof ArrayBuffer);
});

test('uploads cover image as permanent material and returns media id', async () => {
	const requests: Array<{
		url: string;
		method: string;
		bodyBytes?: ArrayBuffer;
		headers?: Record<string, string>;
	}> = [];
	const httpClient: WeChatHttpClient = {
		async requestJson(request) {
			requests.push(request);
			if (request.url.includes('/cgi-bin/token')) {
				return { access_token: 'ACCESS_TOKEN', expires_in: 7200 };
			}
			return { errcode: 0, errmsg: 'ok', media_id: 'COVER_MEDIA_ID', url: 'https://mmbiz.qpic.cn/cover.jpg' };
		},
	};
	const service = new WeChatDraftService(httpClient);

	const result = await service.uploadCoverImage(
		{
			fileName: 'cover.jpg',
			mimeType: 'image/jpeg',
			data: new Uint8Array([4, 5, 6]).buffer,
		},
		{
			...DEFAULT_SETTINGS,
			wechatAppId: 'APPID',
			wechatAppSecret: 'SECRET',
		},
	);

	assert.deepEqual(result, {
		mediaId: 'COVER_MEDIA_ID',
		url: 'https://mmbiz.qpic.cn/cover.jpg',
	});
	assert.equal(requests.length, 2);
	assert.match(requests[1].url, /\/cgi-bin\/material\/add_material\?access_token=ACCESS_TOKEN&type=image/);
	assert.equal(requests[1].method, 'POST');
	assert.match(requests[1].headers?.['Content-Type'] ?? '', /^multipart\/form-data; boundary=/);
	assert.ok(requests[1].bodyBytes instanceof ArrayBuffer);
});

test('explains access token ip whitelist errors', async () => {
	const service = new WeChatDraftService({
		async requestJson() {
			return {
				errcode: 40164,
				errmsg: 'invalid ip 180.113.103.94 ipv6 ::ffff:180.113.103.94, not in whitelist rid: 6a2391b9',
			};
		},
	});

	await assert.rejects(
		() => service.uploadCoverImage(
			{
				fileName: 'cover.jpg',
				mimeType: 'image/jpeg',
				data: new Uint8Array([4, 5, 6]).buffer,
			},
			{
				...DEFAULT_SETTINGS,
				wechatAppId: 'APPID',
				wechatAppSecret: 'SECRET',
			},
		),
		/当前电脑公网 IP 180\.113\.103\.94 不在公众号 IP 白名单/,
	);
});
