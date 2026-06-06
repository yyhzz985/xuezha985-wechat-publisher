import type { EntitlementCache, PluginSettings, ProFeature } from '../settings';

export type { EntitlementCache } from '../settings';

export interface EntitlementStatus {
	active: boolean;
	plan: 'free' | 'pro';
	features: ProFeature[];
	expiresAt: string;
	message?: string;
	maxDevices?: number;
	usedDevices?: number;
	deviceBound?: boolean;
}

export interface LicenseVerifyRequest {
	licenseKey: string;
	deviceId: string;
	pluginId: string;
	pluginVersion: string;
	feature: ProFeature;
}

export interface LicenseVerifyResponse {
	active: boolean;
	plan: 'free' | 'pro';
	features: string[];
	expiresAt: string;
	message?: string;
	maxDevices?: number;
	usedDevices?: number;
	deviceBound?: boolean;
}

export interface LicenseHttpClient {
	verify(request: LicenseVerifyRequest, serverUrl?: string): Promise<LicenseVerifyResponse>;
}

interface EntitlementServiceOptions {
	pluginId: string;
	pluginVersion: string;
	now?: () => Date;
	cacheTtlMs?: number;
}

const ONE_DAY_MS = 24 * 60 * 60 * 1000;
const PRO_REQUIRED_MESSAGE = '公众号上传是 Pro 功能，请在设置中填写 Pro License Key';

export class EntitlementService {
	private readonly now: () => Date;
	private readonly cacheTtlMs: number;

	constructor(
		private readonly getSettings: () => PluginSettings,
		private readonly saveSettings: (settings: PluginSettings) => Promise<void>,
		private readonly httpClient: LicenseHttpClient,
		private readonly options: EntitlementServiceOptions,
	) {
		this.now = options.now ?? (() => new Date());
		this.cacheTtlMs = options.cacheTtlMs ?? ONE_DAY_MS;
	}

	async ensureFeature(feature: ProFeature): Promise<void> {
		const cachedStatus = this.getCachedStatus();
		if (this.allowsFeature(cachedStatus, feature)) {
			return;
		}

		const settings = this.getSettings();
		if (!settings.licenseKey.trim()) {
			throw new Error(PRO_REQUIRED_MESSAGE);
		}
		if (!settings.licenseServerUrl.trim()) {
			throw new Error('授权服务未配置，请重新安装插件');
		}

		let status: EntitlementStatus;
		try {
			status = await this.refreshLicense(feature);
		} catch {
			throw new Error('授权校验失败，请联网后重试');
		}

		if (!this.allowsFeature(status, feature)) {
			throw new Error(status.message ?? '当前 License 未开通该 Pro 功能');
		}
	}

	async refreshLicense(feature: ProFeature = 'wechat_upload'): Promise<EntitlementStatus> {
		const settings = this.getSettings();
		const licenseKey = settings.licenseKey.trim();
		const serverUrl = settings.licenseServerUrl.trim();
		if (!licenseKey) {
			throw new Error(PRO_REQUIRED_MESSAGE);
		}
		if (!serverUrl) {
			throw new Error('授权服务未配置，请重新安装插件');
		}

		const response = await this.httpClient.verify(
			{
				licenseKey,
				deviceId: settings.deviceId,
				pluginId: this.options.pluginId,
				pluginVersion: this.options.pluginVersion,
				feature,
			},
			serverUrl,
		);
		const status = this.toStatus(response);

		await this.saveSettings({
			...this.getSettings(),
			licenseKey,
			licenseServerUrl: serverUrl,
			entitlementCache: this.createCache(status),
		});

		return status;
	}

	getCachedStatus(): EntitlementStatus {
		const cache = this.getSettings().entitlementCache;
		if (!cache) {
			return {
				active: false,
				plan: 'free',
				features: [],
				expiresAt: '',
			};
		}

		return {
			active: this.isFreshCache(cache) && cache.plan === 'pro',
			plan: cache.plan,
			features: cache.features,
			expiresAt: cache.expiresAt,
			maxDevices: cache.maxDevices,
			usedDevices: cache.usedDevices,
			deviceBound: cache.deviceBound,
		};
	}

	private toStatus(response: LicenseVerifyResponse): EntitlementStatus {
		const features = response.features.filter((feature): feature is ProFeature => feature === 'wechat_upload');
		return {
			active: response.active && response.plan === 'pro' && this.isFuture(response.expiresAt),
			plan: response.plan === 'pro' ? 'pro' : 'free',
			features,
			expiresAt: response.expiresAt,
			message: response.message,
			maxDevices: response.maxDevices,
			usedDevices: response.usedDevices,
			deviceBound: response.deviceBound,
		};
	}

	private createCache(status: EntitlementStatus): EntitlementCache | null {
		if (!status.active) {
			return null;
		}
		const cache: EntitlementCache = {
			plan: status.plan,
			expiresAt: status.expiresAt,
			checkedAt: this.now().toISOString(),
			features: status.features,
		};
		if (status.maxDevices !== undefined) {
			cache.maxDevices = status.maxDevices;
		}
		if (status.usedDevices !== undefined) {
			cache.usedDevices = status.usedDevices;
		}
		if (status.deviceBound !== undefined) {
			cache.deviceBound = status.deviceBound;
		}
		return cache;
	}

	private allowsFeature(status: EntitlementStatus, feature: ProFeature): boolean {
		return status.active && status.plan === 'pro' && status.features.includes(feature) && this.isFuture(status.expiresAt);
	}

	private isFreshCache(cache: EntitlementCache): boolean {
		const checkedAtMs = Date.parse(cache.checkedAt);
		return Number.isFinite(checkedAtMs)
			&& this.now().getTime() - checkedAtMs <= this.cacheTtlMs
			&& this.isFuture(cache.expiresAt);
	}

	private isFuture(date: string): boolean {
		const timestamp = Date.parse(date);
		return Number.isFinite(timestamp) && timestamp > this.now().getTime();
	}
}
