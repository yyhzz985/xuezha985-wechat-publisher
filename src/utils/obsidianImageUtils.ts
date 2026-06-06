export function normalizeObsidianImageEmbeds(markdown: string): string {
	return markdown.replace(/!\[\[([^\]\r\n]+)\]\]/g, (_match, target: string) => {
		const { path, alt } = parseImageTarget(target);
		return `![${escapeMarkdownAlt(alt)}](<${escapeMarkdownDestination(path)}>)`;
	});
}

function parseImageTarget(target: string): { path: string; alt: string } {
	const separatorIndex = target.indexOf('|');
	const path = (separatorIndex === -1 ? target : target.slice(0, separatorIndex)).trim();
	const label = separatorIndex === -1 ? '' : target.slice(separatorIndex + 1).trim();
	const alt = label && !/^\d+(x\d+)?$/.test(label) ? label : basenameWithoutExtension(path);
	return { path, alt };
}

function basenameWithoutExtension(path: string): string {
	const fileName = path.split('/').pop()?.split('\\').pop() ?? path;
	return fileName.replace(/\.[^.]+$/, '') || fileName;
}

function escapeMarkdownAlt(value: string): string {
	return value.replace(/\\/g, '\\\\').replace(/\]/g, '\\]');
}

function escapeMarkdownDestination(value: string): string {
	return value.replace(/>/g, '%3E');
}
