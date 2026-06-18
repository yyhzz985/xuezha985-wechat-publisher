import { D1Repository } from '../repository/D1Repository';
import type { LicenseRow, ProFeature, VerifyRequest, VerifyResponse } from '../types';
import { createLicenseKey, decryptText, encryptText, hashLicenseKey, randomId } from '../utils/crypto';

const PRO_FEATURES: ProFeature[] = ['wechat_upload'];
const DEFAULT_MAX_DEVICES = 1;

export interface IssueLicenseInput {
	days: number;
	note?: string;
	source: string;
	orderNo?: string | null;
	now?: string;
}

export interface IssueLicenseResult {
	licenseKey: string;
	licenseHash: string;
	expiresAt: string;
	maxDevices: number;
}

export class LicenseService {
	constructor(
		private readonly repository: D1Repository,
		private readonly hashSecret: string,
	) {}

	async issue(input: IssueLicenseInput): Promise<IssueLicenseResult> {
		const now = input.now ?? new Date().toISOString();
		const licenseKey = createLicenseKey();
		const licenseHash = await hashLicenseKey(this.hashSecret, licenseKey);
		const expiresAt = new Date(Date.parse(now) + input.days * 24 * 60 * 60 * 1000).toISOString();
		await this.repository.createLicense({
			license_hash: licenseHash,
			plan: 'pro',
			features: JSON.stringify(PRO_FEATURES),
			expires_at: expiresAt,
			max_devices: DEFAULT_MAX_DEVICES,
			note: input.note ?? '',
			message: '',
			active: 1,
			created_at: now,
			updated_at: now,
		});
		await this.repository.createLicenseEvent(randomId('evt'), licenseHash, input.orderNo ?? null, 'issued', input.note ?? '', now);
		return {
			licenseKey,
			licenseHash,
			expiresAt,
			maxDevices: DEFAULT_MAX_DEVICES,
		};
	}

	async verify(request: VerifyRequest): Promise<VerifyResponse> {
		const now = new Date().toISOString();
		const licenseKey = request.licenseKey.trim();
		const licenseHash = await hashLicenseKey(this.hashSecret, licenseKey);
		const license = await this.repository.findLicenseByHash(licenseHash);
		if (!license) {
			return denied('License 不存在');
		}

		const features = this.parseFeatures(license);
		const usedDevices = await this.repository.countActivations(licenseHash);
		if (Number(license.active) !== 1) {
			return denied(license.message || 'License 已禁用', license, features, usedDevices);
		}
		if (license.plan !== 'pro') {
			return denied('License 未开通 Pro', license, features, usedDevices);
		}
		if (!features.includes(request.feature)) {
			return denied('License 未开通该功能', license, features, usedDevices);
		}
		if (!isFuture(license.expires_at)) {
			return denied('License 已过期', license, features, usedDevices);
		}

		const activation = await this.repository.findActivation(licenseHash, request.deviceId);
		if (activation) {
			await this.repository.touchActivation(licenseHash, request.deviceId, now);
			return allowed(license, features, usedDevices, true);
		}
		if (usedDevices >= license.max_devices) {
			return denied('该 License 已绑定其他设备，请联系解绑', license, features, usedDevices, false);
		}

		await this.repository.createActivation(licenseHash, {
			device_id: request.deviceId,
			plugin_version: request.pluginVersion,
			created_at: now,
			last_seen_at: now,
		});
		await this.repository.createLicenseEvent(randomId('evt'), licenseHash, null, 'device_bound', request.deviceId, now);
		return allowed(license, features, usedDevices + 1, true);
	}

	async getLicenseKeyForOrder(orderNo: string): Promise<string | null> {
		const order = await this.repository.findOrder(orderNo);
		if (!order?.license_hash) {
			return null;
		}
		if (!order.license_key_ciphertext) {
			return null;
		}
		return decryptText(this.hashSecret, order.license_key_ciphertext);
	}

	async encryptLicenseKey(licenseKey: string): Promise<string> {
		return encryptText(this.hashSecret, licenseKey);
	}

	async resetDevice(licenseKey: string): Promise<void> {
		const licenseHash = await hashLicenseKey(this.hashSecret, licenseKey);
		await this.repository.resetActivations(licenseHash);
		await this.repository.createLicenseEvent(randomId('evt'), licenseHash, null, 'device_reset', '', new Date().toISOString());
	}

	async disable(licenseKey: string): Promise<void> {
		const licenseHash = await hashLicenseKey(this.hashSecret, licenseKey);
		const now = new Date().toISOString();
		await this.repository.disableLicense(licenseHash, 'License 已禁用', now);
		await this.repository.createLicenseEvent(randomId('evt'), licenseHash, null, 'disabled', '', now);
	}

	async extend(licenseKey: string, days: number): Promise<string> {
		const licenseHash = await hashLicenseKey(this.hashSecret, licenseKey);
		const license = await this.repository.findLicenseByHash(licenseHash);
		if (!license) {
			throw new Error('License 不存在');
		}
		const baseMs = Math.max(Date.now(), Date.parse(license.expires_at));
		const expiresAt = new Date(baseMs + days * 24 * 60 * 60 * 1000).toISOString();
		const now = new Date().toISOString();
		await this.repository.extendLicense(licenseHash, expiresAt, now);
		await this.repository.createLicenseEvent(randomId('evt'), licenseHash, null, 'extended', `${days}`, now);
		return expiresAt;
	}

	private parseFeatures(license: LicenseRow): ProFeature[] {
		try {
			const features = JSON.parse(license.features) as string[];
			return features.filter((feature): feature is ProFeature => feature === 'wechat_upload');
		} catch {
			return [];
		}
	}
}

function allowed(license: LicenseRow, features: ProFeature[], usedDevices: number, deviceBound: boolean): VerifyResponse {
	return {
		active: true,
		plan: 'pro',
		features,
		expiresAt: license.expires_at,
		message: 'ok',
		maxDevices: license.max_devices,
		usedDevices,
		deviceBound,
	};
}

function denied(
	message: string,
	license?: LicenseRow,
	features: ProFeature[] = [],
	usedDevices = 0,
	deviceBound = false,
): VerifyResponse {
	return {
		active: false,
		plan: 'free',
		features: [],
		expiresAt: license?.expires_at ?? '',
		message,
		maxDevices: license?.max_devices,
		usedDevices,
		deviceBound,
	};
}

function isFuture(date: string): boolean {
	const timestamp = Date.parse(date);
	return Number.isFinite(timestamp) && timestamp > Date.now();
}
