declare module 'markdown-it-emoji' {
	import type MarkdownIt from 'markdown-it';

	export const full: (md: MarkdownIt) => void;
}

declare module 'shiki/core' {
	export interface HighlighterCore {
		codeToTokens(
			code: string,
			options: { lang: string; theme: string },
		): {
			tokens: Array<Array<{ content: string; color?: string; fontStyle?: number }>>;
		};
	}

	export function createHighlighterCoreSync(options: {
		themes: unknown[];
		langs: unknown[];
		engine: unknown;
	}): HighlighterCore;
}

declare module 'shiki/engine/javascript' {
	export function createJavaScriptRegexEngine(): unknown;
}

declare module 'shiki/langs/*.mjs' {
	const language: unknown;
	export default language;
}

declare module 'shiki/themes/*.mjs' {
	const theme: unknown;
	export default theme;
}
