import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const previewView = readFileSync('src/view/PreviewView.ts', 'utf8');
const settingsTab = readFileSync('src/view/SettingsTab.ts', 'utf8');
const main = readFileSync('src/main.ts', 'utf8');
const settings = readFileSync('src/settings.ts', 'utf8');

test('adds license fields to plugin settings', () => {
	assert.match(settings, /licenseKey:\s*string/);
	assert.match(settings, /licenseServerUrl:\s*string/);
	assert.match(settings, /deviceId:\s*string/);
	assert.match(settings, /entitlementCache:\s*EntitlementCache \| null/);
});

test('shows license controls in both settings surfaces', () => {
	assert.match(previewView, /Pro 授权/);
	assert.match(previewView, /License Key/);
	assert.match(previewView, /授权服务 URL/);
	assert.match(previewView, /校验授权/);
	assert.match(previewView, /授权状态/);
	assert.match(settingsTab, /Pro 授权/);
	assert.match(settingsTab, /License Key/);
	assert.match(settingsTab, /授权服务 URL/);
	assert.match(settingsTab, /校验授权/);
	assert.match(settingsTab, /授权状态/);
});

test('wires license refresh through main and controller', () => {
	assert.match(main, /createLicenseHttpClient/);
	assert.match(main, /publisherController\.refreshLicense/);
	assert.match(main, /publisherController\.getEntitlementStatus/);
});
