import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const previewView = readFileSync('src/view/PreviewView.ts', 'utf8');
const settingsTab = readFileSync('src/view/SettingsTab.ts', 'utf8');
const main = readFileSync('src/main.ts', 'utf8');

test('exposes cover upload button in both settings surfaces', () => {
	assert.match(previewView, /上传封面图/);
	assert.match(settingsTab, /上传封面图/);
	assert.match(previewView, /wechat-publisher-upload-cover-button/);
	assert.match(settingsTab, /wechat-publisher-upload-cover-button/);
	assert.match(previewView, /accept\s*=\s*'image\/jpeg,image\/png,image\/gif'/);
	assert.match(settingsTab, /accept\s*=\s*'image\/jpeg,image\/png,image\/gif'/);
});

test('wires cover upload through controller and draft service', () => {
	assert.match(main, /uploadCoverImage\(file\)/);
	assert.match(main, /publisherController\.uploadCoverImage\(file\)/);
	assert.match(main, /WeChatDraftService/);
});
