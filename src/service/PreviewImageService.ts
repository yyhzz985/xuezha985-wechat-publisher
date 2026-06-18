import type { FormattedWeChatArticle } from './WeChatFormatService';
import { isVaultLocalImageSource } from '../utils/imageSourceUtils';
import { escapeHtml } from '../utils/textUtils';

export interface PreviewImageResolver {
	resolveResourcePath(src: string, sourcePath: string): string | null;
}

export class PreviewImageService {
	constructor(private readonly resolver?: PreviewImageResolver) {}

	rewriteLocalImages(article: FormattedWeChatArticle, sourcePath: string): FormattedWeChatArticle {
		if (!this.resolver) {
			return article;
		}

		const missingSources = new Set<string>();
		const html = article.html.replace(/(<img\b[^>]*\bsrc=")([^"]*)("[^>]*>)/gi, (match, prefix: string, escapedSrc: string, suffix: string) => {
			const src = this.decodeHtmlAttribute(escapedSrc).trim();
			if (!isVaultLocalImageSource(src)) {
				return match;
			}

			const resourcePath = this.resolver?.resolveResourcePath(src, sourcePath);
			if (!resourcePath) {
				missingSources.add(src);
				return match;
			}

			return `${prefix}${escapeHtml(resourcePath)}${suffix}`;
		});

		for (const src of missingSources) {
			console.warn(`[WeChat Publisher] unable to resolve local image: ${src}`);
		}

		return {
			...article,
			html,
		};
	}

	private decodeHtmlAttribute(value: string): string {
		return value
			.replace(/&quot;/g, '"')
			.replace(/&#39;/g, "'")
			.replace(/&lt;/g, '<')
			.replace(/&gt;/g, '>')
			.replace(/&amp;/g, '&');
	}
}
