import test from 'node:test';
import assert from 'node:assert/strict';
import type { MarkdownView, Plugin } from 'obsidian';
import { PublisherController } from '../src/controller/PublisherController';
import { EntitlementService, type EntitlementCache } from '../src/service/EntitlementService';
import type { FormattedWeChatArticle } from '../src/service/WeChatFormatService';
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

	assert.deepEqual(registered.commandIds, ['copy-as-wechat-html', 'preview-wechat-html', 'upload-wechat-draft']);
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

test('rewrites local image sources for preview without changing markdown upload content', async () => {
	let activeView: unknown = null;
	const previewUpdates: Array<{ html: string } | null> = [];
	const uploads: Array<{ markdown: string; html: string; sourcePath?: string }> = [];
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
				return '![本地图](<assets/photo one.png>)\n\n![外链](https://example.com/remote.png)';
			},
			getSelection() {
				return '';
			},
		};
		file = { path: 'posts/note.md' };
	}

	const controller = new PublisherController(
		plugin,
		FakeMarkdownView as unknown as typeof MarkdownView,
		() => ({
			...DEFAULT_SETTINGS,
			wechatAppId: 'APPID',
			wechatAppSecret: 'SECRET',
			wechatThumbMediaId: 'THUMB',
		}),
		undefined,
		(article) => {
			previewUpdates.push(article);
		},
		undefined,
		undefined,
		undefined,
		{
			async uploadDraft(article, markdown, _settings, context) {
				uploads.push({ markdown, html: article.html, sourcePath: context?.sourcePath });
				return { mediaId: 'DRAFT_MEDIA_ID' };
			},
			async uploadCoverImage() {
				return { mediaId: 'COVER_MEDIA_ID', url: '' };
			},
			async uploadAvatarImage() {
				return { url: 'https://mmbiz.qpic.cn/avatar.jpg' };
			},
		},
		undefined,
		{
			resolveResourcePath(src, sourcePath) {
				assert.equal(sourcePath, 'posts/note.md');
				return src === 'assets/photo%20one.png' ? 'app://vault/posts/assets/photo%20one.png' : null;
			},
		},
	);
	controller.register();

	activeView = new FakeMarkdownView();
	commands['preview-wechat-html'].checkCallback(false);
	commands['upload-wechat-draft'].checkCallback(false);
	await Promise.resolve();

	assert.match(previewUpdates[0]?.html ?? '', /src="app:\/\/vault\/posts\/assets\/photo%20one\.png"/);
	assert.match(previewUpdates[0]?.html ?? '', /src="https:\/\/example\.com\/remote\.png"/);
	assert.equal(uploads[0].markdown, '![本地图](<assets/photo one.png>)\n\n![外链](https://example.com/remote.png)');
	assert.match(uploads[0].html, /src="assets\/photo%20one\.png"/);
	assert.equal(uploads[0].sourcePath, 'posts/note.md');
});

test('uploads article images before copying html to clipboard', async () => {
	let activeView: unknown = null;
	const copiedHtml: string[] = [];
	const preparedSources: Array<{ html: string; sourcePath?: string }> = [];
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
				return '![本地图](<assets/photo one.png>)';
			},
			getSelection() {
				return '';
			},
		};
		file = { path: 'posts/note.md' };
	}

	const controller = new PublisherController(
		plugin,
		FakeMarkdownView as unknown as typeof MarkdownView,
		() => ({
			...DEFAULT_SETTINGS,
			wechatAppId: 'APPID',
			wechatAppSecret: 'SECRET',
		}),
		undefined,
		undefined,
		undefined,
		undefined,
		{
			async copyArticle(article: FormattedWeChatArticle) {
				copiedHtml.push(article.html);
			},
		} as never,
		{
			async uploadDraft() {
				throw new Error('should not create draft when copying');
			},
			async prepareArticleImages(article, _settings, context) {
				preparedSources.push({ html: article.html, sourcePath: context?.sourcePath });
				return {
					...article,
					html: article.html.replace('assets/photo%20one.png', 'https://mmbiz.qpic.cn/photo.png'),
				};
			},
			async uploadCoverImage() {
				return { mediaId: 'COVER_MEDIA_ID', url: '' };
			},
			async uploadAvatarImage() {
				return { url: 'https://mmbiz.qpic.cn/avatar.jpg' };
			},
		},
	);
	controller.register();

	activeView = new FakeMarkdownView();
	commands['copy-as-wechat-html'].checkCallback(false);
	await new Promise<void>((resolve) => setImmediate(resolve));

	assert.equal(preparedSources.length, 1);
	assert.equal(preparedSources[0].sourcePath, 'posts/note.md');
	assert.match(preparedSources[0].html, /src="assets\/photo%20one\.png"/);
	assert.equal(copiedHtml.length, 1);
	assert.match(copiedHtml[0], /src="https:\/\/mmbiz\.qpic\.cn\/photo\.png"/);
	assert.equal(copiedHtml[0].includes('assets/photo%20one.png'), false);
});

test('copies html without uploading images when pro entitlement is inactive', async () => {
	let activeView: unknown = null;
	const copiedHtml: string[] = [];
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
				return '![remote](https://example.com/remote.png)\n\n![local](<assets/photo one.png>)';
			},
			getSelection() {
				return '';
			},
		};
		file = { path: 'posts/note.md' };
	}

	const controller = new PublisherController(
		plugin,
		FakeMarkdownView as unknown as typeof MarkdownView,
		() => DEFAULT_SETTINGS,
		undefined,
		undefined,
		undefined,
		undefined,
		{
			async copyArticle(article: FormattedWeChatArticle) {
				copiedHtml.push(article.html);
			},
		} as never,
		{
			async uploadDraft() {
				throw new Error('should not create draft when copying');
			},
			async prepareArticleImages() {
				throw new Error('free copy should not upload images');
			},
			async uploadCoverImage() {
				return { mediaId: 'COVER_MEDIA_ID', url: '' };
			},
			async uploadAvatarImage() {
				return { url: 'https://mmbiz.qpic.cn/avatar.jpg' };
			},
		},
		{
			async ensureFeature() {
				throw new Error('free copy should not require pro');
			},
			async refreshLicense() {
				throw new Error('free copy should not refresh license');
			},
			getCachedStatus() {
				return { active: false, plan: 'free', features: [], expiresAt: '' };
			},
		},
	);
	controller.register();

	activeView = new FakeMarkdownView();
	commands['copy-as-wechat-html'].checkCallback(false);
	await new Promise<void>((resolve) => setImmediate(resolve));

	assert.equal(copiedHtml.length, 1);
	assert.match(copiedHtml[0], /src="https:\/\/example\.com\/remote\.png"/);
	assert.match(copiedHtml[0], /src="assets\/photo%20one\.png"/);
});

test('copies html without uploading images when stale pro cache remains but license key is empty', async () => {
	let activeView: unknown = null;
	const copiedHtml: string[] = [];
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
	const cache: EntitlementCache = {
		plan: 'pro',
		expiresAt: '2026-06-20T00:00:00.000Z',
		checkedAt: '2026-06-16T00:00:00.000Z',
		features: ['wechat_upload'],
	};
	const settings = {
		...DEFAULT_SETTINGS,
		licenseKey: '',
		entitlementCache: cache,
	};
	const entitlementService = new EntitlementService(
		() => settings,
		async () => {},
		{
			async verify() {
				throw new Error('copy should not verify license');
			},
		},
		{
			pluginId: 'kenengba-wechat-publisher',
			pluginVersion: '0.1.1',
			now: () => new Date('2026-06-16T12:00:00.000Z'),
		},
	);

	class FakeMarkdownView {
		editor = {
			getValue() {
				return '![local](<assets/photo one.png>)';
			},
			getSelection() {
				return '';
			},
		};
		file = { path: 'posts/note.md' };
	}

	const controller = new PublisherController(
		plugin,
		FakeMarkdownView as unknown as typeof MarkdownView,
		() => settings,
		undefined,
		undefined,
		undefined,
		undefined,
		{
			async copyArticle(article: FormattedWeChatArticle) {
				copiedHtml.push(article.html);
			},
		} as never,
		{
			async uploadDraft() {
				throw new Error('should not create draft when copying');
			},
			async prepareArticleImages() {
				throw new Error('free copy should ignore stale pro cache');
			},
			async uploadCoverImage() {
				return { mediaId: 'COVER_MEDIA_ID', url: '' };
			},
			async uploadAvatarImage() {
				return { url: 'https://mmbiz.qpic.cn/avatar.jpg' };
			},
		},
		entitlementService,
	);
	controller.register();

	activeView = new FakeMarkdownView();
	commands['copy-as-wechat-html'].checkCallback(false);
	await new Promise<void>((resolve) => setImmediate(resolve));

	assert.equal(copiedHtml.length, 1);
	assert.match(copiedHtml[0], /src="assets\/photo%20one\.png"/);
});

test('preview pane copy uploads images from the last previewed note', async () => {
	let activeView: unknown = null;
	const copiedHtml: string[] = [];
	const preparedSources: Array<{ html: string; sourcePath?: string }> = [];
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
				return '![local](<assets/photo one.png>)\n\nbody';
			},
			getSelection() {
				return 'selection only';
			},
		};
		file = { path: 'posts/note.md' };
	}

	const controller = new PublisherController(
		plugin,
		FakeMarkdownView as unknown as typeof MarkdownView,
		() => ({
			...DEFAULT_SETTINGS,
			wechatAppId: 'APPID',
			wechatAppSecret: 'SECRET',
		}),
		undefined,
		undefined,
		undefined,
		undefined,
		{
			async copyArticle(article: FormattedWeChatArticle) {
				copiedHtml.push(article.html);
			},
		} as never,
		{
			async uploadDraft() {
				throw new Error('should not create draft when copying from preview');
			},
			async prepareArticleImages(article, _settings, context) {
				preparedSources.push({ html: article.html, sourcePath: context?.sourcePath });
				return {
					...article,
					html: article.html.replace('assets/photo%20one.png', 'https://mmbiz.qpic.cn/photo.png'),
				};
			},
			async uploadCoverImage() {
				return { mediaId: 'COVER_MEDIA_ID', url: '' };
			},
			async uploadAvatarImage() {
				return { url: 'https://mmbiz.qpic.cn/avatar.jpg' };
			},
		},
	);
	controller.register();

	activeView = new FakeMarkdownView();
	commands['preview-wechat-html'].checkCallback(false);
	activeView = null;
	await controller.copyPreviewArticle();

	assert.equal(preparedSources.length, 1);
	assert.equal(preparedSources[0].sourcePath, 'posts/note.md');
	assert.match(preparedSources[0].html, /body/);
	assert.match(copiedHtml[0], /src="https:\/\/mmbiz\.qpic\.cn\/photo\.png"/);
	assert.equal(copiedHtml[0].includes('assets/photo%20one.png'), false);
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

test('uploads full current markdown to wechat draft box', () => {
	let activeView: unknown = null;
	const commands: Record<string, { checkCallback: (checking: boolean) => boolean }> = {};
	const uploads: Array<{ markdown: string; html: string }> = [];
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
				return '## 标题\n\n正文';
			},
			getSelection() {
				return '只选中这一句';
			},
		};
	}

	const controller = new PublisherController(
		plugin,
		FakeMarkdownView as unknown as typeof MarkdownView,
		() => ({
			...DEFAULT_SETTINGS,
			wechatAppId: 'APPID',
			wechatAppSecret: 'SECRET',
			wechatThumbMediaId: 'THUMB',
		}),
		undefined,
		undefined,
		undefined,
		undefined,
		undefined,
		{
			async uploadDraft(article, markdown) {
				uploads.push({ markdown, html: article.html });
				return { mediaId: 'DRAFT_MEDIA_ID' };
			},
			async uploadCoverImage() {
				return { mediaId: 'COVER_MEDIA_ID', url: '' };
			},
			async uploadAvatarImage() {
				return { url: 'https://mmbiz.qpic.cn/avatar.jpg' };
			},
		},
	);
	controller.register();

	activeView = new FakeMarkdownView();
	commands['upload-wechat-draft'].checkCallback(false);

	assert.equal(uploads.length, 1);
	assert.equal(uploads[0].markdown, '## 标题\n\n正文');
	assert.match(uploads[0].html, /正文/);
});

test('public draft upload waits for completion and shows success notice', async () => {
	let activeView: unknown = null;
	const notices: string[] = [];
	const plugin = {
		addCommand() {},
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
				return '## 标题\n\n正文';
			},
			getSelection() {
				return '';
			},
		};
		file = { path: 'folder/note.md' };
	}

	const controller = new PublisherController(
		plugin,
		FakeMarkdownView as unknown as typeof MarkdownView,
		() => ({
			...DEFAULT_SETTINGS,
			wechatAppId: 'APPID',
			wechatAppSecret: 'SECRET',
			wechatThumbMediaId: 'THUMB',
		}),
		{
			showSuccess() {},
			showDraftSuccess(mediaId) {
				notices.push(`success:${mediaId}`);
			},
			showCoverSuccess() {},
			showAvatarSuccess() {},
			showEmpty() {},
			showError() {},
			showDraftError(error) {
				notices.push(`error:${error instanceof Error ? error.message : String(error)}`);
			},
			showCoverError() {},
			showAvatarError() {},
		},
		undefined,
		undefined,
		undefined,
		undefined,
		{
			async uploadDraft() {
				return { mediaId: 'DRAFT_MEDIA_ID' };
			},
			async uploadCoverImage() {
				return { mediaId: 'COVER_MEDIA_ID', url: '' };
			},
			async uploadAvatarImage() {
				return { url: 'https://mmbiz.qpic.cn/avatar.jpg' };
			},
		},
	);

	activeView = new FakeMarkdownView();
	const uploadResult = controller.uploadDraft();
	assert.ok(uploadResult instanceof Promise);
	await uploadResult;

	assert.deepEqual(notices, ['success:DRAFT_MEDIA_ID']);
});

test('blocks draft upload when pro entitlement is missing', async () => {
	let activeView: unknown = null;
	const notices: string[] = [];
	let uploadCount = 0;
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
				return '## 标题\n\n正文';
			},
			getSelection() {
				return '';
			},
		};
	}

	const controller = new PublisherController(
		plugin,
		FakeMarkdownView as unknown as typeof MarkdownView,
		() => ({
			...DEFAULT_SETTINGS,
			wechatAppId: 'APPID',
			wechatAppSecret: 'SECRET',
			wechatThumbMediaId: 'THUMB',
		}),
		{
			showSuccess() {},
			showDraftSuccess() {},
			showCoverSuccess() {},
			showAvatarSuccess() {},
			showEmpty() {},
			showError() {},
			showDraftError(error) {
				notices.push(error instanceof Error ? error.message : String(error));
			},
			showCoverError() {},
			showAvatarError() {},
		},
		undefined,
		undefined,
		undefined,
		undefined,
		{
			async uploadDraft() {
				uploadCount += 1;
				return { mediaId: 'DRAFT_MEDIA_ID' };
			},
			async uploadCoverImage() {
				return { mediaId: 'COVER_MEDIA_ID', url: '' };
			},
			async uploadAvatarImage() {
				return { url: 'https://mmbiz.qpic.cn/avatar.jpg' };
			},
		},
		{
			async ensureFeature() {
				throw new Error('需 Pro 授权后可用');
			},
			async refreshLicense() {
				throw new Error('should not refresh');
			},
			getCachedStatus() {
				return { active: false, plan: 'free', features: [], expiresAt: '' };
			},
		},
	);
	controller.register();

	activeView = new FakeMarkdownView();
	commands['upload-wechat-draft'].checkCallback(false);
	await Promise.resolve();

	assert.equal(uploadCount, 0);
	assert.deepEqual(notices, ['需 Pro 授权后可用']);
});

test('allows cover and avatar upload when pro entitlement is active', async () => {
	let checked = 0;
	const controller = new PublisherController(
		{
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
		} as unknown as Plugin,
		class FakeMarkdownView {} as unknown as typeof MarkdownView,
		() => DEFAULT_SETTINGS,
		undefined,
		undefined,
		undefined,
		undefined,
		undefined,
		{
			async uploadDraft() {
				return { mediaId: 'DRAFT_MEDIA_ID' };
			},
			async uploadCoverImage() {
				return { mediaId: 'COVER_MEDIA_ID', url: '' };
			},
			async uploadAvatarImage() {
				return { url: 'https://mmbiz.qpic.cn/avatar.jpg' };
			},
		},
		{
			async ensureFeature(feature) {
				assert.equal(feature, 'wechat_upload');
				checked += 1;
			},
			async refreshLicense() {
				throw new Error('should not refresh');
			},
			getCachedStatus() {
				return { active: true, plan: 'pro', features: ['wechat_upload'], expiresAt: '2026-06-10T00:00:00.000Z' };
			},
		},
	);
	const file = {
		name: 'image.jpg',
		type: 'image/jpeg',
		async arrayBuffer() {
			return new Uint8Array([1, 2, 3]).buffer;
		},
	} as File;

	await controller.uploadCoverImage(file);
	await controller.uploadAvatarImage(file);

	assert.equal(checked, 2);
});
