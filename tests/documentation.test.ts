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
	assert.match(readme, /kenengba-wechat-publisher-0\.1\.7\.zip/);
	assert.match(installGuide, /kenengba-wechat-publisher-0\.1\.7\.zip/);
	assert.match(workerReadme, /pluginId = "kenengba-wechat-publisher"/);
	assert.match(workerReadme, /pluginVersion = "0\.1\.7"/);
	assert.doesNotMatch(workerReadme, /pluginId = "wechat-publisher"/);
	assert.doesNotMatch(readme, /免费功能不影响复制排版/);
	assert.doesNotMatch(installGuide, /免费功能不影响复制排版/);
});

test('documents footnotes and spaced custom container markers', () => {
	assert.match(readme, /脚注/);
	assert.match(readme, /:::\s+tip/);
	assert.match(help, /脚注示例/);
	assert.match(help, /:::\s+tip/);
	assert.match(help, /冒号后可以加空格/);
});

test('documents restored markdown rendering details', () => {
	for (const doc of [readme, installGuide]) {
		assert.match(doc, /代码语法高亮/);
		assert.match(doc, /外站链接文字原色且 URL 蓝色/);
		assert.match(doc, /图片说明小字/);
		assert.match(doc, /emoji 短代码/);
	}

	assert.match(help, /Shiki 自动语法高亮/);
	assert.match(help, /文字（蓝色 URL）/);
	assert.match(help, /图片下方小字说明/);
	assert.match(help, /:rocket:/);
});

test('documents desktop-only support and privacy disclosures', () => {
	for (const doc of [help, readme, installGuide]) {
		assert.match(doc, /Obsidian 桌面版/);
		assert.match(doc, /授权服务器/);
		assert.match(doc, /api\.weixin\.qq\.com/);
		assert.match(doc, /文章正文/);
		assert.match(doc, /AppSecret 明文保存在当前 Obsidian 库/);
	}

	assert.match(readme, /isDesktopOnly:\s*true/);
	assert.match(readme, /zip 只用于手动安装，不能替代单独的 `manifest\.json`、`main\.js` 和 `styles\.css`/);
	assert.match(installGuide, /暂不声明支持 iOS 或 Android/);
});
