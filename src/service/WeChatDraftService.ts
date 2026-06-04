import type { PluginSettings } from '../settings';
import { extractArticleMetadata } from '../utils/articleMetadataUtils';
import type { FormattedWeChatArticle } from './WeChatFormatService';

const WECHAT_API_BASE = 'https://api.weixin.qq.com';

export interface WeChatHttpRequest {
	url: string;
	method: 'GET' | 'POST';
	body?: unknown;
}

export interface WeChatHttpClient {
	requestJson(request: WeChatHttpRequest): Promise<unknown>;
}

export interface WeChatDraftResult {
	mediaId: string;
}

interface WeChatErrorResponse {
	errcode?: number;
	errmsg?: string;
}

interface AccessTokenResponse extends WeChatErrorResponse {
	access_token?: string;
	expires_in?: number;
}

interface DraftAddResponse extends WeChatErrorResponse {
	media_id?: string;
}

export class WeChatDraftService {
	constructor(private readonly httpClient: WeChatHttpClient) {}

	async uploadDraft(
		article: FormattedWeChatArticle,
		markdown: string,
		settings: PluginSettings,
	): Promise<WeChatDraftResult> {
		this.assertSettings(settings);
		const accessToken = await this.getAccessToken(settings);
		const response = await this.addDraft(accessToken, article, markdown, settings);
		return { mediaId: response.media_id };
	}

	private assertSettings(settings: PluginSettings): void {
		if (!settings.wechatAppId.trim() || !settings.wechatAppSecret.trim() || !settings.wechatThumbMediaId.trim()) {
			throw new Error('请先填写公众号 AppID、AppSecret 和默认封面 media_id');
		}
	}

	private async getAccessToken(settings: PluginSettings): Promise<string> {
		const appId = encodeURIComponent(settings.wechatAppId.trim());
		const secret = encodeURIComponent(settings.wechatAppSecret.trim());
		const response = await this.httpClient.requestJson({
			url: `${WECHAT_API_BASE}/cgi-bin/token?grant_type=client_credential&appid=${appId}&secret=${secret}`,
			method: 'GET',
		}) as AccessTokenResponse;
		this.assertWeChatOk(response, '获取 access_token 失败');
		if (!response.access_token) {
			throw new Error('获取 access_token 失败：微信没有返回 access_token');
		}
		return response.access_token;
	}

	private async addDraft(
		accessToken: string,
		article: FormattedWeChatArticle,
		markdown: string,
		settings: PluginSettings,
	): Promise<{ media_id: string }> {
		const metadata = extractArticleMetadata(markdown, article.plainText);
		const response = await this.httpClient.requestJson({
			url: `${WECHAT_API_BASE}/cgi-bin/draft/add?access_token=${encodeURIComponent(accessToken)}`,
			method: 'POST',
			body: {
				articles: [
					{
						article_type: 'news',
						title: metadata.title,
						author: settings.authorName.trim(),
						digest: metadata.digest,
						content: article.html,
						content_source_url: settings.wechatSourceUrl.trim(),
						thumb_media_id: settings.wechatThumbMediaId.trim(),
						need_open_comment: settings.wechatNeedOpenComment ? 1 : 0,
						only_fans_can_comment: 0,
					},
				],
			},
		}) as DraftAddResponse;
		this.assertWeChatOk(response, '上传草稿失败');
		if (!response.media_id) {
			throw new Error('上传草稿失败：微信没有返回 media_id');
		}
		return { media_id: response.media_id };
	}

	private assertWeChatOk(response: WeChatErrorResponse, fallback: string): void {
		if (typeof response.errcode === 'number' && response.errcode !== 0) {
			throw new Error(`${fallback}：${response.errcode} ${response.errmsg ?? ''}`.trim());
		}
	}
}
