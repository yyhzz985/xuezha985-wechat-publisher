import test from 'node:test';
import assert from 'node:assert/strict';
import {
	EntitlementService,
	type EntitlementCache,
	type LicenseHttpClient,
} from '../src/service/EntitlementService';
import { DEFAULT_SETTINGS, type PluginSettings } from '../src/settings';

const PRO_CACHE: EntitlementCache = {
	plan: 'pro',
	expiresAt: '2026-06-10T00:00:00.000Z',
	checkedAt: '2026-06-06T00:00:00.000Z',
	features: ['wechat_upload'],
	maxDevices: 1,
	usedDevices: 1,
	deviceBound: true,
};

function createService(
	settings: PluginSettings,
	httpClient: LicenseHttpClient,
	now = new Date('2026-06-06T12:00:00.000Z'),
): { service: EntitlementService; saved: PluginSettings[] } {
	const saved: PluginSettings[] = [];
	const service = new EntitlementService(
		() => settings,
		async (nextSettings) => {
			settings = nextSettings;
			saved.push(nextSettings);
		},
		httpClient,
		{
			pluginId: 'wechat-publisher',
			pluginVersion: '0.1.0',
			now: () => now,
		},
	);
	return { service, saved };
}

test('allows pro feature from fresh cached entitlement', async () => {
	let verifyCount = 0;
	const { service } = createService(
		{
			...DEFAULT_SETTINGS,
			deviceId: 'device-1',
			licenseKey: 'LICENSE',
			entitlementCache: PRO_CACHE,
		},
		{
			async verify() {
				verifyCount += 1;
				throw new Error('should not request');
			},
		},
	);

	await service.ensureFeature('wechat_upload');

	assert.equal(verifyCount, 0);
	assert.deepEqual(service.getCachedStatus(), {
		active: true,
		plan: 'pro',
		features: ['wechat_upload'],
		expiresAt: '2026-06-10T00:00:00.000Z',
		maxDevices: 1,
		usedDevices: 1,
		deviceBound: true,
	});
});

test('ignores cached pro entitlement when license key is empty', async () => {
	const { service } = createService(
		{
			...DEFAULT_SETTINGS,
			deviceId: 'device-1',
			licenseKey: '',
			entitlementCache: PRO_CACHE,
		},
		{
			async verify() {
				throw new Error('should not request without license key');
			},
		},
	);

	assert.deepEqual(service.getCachedStatus(), {
		active: false,
		plan: 'free',
		features: [],
		expiresAt: '',
	});
	await assert.rejects(
		() => service.ensureFeature('wechat_upload'),
		/需 Pro 授权后可用/,
	);
});

test('refreshes license and saves pro cache when no fresh cache exists', async () => {
	const { service, saved } = createService(
		{
			...DEFAULT_SETTINGS,
			deviceId: 'device-1',
			licenseKey: 'LICENSE',
			licenseServerUrl: 'https://license.example.com/v1/licenses/verify',
			entitlementCache: null,
		},
		{
			async verify(request) {
				assert.deepEqual(request, {
					licenseKey: 'LICENSE',
					deviceId: 'device-1',
					pluginId: 'wechat-publisher',
					pluginVersion: '0.1.0',
					feature: 'wechat_upload',
				});
				return {
					active: true,
					plan: 'pro',
					features: ['wechat_upload'],
					expiresAt: '2026-06-10T00:00:00.000Z',
					maxDevices: 1,
					usedDevices: 1,
					deviceBound: true,
				};
			},
		},
	);

	await service.ensureFeature('wechat_upload');

	assert.equal(saved.length, 1);
	assert.deepEqual(saved[0].entitlementCache, {
		plan: 'pro',
		expiresAt: '2026-06-10T00:00:00.000Z',
		checkedAt: '2026-06-06T12:00:00.000Z',
		features: ['wechat_upload'],
		maxDevices: 1,
		usedDevices: 1,
		deviceBound: true,
	});
});

test('rejects expired cache when license server cannot be reached', async () => {
	const { service } = createService(
		{
			...DEFAULT_SETTINGS,
			deviceId: 'device-1',
			licenseKey: 'LICENSE',
			licenseServerUrl: 'https://license.example.com/v1/licenses/verify',
			entitlementCache: {
				...PRO_CACHE,
				checkedAt: '2026-06-04T00:00:00.000Z',
			},
		},
		{
			async verify() {
				throw new Error('network down');
			},
		},
	);

	await assert.rejects(
		() => service.ensureFeature('wechat_upload'),
		/授权校验失败，请联网后重试/,
	);
});

test('rejects inactive or expired license responses', async () => {
	const { service } = createService(
		{
			...DEFAULT_SETTINGS,
			deviceId: 'device-1',
			licenseKey: 'LICENSE',
			licenseServerUrl: 'https://license.example.com/v1/licenses/verify',
			entitlementCache: null,
		},
		{
			async verify() {
				return {
					active: false,
					plan: 'free',
					features: [],
					expiresAt: '2026-06-05T00:00:00.000Z',
					message: 'License 已过期',
				};
			},
		},
	);

	await assert.rejects(
		() => service.ensureFeature('wechat_upload'),
		/License 已过期/,
	);
});
