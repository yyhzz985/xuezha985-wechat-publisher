import MarkdownIt from 'markdown-it';
import type Token from 'markdown-it/lib/token.mjs';
import type { RenderRule } from 'markdown-it/lib/renderer.mjs';
import type { CodeTheme, PluginSettings } from '../settings';
import { isWeChatLink } from '../utils/linkUtils';
import { normalizeObsidianImageEmbeds } from '../utils/obsidianImageUtils';
import {
	createWeChatStyles,
	KNB_DEFAULT_AUTHOR,
	KNB_DEFAULT_AVATAR_URL,
	type WeChatStyleSet,
} from '../utils/styleUtils';
import {
	addCjkSpacing,
	calculateReadingMinutes,
	escapeHtml,
	escapeHtmlPreservingSpaces,
	htmlToPlainText,
	measureDisplayUnits,
	removeYamlFrontmatter,
} from '../utils/textUtils';

export interface FormattedWeChatArticle {
	html: string;
	plainText: string;
}

interface TocEntry {
	title: string;
	length: number;
}

type BlockState = {
	src: string;
	bMarks: number[];
	eMarks: number[];
	tShift: number[];
	line: number;
	push(type: string, tag: string, nesting: number): Token;
};

type ChatRoleIconMap = Map<string, number>;
const CHAT_ICON_SYMBOLS = ['💬', '🗨️'];
const CHAT_ICON_VARIANT_COUNT = CHAT_ICON_SYMBOLS.length;

const CONTAINER_TITLES: Record<string, { icon: string; title: string }> = {
	tip: { icon: '💡', title: '提示' },
	info: { icon: 'ℹ️', title: '说明' },
	note: { icon: '📝', title: '笔记' },
	warning: { icon: '⚠️', title: '注意' },
	danger: { icon: '⛔', title: '危险' },
	say: { icon: '💬', title: '说' },
};

export class WeChatFormatService {
	format(markdown: string, settings: PluginSettings): FormattedWeChatArticle {
		const cleanedMarkdown = normalizeObsidianImageEmbeds(removeYamlFrontmatter(markdown)).trim();
		const tocEntries = this.extractToc(cleanedMarkdown);
		const styles = createWeChatStyles(settings);
		const renderer = this.createRenderer(settings, tocEntries, styles);
		const bodyHtml = renderer.render(cleanedMarkdown);
		const plainText = htmlToPlainText(bodyHtml);
		const metaHtml = settings.showReadingTime
			? this.renderReadingMeta(settings, plainText, styles)
			: '';
		const html = `<section class="wechat-markdown-root" style="${styles.articleStyle}">${metaHtml}${bodyHtml}</section>`;

		return {
			html,
			plainText: htmlToPlainText(html),
		};
	}

	private createRenderer(settings: PluginSettings, tocEntries: TocEntry[], styles: WeChatStyleSet): MarkdownIt {
		let h2Index = 0;
		let activeH2Index = 0;
		let h3IndexInSection = 0;
		let blockquoteDepth = 0;
		const externalLinks: string[] = [];
		const md = new MarkdownIt({
			html: false,
			linkify: false,
			typographer: false,
		});
		const chatRoleIcons: ChatRoleIconMap = new Map();

		this.registerContainerRule(md);
		this.registerTocRule(md);

		md.renderer.rules.text = (tokens, index) => this.renderText(tokens[index].content, styles);

		md.renderer.rules.paragraph_open = () => `<p style="${blockquoteDepth > 0 ? styles.blockquoteParagraphStyle : styles.paragraphStyle}">`;
		md.renderer.rules.paragraph_close = () => '</p>';

		md.renderer.rules.heading_open = (tokens, index) => {
			const tag = tokens[index].tag;
			if (tag === 'h1') {
				return `<h1 style="${styles.h1Style}"><strong style="${styles.h1SlashLeftStyle}">/</strong>`;
			}
			if (tag === 'h2') {
				h2Index += 1;
				activeH2Index = h2Index;
				h3IndexInSection = 0;
				const progress = Math.round((h2Index / Math.max(tocEntries.length, h2Index)) * 100);
				const markerHtml =
					settings.subheadingStyle === 'number'
						? `<p class="h2-progress" style="${styles.h2ProgressStyle}">${h2Index}</p>`
						: settings.subheadingStyle === 'eye'
							? [
								`<p class="h2-eye-marker" style="${styles.h2EyeStyle}">`,
								`<span style="${styles.h2EyeTrackStyle(progress)}">`,
								`<span style="${styles.h2EyeIconStyle}">&#128064;</span>`,
								'</span>',
								'</p>',
							].join('')
							: '';
				return [
					markerHtml,
					`<h2 style="${styles.h2BarStyle(progress)}">&nbsp; &nbsp;</h2>`,
					`<p class="h2-progress-title" style="${styles.h2TitleStyle}"><strong style="${styles.headingStrongStyle}">`,
				].join('');
			}
			if (tag === 'h3') {
				h3IndexInSection += 1;
				const sectionNumber = Math.max(activeH2Index, 1);
				const markerHtml =
					settings.subheadingStyle === 'number'
						? `<p class="h3-progress" style="${styles.h3ProgressStyle}">${sectionNumber}.${h3IndexInSection}</p>`
						: '';
				return [
					markerHtml,
					`<h3 style="${styles.h3BarStyle}">&nbsp; &nbsp;</h3>`,
					`<p class="h3-progress-title" style="${styles.h3TitleStyle}"><strong style="${styles.headingStrongStyle}">`,
				].join('');
			}
			if (tag === 'h4') {
				return `<h4 style="${styles.h4Style}">`;
			}
			return `<${tag}>`;
		};

		md.renderer.rules.heading_close = (tokens, index) => {
			const tag = tokens[index].tag;
			if (tag === 'h1') {
				return `<strong style="${styles.h1SlashRightStyle}">/</strong></h1>`;
			}
			if (tag === 'h2' || tag === 'h3') {
				return '</strong></p>';
			}
			return `</${tag}>`;
		};

		md.renderer.rules.bullet_list_open = () => `<ul style="${styles.listStyle}">`;
		md.renderer.rules.ordered_list_open = () => `<ol style="${styles.orderedListStyle}">`;
		md.renderer.rules.list_item_open = () => `<li style="${styles.listItemStyle}"><section style="${styles.listItemContentStyle}">`;
		md.renderer.rules.list_item_close = () => '</section></li>';

		md.renderer.rules.strong_open = () => `<strong style="${styles.headingStrongStyle}">`;
		md.renderer.rules.strong_close = () => '</strong>';

		md.renderer.rules.blockquote_open = () => {
			blockquoteDepth += 1;
			return `<blockquote style="${styles.blockquoteStyle}">`;
		};
		md.renderer.rules.blockquote_close = () => {
			blockquoteDepth = Math.max(0, blockquoteDepth - 1);
			return '</blockquote>';
		};

		md.renderer.rules.hr = () => `<hr style="${styles.hrStyle}">`;

		md.renderer.rules.table_open = () => `<section class="knb-table-wrap" style="${styles.tableWrapStyle}"><table style="${styles.tableStyle}">`;
		md.renderer.rules.table_close = () => '</table></section>';
		md.renderer.rules.th_open = () => `<th style="${styles.tableHeaderCellStyle}">`;
		md.renderer.rules.td_open = () => `<td style="${styles.tableCellStyle}">`;

		md.renderer.rules.link_open = (tokens, index) => {
			const href = tokens[index].attrGet('href') ?? '';
			if (!isWeChatLink(href)) {
				externalLinks.push(href);
				return '';
			}
			return `<a href="${escapeHtml(href)}" style="${styles.linkStyle}">`;
		};

		md.renderer.rules.link_close = () => {
			const href = externalLinks.pop();
			if (href !== undefined) {
				return `（${escapeHtml(href)}）`;
			}
			return '</a>';
		};

		md.renderer.rules.image = (tokens, index) => this.renderImage(tokens[index], styles);
		md.renderer.rules.code_inline = (tokens, index) =>
			`<code style="${styles.inlineCodeStyle}">${this.renderPlainInline(tokens[index].content)}</code>`;
		md.renderer.rules.fence = (tokens, index) => this.renderCodeBlock(tokens[index].content, settings.codeTheme, styles);
		md.renderer.rules.code_block = md.renderer.rules.fence as RenderRule;
		md.renderer.rules.knb_container = (tokens, index) =>
			this.renderContainer(tokens[index].info, tokens[index].content, md, styles, chatRoleIcons);
		md.renderer.rules.knb_toc = () => this.renderToc(tocEntries, styles);

		return md;
	}

	private registerContainerRule(md: MarkdownIt): void {
		md.block.ruler.before('fence', 'knb_container', (state: BlockState, startLine: number, endLine: number, silent: boolean) => {
			const start = state.bMarks[startLine] + state.tShift[startLine];
			const end = state.eMarks[startLine];
			const marker = state.src.slice(start, end).trim();
			const match = marker.match(/^:::(intro|highlight|tip|info|note|warning|danger|say|chat)\s*$/);
			if (!match) {
				return false;
			}
			if (silent) {
				return true;
			}

			let nextLine = startLine + 1;
			while (nextLine < endLine) {
				const lineStart = state.bMarks[nextLine] + state.tShift[nextLine];
				const lineEnd = state.eMarks[nextLine];
				if (state.src.slice(lineStart, lineEnd).trim() === ':::') {
					break;
				}
				nextLine += 1;
			}

			const contentStart = state.bMarks[startLine + 1] ?? state.eMarks[startLine];
			const contentEnd = nextLine < endLine ? state.bMarks[nextLine] : state.eMarks[endLine - 1];
			const token = state.push('knb_container', '', 0);
			token.info = match[1];
			token.content = state.src.slice(contentStart, contentEnd).trim();
			token.map = [startLine, Math.min(nextLine + 1, endLine)];
			state.line = Math.min(nextLine + 1, endLine);
			return true;
		});
	}

	private registerTocRule(md: MarkdownIt): void {
		md.block.ruler.before('paragraph', 'knb_toc', (state: BlockState, startLine: number, _endLine: number, silent: boolean) => {
			const start = state.bMarks[startLine] + state.tShift[startLine];
			const end = state.eMarks[startLine];
			if (!/^\[TOC\]\s*$/.test(state.src.slice(start, end))) {
				return false;
			}
			if (silent) {
				return true;
			}

			const token = state.push('knb_toc', '', 0);
			token.map = [startLine, startLine + 1];
			state.line = startLine + 1;
			return true;
		});
	}

	private renderText(text: string, styles: WeChatStyleSet): string {
		const value = this.renderPlainInline(text);
		return value
			.replace(/==(.+?)==/g, `<mark style="${styles.markStyle}">$1</mark>`)
			.replace(/\+\+(.+?)\+\+/g, `<u style="${styles.underlineStyle}">$1</u>`)
			.replace(/~([^~]+?)~/g, '<sub>$1</sub>')
			.replace(/\^([^^]+?)\^/g, '<sup>$1</sup>')
			.replace(/^\[x\]\s+/i, '✅ ')
			.replace(/^\[\s\]\s+/, '⬜ ');
	}

	private renderPlainInline(text: string): string {
		return escapeHtml(addCjkSpacing(text));
	}

	private renderIntroContent(content: string, md: MarkdownIt, styles: WeChatStyleSet): string {
		return this.renderInlineParagraphs(content, md, styles.introParagraphStyle);
	}

	private renderInlineParagraphs(content: string, md: MarkdownIt, paragraphStyle: string): string {
		return content
			.split(/\n{2,}/)
			.map((paragraph) => paragraph.trim())
			.filter(Boolean)
			.map((paragraph) => `<p style="${paragraphStyle}">${md.renderInline(paragraph)}</p>`)
			.join('\n');
	}

	private renderImage(token: Token, styles: WeChatStyleSet): string {
		const src = token.attrGet('src') ?? '';
		const alt = token.content ? ` alt="${this.renderPlainInline(token.content)}"` : '';
		return `<img src="${escapeHtml(src)}"${alt} style="${styles.imageStyle}">`;
	}

	private renderCodeBlock(content: string, theme: CodeTheme, styles: WeChatStyleSet): string {
		const lines = content.replace(/\n$/, '').split('\n');
		const numberWidth = String(lines.length).length;
		const rows = lines
			.map((line, index) => `${String(index + 1).padStart(numberWidth, ' ')}  ${line}`)
			.map((line) => `<p style="${styles.codeLineTextStyle}">${escapeHtmlPreservingSpaces(line)}</p>`)
			.join('');
		const codeWidthPx = Math.max(
			360,
			Math.max(...lines.map((line, index) => measureDisplayUnits(`${String(index + 1).padStart(numberWidth, ' ')}  ${line}`))) * 8 + 24,
		);
		const codeClass = theme === 'dark' ? 'shiki github-dark' : 'shiki github-light';

		return [
			`<section class="${codeClass}" style="${styles.codeBlockStyle(theme)}">`,
			`<section class="code-scroll-area" style="${styles.codeScrollerStyle}" tabindex="0">`,
			`<section style="${styles.codeTagStyle(codeWidthPx)}">${rows}</section>`,
			'</section>',
			'</section>',
		].join('');
	}

	private renderContainer(
		type: string,
		content: string,
		md: MarkdownIt,
		styles: WeChatStyleSet,
		chatRoleIcons: ChatRoleIconMap,
	): string {
		if (type === 'intro') {
			return `<section class="container-intro" style="${styles.introStyle}">${this.renderIntroContent(content, md, styles)}</section>`;
		}
		if (type === 'highlight') {
			return [
				`<section class="knb-highlight" style="${styles.highlightStyle}">`,
				`<span class="knb-highlight-quote-left" style="${styles.highlightQuoteLeftStyle}">“</span>`,
				`<section class="knb-highlight-text">${this.renderInlineParagraphs(content, md, styles.highlightParagraphStyle)}</section>`,
				`<span class="knb-highlight-quote-right" style="${styles.highlightQuoteRightStyle}">”</span>`,
				'</section>',
			].join('');
		}
		if (type === 'chat') {
			return this.renderChat(content, styles, chatRoleIcons);
		}

		const title = CONTAINER_TITLES[type] ?? CONTAINER_TITLES.info;
		return [
			`<section class="knb-callout knb-callout-${escapeHtml(type)}" style="${styles.calloutStyle(type)}">`,
			`<p style="${styles.calloutTitleStyle}">${title.icon} ${title.title}</p>`,
			this.renderInlineParagraphs(content, md, styles.calloutParagraphStyle),
			'</section>',
		].join('');
	}

	private renderChat(content: string, styles: WeChatStyleSet, chatRoleIcons: ChatRoleIconMap): string {
		const rows = content
			.split(/\r?\n/)
			.map((line) => line.trim())
			.filter(Boolean)
			.map((line) => {
				const match = line.match(/^([^:：]{1,16})[:：]\s*(.+)$/);
				const name = match ? match[1] : '说';
				const text = match ? match[2] : line;
				const iconIndex = this.getChatRoleIconIndex(name, chatRoleIcons);
				return [
					'<section style="margin:0 0 0.5em;">',
					`<p class="knb-chat-speaker" style="${styles.chatSpeakerStyle}">${this.renderChatIcon(iconIndex, styles)}${this.renderPlainInline(name)}</p>`,
					`<p style="${styles.chatTextStyle}">${this.renderText(text, styles)}</p>`,
					'</section>',
				].join('');
			})
			.join('');

		return `<section class="knb-chat" style="${styles.chatStyle}">${rows}</section>`;
	}

	private getChatRoleIconIndex(name: string, chatRoleIcons: ChatRoleIconMap): number {
		const existing = chatRoleIcons.get(name);
		if (existing !== undefined) {
			return existing;
		}

		const next = chatRoleIcons.size % CHAT_ICON_VARIANT_COUNT;
		chatRoleIcons.set(name, next);
		return next;
	}

	private renderChatIcon(iconIndex: number, styles: WeChatStyleSet): string {
		const icon = CHAT_ICON_SYMBOLS[iconIndex] ?? CHAT_ICON_SYMBOLS[0];
		return `<span class="knb-chat-icon knb-chat-icon-${iconIndex}" style="${styles.chatIconStyle}">${icon}</span>`;
	}

	private renderToc(entries: TocEntry[], styles: WeChatStyleSet): string {
		if (entries.length === 0) {
			return '';
		}
		const max = Math.max(...entries.map((entry) => entry.length), 1);
		const rows = entries
			.map((entry, index) => {
				const width = Math.max(14, Math.round((entry.length / max) * 100));
				return [
					`<section style="${styles.tocRowStyle}">`,
					`<p style="${styles.tocLineStyle}"><span class="knb-toc-index" style="${styles.tocIndexStyle}">${index + 1}</span>${this.renderPlainInline(entry.title)}</p>`,
					`<section class="knb-toc-track" style="${styles.tocTrackStyle}"><span class="knb-toc-fill" style="${styles.tocFillStyle} width:${width}%;"></span></section>`,
					'</section>',
				].join('');
			})
			.join('');

		return `<section class="knb-toc" style="${styles.tocStyle}"><p style="${styles.tocTitleStyle}">全文导航</p>${rows}</section>`;
	}

	private extractToc(markdown: string): TocEntry[] {
		const lines = markdown.split(/\r?\n/);
		const entries: TocEntry[] = [];
		let current: TocEntry | null = null;
		for (const line of lines) {
			const heading = line.match(/^##\s+(.+)$/);
			if (heading) {
				current = { title: heading[1].trim(), length: 0 };
				entries.push(current);
				continue;
			}
			if (current && line.trim() && !line.startsWith('#')) {
				current.length += line.trim().length;
			}
		}
		return entries;
	}

	private renderReadingMeta(settings: PluginSettings, plainText: string, styles: WeChatStyleSet): string {
		const minutes = calculateReadingMinutes(plainText);
		const fastMinutes = Math.max(1, Math.ceil(minutes / 2));
		const author = settings.authorName.trim() || KNB_DEFAULT_AUTHOR;
		const avatar = settings.avatarUrl.trim() || KNB_DEFAULT_AVATAR_URL;

		return [
			`<section class="reading-time" style="${styles.readingTimeStyle}">`,
			`<section class="reading-time__card-author" style="${styles.readingAuthorCardStyle}">`,
			`<section style="${styles.readingAvatarStyle(escapeHtml(avatar))}"><br></section>`,
			`<p style="${styles.readingAuthorNameStyle}">${escapeHtml(author)}</p>`,
			'</section>',
			`<section class="reading-time__card-time" style="${styles.readingTimeCardStyle}">`,
			`<section style="${styles.readingTimeBoxStyle}">`,
			`<p style="${styles.readingTimeLabelStyle}">读完需要</p>`,
			`<section style="${styles.readingTimeMinutesStyle}">${minutes}</section>`,
			'<span style="text-align: center;">分钟</span>',
			`<p style="${styles.readingTimeFastStyle}">速读仅需 ${fastMinutes} 分钟</p>`,
			'</section>',
			'</section>',
			'</section>',
		].join('');
	}
}
