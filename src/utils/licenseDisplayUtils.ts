import type { EntitlementStatus } from '../service/EntitlementService';

const PERMANENT_LICENSE_MIN_MS = 50 * 365 * 24 * 60 * 60 * 1000;

export function formatLicenseStatus(status: EntitlementStatus): string {
	if (!status.active) {
		return status.message ? `Free，${status.message}` : 'Free';
	}

	const deviceText = status.maxDevices ? `，设备 ${status.usedDevices ?? 0}/${status.maxDevices}` : '';
	const expiresAt = status.expiresAt.trim();
	if (isPermanentExpiresAt(expiresAt)) {
		return `Pro，永久授权${deviceText}`;
	}
	return `Pro，有效期至 ${expiresAt}${deviceText}`;
}

function isPermanentExpiresAt(expiresAt: string): boolean {
	const timestamp = Date.parse(expiresAt);
	return Number.isFinite(timestamp) && timestamp - Date.now() >= PERMANENT_LICENSE_MIN_MS;
}
