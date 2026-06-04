import test from 'node:test';
import assert from 'node:assert/strict';
import type { MarkdownView, Plugin } from 'obsidian';
import { PublisherController } from '../src/controller/PublisherController';
import { DEFAULT_SETTINGS } from '../src/settings';

test('registers command and ribbon icon for previewing wechat html', () => {
	const registered: { commandIds: string[]; eventNames: string[]; ribbonIcon?: string; ribbonTitle?: string } = {
		commandIds: [],
		eventNames: [],
	};
	const plugin = {
		addCommand(command: { id: string }) {
			registered.commandIds.push(command.id);
		},
		addRibbonIcon(icon: string, title: string) {
			registered.ribbonIcon = icon;
			registered.ribbonTitle = title;
		},
		registerEvent() {},
		app: {
			workspace: {
				on(name: string) {
					registered.eventNames.push(name);
					return {};
				},
			},
		},
	} as unknown as Plugin;

	class FakeMarkdownView {}

	new PublisherController(
		plugin,
		FakeMarkdownView as unknown as typeof MarkdownView,
		() => DEFAULT_SETTINGS,
	).register();

	assert.deepEqual(registered.commandIds, ['copy-as-wechat-html', 'preview-wechat-html']);
	assert.deepEqual(registered.eventNames, ['editor-change', 'active-leaf-change']);
	assert.equal(registered.ribbonIcon, 'panel-right-open');
	assert.equal(registered.ribbonTitle, '打开公众号实时预览');
});

test('keeps preview content when focus moves away from markdown view', () => {
	const previewUpdates: unknown[] = [];
	const plugin = {
		addCommand() {},
		addRibbonIcon() {},
		registerEvent() {},
		app: {
			workspace: {
				getActiveViewOfType() {
					return null;
				},
				on() {
					return {};
				},
			},
		},
	} as unknown as Plugin;

	class FakeMarkdownView {}

	const controller = new PublisherController(
		plugin,
		FakeMarkdownView as unknown as typeof MarkdownView,
		() => DEFAULT_SETTINGS,
		undefined,
		(article) => {
			previewUpdates.push(article);
		},
		() => true,
	);

	controller.refreshPreviewFromActiveView();

	assert.equal(previewUpdates.length, 0);
});

test('refreshes the last previewed markdown when settings change after focus leaves editor', () => {
	let activeView: unknown = null;
	const previewUpdates: Array<{ html: string } | null> = [];
	const commands: Record<string, { checkCallback: (checking: boolean) => boolean }> = {};
	const plugin = {
		addCommand(command: { id: string; checkCallback: (checking: boolean) => boolean }) {
			commands[command.id] = command;
		},
		addRibbonIcon() {},
		registerEvent() {},
		app: {
			workspace: {
				getActiveViewOfType() {
					return activeView;
				},
				on() {
					return {};
				},
			},
		},
	} as unknown as Plugin;

	class FakeMarkdownView {
		editor = {
			getValue() {
				return '## Section';
			},
			getSelection() {
				return '';
			},
		};
	}

	let settings = DEFAULT_SETTINGS;
	const controller = new PublisherController(
		plugin,
		FakeMarkdownView as unknown as typeof MarkdownView,
		() => settings,
		undefined,
		(article) => {
			previewUpdates.push(article);
		},
		() => true,
	);
	controller.register();

	activeView = new FakeMarkdownView();
	commands['preview-wechat-html'].checkCallback(false);
	activeView = null;
	settings = { ...DEFAULT_SETTINGS, layoutTheme: 'red' };
	controller.refreshPreviewFromActiveView();

	assert.equal(previewUpdates.length, 2);
	assert.match(previewUpdates[1]?.html ?? '', /rgb\(187, 30, 30\)/);
});

test('applies toolbar formatting to the last previewed markdown editor', () => {
	let activeView: unknown = null;
	const commands: Record<string, { checkCallback: (checking: boolean) => boolean }> = {};
	const plugin = {
		addCommand(command: { id: string; checkCallback: (checking: boolean) => boolean }) {
			commands[command.id] = command;
		},
		addRibbonIcon() {},
		registerEvent() {},
		app: {
			workspace: {
				getActiveViewOfType() {
					return activeView;
				},
				on() {
					return {};
				},
			},
		},
	} as unknown as Plugin;

	class FakeMarkdownView {
		editor = {
			selection: '重点',
			replaced: '',
			getValue() {
				return '重点';
			},
			getSelection() {
				return this.selection;
			},
			replaceSelection(value: string) {
				this.replaced = value;
			},
			focus() {},
		};
	}

	const view = new FakeMarkdownView();
	const controller = new PublisherController(
		plugin,
		FakeMarkdownView as unknown as typeof MarkdownView,
		() => DEFAULT_SETTINGS,
	);
	controller.register();

	activeView = view;
	commands['preview-wechat-html'].checkCallback(false);
	activeView = null;
	controller.applyFormat('bold');

	assert.equal(view.editor.replaced, '**重点**');
});
