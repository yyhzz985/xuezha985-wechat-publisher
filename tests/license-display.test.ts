import test from 'node:test';
import assert from 'node:assert/strict';
import { formatLicenseStatus } from '../src/utils/licenseDisplayUtils';

test('formats permanent pro entitlement as lifetime access', () => {
	const text = formatLicenseStatus({
		active: true,
		plan: 'pro',
		features: ['wechat_upload'],
		expiresAt: '2126-06-11T00:00:00.000Z',
		maxDevices: 1,
		usedDevices: 1,
		deviceBound: true,
	});

	assert.equal(text, 'Pro，永久授权，设备 1/1');
});

test('formats yearly pro entitlement with expiration date', () => {
	const text = formatLicenseStatus({
		active: true,
		plan: 'pro',
		features: ['wechat_upload'],
		expiresAt: '2027-06-11T00:00:00.000Z',
		maxDevices: 1,
		usedDevices: 1,
		deviceBound: true,
	});

	assert.equal(text, 'Pro，有效期至 2027-06-11T00:00:00.000Z，设备 1/1');
});

test('formats free entitlement with server message', () => {
	const text = formatLicenseStatus({
		active: false,
		plan: 'free',
		features: [],
		expiresAt: '',
		message: 'License 不存在',
	});

	assert.equal(text, 'Free，License 不存在');
});
