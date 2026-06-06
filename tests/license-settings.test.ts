import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const previewView = readFileSync('src/view/PreviewView.ts', 'utf8');
const settingsTab = readFileSync('src/view/SettingsTab.ts', 'utf8');
const main = readFileSync('src/main.ts', 'utf8');
const settings = readFileSync('src/settings.ts', 'utf8');
const entitlementService = readFileSync('src/service/EntitlementService.ts', 'utf8');
const issueLicenseScript = readFileSync('worker/scripts/issue-license.ps1', 'utf8');

test('adds license fields to plugin settings', () => {
	assert.match(settings, /licenseKey:\s*string/);
	assert.match(settings, /licenseServerUrl:\s*string/);
	assert.match(settings, /deviceId:\s*string/);
	assert.match(settings, /entitlementCache:\s*EntitlementCache \| null/);
	assert.match(settings, /DEFAULT_LICENSE_SERVER_URL/);
	assert.match(settings, /wechat-publisher-license\.237219265\.workers\.dev\/v1\/licenses\/verify/);
});

test('shows only license key controls in both settings surfaces', () => {
	assert.match(previewView, /Pro 授权/);
	assert.match(previewView, /License Key/);
	assert.doesNotMatch(previewView, /授权服务 URL/);
	assert.match(previewView, /校验授权/);
	assert.match(previewView, /授权状态/);
	assert.match(settingsTab, /Pro 授权/);
	assert.match(settingsTab, /License Key/);
	assert.doesNotMatch(settingsTab, /授权服务 URL/);
	assert.match(settingsTab, /校验授权/);
	assert.match(settingsTab, /授权状态/);
	assert.doesNotMatch(main, /请先填写授权服务 URL/);
	assert.doesNotMatch(entitlementService, /请先填写授权服务 URL/);
});

test('wires license refresh through main and controller', () => {
	assert.match(main, /createLicenseHttpClient/);
	assert.match(main, /publisherController\.refreshLicense/);
	assert.match(main, /publisherController\.getEntitlementStatus/);
});

test('supports batch license issuing for card sellers', () => {
	assert.match(issueLicenseScript, /int\]\$Count = 1/);
	assert.match(issueLicenseScript, /licenses-\$batchId\.csv/);
	assert.match(issueLicenseScript, /kv bulk put/);
	assert.match(issueLicenseScript, /Export-Csv/);
	assert.match(issueLicenseScript, /System\.Text\.UTF8Encoding/);
	assert.match(issueLicenseScript, /ArgumentList \$false/);
});
