import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const help = readFileSync('docs/plugin-help.md', 'utf8');
const readme = readFileSync('README.md', 'utf8');
const installGuide = readFileSync('docs/install-guide.md', 'utf8');
const workerReadme = readFileSync('worker/README.md', 'utf8');

test('documents free copy and pro local image handling consistently', () => {
	for (const doc of [help, readme, installGuide]) {
		assert.match(doc, /免费复制/);
		assert.match(doc, /本地图片/);
		assert.match(doc, /AppID/);
		assert.match(doc, /AppSecret/);
	}

	assert.match(help, /免费复制不需要公众号 AppID、AppSecret/);
	assert.match(readme, /免费复制不需要公众号 AppID、AppSecret/);
	assert.match(installGuide, /免费功能可以预览和复制排版 HTML，不需要公众号 AppID \/ AppSecret/);
	assert.match(help, /插件不提供“图片目录配置”作为主方案/);
	assert.match(readme, /插件不提供图片目录配置/);
	assert.match(help, /复制本地图片并自动换成微信图片 URL/);
	assert.match(readme, /复制时自动上传本地图片并替换成微信图片 URL/);
	assert.match(installGuide, /复制时自动上传本地图片并替换成微信图片 URL/);
});

test('documents current package version and license verification plugin id', () => {
	assert.match(readme, /xuezha985-wechat-publisher-0\.1\.1\.zip/);
	assert.match(installGuide, /xuezha985-wechat-publisher-0\.1\.1\.zip/);
	assert.match(workerReadme, /pluginId = "xuezha985-wechat-publisher"/);
	assert.match(workerReadme, /pluginVersion = "0\.1\.1"/);
	assert.doesNotMatch(workerReadme, /pluginId = "wechat-publisher"/);
	assert.doesNotMatch(readme, /免费功能不影响复制排版/);
	assert.doesNotMatch(installGuide, /免费功能不影响复制排版/);
});
