import { LAYOUT_THEME_OPTIONS, type CodeTheme, type FontWeight, type LayoutTheme, type PluginSettings } from '../settings';

export const KNB_DEFAULT_AUTHOR = '阿禅 Jason Ng';
export const KNB_DEFAULT_AVATAR_URL = 'https://mp.knb.im/jn.png';

export const articleStyle = 'font-size: 15px; line-height: 28px; color: rgb(43, 43, 43); text-align: left; font-weight: 400; letter-spacing: 1px;';

export const paragraphStyle = 'margin: 1.2em 8px; color: rgb(43, 43, 43); font-size: 15px; line-height: 28px; letter-spacing: 1px; text-align: justify;';

export const h1Style = 'margin: 1.6em 8px 1em; color: rgb(41, 148, 128); font-size: 22px; font-weight: 300; text-align: center; line-height: 1.5; border: 0';
export const h1SlashLeftStyle = 'color: rgb(41, 148, 128); font-weight: 600; margin-right: 8px';
export const h1SlashRightStyle = 'color: rgb(41, 148, 128); font-weight: 600; margin-left: 8px';

export const h2ProgressStyle = 'margin: 1.6em 8px 0.4em; color: rgb(41, 148, 128); font-weight: 600; font-size: 22px; font-style: italic; line-height: 1.2';
export const h2TitleStyle = 'margin: 0.6em 8px 1em; color: rgb(62, 62, 62); font-size: 20px; font-weight: 600; line-height: 1.5';
export const headingStrongStyle = 'color: rgb(62, 62, 62); font-weight: 600;';

export function h2BarStyle(progressPercent: number): string {
	return `margin: 0 8px; padding: 0; line-height: 9px; min-height: 9px; border-radius: 10px; background: linear-gradient(to right, rgb(41, 148, 128) ${progressPercent}%, rgb(73, 200, 149) ${progressPercent}%); color: white; font-size: 0; border: 0; box-sizing: border-box`;
}

export const h3ProgressStyle = 'margin: 1.4em 8px 0.3em; color: rgb(26, 149, 165); font-weight: 600; font-style: italic; font-size: 18px; line-height: 1.2';
export const h3TitleStyle = 'margin: 0.6em 8px 0.8em; color: rgb(62, 62, 62); font-size: 18px; font-weight: 600; line-height: 1.5';
export const h3BarStyle = 'margin: 0 8px; padding: 0; line-height: 5px; min-height: 5px; border-radius: 10px; background: linear-gradient(to right, rgb(26, 149, 165), rgb(38, 198, 218)); color: white; font-size: 0; border: 0; box-sizing: border-box';

export const h4Style = 'margin: 1.6em 8px 0.6em; color: rgb(62, 62, 62); font-size: 17px; font-weight: 600; line-height: 1.5;';

export const blockquoteStyle = 'margin: 1.4em 8px; padding: 4px 14px; border-left: 4px solid rgb(41, 148, 128); border-radius: 0; background: transparent; color: rgb(43, 43, 43); font-size: 15px; line-height: 28px; letter-spacing: 1px; text-align: justify; box-sizing: border-box; max-width: 100%;';
export const blockquoteParagraphStyle = 'margin: 0.4em 0; padding: 0; color: rgb(43, 43, 43); font-size: inherit; line-height: inherit; letter-spacing: inherit; text-align: inherit;';

export const listStyle = 'margin: 1em 8px; padding-left: 2em; color: rgb(41, 148, 128); list-style-type: disc;';
export const orderedListStyle = 'margin: 1em 8px; padding-left: 2em; color: rgb(41, 148, 128);';
export const listItemStyle = 'margin: 0.4em 0; line-height: 28px;';
export const listItemContentStyle = 'color: rgb(43, 43, 43); font-size: 15px; line-height: 28px; letter-spacing: 1px;';

export const linkStyle = 'color: rgb(41, 148, 128); text-decoration: none; border-bottom: 1px solid rgba(41, 148, 128, 0.25);';

export const inlineCodeStyle = 'margin: 0 2px; padding: 2px 5px; border-radius: 4px; background: rgba(41, 148, 128, 0.08); color: rgb(41, 148, 128); font-size: 14px; font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;';

export const markStyle = 'padding: 0 3px; background: linear-gradient(transparent 58%, rgba(102, 204, 197, 0.38) 58%); color: rgb(62, 62, 62);';
export const underlineStyle = 'text-decoration: underline; text-decoration-color: #66CCC5; text-decoration-thickness: 2px; text-underline-offset: 3px;';

export function codeBlockStyle(theme: CodeTheme): string {
	if (theme === 'dark') {
		return 'margin: 1em 8px; padding: 0; background: #24292e; border-radius: 8px; overflow: hidden; color: #e1e4e8; box-sizing: border-box;';
	}
	return 'margin: 1em 8px; padding: 0; background: #f6f8fa; border-radius: 8px; overflow: hidden; color: #24292e; box-sizing: border-box;';
}

export const codeScrollerStyle = 'padding: 0.9em 1em 0.35em; overflow-x: scroll; overflow-y: hidden; -webkit-overflow-scrolling: touch; box-sizing: border-box;';

export function codeTagStyle(widthPx: number): string {
	return `font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; display: block; width: ${widthPx}px; min-width: 100%; max-width: none; background: transparent; color: inherit; padding: 0; border: 0; border-radius: 0; font-size: 13px; line-height: 19px; letter-spacing: 0; text-align: left; white-space: nowrap; word-break: keep-all; overflow-wrap: normal;`;
}

export const codeLineTextStyle = 'margin: 0; padding: 0; color: inherit; font-size: 13px; line-height: 19px; letter-spacing: 0; text-align: left; white-space: nowrap; word-break: keep-all; overflow-wrap: normal;';

export const imageStyle = 'display: block; max-width: 100%; margin: 1.2em auto; border-radius: 0;';

export const hrStyle = 'margin: 2em 8px; border: 0; border-top: 1px dashed rgb(41, 148, 128);';

export const introStyle = 'margin: 1.6em 8px 2em; padding: 0.9em 0.4em; border: 0; border-top: 1px dashed rgb(41, 148, 128); border-bottom: 1px dashed rgb(41, 148, 128); border-radius: 0; background: transparent;';
export const introParagraphStyle = 'margin: 0.3em 0; color: rgb(60, 90, 80); font-size: 15px; line-height: 1.85; letter-spacing: 0.04em; text-align: left;';

export const highlightStyle = 'position: relative; margin: 1.8em 8px; padding: 0.8em 0.6em 1em; border: 0; background: transparent; color: rgb(41, 148, 128); font-size: 16px; line-height: 1.8; text-align: center; box-sizing: border-box;';
export const highlightQuoteLeftStyle = 'display: block; margin: 0 0 0.35em; color: rgb(41, 148, 128); font-size: 30px; line-height: 1; text-align: left; font-weight: 700;';
export const highlightQuoteRightStyle = 'display: block; margin: 0.35em 0 0; color: rgb(41, 148, 128); font-size: 30px; line-height: 1; text-align: right; font-weight: 700;';
export const highlightParagraphStyle = 'margin: 0; color: rgb(41, 148, 128); font-size: 16px; line-height: 1.8; font-weight: 600; letter-spacing: 1px; text-align: center;';

export const tocStyle = 'margin: 1.6em 8px 2em; padding: 0.6em 0; border: 0; color: rgb(43, 43, 43);';
export const tocTitleStyle = 'margin: 0 0 0.8em; color: rgb(41, 148, 128); font-size: 14px; line-height: 1.5; font-weight: 700; letter-spacing: 1px;';
export const tocRowStyle = 'margin: 0 0 0.7em; padding: 0; box-sizing: border-box;';
export const tocLineStyle = 'margin: 0 0 0.2em; color: rgb(43, 43, 43); font-size: 14px; line-height: 1.5; letter-spacing: 0;';
export const tocIndexStyle = 'display: inline-block; min-width: 1.4em; margin-right: 0.45em; color: rgb(41, 148, 128); font-weight: 700;';
export const tocTrackStyle = 'height: 3px; background: #efefef; overflow: hidden; line-height: 0; font-size: 0;';
export const tocFillStyle = 'display: block; height: 3px; background: linear-gradient(to right, rgb(41, 148, 128), rgb(73, 200, 149)); line-height: 0; font-size: 0;';

export const tableWrapStyle = 'margin: 1.2em 8px; max-width: 100%; overflow-x: auto; box-sizing: border-box;';
export const tableStyle = 'width: 100%; max-width: 100%; border-collapse: collapse; table-layout: fixed; color: rgb(43, 43, 43); font-size: 15px; line-height: 28px; letter-spacing: 1px;';
export const tableHeaderCellStyle = 'padding: 8px 10px; border: 1px solid #d9d9d9; background: #f7f7f7; color: rgb(62, 62, 62); font-weight: 600; text-align: left; vertical-align: top; overflow-wrap: anywhere; word-break: break-word; box-sizing: border-box;';
export const tableCellStyle = 'padding: 8px 10px; border: 1px solid #d9d9d9; color: rgb(43, 43, 43); text-align: left; vertical-align: top; overflow-wrap: anywhere; word-break: break-word; box-sizing: border-box;';

export const calloutBaseStyle = 'margin: 1.4em 8px; padding: 0.85em 1em; border: 1px solid #66CCC5; border-radius: 8px; background: transparent; color: rgb(43, 43, 43); font-size: 15px; line-height: 28px; box-sizing: border-box;';
export const calloutTitleStyle = 'margin: 0 0 0.45em; color: rgb(41, 148, 128); font-size: 15px; line-height: 1.5; font-weight: 700; letter-spacing: 1px;';
export const calloutParagraphStyle = 'margin: 0.35em 0; color: rgb(43, 43, 43); font-size: 15px; line-height: 28px; letter-spacing: 1px; text-align: left;';

export function calloutStyle(_type: string): string {
	return calloutBaseStyle;
}

export const chatStyle = 'margin: 1.4em 8px; padding: 0;';
export const chatSpeakerStyle = 'margin: 0.7em 0 0.15em; color: rgb(41, 148, 128); font-size: 14px; line-height: 1.7; font-weight: 700; letter-spacing: 1px;';
export const chatTextStyle = 'margin: 0 0 0.55em; color: rgb(43, 43, 43); font-size: 15px; line-height: 1.8; letter-spacing: 1px; text-align: left;';
export const chatIconStyle = 'display: inline-block; margin: 0 5px 0 0; color: rgb(43, 43, 43); font-size: 13px; line-height: 1; vertical-align: -1px;';

export const readingTimeStyle = 'text-align: center; margin: 0 8px 1.6em; font-size: 0; box-sizing: border-box;';
export const readingAuthorCardStyle = 'display: inline-block; vertical-align: middle; padding: 8px 5px; width: 50%; box-sizing: border-box; text-align: center; border-right: 1px solid #66CCC5;';
export const readingAuthorNameStyle = 'margin: 6px 0 0; font-size: 14px; color: #66CCC5; line-height: 1.6; text-align: center; letter-spacing: 0;';
export const readingTimeCardStyle = 'display: inline-block; vertical-align: middle; padding: 6px; width: 50%; box-sizing: border-box;';
export const readingTimeBoxStyle = 'border: 1px solid #66CCC5; padding: 8px 5px; width: 120px; max-width: 100%; color: #66CCC5; border-radius: 4px; margin: auto; line-height: 20px; font-size: 14px; text-align: center; letter-spacing: 0;';
export const readingTimeLabelStyle = 'font-size: 15px; line-height: 28px; margin: 0; text-align: center; letter-spacing: 0; color: #66CCC5;';
export const readingTimeMinutesStyle = 'font-size: 30px; color: #66CCC5; line-height: 32px; text-align: center;';
export const readingTimeFastStyle = 'line-height: 28px; margin: 0; font-size: 11px; color: #aaa; padding-top: 3px; text-align: center; letter-spacing: 0;';
export const readingAvatarImageStyle = 'box-sizing: border-box; width: 60px; height: 60px; display: inline-block; vertical-align: middle; border-radius: 50%; object-fit: cover;';

interface ThemePalette {
	primary: string;
	secondary: string;
	accent: string;
	accentSecondary: string;
	soft: string;
	softRgb: string;
	mark: string;
}

export interface WeChatStyleSet {
	articleStyle: string;
	paragraphStyle: string;
	h1Style: string;
	h1SlashLeftStyle: string;
	h1SlashRightStyle: string;
	h2ProgressStyle: string;
	h2EyeStyle: string;
	h2EyeTrackStyle(progressPercent: number): string;
	h2EyeIconStyle: string;
	h2TitleStyle: string;
	headingStrongStyle: string;
	h2BarStyle(progressPercent: number): string;
	h3ProgressStyle: string;
	h3TitleStyle: string;
	h3BarStyle: string;
	h4Style: string;
	blockquoteStyle: string;
	blockquoteParagraphStyle: string;
	listStyle: string;
	orderedListStyle: string;
	listItemStyle: string;
	listItemContentStyle: string;
	linkStyle: string;
	inlineCodeStyle: string;
	markStyle: string;
	underlineStyle: string;
	codeBlockStyle(theme: CodeTheme): string;
	codeScrollerStyle: string;
	codeTagStyle(widthPx: number): string;
	codeLineTextStyle: string;
	imageStyle: string;
	hrStyle: string;
	introStyle: string;
	introParagraphStyle: string;
	highlightStyle: string;
	highlightQuoteLeftStyle: string;
	highlightQuoteRightStyle: string;
	highlightParagraphStyle: string;
	tocStyle: string;
	tocTitleStyle: string;
	tocRowStyle: string;
	tocLineStyle: string;
	tocIndexStyle: string;
	tocTrackStyle: string;
	tocFillStyle: string;
	tableWrapStyle: string;
	tableStyle: string;
	tableHeaderCellStyle: string;
	tableCellStyle: string;
	calloutStyle(type: string): string;
	calloutTitleStyle: string;
	calloutParagraphStyle: string;
	chatStyle: string;
	chatSpeakerStyle: string;
	chatTextStyle: string;
	chatIconStyle: string;
	readingTimeStyle: string;
	readingAuthorCardStyle: string;
	readingAuthorNameStyle: string;
	readingAvatarImageStyle: string;
	readingTimeBoxStyle: string;
	readingTimeCardStyle: string;
	readingTimeFastStyle: string;
	readingTimeLabelStyle: string;
	readingTimeMinutesStyle: string;
}

function extractRgb(value: string): string {
	const match = value.match(/rgb\(([^)]+)\)/);
	return match?.[1] ?? '41, 148, 128';
}

function optionToPalette(option: (typeof LAYOUT_THEME_OPTIONS)[number]): ThemePalette {
	if (option.value === 'green-blue') {
		return {
			primary: 'rgb(41, 148, 128)',
			secondary: 'rgb(73, 200, 149)',
			accent: 'rgb(26, 149, 165)',
			accentSecondary: 'rgb(38, 198, 218)',
			soft: '#66CCC5',
			softRgb: '102, 204, 197',
			mark: 'rgba(102, 204, 197, 0.38)',
		};
	}

	return {
		primary: option.primary,
		secondary: option.secondary,
		accent: option.primary,
		accentSecondary: option.secondary,
		soft: option.primary,
		softRgb: extractRgb(option.primary),
		mark: `rgba(${extractRgb(option.secondary)}, 0.32)`,
	};
}

const THEME_PALETTES = LAYOUT_THEME_OPTIONS.reduce((palettes, option) => {
	palettes[option.value] = optionToPalette(option);
	return palettes;
}, {} as Record<LayoutTheme, ThemePalette>);

const LEGACY_THEME_PALETTES: Record<string, ThemePalette> = {
	blue: {
		primary: 'rgb(32, 91, 195)',
		secondary: 'rgb(166, 189, 231)',
		accent: 'rgb(32, 91, 195)',
		accentSecondary: 'rgb(166, 189, 231)',
		soft: 'rgb(32, 91, 195)',
		softRgb: '32, 91, 195',
		mark: 'rgba(166, 189, 231, 0.32)',
	},
	purple: {
		primary: 'rgb(145, 124, 183)',
		secondary: 'rgb(186, 168, 228)',
		accent: 'rgb(145, 124, 183)',
		accentSecondary: 'rgb(186, 168, 228)',
		soft: 'rgb(145, 124, 183)',
		softRgb: '145, 124, 183',
		mark: 'rgba(186, 168, 228, 0.32)',
	},
	orange: {
		primary: 'rgb(255, 163, 89)',
		secondary: 'rgb(254, 230, 145)',
		accent: 'rgb(255, 163, 89)',
		accentSecondary: 'rgb(254, 230, 145)',
		soft: 'rgb(255, 163, 89)',
		softRgb: '255, 163, 89',
		mark: 'rgba(254, 230, 145, 0.32)',
	},
	gray: {
		primary: 'rgb(85, 85, 85)',
		secondary: 'rgb(153, 153, 153)',
		accent: 'rgb(85, 85, 85)',
		accentSecondary: 'rgb(153, 153, 153)',
		soft: 'rgb(85, 85, 85)',
		softRgb: '85, 85, 85',
		mark: 'rgba(153, 153, 153, 0.32)',
	},
};

const CONTENT_WEIGHTS: Record<FontWeight, string> = {
	light: '300',
	medium: '400',
	bold: '500',
};

const HEADING_WEIGHTS: Record<FontWeight, string> = {
	light: '500',
	medium: '600',
	bold: '700',
};

function applyPalette(style: string, palette: ThemePalette): string {
	return style
		.replace(/rgb\(41, 148, 128\)/g, palette.primary)
		.replace(/rgb\(73, 200, 149\)/g, palette.secondary)
		.replace(/rgb\(26, 149, 165\)/g, palette.accent)
		.replace(/rgb\(38, 198, 218\)/g, palette.accentSecondary)
		.replace(/#66CCC5/g, palette.soft)
		.replace(/rgba\(102, 204, 197, 0\.38\)/g, palette.mark)
		.replace(/rgba\(102, 204, 197, 0\.08\)/g, `rgba(${palette.softRgb}, 0.08)`)
		.replace(/rgba\(41, 148, 128, 0\.08\)/g, `rgba(${palette.softRgb}, 0.08)`)
		.replace(/rgba\(41, 148, 128, 0\.25\)/g, `rgba(${palette.softRgb}, 0.25)`);
}

function withContentWeight(style: string, weight: string): string {
	if (style.includes('font-weight:')) {
		return style.replace(/font-weight:\s*\d+/g, `font-weight: ${weight}`);
	}
	return `${style} font-weight: ${weight};`;
}

function withHeadingWeight(style: string, weight: string): string {
	return style.replace(/font-weight:\s*\d+/g, `font-weight: ${weight}`);
}

export function createWeChatStyles(settings: PluginSettings): WeChatStyleSet {
	const themeKey = settings.layoutTheme as string;
	const palette = THEME_PALETTES[settings.layoutTheme] ?? LEGACY_THEME_PALETTES[themeKey] ?? THEME_PALETTES['green-blue'];
	const contentWeight = CONTENT_WEIGHTS[settings.fontWeight] ?? CONTENT_WEIGHTS.medium;
	const headingWeight = HEADING_WEIGHTS[settings.fontWeight] ?? HEADING_WEIGHTS.medium;

	return {
		articleStyle: withContentWeight(applyPalette(articleStyle, palette), contentWeight),
		paragraphStyle: withContentWeight(applyPalette(paragraphStyle, palette), contentWeight),
		h1Style: withHeadingWeight(applyPalette(h1Style, palette), contentWeight),
		h1SlashLeftStyle: withHeadingWeight(applyPalette(h1SlashLeftStyle, palette), headingWeight),
		h1SlashRightStyle: withHeadingWeight(applyPalette(h1SlashRightStyle, palette), headingWeight),
		h2ProgressStyle: withHeadingWeight(applyPalette(h2ProgressStyle, palette), headingWeight),
		h2EyeStyle: `margin: 1.6em 8px -0.1em; color: rgb(43, 43, 43); font-size: 18px; line-height: 1.2; font-weight: ${headingWeight}; text-align: left; letter-spacing: 0;`,
		h2EyeTrackStyle: (progressPercent: number) =>
			`display: inline-block; width: ${Math.max(0, Math.min(100, progressPercent))}%; min-width: 18px; max-width: 100%; text-align: right; vertical-align: top;`,
		h2EyeIconStyle: 'display: inline-block; width: 18px; margin-right: -9px; text-align: center;',
		h2TitleStyle: withHeadingWeight(applyPalette(h2TitleStyle, palette), headingWeight),
		headingStrongStyle: withHeadingWeight(applyPalette(headingStrongStyle, palette), headingWeight),
		h2BarStyle: (progressPercent: number) => applyPalette(h2BarStyle(progressPercent), palette),
		h3ProgressStyle: withHeadingWeight(applyPalette(h3ProgressStyle, palette), headingWeight),
		h3TitleStyle: withHeadingWeight(applyPalette(h3TitleStyle, palette), headingWeight),
		h3BarStyle: applyPalette(h3BarStyle, palette),
		h4Style: withHeadingWeight(applyPalette(h4Style, palette), headingWeight),
		blockquoteStyle: withContentWeight(applyPalette(blockquoteStyle, palette), contentWeight),
		blockquoteParagraphStyle: withContentWeight(applyPalette(blockquoteParagraphStyle, palette), contentWeight),
		listStyle: applyPalette(listStyle, palette),
		orderedListStyle: applyPalette(orderedListStyle, palette),
		listItemStyle,
		listItemContentStyle: withContentWeight(applyPalette(listItemContentStyle, palette), contentWeight),
		linkStyle: applyPalette(linkStyle, palette),
		inlineCodeStyle: applyPalette(inlineCodeStyle, palette),
		markStyle: applyPalette(markStyle, palette),
		underlineStyle: applyPalette(underlineStyle, palette),
		codeBlockStyle,
		codeScrollerStyle,
		codeTagStyle,
		codeLineTextStyle,
		imageStyle,
		hrStyle: applyPalette(hrStyle, palette),
		introStyle: applyPalette(introStyle, palette),
		introParagraphStyle: applyPalette(introParagraphStyle, palette),
		highlightStyle: withContentWeight(applyPalette(highlightStyle, palette), contentWeight),
		highlightQuoteLeftStyle: applyPalette(highlightQuoteLeftStyle, palette),
		highlightQuoteRightStyle: applyPalette(highlightQuoteRightStyle, palette),
		highlightParagraphStyle: withHeadingWeight(applyPalette(highlightParagraphStyle, palette), headingWeight),
		tocStyle: applyPalette(tocStyle, palette),
		tocTitleStyle: withHeadingWeight(applyPalette(tocTitleStyle, palette), headingWeight),
		tocRowStyle,
		tocLineStyle: withContentWeight(applyPalette(tocLineStyle, palette), contentWeight),
		tocIndexStyle: withHeadingWeight(applyPalette(tocIndexStyle, palette), headingWeight),
		tocTrackStyle,
		tocFillStyle: applyPalette(tocFillStyle, palette),
		tableWrapStyle,
		tableStyle: withContentWeight(applyPalette(tableStyle, palette), contentWeight),
		tableHeaderCellStyle: withHeadingWeight(applyPalette(tableHeaderCellStyle, palette), headingWeight),
		tableCellStyle: withContentWeight(applyPalette(tableCellStyle, palette), contentWeight),
		calloutStyle: (type: string) => applyPalette(calloutStyle(type), palette),
		calloutTitleStyle: withHeadingWeight(applyPalette(calloutTitleStyle, palette), headingWeight),
		calloutParagraphStyle: withContentWeight(applyPalette(calloutParagraphStyle, palette), contentWeight),
		chatStyle,
		chatSpeakerStyle: withHeadingWeight(applyPalette(chatSpeakerStyle, palette), headingWeight),
		chatTextStyle: withContentWeight(applyPalette(chatTextStyle, palette), contentWeight),
		chatIconStyle,
		readingTimeStyle,
		readingAuthorCardStyle: applyPalette(readingAuthorCardStyle, palette),
		readingAuthorNameStyle: applyPalette(readingAuthorNameStyle, palette),
		readingAvatarImageStyle,
		readingTimeBoxStyle: applyPalette(readingTimeBoxStyle, palette),
		readingTimeCardStyle,
		readingTimeFastStyle,
		readingTimeLabelStyle: applyPalette(readingTimeLabelStyle, palette),
		readingTimeMinutesStyle: applyPalette(readingTimeMinutesStyle, palette),
	};
}
