import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const manifest = JSON.parse(readFileSync('manifest.json', 'utf8')) as {
	minAppVersion: string;
};
const readme = readFileSync('README.md', 'utf8');
const previewModal = readFileSync('src/view/PreviewModal.ts', 'utf8');
const previewView = readFileSync('src/view/PreviewView.ts', 'utf8');
const settingsTab = readFileSync('src/view/SettingsTab.ts', 'utf8');

function compareVersions(left: string, right: string): number {
	const leftParts = left.split('.').map(Number);
	const rightParts = right.split('.').map(Number);
	const length = Math.max(leftParts.length, rightParts.length);

	for (let index = 0; index < length; index += 1) {
		const leftPart = leftParts[index] ?? 0;
		const rightPart = rightParts[index] ?? 0;
		if (leftPart !== rightPart) {
			return leftPart - rightPart;
		}
	}

	return 0;
}

test('declares the Obsidian API floor required by preview pane APIs', () => {
	assert.equal(compareVersions(manifest.minAppVersion, '1.7.2') >= 0, true);
});

test('avoids direct innerHTML or outerHTML writes in view code', () => {
	for (const source of [previewModal, previewView]) {
		assert.doesNotMatch(source, /\.(?:innerHTML|outerHTML)\s*=/);
	}
});

test('uses Obsidian Setting headings in the settings tab', () => {
	assert.doesNotMatch(settingsTab, /createEl\('h[1-6]'/);
	assert.match(settingsTab, /\.setHeading\(\)/);
});

test('includes an English README summary for official directory review', () => {
	assert.match(readme, /## English summary/);
	assert.match(readme, /desktop-only Obsidian plugin/);
	assert.match(readme, /WeChat Official Account/);
});
