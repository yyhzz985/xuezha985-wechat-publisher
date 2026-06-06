import type { PluginSettings } from '../settings';
import { extractArticleMetadata } from '../utils/articleMetadataUtils';
import { escapeHtml } from '../utils/textUtils';
import type { FormattedWeChatArticle } from './WeChatFormatService';

const WECHAT_API_BASE = 'https://api.weixin.qq.com';

export interface WeChatHttpRequest {
	url: string;
	method: 'GET' | 'POST';
	body?: unknown;
	bodyBytes?: ArrayBuffer;
	headers?: Record<string, string>;
}

export interface WeChatHttpClient {
	requestJson(request: WeChatHttpRequest): Promise<unknown>;
}

export interface WeChatDraftResult {
	mediaId: string;
}

export interface LocalImageAsset {
	fileName: string;
	mimeType: string;
	data: ArrayBuffer;
}

export interface LocalImageResolver {
	resolve(src: string, sourcePath: string): Promise<LocalImageAsset | null>;
}

export interface DraftUploadContext {
	sourcePath?: string;
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

interface ArticleImageUploadResponse extends WeChatErrorResponse {
	url?: string;
}

export class WeChatDraftService {
	constructor(
		private readonly httpClient: WeChatHttpClient,
		private readonly localImageResolver?: LocalImageResolver,
	) {}

	async uploadDraft(
		article: FormattedWeChatArticle,
		markdown: string,
		settings: PluginSettings,
		context: DraftUploadContext = {},
	): Promise<WeChatDraftResult> {
		this.assertSettings(settings);
		const accessToken = await this.getAccessToken(settings);
		const articleWithImages = await this.uploadLocalArticleImages(accessToken, article, context);
		const response = await this.addDraft(accessToken, articleWithImages, markdown, settings);
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

	private async uploadLocalArticleImages(
		accessToken: string,
		article: FormattedWeChatArticle,
		context: DraftUploadContext,
	): Promise<FormattedWeChatArticle> {
		const localSources = this.extractLocalImageSources(article.html);
		if (localSources.length === 0) {
			return article;
		}
		if (!this.localImageResolver) {
			throw new Error('正文包含本地图片，但插件没有配置本地图片读取服务');
		}

		const uploadedUrls = new Map<string, string>();
		for (const src of localSources) {
			const asset = await this.localImageResolver.resolve(src, context.sourcePath ?? '');
			if (!asset) {
				throw new Error(`无法读取正文图片：${src}`);
			}
			uploadedUrls.set(src, await this.uploadArticleImage(accessToken, asset));
		}

		return {
			...article,
			html: this.replaceImageSources(article.html, uploadedUrls),
		};
	}

	private extractLocalImageSources(html: string): string[] {
		const sources = new Set<string>();
		const imagePattern = /<img\b[^>]*\bsrc="([^"]*)"[^>]*>/gi;
		let match: RegExpExecArray | null;
		while ((match = imagePattern.exec(html)) !== null) {
			const src = this.decodeHtmlAttribute(match[1]).trim();
			if (src && this.isLocalImageSource(src)) {
				sources.add(src);
			}
		}
		return Array.from(sources);
	}

	private replaceImageSources(html: string, uploadedUrls: Map<string, string>): string {
		return html.replace(/(<img\b[^>]*\bsrc=")([^"]*)("[^>]*>)/gi, (match, prefix: string, escapedSrc: string, suffix: string) => {
			const src = this.decodeHtmlAttribute(escapedSrc).trim();
			const uploadedUrl = uploadedUrls.get(src);
			return uploadedUrl ? `${prefix}${escapeHtml(uploadedUrl)}${suffix}` : match;
		});
	}

	private isLocalImageSource(src: string): boolean {
		return !/^(https?:|data:|\/\/)/i.test(src);
	}

	private async uploadArticleImage(accessToken: string, asset: LocalImageAsset): Promise<string> {
		const multipart = this.createMultipartBody(asset);
		const response = await this.httpClient.requestJson({
			url: `${WECHAT_API_BASE}/cgi-bin/media/uploadimg?access_token=${encodeURIComponent(accessToken)}`,
			method: 'POST',
			bodyBytes: multipart.bodyBytes,
			headers: {
				'Content-Type': multipart.contentType,
			},
		}) as ArticleImageUploadResponse;
		this.assertWeChatOk(response, `上传正文图片失败：${asset.fileName}`);
		if (!response.url) {
			throw new Error(`上传正文图片失败：微信没有返回图片 URL（${asset.fileName}）`);
		}
		return response.url;
	}

	private createMultipartBody(asset: LocalImageAsset): { bodyBytes: ArrayBuffer; contentType: string } {
		const boundary = `----ob-kenengba-${Date.now()}-${Math.random().toString(16).slice(2)}`;
		const header = [
			`--${boundary}`,
			`Content-Disposition: form-data; name="media"; filename="${this.sanitizeMultipartFileName(asset.fileName)}"`,
			`Content-Type: ${asset.mimeType}`,
			'',
			'',
		].join('\r\n');
		const footer = `\r\n--${boundary}--\r\n`;
		const encoder = new TextEncoder();
		const headerBytes = encoder.encode(header);
		const bodyBytes = new Uint8Array(asset.data);
		const footerBytes = encoder.encode(footer);
		const multipartBytes = new Uint8Array(headerBytes.length + bodyBytes.length + footerBytes.length);
		multipartBytes.set(headerBytes, 0);
		multipartBytes.set(bodyBytes, headerBytes.length);
		multipartBytes.set(footerBytes, headerBytes.length + bodyBytes.length);
		return {
			bodyBytes: multipartBytes.buffer,
			contentType: `multipart/form-data; boundary=${boundary}`,
		};
	}

	private sanitizeMultipartFileName(fileName: string): string {
		return fileName.replace(/["\r\n]/g, '_');
	}

	private decodeHtmlAttribute(value: string): string {
		return value
			.replace(/&quot;/g, '"')
			.replace(/&#39;/g, "'")
			.replace(/&lt;/g, '<')
			.replace(/&gt;/g, '>')
			.replace(/&amp;/g, '&');
	}

	private assertWeChatOk(response: WeChatErrorResponse, fallback: string): void {
		if (typeof response.errcode === 'number' && response.errcode !== 0) {
			throw new Error(`${fallback}：${response.errcode} ${response.errmsg ?? ''}`.trim());
		}
	}
}
