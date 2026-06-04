export type MarkdownFormatAction =
	| 'h1'
	| 'h2'
	| 'h3'
	| 'h4'
	| 'bold'
	| 'inlineCode'
	| 'bulletList'
	| 'orderedList'
	| 'link'
	| 'image'
	| 'quote'
	| 'intro'
	| 'highlight'
	| 'tip'
	| 'info'
	| 'note'
	| 'warning'
	| 'danger'
	| 'say'
	| 'chat'
	| 'codeBlock';

export function formatMarkdownSelection(action: MarkdownFormatAction, selection: string): string {
	const text = selection.trim();

	switch (action) {
		case 'h1':
			return formatHeading(text, '#', '一级标题');
		case 'h2':
			return formatHeading(text, '##', '标题');
		case 'h3':
			return formatHeading(text, '###', '三级标题');
		case 'h4':
			return formatHeading(text, '####', '四级标题');
		case 'bold':
			return wrapInline(text, '**', '**', '重点');
		case 'inlineCode':
			return wrapInline(text, '`', '`', 'code');
		case 'bulletList':
			return prefixLines(text || '列表项', '- ');
		case 'orderedList':
			return orderedLines(text || '列表项');
		case 'link':
			return `[${text || '链接文字'}](https://)`;
		case 'image':
			return `![${text || '图片描述'}](https://)`;
		case 'quote':
			return prefixLines(text || '引用内容', '> ');
		case 'intro':
			return formatContainer('intro', text || '摘要内容');
		case 'highlight':
			return formatContainer('highlight', text || '高亮内容');
		case 'tip':
			return formatContainer('tip', text || '提示内容');
		case 'info':
			return formatContainer('info', text || '说明内容');
		case 'note':
			return formatContainer('note', text || '笔记内容');
		case 'warning':
			return formatContainer('warning', text || '注意内容');
		case 'danger':
			return formatContainer('danger', text || '危险内容');
		case 'say':
			return formatContainer('say', text || '想说的话');
		case 'chat':
			return formatContainer('chat', text ? `我: ${text}` : '我: 对话内容');
		case 'codeBlock':
			return `\`\`\`\n${text || '代码'}\n\`\`\``;
	}
}

function formatHeading(text: string, marker: string, fallback: string): string {
	return (text || fallback)
		.split(/\r?\n/)
		.map((line) => `${marker} ${line.replace(/^#{1,6}\s+/, '').trim() || fallback}`)
		.join('\n');
}

function wrapInline(text: string, before: string, after: string, fallback: string): string {
	return `${before}${text || fallback}${after}`;
}

function prefixLines(text: string, prefix: string): string {
	return text
		.split(/\r?\n/)
		.map((line) => `${prefix}${line.replace(/^([>-]|\d+\.)\s+/, '').trim()}`)
		.join('\n');
}

function orderedLines(text: string): string {
	return text
		.split(/\r?\n/)
		.map((line, index) => `${index + 1}. ${line.replace(/^([>-]|\d+\.)\s+/, '').trim()}`)
		.join('\n');
}

function formatContainer(type: string, text: string): string {
	return `:::${type}\n${text}\n:::`;
}
