import type { MarkdownView, Plugin } from 'obsidian';
import type { PluginSettings, ProFeature } from '../settings';
import { ClipboardService } from '../service/ClipboardService';
import type { EntitlementStatus } from '../service/EntitlementService';
import { PreviewImageService, type PreviewImageResolver } from '../service/PreviewImageService';
import type { LocalImageAsset } from '../service/WeChatDraftService';
import { type FormattedWeChatArticle, WeChatFormatService } from '../service/WeChatFormatService';
import { formatMarkdownSelection, type MarkdownFormatAction } from '../utils/markdownEditUtils';
import { type NoticeView, silentNoticeView } from '../view/NoticeView';

type PreviewArticle = (article: FormattedWeChatArticle | null, reveal: boolean) => void | Promise<void>;
type MaybePromise<T> = T | Promise<T>;
type EntitlementGate = {
	ensureFeature(feature: ProFeature): MaybePromise<void>;
	refreshLicense(): Promise<EntitlementStatus>;
	getCachedStatus(): EntitlementStatus;
};
type DraftService = {
	uploadDraft(
		article: FormattedWeChatArticle,
		markdown: string,
		settings: PluginSettings,
		context?: { sourcePath?: string },
	): Promise<{ mediaId: string }>;
	prepareArticleImages?(
		article: FormattedWeChatArticle,
		settings: PluginSettings,
		context?: { sourcePath?: string },
	): Promise<FormattedWeChatArticle>;
	uploadCoverImage(asset: LocalImageAsset, settings: PluginSettings): Promise<{ mediaId: string; url: string }>;
	uploadAvatarImage(asset: LocalImageAsset, settings: PluginSettings): Promise<{ url: string }>;
};

const allowAllEntitlementGate: EntitlementGate = {
	ensureFeature() {},
	async refreshLicense() {
		return {
			active: true,
			plan: 'pro',
			features: ['wechat_upload'],
			expiresAt: '9999-12-31T23:59:59.999Z',
		};
	},
	getCachedStatus() {
		return {
			active: true,
			plan: 'pro',
			features: ['wechat_upload'],
			expiresAt: '9999-12-31T23:59:59.999Z',
		};
	},
};

export class PublisherController {
	private lastPreviewMarkdown = '';
	private lastPreviewSourcePath = '';
	private lastMarkdownView: MarkdownView | null = null;
	private readonly previewImageService: PreviewImageService;

	constructor(
		private readonly plugin: Plugin,
		private readonly markdownViewType: typeof MarkdownView,
		private readonly getSettings: () => PluginSettings,
		private readonly noticeView: NoticeView = silentNoticeView,
		private readonly previewArticle: PreviewArticle = () => {},
		private readonly isPreviewOpen: () => boolean = () => false,
		private readonly formatService = new WeChatFormatService(),
		private readonly clipboardService = new ClipboardService(),
		private readonly draftService: DraftService = {
			async uploadDraft() {
				throw new Error('未配置公众号草稿上传服务');
			},
			async uploadCoverImage() {
				throw new Error('未配置封面图上传服务');
			},
			async uploadAvatarImage() {
				throw new Error('未配置头像图上传服务');
			},
		},
		private readonly entitlementService: EntitlementGate = allowAllEntitlementGate,
		previewImageResolver?: PreviewImageResolver,
	) {
		this.previewImageService = new PreviewImageService(previewImageResolver);
	}

	register(): void {
		this.plugin.addCommand({
			id: 'copy-as-wechat-html',
			name: '复制为公众号排版 HTML',
			checkCallback: (checking) => {
				const view = this.plugin.app.workspace.getActiveViewOfType(this.markdownViewType);
				if (!view) {
					return false;
				}

				if (!checking) {
					void this.copyFromView(view);
				}

				return true;
			},
		});

		this.plugin.addCommand({
			id: 'preview-wechat-html',
			name: '打开公众号实时预览',
			checkCallback: (checking) => {
				const view = this.plugin.app.workspace.getActiveViewOfType(this.markdownViewType);
				if (!view) {
					return false;
				}

				if (!checking) {
					this.previewFromView(view);
				}

				return true;
			},
		});

		this.plugin.addCommand({
			id: 'upload-wechat-draft',
			name: '上传到公众号草稿箱',
			checkCallback: (checking) => {
				const view = this.getCurrentMarkdownView();
				if (!view) {
					return false;
				}

				if (!checking) {
					void this.uploadDraftFromView(view);
				}

				return true;
			},
		});

		this.plugin.addRibbonIcon('panel-right-open', '打开公众号实时预览', () => {
			const view = this.plugin.app.workspace.getActiveViewOfType(this.markdownViewType);
			if (!view) {
				this.noticeView.showError(new Error('请先打开一篇 Markdown 笔记'));
				return;
			}

			this.previewFromView(view);
		});

		this.plugin.registerEvent(
			this.plugin.app.workspace.on('editor-change', (_editor, info) => {
				if (!this.isPreviewOpen() || !(info instanceof this.markdownViewType)) {
					return;
				}

				this.updatePreviewFromView(info, false);
			}),
		);

		this.plugin.registerEvent(
			this.plugin.app.workspace.on('active-leaf-change', () => {
				this.refreshPreviewFromActiveView();
			}),
		);
	}

	refreshPreviewFromActiveView(): void {
		if (!this.isPreviewOpen()) {
			return;
		}

		const view = this.plugin.app.workspace.getActiveViewOfType(this.markdownViewType);
		if (!view) {
			if (this.lastPreviewMarkdown.trim()) {
				this.renderPreview(this.lastPreviewMarkdown, this.lastPreviewSourcePath, false);
			}
			return;
		}

		this.updatePreviewFromView(view, false);
	}

	applyFormat(action: MarkdownFormatAction): void {
		const view = this.getCurrentMarkdownView();
		if (!view) {
			this.noticeView.showError(new Error('请先打开一篇 Markdown 笔记'));
			return;
		}

		const selection = view.editor.getSelection();
		view.editor.replaceSelection(formatMarkdownSelection(action, selection));
		view.editor.focus();
		this.updatePreviewFromView(view, false);
	}

	uploadDraft(): Promise<void> {
		const view = this.getCurrentMarkdownView();
		if (!view) {
			this.noticeView.showDraftError(new Error('请先打开一篇 Markdown 笔记'));
			return Promise.resolve();
		}

		return this.uploadDraftFromView(view);
	}

	async copyPreviewArticle(): Promise<void> {
		const view = this.getCurrentMarkdownView();
		const markdown = view ? this.readMarkdownForPreview(view) : this.lastPreviewMarkdown;
		const sourcePath = view?.file?.path ?? this.lastPreviewSourcePath;
		if (!markdown.trim()) {
			this.noticeView.showEmpty();
			return;
		}

		try {
			const settings = this.getSettings();
			const article = await this.prepareArticleForCopy(
				this.formatService.format(markdown, settings),
				settings,
				sourcePath,
			);
			await this.clipboardService.copyArticle(article);
			this.noticeView.showSuccess();
		} catch (error) {
			console.error('[WeChat Publisher] copy failed', error);
			this.noticeView.showError(error);
		}
	}

	async uploadCoverImage(file: File): Promise<{ mediaId: string; url: string }> {
		await this.ensureProFeature('wechat_upload');
		const asset = await this.fileToImageAsset(file);
		return this.draftService.uploadCoverImage(asset, this.getSettings());
	}

	async uploadAvatarImage(file: File): Promise<{ url: string }> {
		await this.ensureProFeature('wechat_upload');
		const asset = await this.fileToImageAsset(file);
		return this.draftService.uploadAvatarImage(asset, this.getSettings());
	}

	async refreshLicense(): Promise<EntitlementStatus> {
		try {
			const status = await this.entitlementService.refreshLicense();
			this.noticeView.showLicenseSuccess?.(status);
			return status;
		} catch (error) {
			this.noticeView.showLicenseError?.(error);
			throw error;
		}
	}

	getEntitlementStatus(): EntitlementStatus {
		return this.entitlementService.getCachedStatus();
	}

	private async copyFromView(view: MarkdownView): Promise<void> {
		const markdown = this.readMarkdownForCopy(view);
		if (!markdown.trim()) {
			this.noticeView.showEmpty();
			return;
		}

		try {
			const settings = this.getSettings();
			const article = await this.prepareArticleForCopy(
				this.formatService.format(markdown, settings),
				settings,
				view.file?.path,
			);
			await this.clipboardService.copyArticle(article);
			this.noticeView.showSuccess();
		} catch (error) {
			console.error('[WeChat Publisher] copy failed', error);
			this.noticeView.showError(error);
		}
	}

	private async prepareArticleForCopy(
		article: FormattedWeChatArticle,
		settings: PluginSettings,
		sourcePath: string | undefined,
	): Promise<FormattedWeChatArticle> {
		if (!this.draftService.prepareArticleImages || !this.hasWechatUploadEntitlement()) {
			return article;
		}

		return this.draftService.prepareArticleImages(article, settings, { sourcePath });
	}

	private hasWechatUploadEntitlement(): boolean {
		const status = this.entitlementService.getCachedStatus();
		return status.active && status.plan === 'pro' && status.features.includes('wechat_upload');
	}

	private async uploadDraftFromView(view: MarkdownView): Promise<void> {
		const markdown = this.readMarkdownForPreview(view);
		if (!markdown.trim()) {
			this.noticeView.showEmpty();
			return;
		}

		try {
			const entitlementResult = this.entitlementService.ensureFeature('wechat_upload');
			if (this.isPromiseLike(entitlementResult)) {
				await entitlementResult;
			}
			const settings = this.getSettings();
			const article = this.formatService.format(markdown, settings);
			const result = await this.draftService.uploadDraft(article, markdown, settings, {
				sourcePath: view.file?.path,
			});
			this.noticeView.showDraftSuccess(result.mediaId);
		} catch (error) {
			console.error('[WeChat Publisher] draft upload failed', error);
			this.noticeView.showDraftError(error);
		}
	}

	private previewFromView(view: MarkdownView): void {
		const markdown = this.readMarkdownForPreview(view);
		this.lastPreviewMarkdown = markdown;
		this.lastPreviewSourcePath = view.file?.path ?? '';
		this.lastMarkdownView = view;
		if (!markdown.trim()) {
			this.noticeView.showEmpty();
			return;
		}

		this.renderPreview(markdown, this.lastPreviewSourcePath, true);
	}

	private updatePreviewFromView(view: MarkdownView, reveal: boolean): void {
		const markdown = this.readMarkdownForPreview(view);
		this.lastPreviewMarkdown = markdown;
		this.lastPreviewSourcePath = view.file?.path ?? '';
		this.lastMarkdownView = view;
		if (!markdown.trim()) {
			void this.previewArticle(null, reveal);
			return;
		}

		this.renderPreview(markdown, this.lastPreviewSourcePath, reveal);
	}

	private renderPreview(markdown: string, sourcePath: string, reveal: boolean): void {
		try {
			const article = this.previewImageService.rewriteLocalImages(
				this.formatService.format(markdown, this.getSettings()),
				sourcePath,
			);
			void this.previewArticle(article, reveal);
		} catch (error) {
			console.error('[WeChat Publisher] preview failed', error);
			this.noticeView.showError(error);
		}
	}

	private readMarkdownForCopy(view: MarkdownView): string {
		const selection = view.editor.getSelection();
		if (selection.trim()) {
			return selection;
		}

		return view.editor.getValue();
	}

	private readMarkdownForPreview(view: MarkdownView): string {
		return view.editor.getValue();
	}

	private getCurrentMarkdownView(): MarkdownView | null {
		return this.plugin.app.workspace.getActiveViewOfType(this.markdownViewType) ?? this.lastMarkdownView;
	}

	private async ensureProFeature(feature: ProFeature): Promise<void> {
		const result = this.entitlementService.ensureFeature(feature);
		if (this.isPromiseLike(result)) {
			await result;
		}
	}

	private isPromiseLike<T>(value: MaybePromise<T>): value is Promise<T> {
		return typeof (value as Promise<T> | undefined)?.then === 'function';
	}

	private async fileToImageAsset(file: File): Promise<LocalImageAsset> {
		const mimeType = this.getSupportedImageMimeType(file);
		return {
			fileName: file.name,
			mimeType,
			data: await file.arrayBuffer(),
		};
	}

	private getSupportedImageMimeType(file: File): string {
		if (this.isSupportedImageMimeType(file.type)) {
			return file.type;
		}

		const extension = file.name.split('.').pop()?.toLowerCase();
		if (extension === 'jpg' || extension === 'jpeg') {
			return 'image/jpeg';
		}
		if (extension === 'png') {
			return 'image/png';
		}
		if (extension === 'gif') {
			return 'image/gif';
		}

		throw new Error('图片只支持 JPG、PNG、GIF');
	}

	private isSupportedImageMimeType(mimeType: string): boolean {
		return mimeType === 'image/jpeg' || mimeType === 'image/png' || mimeType === 'image/gif';
	}
}
