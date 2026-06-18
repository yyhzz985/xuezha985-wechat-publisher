import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const manifest = JSON.parse(readFileSync('manifest.json', 'utf8')) as {
	id: string;
	name: string;
	version: string;
	minAppVersion: string;
	isDesktopOnly: boolean;
};
const versions = JSON.parse(readFileSync('versions.json', 'utf8')) as Record<string, string>;
const packageJson = JSON.parse(readFileSync('package.json', 'utf8')) as { scripts: Record<string, string>; license: string };
const packageScript = readFileSync('scripts/package-plugin.ps1', 'utf8');
const verifyScript = readFileSync('scripts/verify-release-assets.ps1', 'utf8');

test('keeps official manifest metadata ready for community review', () => {
	assert.equal(manifest.name, 'Kenengba WeChat Publisher');
	assert.match(manifest.name, /^[\x20-\x7E]+$/);
	assert.doesNotMatch(manifest.name, /\b(Obsidian|Plugin)\b/i);
	assert.equal(manifest.isDesktopOnly, true);
	assert.equal(versions[manifest.version], manifest.minAppVersion);
	assert.equal(packageJson.license, 'MIT');
});

test('verifies release assets as separate files and package zip contents', () => {
	assert.match(packageJson.scripts['verify:release-assets'], /scripts\/verify-release-assets\.ps1/);
	assert.match(packageJson.scripts['package:plugin'], /scripts\/package-plugin\.ps1/);
	assert.match(packageScript, /verify-release-assets\.ps1/);
	for (const asset of ['manifest.json', 'main.js', 'styles.css']) {
		assert.match(verifyScript, new RegExp(asset.replace('.', '\\.')));
	}
	assert.match(verifyScript, /Package zip must contain exactly manifest\.json, main\.js, and styles\.css/);
	assert.match(verifyScript, /separate GitHub Release assets/);
	assert.match(verifyScript, /must not replace the separate manifest\.json, main\.js, and styles\.css assets/);
});
