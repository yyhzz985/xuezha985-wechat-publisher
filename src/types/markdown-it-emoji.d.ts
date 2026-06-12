declare module 'markdown-it-emoji' {
	import type MarkdownIt from 'markdown-it';

	type MarkdownItPlugin = (md: MarkdownIt) => void;

	export const bare: MarkdownItPlugin;
	export const full: MarkdownItPlugin;
	export const light: MarkdownItPlugin;
}
