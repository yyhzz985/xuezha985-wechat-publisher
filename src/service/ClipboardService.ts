import type { FormattedWeChatArticle } from './WeChatFormatService';

type ElectronClipboard = {
	write(data: { html: string; text: string }): void;
};

type ElectronRequire = (moduleName: string) => {
	clipboard?: ElectronClipboard;
};

export class ClipboardService {
	async copyArticle(article: FormattedWeChatArticle): Promise<void> {
		const electronClipboard = this.getElectronClipboard();
		if (electronClipboard) {
			electronClipboard.write({
				html: article.html,
				text: article.plainText,
			});
			return;
		}

		if (typeof ClipboardItem === 'undefined' || !navigator.clipboard?.write) {
			throw new Error('当前环境不支持复制富文本 HTML');
		}

		const item = new ClipboardItem({
			'text/html': new Blob([article.html], { type: 'text/html' }),
			'text/plain': new Blob([article.plainText], { type: 'text/plain' }),
		});

		await navigator.clipboard.write([item]);
	}

	private getElectronClipboard(): ElectronClipboard | null {
		const runtimeRequire = this.getRuntimeRequire();
		if (!runtimeRequire) {
			return null;
		}

		try {
			return runtimeRequire('electron').clipboard ?? null;
		} catch {
			return null;
		}
	}

	private getRuntimeRequire(): ElectronRequire | null {
		const globalRequire = (globalThis as { require?: ElectronRequire }).require;
		if (globalRequire) {
			return globalRequire;
		}

		if (typeof window === 'undefined') {
			return null;
		}

		return (window as Window & { require?: ElectronRequire }).require ?? null;
	}
}
