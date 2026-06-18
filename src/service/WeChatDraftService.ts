import type { PluginSettings } from '../settings';
import { extractArticleMetadata } from '../utils/articleMetadataUtils';
import { isVaultLocalImageSource } from '../utils/imageSourceUtils';
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
	requestBytes?(request: WeChatHttpRequest): Promise<WeChatHttpBytesResponse>;
}

export interface WeChatHttpBytesResponse {
	data: ArrayBuffer;
	mimeType?: string;
}

export interface WeChatDraftResult {
	mediaId: string;
}

export interface WeChatCoverImageResult {
	mediaId: string;
	url: string;
}

export interface WeChatAvatarImageResult {
	url: string;
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

interface MaterialAddResponse extends WeChatErrorResponse {
	media_id?: string;
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
		this.assertDraftSettings(settings);
		const accessToken = await this.getAccessToken(settings);
		const articleWithImages = await this.uploadArticleImages(accessToken, article, context);
		const response = await this.addDraft(accessToken, articleWithImages, markdown, settings);
		return { mediaId: response.media_id };
	}

	async prepareArticleImages(
		article: FormattedWeChatArticle,
		settings: PluginSettings,
		context: DraftUploadContext = {},
	): Promise<FormattedWeChatArticle> {
		if (this.extractArticleImageSources(article.html).length === 0) {
			return article;
		}

		this.assertApiSettings(settings);
		const accessToken = await this.getAccessToken(settings);
		return this.uploadArticleImages(accessToken, article, context);
	}

	async uploadCoverImage(asset: LocalImageAsset, settings: PluginSettings): Promise<WeChatCoverImageResult> {
		this.assertApiSettings(settings);
		const accessToken = await this.getAccessToken(settings);
		const multipart = this.createMultipartBody(asset);
		const response = await this.httpClient.requestJson({
			url: `${WECHAT_API_BASE}/cgi-bin/material/add_material?access_token=${encodeURIComponent(accessToken)}&type=image`,
			method: 'POST',
			bodyBytes: multipart.bodyBytes,
			headers: {
				'Content-Type': multipart.contentType,
			},
		}) as MaterialAddResponse;
		this.assertWeChatOk(response, `上传封面图失败：${asset.fileName}`);
		if (!response.media_id) {
			throw new Error(`上传封面图失败：微信没有返回 media_id（${asset.fileName}）`);
		}
		return {
			mediaId: response.media_id,
			url: response.url ?? '',
		};
	}

	async uploadAvatarImage(asset: LocalImageAsset, settings: PluginSettings): Promise<WeChatAvatarImageResult> {
		this.assertApiSettings(settings);
		const accessToken = await this.getAccessToken(settings);
		return {
			url: await this.uploadArticleImage(accessToken, asset),
		};
	}

	private assertApiSettings(settings: PluginSettings): void {
		if (!settings.wechatAppId.trim() || !settings.wechatAppSecret.trim()) {
			throw new Error('请先填写公众号 AppID 和 AppSecret');
		}
	}

	private assertDraftSettings(settings: PluginSettings): void {
		if (!settings.wechatAppId.trim() || !settings.wechatAppSecret.trim() || !settings.wechatThumbMediaId.trim()) {
			throw new Error('请先填写公众号 AppID、AppSecret 和默认封面 media_id，默认封面可点击上传封面图自动生成');
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

	private async uploadArticleImages(
		accessToken: string,
		article: FormattedWeChatArticle,
		context: DraftUploadContext,
	): Promise<FormattedWeChatArticle> {
		const imageSources = this.extractArticleImageSources(article.html);
		if (imageSources.length === 0) {
			return article;
		}

		const uploadedUrls = new Map<string, string>();
		for (const src of imageSources) {
			const asset = await this.resolveArticleImageSource(src, context);
			uploadedUrls.set(src, await this.uploadArticleImage(accessToken, asset));
		}

		return {
			...article,
			html: this.replaceArticleImageSources(article.html, uploadedUrls),
		};
	}

	private extractArticleImageSources(html: string): string[] {
		const sources = new Set<string>();
		const imagePattern = /<img\b[^>]*\bsrc="([^"]*)"[^>]*>/gi;
		let match: RegExpExecArray | null;
		while ((match = imagePattern.exec(html)) !== null) {
			const src = this.decodeHtmlAttribute(match[1]).trim();
			if (this.shouldUploadArticleImageSource(src)) {
				sources.add(src);
			}
		}

		const cssUrlPattern = /\burl\(\s*(['"]?)([^'")]+)\1\s*\)/gi;
		while ((match = cssUrlPattern.exec(html)) !== null) {
			const src = this.decodeHtmlAttribute(match[2]).trim();
			if (this.shouldUploadArticleImageSource(src)) {
				sources.add(src);
			}
		}
		return Array.from(sources);
	}

	private replaceArticleImageSources(html: string, uploadedUrls: Map<string, string>): string {
		const htmlWithImageTags = html.replace(/(<img\b[^>]*\bsrc=")([^"]*)("[^>]*>)/gi, (match, prefix: string, escapedSrc: string, suffix: string) => {
			const src = this.decodeHtmlAttribute(escapedSrc).trim();
			const uploadedUrl = uploadedUrls.get(src);
			return uploadedUrl ? `${prefix}${escapeHtml(uploadedUrl)}${suffix}` : match;
		});

		return htmlWithImageTags.replace(/(\burl\(\s*['"]?)([^'")]+)(['"]?\s*\))/gi, (match, prefix: string, escapedSrc: string, suffix: string) => {
			const src = this.decodeHtmlAttribute(escapedSrc).trim();
			const uploadedUrl = uploadedUrls.get(src);
			return uploadedUrl ? `${prefix}${escapeHtml(uploadedUrl)}${suffix}` : match;
		});
	}

	private shouldUploadArticleImageSource(src: string): boolean {
		if (!src || /^\/\//.test(src)) {
			return false;
		}
		if (/^https?:\/\//i.test(src)) {
			return !this.isWeChatHostedImageSource(src);
		}
		return isVaultLocalImageSource(src);
	}

	private isWeChatHostedImageSource(src: string): boolean {
		try {
			const host = new URL(src).hostname.toLowerCase();
			return host === 'mmbiz.qpic.cn' || host.endsWith('.mmbiz.qpic.cn');
		} catch {
			return false;
		}
	}

	private async resolveArticleImageSource(src: string, context: DraftUploadContext): Promise<LocalImageAsset> {
		if (/^https?:\/\//i.test(src)) {
			return this.fetchRemoteArticleImage(src);
		}
		if (!this.localImageResolver) {
			throw new Error('正文包含本地图片，但插件没有配置本地图片读取服务');
		}
		const asset = await this.localImageResolver.resolve(src, context.sourcePath ?? '');
		if (!asset) {
			throw new Error(`无法读取正文图片：${src}`);
		}
		return asset;
	}

	private async fetchRemoteArticleImage(src: string): Promise<LocalImageAsset> {
		if (!this.httpClient.requestBytes) {
			throw new Error(`正文包含外链图片，但插件没有配置外链图片下载服务：${src}`);
		}
		const response = await this.httpClient.requestBytes({
			url: src,
			method: 'GET',
		});
		const mimeType = this.getSupportedRemoteImageMimeType(response.mimeType, src);
		return {
			fileName: this.getRemoteImageFileName(src, mimeType),
			mimeType,
			data: response.data,
		};
	}

	private getSupportedRemoteImageMimeType(mimeType: string | undefined, src: string): string {
		const normalized = mimeType?.split(';')[0].trim().toLowerCase();
		if (normalized === 'image/jpeg' || normalized === 'image/png' || normalized === 'image/gif') {
			return normalized;
		}

		const extension = this.getUrlPathExtension(src);
		if (extension === 'jpg' || extension === 'jpeg') {
			return 'image/jpeg';
		}
		if (extension === 'png') {
			return 'image/png';
		}
		if (extension === 'gif') {
			return 'image/gif';
		}

		throw new Error(`外链图片格式不支持：${src}`);
	}

	private getRemoteImageFileName(src: string, mimeType: string): string {
		const urlPath = this.getUrlPathName(src);
		const baseName = urlPath.split('/').pop() || 'image';
		if (/\.(jpe?g|png|gif)$/i.test(baseName)) {
			return baseName;
		}
		const extension = mimeType === 'image/jpeg' ? 'jpg' : mimeType.slice('image/'.length);
		return `${baseName}.${extension}`;
	}

	private getUrlPathExtension(src: string): string {
		const fileName = this.getUrlPathName(src).split('/').pop() ?? '';
		return fileName.split('.').pop()?.toLowerCase() ?? '';
	}

	private getUrlPathName(src: string): string {
		try {
			return decodeURIComponent(new URL(src).pathname);
		} catch {
			return src.split(/[?#]/)[0];
		}
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
			const errmsg = response.errmsg ?? '';
			if (response.errcode === 40164 && /not in whitelist/i.test(errmsg)) {
				const ip = this.extractFirstIpv4(errmsg);
				const ipText = ip ? `当前电脑公网 IP ${ip}` : '当前电脑公网 IP';
				const addText = ip ? `添加 ${ip}` : '添加当前公网 IP';
				throw new Error(`${fallback}：${ipText} 不在公众号 IP 白名单。请到微信公众平台 > 设置与开发 > 基本配置 > IP 白名单，${addText} 后重试。原始错误：${response.errcode} ${errmsg}`);
			}
			throw new Error(`${fallback}：${response.errcode} ${errmsg}`.trim());
		}
	}

	private extractFirstIpv4(value: string): string | null {
		return value.match(/\b(?:\d{1,3}\.){3}\d{1,3}\b/)?.[0] ?? null;
	}
}
