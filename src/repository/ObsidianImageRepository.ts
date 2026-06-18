import { normalizePath, TFile, type App } from 'obsidian';
import type { PreviewImageResolver } from '../service/PreviewImageService';
import type { LocalImageAsset, LocalImageResolver } from '../service/WeChatDraftService';
import { isVaultLocalImageSource } from '../utils/imageSourceUtils';

export class ObsidianImageRepository implements LocalImageResolver, PreviewImageResolver {
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

	resolveResourcePath(src: string, sourcePath: string): string | null {
		const file = this.resolveImageFile(src, sourcePath);
		return file ? this.app.vault.getResourcePath(file) : null;
	}

	private resolveImageFile(src: string, sourcePath: string): TFile | null {
		const cleanSrc = this.cleanImageSrc(src);
		if (!isVaultLocalImageSource(cleanSrc)) {
			return null;
		}

		if (sourcePath) {
			const linked = this.app.metadataCache.getFirstLinkpathDest(cleanSrc, sourcePath);
			if (linked) {
				return linked;
			}

			const baseFolder = sourcePath.split('/').slice(0, -1).join('/');
			const relativePath = normalizePath(baseFolder ? `${baseFolder}/${cleanSrc}` : cleanSrc);
			const relative = this.getTFile(relativePath);
			if (relative) {
				return relative;
			}
		}

		return this.getTFile(cleanSrc);
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
