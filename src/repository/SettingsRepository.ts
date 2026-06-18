import type { Plugin } from 'obsidian';
import {
	CODE_THEME_OPTIONS,
	DEFAULT_SETTINGS,
	DEFAULT_LICENSE_SERVER_URL,
	FONT_WEIGHT_OPTIONS,
	LAYOUT_THEME_OPTIONS,
	SUBHEADING_STYLE_OPTIONS,
	type EntitlementCache,
	type LayoutTheme,
	type PluginSettings,
	type ProFeature,
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
		const deviceId = this.normalizeText(merged.deviceId).trim() || this.createDeviceId();
		const settings = {
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
			licenseKey: this.normalizeText(merged.licenseKey).trim(),
			licenseServerUrl: DEFAULT_LICENSE_SERVER_URL,
			deviceId,
			entitlementCache: this.normalizeEntitlementCache(merged.entitlementCache),
		};

		if (!this.normalizeText(saved?.deviceId).trim()) {
			await this.save(settings);
		}

		return settings;
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

	private normalizeEntitlementCache(value: unknown): EntitlementCache | null {
		if (!value || typeof value !== 'object') {
			return null;
		}

		const cache = value as Partial<EntitlementCache>;
		const plan = cache.plan === 'pro' || cache.plan === 'free' ? cache.plan : null;
		if (!plan || typeof cache.expiresAt !== 'string' || typeof cache.checkedAt !== 'string') {
			return null;
		}

		const normalized: EntitlementCache = {
			plan,
			expiresAt: cache.expiresAt,
			checkedAt: cache.checkedAt,
			features: this.normalizeFeatures(cache.features),
		};
		const maxDevices = this.normalizeOptionalNumber(cache.maxDevices);
		const usedDevices = this.normalizeOptionalNumber(cache.usedDevices);
		if (maxDevices !== undefined) {
			normalized.maxDevices = maxDevices;
		}
		if (usedDevices !== undefined) {
			normalized.usedDevices = usedDevices;
		}
		if (typeof cache.deviceBound === 'boolean') {
			normalized.deviceBound = cache.deviceBound;
		}
		return normalized;
	}

	private normalizeFeatures(value: unknown): ProFeature[] {
		if (!Array.isArray(value)) {
			return [];
		}
		return value.filter((feature): feature is ProFeature => feature === 'wechat_upload');
	}

	private normalizeOptionalNumber(value: unknown): number | undefined {
		return typeof value === 'number' && Number.isFinite(value) ? value : undefined;
	}

	private createDeviceId(): string {
		const randomId = globalThis.crypto?.randomUUID?.() ?? `${Date.now()}_${Math.random().toString(16).slice(2)}`;
		return `device_${randomId}`;
	}
}
