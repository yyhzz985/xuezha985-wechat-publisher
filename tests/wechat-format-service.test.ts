import test from 'node:test';
import assert from 'node:assert/strict';
import { WeChatFormatService } from '../src/service/WeChatFormatService';
import { DEFAULT_SETTINGS, LAYOUT_THEME_GROUPS } from '../src/settings';

test('formats note content and removes yaml frontmatter', () => {
	const service = new WeChatFormatService();
	const result = service.format(`---
title: Hidden
---

## 标题

你好Obsidian 2026。
`, {
		...DEFAULT_SETTINGS,
		codeTheme: 'dark',
	});

	assert.equal(result.html.includes('title: Hidden'), false);
	assert.match(result.html, /标题/);
	assert.match(result.html, /你好 Obsidian 2026/);
	assert.match(result.plainText, /你好 Obsidian 2026/);
});

test('renders possible-bar fixed opening module', () => {
	const service = new WeChatFormatService();
	const result = service.format('正文', DEFAULT_SETTINGS);

	assert.match(result.html, /class="wechat-markdown-root"/);
	assert.match(result.html, /class="reading-time"/);
	assert.match(result.html, /reading-time__card-author/);
	assert.match(result.html, /border-right: 1px solid #66CCC5/);
	assert.match(result.html, /<img class="reading-time__avatar" src="https:\/\/xuezha985\.oss-cn-beijing\.aliyuncs\.com\/img\/IMG_6890\.JPG"/);
	assert.equal(result.html.includes('background-image'), false);
	assert.match(result.html, /momo/);
	assert.match(result.html, /读完需要/);
	assert.match(result.html, /速读仅需 1 分钟/);
});

test('renders possible-bar heading styles', () => {
	const service = new WeChatFormatService();
	const result = service.format(`# 顶部大标题

## 第一章

### 第一节

#### 小标题

## 第二章
`, DEFAULT_SETTINGS);

	assert.match(result.html, /<h1 style="margin: 1.6em 8px 1em; color: rgb\(41, 148, 128\); font-size: 22px/);
	assert.match(result.html, /<strong style="color: rgb\(41, 148, 128\); font-weight: 600; margin-right: 8px">\/<\/strong>顶部大标题/);
	assert.match(result.html, /class="h2-progress"[^>]*>1<\/p>/);
	assert.match(result.html, /background: linear-gradient\(to right, rgb\(41, 148, 128\) 50%, rgb\(73, 200, 149\) 50%\)/);
	assert.match(result.html, /class="h2-progress-title"/);
	assert.match(result.html, /class="h3-progress"[^>]*>1\.1<\/p>/);
	assert.match(result.html, /background: linear-gradient\(to right, rgb\(26, 149, 165\), rgb\(38, 198, 218\)\)/);
	assert.match(result.html, /class="h3-progress-title"/);
	assert.match(result.html, /<h4 style="margin: 1.6em 8px 0.6em; color: rgb\(62, 62, 62\); font-size: 17px/);
});

test('applies layout theme and font weight settings', () => {
	const service = new WeChatFormatService();
	const result = service.format('## Section\n\nBody text', {
		...DEFAULT_SETTINGS,
		layoutTheme: 'blue-indigo',
		fontWeight: 'bold',
	});

	assert.match(result.html, /rgb\(32, 91, 195\)/);
	assert.match(result.html, /font-weight: 500/);
	assert.match(result.html, /font-weight: 700/);
});

test('exposes possible-bar theme groups with color previews', () => {
	const themeLabels = LAYOUT_THEME_GROUPS.reduce<string[]>(
		(labels, group) => labels.concat(group.options.map((option) => option.label)),
		[],
	);

	assert.deepEqual(themeLabels, [
		'绿蓝',
		'黑白',
		'蓝靛',
		'红火',
		'桃红',
		'金黄',
		'钢人',
		'小丑',
		'老爷',
		'洛基',
		'小虫',
		'毒藤',
	]);
	assert.equal(LAYOUT_THEME_GROUPS[0].label, '颜色');
	assert.equal(LAYOUT_THEME_GROUPS[1].label, '超英');
	assert.equal(LAYOUT_THEME_GROUPS[0].options[0].swatch, 'linear-gradient(to right, rgb(41, 148, 128), rgb(73, 200, 149))');
});

test('applies possible-bar red theme colors', () => {
	const service = new WeChatFormatService();
	const result = service.format('## Section\n\nBody text', {
		...DEFAULT_SETTINGS,
		layoutTheme: 'red',
	});

	assert.match(result.html, /rgb\(187, 30, 30\)/);
	assert.match(result.html, /rgb\(255, 73, 73\)/);
});

test('switches h2 and h3 subheading markers', () => {
	const service = new WeChatFormatService();
	const withNumber = service.format('## First\n\n### Subheading\n\n## Second', {
		...DEFAULT_SETTINGS,
		subheadingStyle: 'number',
	});
	const withoutNumber = service.format('## First\n\n### Subheading\n\n## Second', {
		...DEFAULT_SETTINGS,
		subheadingStyle: 'none',
	});
	const withEye = service.format('## First\n\n### Subheading\n\n## Second', {
		...DEFAULT_SETTINGS,
		subheadingStyle: 'eye',
	});

	assert.match(withNumber.html, /class="h2-progress"[^>]*>1<\/p>/);
	assert.match(withNumber.html, /class="h3-progress"[^>]*>1\.1<\/p>/);
	assert.equal(withoutNumber.html.includes('class="h3-progress"'), false);
	assert.equal(withoutNumber.html.includes('class="h2-progress"'), false);
	assert.equal(withoutNumber.html.includes('class="h2-eye-marker"'), false);
	assert.equal(withoutNumber.html.includes('>1.1</p>'), false);
	assert.equal(withoutNumber.html.includes('>1</p>'), false);
	assert.match(withoutNumber.html, /background: linear-gradient\(to right, rgb\(41, 148, 128\) 50%, rgb\(73, 200, 149\) 50%\)/);
	assert.match(withoutNumber.html, /background: linear-gradient\(to right, rgb\(26, 149, 165\), rgb\(38, 198, 218\)\)/);
	assert.match(withEye.html, /class="h2-eye-marker"/);
	assert.match(withEye.html, /&#128064;/);
	assert.match(withEye.html, /width: 50%/);
	assert.equal(withEye.html.includes('class="h2-progress"'), false);
	assert.equal(withEye.html.includes('class="h3-progress"'), false);
	assert.equal(withEye.html.includes('class="h3-eye-marker"'), false);
	assert.match(withEye.html, /background: linear-gradient\(to right, rgb\(41, 148, 128\) 50%, rgb\(73, 200, 149\) 50%\)/);
	assert.match(withEye.html, /background: linear-gradient\(to right, rgb\(26, 149, 165\), rgb\(38, 198, 218\)\)/);
	assert.equal(withEye.html.includes('class="h3-eye-title"'), false);
});

test('keeps wechat links and rewrites external links', () => {
	const service = new WeChatFormatService();
	const result = service.format(
		`[内链](https://mp.weixin.qq.com/s/example) 和 [外链](https://example.com/path)。

原始外链 https://mp.knb.im/ 也要突出显示。`,
		DEFAULT_SETTINGS,
	);

	assert.match(result.html, /href="https:\/\/mp\.weixin\.qq\.com\/s\/example"/);
	assert.equal(result.html.includes('href="https://example.com/path"'), false);
	assert.match(result.html, /class="knb-external-link-text" style="color: inherit; text-decoration: none;"/);
	assert.equal(result.html.includes('class="knb-external-link-text" style="color: #2f63b7'), false);
	assert.match(result.html, /class="knb-external-link-url" style="color: #2f63b7/);
	assert.match(result.html, /https:\/\/example\.com\/path/);
	assert.match(result.html, /https:\/\/mp\.knb\.im\//);
});

test('adds reading meta when enabled', () => {
	const service = new WeChatFormatService();
	const result = service.format('# 正文\n\n内容', {
		...DEFAULT_SETTINGS,
		authorName: '阿禅',
		avatarUrl: 'https://example.com/avatar.png',
		showReadingTime: true,
	});

	assert.match(result.html, /阿禅/);
	assert.match(result.html, /<img class="reading-time__avatar" src="https:\/\/example\.com\/avatar\.png" alt="阿禅"/);
	assert.match(result.html, /object-fit: cover/);
	assert.match(result.html, /分钟/);
});

test('escapes fenced code block html', () => {
	const service = new WeChatFormatService();
	const result = service.format('```html\n<div>hi</div>\n```', DEFAULT_SETTINGS);

	assert.equal(result.html.includes('<div>hi</div>'), false);
	assert.match(result.html, /&lt;/);
	assert.match(result.html, /&gt;hi&lt;\//);
});

test('renders fenced code blocks with horizontal scrolling and line numbers', () => {
	const service = new WeChatFormatService();
	const result = service.format(`\`\`\`
my-app/
├── public/                         # 静态资源（图片、字体等），URL 直接访问
├── src/                            # 源代码（推荐放这里）
\`\`\`
`, {
		...DEFAULT_SETTINGS,
		codeTheme: 'dark',
	});

	assert.match(result.html, /<section class="shiki github-dark"/);
	assert.match(result.html, /overflow-x: scroll/);
	assert.match(result.html, /tabindex="0"/);
	assert.match(result.html, /font-size: 13px/);
	assert.match(result.html, /line-height: 19px/);
	assert.match(result.html, /letter-spacing: 0/);
	assert.match(result.html, /white-space: nowrap/);
	assert.match(result.html, /width: \d+px/);
	assert.match(result.html, /min-width: 100%/);
	assert.match(result.html, /word-break: keep-all/);
	assert.match(result.html, /class="code-scroll-area"/);
	assert.equal(result.html.includes('class="code-scrollbar-track"'), false);
	assert.equal(result.html.includes('class="code-scrollbar-thumb"'), false);
	assert.match(result.html, /class="code-line-number"[^>]*>1<\/span>/);
	assert.match(result.html, /class="code-line-content"[^>]*>my-app\//);
	assert.match(result.html, /class="code-line-number"[^>]*>2<\/span>/);
	assert.match(result.html, /public\//);
	assert.equal(result.html.includes('class="line-no"'), false);
	assert.equal(result.html.includes('display: inline-block; min-width: max-content'), false);
});

test('renders shiki syntax highlighting for fenced code blocks', () => {
	const service = new WeChatFormatService();
	const result = service.format(`\`\`\`js
function greet(name) {
  return \`Hello, ${'${name}'}!\`
}

console.log(greet('世界'))
\`\`\`
`, {
		...DEFAULT_SETTINGS,
		codeTheme: 'dark',
	});

	assert.match(result.html, /class="shiki github-dark"/);
	assert.match(result.html, /class="code-line-number"/);
	assert.match(result.html, /style="color:#F97583">function<\/span>/);
	assert.match(result.html, /style="color:#B392F0">greet<\/span>/);
	assert.match(result.html, /console\./);
});

test('renders obsidian image embeds as article images', () => {
	const service = new WeChatFormatService();
	const result = service.format('![[attachments/photo one.png|封面图]]', DEFAULT_SETTINGS);

	assert.match(result.html, /<img src="attachments\/photo%20one\.png" alt="封面图"/);
});

test('renders image captions below markdown images', () => {
	const service = new WeChatFormatService();
	const result = service.format('![一张示例图片](https://mp.knb.im/light.jpg)', DEFAULT_SETTINGS);

	assert.match(result.html, /class="knb-image-figure"/);
	assert.match(result.html, /<img src="https:\/\/mp\.knb\.im\/light\.jpg" alt="一张示例图片"/);
	assert.match(result.html, /class="knb-image-caption"/);
	assert.match(result.html, /font-size: 13px/);
	assert.match(result.html, />一张示例图片<\/p>/);
});

test('renders knb special containers', () => {
	const service = new WeChatFormatService();
	const result = service.format(`:::intro
这是一段摘要。
:::

:::highlight
这是一句金句。
:::

:::warning
注意这里。
:::

:::say
这里是一段独白。
:::

:::chat
阿禅: 第一句
朋友: 回复
阿禅: 第二句
朋友1: 回复
朋友1: 再回复
:::
`, DEFAULT_SETTINGS);

	assert.match(result.html, /container-intro/);
	assert.match(result.html, /border-top: 1px dashed rgb\(41, 148, 128\)/);
	assert.match(result.html, /这是一段摘要/);
	assert.match(result.html, /knb-highlight/);
	assert.match(result.html, /class="knb-highlight-quote-left"/);
	assert.match(result.html, /class="knb-highlight-text"/);
	assert.match(result.html, /这是一句金句/);
	assert.match(result.html, /knb-callout/);
	assert.match(result.html, /border: 1px solid #66CCC5/);
	assert.match(result.html, /border-radius: 8px/);
	assert.match(result.html, /knb-callout-warning/);
	assert.match(result.html, /knb-callout-say/);
	assert.match(result.html, /💬 说/);
	assert.match(result.html, /注意/);
	assert.match(result.html, /class="knb-chat-speaker"/);
	assert.match(result.html, /class="knb-chat-icon knb-chat-icon-0"/);
	assert.match(result.html, /class="knb-chat-icon knb-chat-icon-1"/);
	assert.match(result.html, />💬<\/span>/);
	assert.match(result.html, />🗨️<\/span>/);
	assert.match(result.html, /阿禅/);
	assert.match(result.html, /朋友/);
	assert.match(result.html, /朋友 1/);
	assert.equal((result.html.match(/>💬<\/span>/g) ?? []).length, 4);
	assert.equal((result.html.match(/>🗨️<\/span>/g) ?? []).length, 1);
});

test('renders knb special containers with a space after marker', () => {
	const service = new WeChatFormatService();
	const result = service.format(`::: tip
这是一段提示。
:::
`, DEFAULT_SETTINGS);

	assert.equal(result.html.includes('::: tip'), false);
	assert.match(result.html, /knb-callout-tip/);
	assert.match(result.html, /💡 提示/);
	assert.match(result.html, /这是一段提示/);
});

test('renders footnotes as endnotes', () => {
	const service = new WeChatFormatService();
	const result = service.format(`正文里引用脚注[^1]。

[^1]: 这是脚注内容。
`, DEFAULT_SETTINGS);

	assert.equal(result.html.includes('[^1]'), false);
	assert.equal(result.html.includes('[^1]:'), false);
	assert.match(result.html, /class="knb-footnote-ref"/);
	assert.match(result.html, /class="knb-footnotes"/);
	assert.match(result.html, /<span class="knb-footnote-index"/);
	assert.match(result.html, /class="knb-footnotes"[^>]*border-top: 1px solid/);
	assert.equal(result.html.includes('class="knb-footnotes" style="margin: 1.8em 8px 0; padding-top: 0.75em; border-top: 1px dashed'), false);
	assert.match(result.html, /这是脚注内容/);
});

test('renders horizontal rules as thin solid separators', () => {
	const service = new WeChatFormatService();
	const result = service.format('正文\n\n---\n\n继续', DEFAULT_SETTINGS);

	assert.match(result.html, /<hr style="[^"]*border-top: 1px solid/);
	assert.equal(result.html.includes('border-top: 1px dashed'), false);
});

test('keeps markdown tables inside article margins', () => {
	const service = new WeChatFormatService();
	const result = service.format(`| 文件 | 作用 |
| --- | --- |
| \`next.config.ts\` | Next.js 开关总控——图片域名、重定向、环境变量等 |
| \`tsconfig.json\` | TS 编译规则——路径别名（@/）、严格模式 |
`, DEFAULT_SETTINGS);

	assert.match(result.html, /class="knb-table-wrap"/);
	assert.match(result.html, /margin: 1.2em 8px/);
	assert.match(result.html, /box-sizing: border-box/);
	assert.match(result.html, /table-layout: fixed/);
	assert.match(result.html, /overflow-wrap: anywhere/);
	assert.match(result.html, /word-break: break-word/);
});

test('renders toc marker from h2 headings', () => {
	const service = new WeChatFormatService();
	const result = service.format(`[TOC]

## 第一章
内容

## 第二章
更多内容
`, DEFAULT_SETTINGS);

	assert.match(result.html, /knb-toc/);
	assert.match(result.html, /全文导航/);
	assert.match(result.html, /class="knb-toc-index"/);
	assert.match(result.html, /class="knb-toc-track"/);
	assert.match(result.html, /class="knb-toc-fill"/);
	assert.match(result.html, /<section class="knb-toc-fill"[^>]*width:\d+%;[^>]*>&nbsp;<\/section>/);
	assert.equal(result.html.includes('<span class="knb-toc-fill"'), false);
	assert.match(result.html, /第一章/);
	assert.match(result.html, /第二章/);
	assert.equal(result.html.includes('字</span>'), false);
});

test('renders knb inline extensions and task list', () => {
	const service = new WeChatFormatService();
	const result = service.format(`普通段落有==高亮==、++下划线++、H~2~O 和 x^2^。

- [x] 已完成
- [ ] 待办
`, DEFAULT_SETTINGS);

	assert.match(result.html, /<mark/);
	assert.match(result.html, /<u/);
	assert.match(result.html, /<sub/);
	assert.match(result.html, /<sup/);
	assert.match(result.html, /✅/);
	assert.match(result.html, /⬜/);
});

test('renders emoji shortcodes', () => {
	const service = new WeChatFormatService();
	const result = service.format('写文章可以用 emoji 短代码： :smile: :rocket: :sparkles: :tada: :star:', DEFAULT_SETTINGS);

	assert.doesNotMatch(result.html, /:smile:/);
	assert.match(result.html, /😄|😃|😊/);
	assert.match(result.html, /🚀/);
	assert.match(result.html, /✨/);
	assert.match(result.html, /🎉/);
	assert.match(result.html, /⭐/);
});
