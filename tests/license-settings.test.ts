import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const previewView = readFileSync('src/view/PreviewView.ts', 'utf8');
const settingsTab = readFileSync('src/view/SettingsTab.ts', 'utf8');
const main = readFileSync('src/main.ts', 'utf8');
const settings = readFileSync('src/settings.ts', 'utf8');
const styleUtils = readFileSync('src/utils/styleUtils.ts', 'utf8');
const entitlementService = readFileSync('src/service/EntitlementService.ts', 'utf8');
const issueLicenseScript = readFileSync('worker/scripts/issue-license.ps1', 'utf8');

test('adds license fields to plugin settings', () => {
	assert.match(settings, /licenseKey:\s*string/);
	assert.match(settings, /licenseServerUrl:\s*string/);
	assert.match(settings, /deviceId:\s*string/);
	assert.match(settings, /entitlementCache:\s*EntitlementCache \| null/);
	assert.match(settings, /DEFAULT_LICENSE_SERVER_URL/);
	assert.match(settings, /DEFAULT_PRO_PURCHASE_URL/);
	assert.match(settings, /wechat-publisher-license\.237219265\.workers\.dev\/v1\/licenses\/verify/);
	assert.match(settings, /maxDevices\?:\s*number/);
	assert.match(settings, /usedDevices\?:\s*number/);
	assert.match(settings, /deviceBound\?:\s*boolean/);
	assert.match(settings, /IMG_6890\.JPG/);
	assert.match(styleUtils, /IMG_6890\.JPG/);
});

test('shows pro license controls without dangerous local storage clearing', () => {
	assert.match(previewView, /License Key/);
	assert.match(settingsTab, /License Key/);
	assert.match(previewView, /购买 Pro/);
	assert.match(settingsTab, /购买 Pro/);
	assert.match(previewView, /addPurchaseProButton/);
	assert.match(settingsTab, /addPurchaseProButton/);
	assert.doesNotMatch(previewView, /授权服务 URL/);
	assert.doesNotMatch(settingsTab, /授权服务 URL/);
	assert.doesNotMatch(previewView, /清空本地存储/);
	assert.doesNotMatch(settingsTab, /清空本地存储/);
	assert.doesNotMatch(previewView, /清空本地设置/);
	assert.doesNotMatch(settingsTab, /清空本地设置/);
	assert.doesNotMatch(main, /请先填写授权服务 URL/);
	assert.doesNotMatch(entitlementService, /请先填写授权服务 URL/);
});

test('wires license refresh, purchase url, and entitlement status through main', () => {
	assert.match(main, /createLicenseHttpClient/);
	assert.match(main, /publisherController\.refreshLicense/);
	assert.match(main, /publisherController\.getEntitlementStatus/);
	assert.match(main, /DEFAULT_PRO_PURCHASE_URL/);
	assert.match(main, /openPurchasePage/);
});

test('supports admin license management instead of raw KV issuing only', () => {
	assert.match(issueLicenseScript, /\/v1\/admin\/licenses\/issue/);
	assert.match(issueLicenseScript, /ADMIN_TOKEN/);
	assert.match(issueLicenseScript, /reset-device/);
	assert.match(issueLicenseScript, /disable/);
	assert.match(issueLicenseScript, /extend/);
	assert.doesNotMatch(issueLicenseScript, /kv bulk put/);
});
