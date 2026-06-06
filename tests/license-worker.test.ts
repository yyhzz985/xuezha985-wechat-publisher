import test from 'node:test';
import assert from 'node:assert/strict';
import worker from '../worker/src/index';

class MemoryKv {
	constructor(private readonly data: Record<string, string>) {}

	async get(key: string): Promise<string | null> {
		return this.data[key] ?? null;
	}
}

function createRequest(body: unknown): Request {
	return new Request('https://license.example.com/v1/licenses/verify', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(body),
	});
}

test('worker verifies active pro license from KV', async () => {
	const response = await worker.fetch(
		createRequest({
			licenseKey: 'PRO-123',
			deviceId: 'device_1',
			pluginId: 'wechat-publisher',
			pluginVersion: '0.1.0',
			feature: 'wechat_upload',
		}),
		{
			LICENSES: new MemoryKv({
				'license:PRO-123': JSON.stringify({
					active: true,
					plan: 'pro',
					features: ['wechat_upload'],
					expiresAt: '2999-01-01T00:00:00.000Z',
				}),
			}),
		},
	);

	assert.equal(response.status, 200);
	assert.deepEqual(await response.json(), {
		active: true,
		plan: 'pro',
		features: ['wechat_upload'],
		expiresAt: '2999-01-01T00:00:00.000Z',
		message: 'ok',
	});
});

test('worker rejects missing, inactive, or expired license', async () => {
	const missing = await worker.fetch(
		createRequest({
			licenseKey: 'MISSING',
			deviceId: 'device_1',
			pluginId: 'wechat-publisher',
			pluginVersion: '0.1.0',
			feature: 'wechat_upload',
		}),
		{ LICENSES: new MemoryKv({}) },
	);
	const expired = await worker.fetch(
		createRequest({
			licenseKey: 'OLD',
			deviceId: 'device_1',
			pluginId: 'wechat-publisher',
			pluginVersion: '0.1.0',
			feature: 'wechat_upload',
		}),
		{
			LICENSES: new MemoryKv({
				'license:OLD': JSON.stringify({
					active: true,
					plan: 'pro',
					features: ['wechat_upload'],
					expiresAt: '2000-01-01T00:00:00.000Z',
				}),
			}),
		},
	);

	assert.equal(missing.status, 200);
	assert.match((await missing.json() as { message: string }).message, /License 不存在/);
	assert.equal(expired.status, 200);
	assert.match((await expired.json() as { message: string }).message, /License 已过期/);
});
