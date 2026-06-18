import test from 'node:test';
import assert from 'node:assert/strict';
import type { Plugin } from 'obsidian';
import { SettingsRepository } from '../src/repository/SettingsRepository';
import { DEFAULT_LICENSE_SERVER_URL } from '../src/settings';

test('generates and persists device id on first load', async () => {
	let savedData: unknown = null;
	const plugin = {
		async loadData() {
			return null;
		},
		async saveData(data: unknown) {
			savedData = data;
		},
	} as unknown as Plugin;

	const settings = await new SettingsRepository(plugin).load();

	assert.match(settings.deviceId, /^device_/);
	assert.equal(settings.licenseKey, '');
	assert.equal(settings.licenseServerUrl, DEFAULT_LICENSE_SERVER_URL);
	assert.equal(settings.entitlementCache, null);
	assert.equal((savedData as { deviceId?: string }).deviceId, settings.deviceId);
});

test('normalizes entitlement settings from saved data', async () => {
	const plugin = {
		async loadData() {
			return {
				deviceId: 'device_saved',
				licenseKey: ' LICENSE ',
				licenseServerUrl: '',
				entitlementCache: {
					plan: 'pro',
					expiresAt: '2026-06-10T00:00:00.000Z',
					checkedAt: '2026-06-06T00:00:00.000Z',
					features: ['wechat_upload'],
				},
			};
		},
		async saveData() {
			throw new Error('should not save existing device id');
		},
	} as unknown as Plugin;

	const settings = await new SettingsRepository(plugin).load();

	assert.equal(settings.deviceId, 'device_saved');
	assert.equal(settings.licenseKey, 'LICENSE');
	assert.equal(settings.licenseServerUrl, DEFAULT_LICENSE_SERVER_URL);
	assert.deepEqual(settings.entitlementCache, {
		plan: 'pro',
		expiresAt: '2026-06-10T00:00:00.000Z',
		checkedAt: '2026-06-06T00:00:00.000Z',
		features: ['wechat_upload'],
	});
});
