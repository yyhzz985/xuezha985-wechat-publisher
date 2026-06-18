import { App, Modal, setIcon } from 'obsidian';
import type { ClipboardService } from '../service/ClipboardService';
import type { FormattedWeChatArticle } from '../service/WeChatFormatService';
import { replaceWithSanitizedHtml } from '../utils/domUtils';
import type { NoticeView } from './NoticeView';

export class PreviewModal extends Modal {
	constructor(
		app: App,
		private readonly article: FormattedWeChatArticle,
		private readonly clipboardService: ClipboardService,
		private readonly noticeView: NoticeView,
	) {
		super(app);
	}

	onOpen(): void {
		this.modalEl.addClass('wechat-publisher-preview-modal');
		const { contentEl } = this;
		contentEl.empty();

		const header = contentEl.createDiv({ cls: 'wechat-publisher-preview-header' });
		header.createEl('h2', { text: '公众号排版预览' });
		const copyButton = header.createEl('button', {
			cls: 'wechat-publisher-icon-button wechat-publisher-copy-button',
			attr: {
				'aria-label': '复制到公众号',
			},
		});
		copyButton.type = 'button';
		setIcon(copyButton, 'copy');
		copyButton.addEventListener('click', () => {
			void this.copy();
		});

		const shell = contentEl.createDiv({ cls: 'wechat-publisher-phone-shell' });
		const articleEl = shell.createDiv({ cls: 'wechat-publisher-phone-article' });
		replaceWithSanitizedHtml(articleEl, this.article.html);
	}

	onClose(): void {
		this.contentEl.empty();
	}

	private async copy(): Promise<void> {
		try {
			await this.clipboardService.copyArticle(this.article);
			this.noticeView.showSuccess();
		} catch (error) {
			this.noticeView.showError(error);
		}
	}
}
