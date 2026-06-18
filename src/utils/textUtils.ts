export function removeYamlFrontmatter(markdown: string): string {
	if (!markdown.startsWith('---')) {
		return markdown;
	}

	const end = markdown.indexOf('\n---', 3);
	if (end === -1) {
		return markdown;
	}

	const afterEnd = markdown.indexOf('\n', end + 4);
	return afterEnd === -1 ? '' : markdown.slice(afterEnd + 1);
}

export function addCjkSpacing(text: string): string {
	return text
		.replace(/([\u4e00-\u9fff])([A-Za-z0-9])/g, '$1 $2')
		.replace(/([A-Za-z0-9])([\u4e00-\u9fff])/g, '$1 $2');
}

export function escapeHtml(value: string): string {
	return value
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;')
		.replace(/'/g, '&#39;');
}

export function escapeHtmlPreservingSpaces(value: string): string {
	return escapeHtml(value).replace(/ /g, '&nbsp;');
}

export function measureDisplayUnits(value: string): number {
	return Array.from(value).reduce((total, char) => {
		return total + (/[\u4e00-\u9fff\u3000-\u303f\uff00-\uffef]/.test(char) ? 2 : 1);
	}, 0);
}

export function htmlToPlainText(html: string): string {
	return html
		.replace(/<style[\s\S]*?<\/style>/gi, '')
		.replace(/<script[\s\S]*?<\/script>/gi, '')
		.replace(/<br\s*\/?>/gi, '\n')
		.replace(/<\/(p|h[1-6]|li|blockquote|pre|section|div)>/gi, '\n')
		.replace(/<[^>]+>/g, '')
		.replace(/&nbsp;/g, ' ')
		.replace(/&amp;/g, '&')
		.replace(/&lt;/g, '<')
		.replace(/&gt;/g, '>')
		.replace(/&quot;/g, '"')
		.replace(/&#39;/g, "'")
		.replace(/\n{3,}/g, '\n\n')
		.trim();
}

export function calculateReadingMinutes(text: string): number {
	const chineseChars = text.match(/[\u4e00-\u9fff]/g)?.length ?? 0;
	const words = text.match(/[A-Za-z0-9]+/g)?.length ?? 0;
	const units = chineseChars + words;
	return Math.max(1, Math.ceil(units / 350));
}
