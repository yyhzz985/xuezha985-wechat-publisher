import { normalizePath, TFile, type App } from 'obsidian';
import type { LocalImageAsset, LocalImageResolver } from '../service/WeChatDraftService';

export class ObsidianImageRepository implements LocalImageResolver {
	constructor(private readonly app: App) {}

	async resolve(src: string, sourcePath: string): Promise<LocalImageAsset | null> {
		const file = this.resolveImageFile(src, sourcePath);
		if (!file) {
			return null;
		}
		const mimeType = this.getImageMimeType(file.extension);
		if (!mimeType) {
			throw new Error(`微信公众号正文图片暂不支持 .${file.extension}：${file.path}`);
		}
		return {
			fileName: file.name,
			mimeType,
			data: await this.app.vault.readBinary(file),
		};
	}

	private resolveImageFile(src: string, sourcePath: string): TFile | null {
		const cleanSrc = this.cleanImageSrc(src);
		const direct = this.getTFile(cleanSrc);
		if (direct) {
			return direct;
		}

		if (sourcePath) {
			const linked = this.app.metadataCache.getFirstLinkpathDest(cleanSrc, sourcePath);
			if (linked) {
				return linked;
			}

			const baseFolder = sourcePath.split('/').slice(0, -1).join('/');
			const relativePath = normalizePath(baseFolder ? `${baseFolder}/${cleanSrc}` : cleanSrc);
			return this.getTFile(relativePath);
		}

		return null;
	}

	private getTFile(path: string): TFile | null {
		const file = this.app.vault.getAbstractFileByPath(normalizePath(path));
		return file instanceof TFile ? file : null;
	}

	private cleanImageSrc(src: string): string {
		const withoutQuery = src.split(/[?#]/)[0];
		try {
			return decodeURI(withoutQuery);
		} catch {
			return withoutQuery;
		}
	}

	private getImageMimeType(extension: string): string | null {
		switch (extension.toLowerCase()) {
			case 'jpg':
			case 'jpeg':
				return 'image/jpeg';
			case 'png':
				return 'image/png';
			case 'gif':
				return 'image/gif';
			default:
				return null;
		}
	}
}
