import type { MarkdownView, Plugin } from 'obsidian';
import type { PluginSettings } from '../settings';
import { ClipboardService } from '../service/ClipboardService';
import { type FormattedWeChatArticle, WeChatFormatService } from '../service/WeChatFormatService';
import { formatMarkdownSelection, type MarkdownFormatAction } from '../utils/markdownEditUtils';
import { type NoticeView, silentNoticeView } from '../view/NoticeView';

type PreviewArticle = (article: FormattedWeChatArticle | null, reveal: boolean) => void | Promise<void>;
type DraftService = {
	uploadDraft(
		article: FormattedWeChatArticle,
		markdown: string,
		settings: PluginSettings,
	): Promise<{ mediaId: string }>;
};

export class PublisherController {
	private lastPreviewMarkdown = '';
	private lastMarkdownView: MarkdownView | null = null;

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
		},
	) {}

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
				this.renderPreview(this.lastPreviewMarkdown, false);
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

	uploadDraft(): void {
		const view = this.getCurrentMarkdownView();
		if (!view) {
			this.noticeView.showDraftError(new Error('请先打开一篇 Markdown 笔记'));
			return;
		}

		void this.uploadDraftFromView(view);
	}

	private async copyFromView(view: MarkdownView): Promise<void> {
		const markdown = this.readMarkdownForCopy(view);
		if (!markdown.trim()) {
			this.noticeView.showEmpty();
			return;
		}

		try {
			const article = this.formatService.format(markdown, this.getSettings());
			await this.clipboardService.copyArticle(article);
			this.noticeView.showSuccess();
		} catch (error) {
			console.error('[WeChat Publisher] copy failed', error);
			this.noticeView.showError(error);
		}
	}

	private async uploadDraftFromView(view: MarkdownView): Promise<void> {
		const markdown = this.readMarkdownForPreview(view);
		if (!markdown.trim()) {
			this.noticeView.showEmpty();
			return;
		}

		try {
			const settings = this.getSettings();
			const article = this.formatService.format(markdown, settings);
			const result = await this.draftService.uploadDraft(article, markdown, settings);
			this.noticeView.showDraftSuccess(result.mediaId);
		} catch (error) {
			console.error('[WeChat Publisher] draft upload failed', error);
			this.noticeView.showDraftError(error);
		}
	}

	private previewFromView(view: MarkdownView): void {
		const markdown = this.readMarkdownForPreview(view);
		this.lastPreviewMarkdown = markdown;
		this.lastMarkdownView = view;
		if (!markdown.trim()) {
			this.noticeView.showEmpty();
			return;
		}

		this.renderPreview(markdown, true);
	}

	private updatePreviewFromView(view: MarkdownView, reveal: boolean): void {
		const markdown = this.readMarkdownForPreview(view);
		this.lastPreviewMarkdown = markdown;
		this.lastMarkdownView = view;
		if (!markdown.trim()) {
			void this.previewArticle(null, reveal);
			return;
		}

		this.renderPreview(markdown, reveal);
	}

	private renderPreview(markdown: string, reveal: boolean): void {
		try {
			const article = this.formatService.format(markdown, this.getSettings());
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
}
