import { removeYamlFrontmatter } from './textUtils';

export interface ArticleMetadata {
	title: string;
	digest: string;
}

export function extractArticleMetadata(markdown: string, plainText: string): ArticleMetadata {
	const cleaned = removeYamlFrontmatter(markdown);
	const lines = cleaned
		.split(/\r?\n/)
		.map((line) => line.trim())
		.filter(Boolean);
	const titleLine = lines.find((line) => /^#{1,2}\s+/.test(line)) ?? lines[0] ?? '未命名文章';
	const digestLine = lines.find((line) => !line.startsWith('#') && !line.startsWith('```')) ?? plainText;

	return {
		title: truncate(stripMarkdown(titleLine.replace(/^#{1,6}\s+/, '')), 64) || '未命名文章',
		digest: truncate(stripMarkdown(digestLine), 120),
	};
}

function stripMarkdown(value: string): string {
	return value
		.replace(/!\[([^\]]*)\]\([^)]+\)/g, '$1')
		.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
		.replace(/[`*_>#-]/g, '')
		.replace(/\s+/g, ' ')
		.trim();
}

function truncate(value: string, maxLength: number): string {
	return value.length > maxLength ? value.slice(0, maxLength) : value;
}
