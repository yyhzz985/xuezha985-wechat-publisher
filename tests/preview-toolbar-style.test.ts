import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const previewView = readFileSync('src/view/PreviewView.ts', 'utf8');
const previewModal = readFileSync('src/view/PreviewModal.ts', 'utf8');
const styles = readFileSync('styles.css', 'utf8');

function cssRule(selector: string): string {
	const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
	const match = styles.match(new RegExp(`${escaped}\\s*\\{([^}]*)\\}`, 'm'));
	assert.ok(match, `missing css rule: ${selector}`);
	return match[1];
}

test('uses icon-only copy buttons in preview surfaces', () => {
	assert.doesNotMatch(previewView, /text:\s*'复制到公众号'/);
	assert.doesNotMatch(previewModal, /text:\s*'复制到公众号'/);
	assert.match(previewView, /wechat-publisher-copy-button/);
	assert.match(previewModal, /wechat-publisher-copy-button/);
	assert.match(previewView, /setIcon\(this\.copyButton,\s*'copy'\)/);
	assert.match(previewModal, /setIcon\(copyButton,\s*'copy'\)/);
});

test('keeps preview toolbar compact until hover', () => {
	const toolbarButton = cssRule('.wechat-publisher-format-button');
	assert.match(toolbarButton, /width:\s*24px/);
	assert.match(toolbarButton, /height:\s*24px/);
	assert.match(toolbarButton, /border:\s*1px solid transparent/);
	assert.match(toolbarButton, /box-shadow:\s*none/);

	const toolbarButtonHover = cssRule('.wechat-publisher-format-button:hover');
	assert.match(toolbarButtonHover, /border-color:\s*var\(--background-modifier-border\)/);
	assert.match(toolbarButtonHover, /box-shadow:\s*0 2px 6px/);

	const iconButton = cssRule('.wechat-publisher-icon-button');
	assert.match(iconButton, /border:\s*1px solid transparent/);
	assert.match(iconButton, /box-shadow:\s*none/);

	const iconButtonHover = cssRule('.wechat-publisher-icon-button:hover');
	assert.match(iconButtonHover, /border-color:\s*var\(--background-modifier-border\)/);
	assert.match(iconButtonHover, /box-shadow:\s*0 2px 6px/);
});
