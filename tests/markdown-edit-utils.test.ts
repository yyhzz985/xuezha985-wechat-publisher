import test from 'node:test';
import assert from 'node:assert/strict';
import { formatMarkdownSelection } from '../src/utils/markdownEditUtils';

test('formats selected markdown text for toolbar actions', () => {
	assert.equal(formatMarkdownSelection('h2', '标题'), '## 标题');
	assert.equal(formatMarkdownSelection('bold', '重点'), '**重点**');
	assert.equal(formatMarkdownSelection('quote', '第一行\n第二行'), '> 第一行\n> 第二行');
	assert.equal(formatMarkdownSelection('intro', '摘要'), ':::intro\n摘要\n:::');
});

test('uses practical snippets when toolbar actions have no selection', () => {
	assert.equal(formatMarkdownSelection('h3', ''), '### 三级标题');
	assert.equal(formatMarkdownSelection('link', ''), '[链接文字](https://)');
	assert.equal(formatMarkdownSelection('codeBlock', ''), '```\n代码\n```');
});
