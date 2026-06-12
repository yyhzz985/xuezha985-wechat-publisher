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
const worker = readFileSync('worker/src/index.ts', 'utf8');
const helpMarkdown = readFileSync('docs/plugin-help.md', 'utf8');
const manifest = JSON.parse(readFileSync('manifest.json', 'utf8')) as { id: string; name: string; author: string };
const packageJson = JSON.parse(readFileSync('package.json', 'utf8')) as { name: string };

test('uses a unique plugin id that does not collide with public wechat publisher plugins', () => {
	assert.equal(manifest.id, 'xuezha985-wechat-publisher');
	assert.equal(manifest.name, '公众号一键排版上传');
	assert.equal(manifest.author, 'xuezha985');
	assert.equal(packageJson.name, 'obsidian-xuezha985-wechat-publisher');
	assert.notEqual(manifest.id, 'wechat-publisher');
	assert.match(previewView, /xuezha985-wechat-publisher-preview/);
	assert.doesNotMatch(previewView, /kenengba-wechat-publisher-preview/);
	assert.doesNotMatch(previewView, /'wechat-publisher-preview'/);
});

test('adds license fields to plugin settings', () => {
	assert.match(settings, /licenseKey:\s*string/);
	assert.match(settings, /licenseServerUrl:\s*string/);
	assert.match(settings, /deviceId:\s*string/);
	assert.match(settings, /entitlementCache:\s*EntitlementCache \| null/);
	assert.match(settings, /DEFAULT_LICENSE_SERVER_URL/);
	assert.doesNotMatch(settings, /DEFAULT_PRO_PURCHASE_URL/);
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
	assert.doesNotMatch(previewView, /购买 Pro/);
	assert.doesNotMatch(settingsTab, /购买 Pro/);
	assert.doesNotMatch(previewView, /addPurchaseProButton/);
	assert.doesNotMatch(settingsTab, /addPurchaseProButton/);
	assert.doesNotMatch(previewView, /授权服务 URL/);
	assert.doesNotMatch(settingsTab, /授权服务 URL/);
	assert.doesNotMatch(previewView, /清空本地存储/);
	assert.doesNotMatch(settingsTab, /清空本地存储/);
	assert.doesNotMatch(previewView, /清空本地设置/);
	assert.doesNotMatch(settingsTab, /清空本地设置/);
	assert.doesNotMatch(main, /请先填写授权服务 URL/);
	assert.doesNotMatch(entitlementService, /请先填写授权服务 URL/);
});

test('wires license refresh and entitlement status through main without purchase page', () => {
	assert.match(main, /createLicenseHttpClient/);
	assert.match(main, /publisherController\.refreshLicense/);
	assert.match(main, /publisherController\.getEntitlementStatus/);
	assert.doesNotMatch(main, /DEFAULT_PRO_PURCHASE_URL/);
	assert.doesNotMatch(main, /openPurchasePage/);
});

test('supports admin license management instead of raw KV issuing only', () => {
	assert.match(issueLicenseScript, /\/v1\/admin\/licenses\/issue/);
	assert.match(issueLicenseScript, /LicenseType/);
	assert.match(issueLicenseScript, /year/);
	assert.match(issueLicenseScript, /lifetime/);
	assert.match(issueLicenseScript, /36500/);
	assert.match(issueLicenseScript, /licenses-\$LicenseType-/);
	assert.match(issueLicenseScript, /licenseType/);
	assert.match(issueLicenseScript, /price/);
	assert.match(issueLicenseScript, /ADMIN_TOKEN/);
	assert.match(issueLicenseScript, /reset-device/);
	assert.match(issueLicenseScript, /disable/);
	assert.match(issueLicenseScript, /extend/);
	assert.doesNotMatch(issueLicenseScript, /kv bulk put/);
});

test('renders the inline help panel from docs/plugin-help.md', () => {
	assert.match(previewView, /helpButton/);
	assert.match(previewView, /circle-help/);
	assert.match(previewView, /wechat-publisher-inline-help/);
	assert.match(previewView, /plugin-help\.md/);
	assert.match(previewView, /MarkdownIt/);
	assert.match(previewView, /linkify:\s*true/);
	assert.match(previewView, /attrSet\('target',\s*'_blank'\)/);
	assert.match(previewView, /attrSet\('rel',\s*'noopener noreferrer'\)/);
	assert.match(helpMarkdown, /可能吧公众号排版器/);
	assert.match(helpMarkdown, /https:\/\/mp\.knb\.im\//);
	assert.match(helpMarkdown, /快速开始/);
	assert.match(helpMarkdown, /支持的语法/);
	assert.match(helpMarkdown, /公众号草稿箱上传/);
	assert.match(helpMarkdown, /Pro 功能与价格/);
	assert.match(helpMarkdown, /19 元/);
	assert.match(helpMarkdown, /58 元/);
	assert.match(helpMarkdown, /237219265/);
	assert.match(helpMarkdown, /https:\/\/developers\.weixin\.qq\.com\/platform/);
	assert.match(helpMarkdown, /https:\/\/myip\.ipip\.net\//);
});

test('disables public purchase endpoints while manual activation is used', () => {
	assert.match(worker, /购买入口暂未开放/);
	assert.doesNotMatch(worker, /renderBuyPage/);
	assert.doesNotMatch(worker, /handleCreateOrder/);
});
