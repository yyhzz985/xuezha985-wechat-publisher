import type { Plugin } from 'obsidian';
import {
	CODE_THEME_OPTIONS,
	DEFAULT_SETTINGS,
	FONT_WEIGHT_OPTIONS,
	LAYOUT_THEME_OPTIONS,
	SUBHEADING_STYLE_OPTIONS,
	type LayoutTheme,
	type PluginSettings,
} from '../settings';

const LEGACY_LAYOUT_THEME_MAP: Record<string, LayoutTheme> = {
	blue: 'blue-indigo',
	purple: 'joker',
	orange: 'yellow',
	gray: 'black-white',
};

export class SettingsRepository {
	constructor(private readonly plugin: Plugin) {}

	async load(): Promise<PluginSettings> {
		const saved = (await this.plugin.loadData()) as Partial<PluginSettings> | null;
		const merged = {
			...DEFAULT_SETTINGS,
			...(saved ?? {}),
		};
		return {
			...merged,
			codeTheme: this.normalizeOption(merged.codeTheme, CODE_THEME_OPTIONS, DEFAULT_SETTINGS.codeTheme),
			layoutTheme: this.normalizeLayoutTheme(merged.layoutTheme),
			fontWeight: this.normalizeOption(merged.fontWeight, FONT_WEIGHT_OPTIONS, DEFAULT_SETTINGS.fontWeight),
			subheadingStyle: this.normalizeOption(merged.subheadingStyle, SUBHEADING_STYLE_OPTIONS, DEFAULT_SETTINGS.subheadingStyle),
			wechatAppId: this.normalizeText(merged.wechatAppId),
			wechatAppSecret: this.normalizeText(merged.wechatAppSecret),
			wechatThumbMediaId: this.normalizeText(merged.wechatThumbMediaId),
			wechatSourceUrl: this.normalizeText(merged.wechatSourceUrl),
			wechatNeedOpenComment: typeof merged.wechatNeedOpenComment === 'boolean'
				? merged.wechatNeedOpenComment
				: DEFAULT_SETTINGS.wechatNeedOpenComment,
		};
	}

	async save(settings: PluginSettings): Promise<void> {
		await this.plugin.saveData(settings);
	}

	private normalizeLayoutTheme(value: unknown): LayoutTheme {
		if (typeof value !== 'string') {
			return DEFAULT_SETTINGS.layoutTheme;
		}
		const legacyTheme = LEGACY_LAYOUT_THEME_MAP[value];
		if (legacyTheme) {
			return legacyTheme;
		}
		return this.normalizeOption(value, LAYOUT_THEME_OPTIONS, DEFAULT_SETTINGS.layoutTheme);
	}

	private normalizeOption<T extends string>(
		value: unknown,
		options: Array<{ value: T }>,
		defaultValue: T,
	): T {
		if (typeof value !== 'string') {
			return defaultValue;
		}
		return options.some((option) => option.value === value) ? value as T : defaultValue;
	}

	private normalizeText(value: unknown): string {
		return typeof value === 'string' ? value : '';
	}
}
