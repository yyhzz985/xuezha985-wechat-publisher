import { ItemView, setIcon, type WorkspaceLeaf } from 'obsidian';
import {
	CODE_THEME_OPTIONS,
	DEFAULT_SETTINGS,
	FONT_WEIGHT_OPTIONS,
	LAYOUT_THEME_GROUPS,
	LAYOUT_THEME_OPTIONS,
	SUBHEADING_STYLE_OPTIONS,
	type CodeTheme,
	type FontWeight,
	type LayoutTheme,
	type PluginSettings,
	type SubheadingStyle,
} from '../settings';
import type { ClipboardService } from '../service/ClipboardService';
import type { EntitlementStatus } from '../service/EntitlementService';
import type { FormattedWeChatArticle } from '../service/WeChatFormatService';
import { formatLicenseStatus } from '../utils/licenseDisplayUtils';
import type { MarkdownFormatAction } from '../utils/markdownEditUtils';
import type { NoticeView } from './NoticeView';

export const VIEW_TYPE_WECHAT_PUBLISHER_PREVIEW = 'xuezha985-wechat-publisher-preview';

interface FormatTool {
	action: MarkdownFormatAction;
	label: string;
	title: string;
	icon?: string;
}

type HelpItem = string | {
	text: string;
	href: string;
};

const BASIC_FORMAT_TOOLS: FormatTool[] = [
	{ action: 'h1', label: 'H1', title: '一级标题' },
	{ action: 'h2', label: 'H2', title: '二级标题' },
	{ action: 'h3', label: 'H3', title: '三级标题' },
	{ action: 'h4', label: 'H4', title: '四级标题' },
	{ action: 'bold', label: 'B', title: '加粗', icon: 'bold' },
	{ action: 'inlineCode', label: '<>', title: '行内代码', icon: 'code-2' },
	{ action: 'bulletList', label: '', title: '无序列表', icon: 'list' },
	{ action: 'orderedList', label: '', title: '有序列表', icon: 'list-ordered' },
	{ action: 'link', label: '', title: '链接', icon: 'link' },
	{ action: 'image', label: '', title: '图片', icon: 'image' },
	{ action: 'quote', label: '', title: '引用', icon: 'quote' },
	{ action: 'codeBlock', label: '', title: '代码块', icon: 'file-code' },
];

const SPECIAL_FORMAT_TOOLS: FormatTool[] = [
	{ action: 'toc', label: '', title: '全能导航', icon: 'map' },
	{ action: 'intro', label: '', title: '摘要', icon: 'book-open' },
	{ action: 'highlight', label: '', title: '高亮', icon: 'sparkles' },
	{ action: 'tip', label: '', title: '提示', icon: 'lightbulb' },
	{ action: 'info', label: '', title: '说明', icon: 'info' },
	{ action: 'note', label: '', title: '笔记', icon: 'file-text' },
	{ action: 'warning', label: '', title: '注意', icon: 'triangle-alert' },
	{ action: 'danger', label: '', title: '危险', icon: 'ban' },
	{ action: 'say', label: '', title: '想说的话', icon: 'message-square' },
	{ action: 'chat', label: '', title: '对话', icon: 'messages-square' },
];

export class WeChatPublisherPreviewView extends ItemView {
	private article: FormattedWeChatArticle | null = null;
	private articleEl!: HTMLElement;
	private emptyEl!: HTMLElement;
	private copyButton!: HTMLButtonElement;
	private syncButton!: HTMLButtonElement;
	private settingsButton!: HTMLButtonElement;
	private helpButton!: HTMLButtonElement;
	private settingsPanel!: HTMLElement;
	private helpPanel!: HTMLElement;
	private activePanel: 'settings' | 'help' | null = null;
	private isThemeDropdownOpen = false;

	constructor(
		leaf: WorkspaceLeaf,
		private readonly clipboardService: ClipboardService,
		private readonly noticeView: NoticeView,
		private readonly getSettings: () => PluginSettings,
		private readonly saveSettings: (settings: PluginSettings) => Promise<void>,
		private readonly applyFormat: (action: MarkdownFormatAction) => void = () => {},
		private readonly uploadDraft: () => Promise<void> = async () => {},
		private readonly uploadCoverImage: (file: File) => Promise<{ mediaId: string; url: string }> = async () => {
			throw new Error('未配置封面图上传服务');
		},
		private readonly uploadAvatarImage: (file: File) => Promise<{ url: string }> = async () => {
			throw new Error('未配置头像图上传服务');
		},
		private readonly refreshLicense: () => Promise<EntitlementStatus> = async () => ({
			active: false,
			plan: 'free',
			features: [],
			expiresAt: '',
		}),
		private readonly getEntitlementStatus: () => EntitlementStatus = () => ({
			active: false,
			plan: 'free',
			features: [],
			expiresAt: '',
		}),
	) {
		super(leaf);
		this.navigation = false;
	}

	getViewType(): string {
		return VIEW_TYPE_WECHAT_PUBLISHER_PREVIEW;
	}

	getDisplayText(): string {
		return '公众号实时预览';
	}

	getIcon(): string {
		return 'panel-right-open';
	}

	async onOpen(): Promise<void> {
		this.contentEl.empty();
		this.contentEl.addClass('wechat-publisher-preview-view');

		const header = this.contentEl.createDiv({ cls: 'wechat-publisher-preview-header' });
		header.createEl('h2', { text: '公众号预览' });
		const actions = header.createDiv({ cls: 'wechat-publisher-preview-actions' });

		this.copyButton = actions.createEl('button', {
			cls: 'wechat-publisher-icon-button wechat-publisher-copy-button',
			attr: {
				'aria-label': '复制到公众号',
			},
		}) as HTMLButtonElement;
		this.copyButton.type = 'button';
		setIcon(this.copyButton, 'copy');
		this.copyButton.addEventListener('click', () => {
			void this.copy();
		});

		this.syncButton = actions.createEl('button', {
			cls: 'wechat-publisher-icon-button',
			attr: {
				'aria-label': '上传到公众号草稿箱',
			},
		}) as HTMLButtonElement;
		this.syncButton.type = 'button';
		setIcon(this.syncButton, 'upload-cloud');
		this.syncButton.addEventListener('click', () => {
			void this.uploadDraftFromButton();
		});

		this.settingsButton = actions.createEl('button', {
			cls: 'wechat-publisher-icon-button',
			attr: {
				'aria-label': '设置',
			},
		}) as HTMLButtonElement;
		this.settingsButton.type = 'button';
		setIcon(this.settingsButton, 'settings');
		this.settingsButton.addEventListener('click', () => {
			this.setActivePanel(this.activePanel === 'settings' ? null : 'settings');
		});

		this.helpButton = actions.createEl('button', {
			cls: 'wechat-publisher-icon-button',
			attr: {
				'aria-label': '帮助',
			},
		}) as HTMLButtonElement;
		this.helpButton.type = 'button';
		setIcon(this.helpButton, 'circle-help');
		this.helpButton.addEventListener('click', () => {
			this.setActivePanel(this.activePanel === 'help' ? null : 'help');
		});

		const toolbar = this.contentEl.createDiv({ cls: 'wechat-publisher-format-toolbar' });
		this.renderFormatToolbar(toolbar);

		const body = this.contentEl.createDiv({ cls: 'wechat-publisher-preview-body' });
		const shell = body.createDiv({ cls: 'wechat-publisher-phone-shell' });
		this.emptyEl = shell.createDiv({
			cls: 'wechat-publisher-preview-empty',
			text: '暂无可预览内容',
		});
		this.articleEl = shell.createDiv({ cls: 'wechat-publisher-phone-article' });
		this.settingsPanel = body.createDiv({ cls: 'wechat-publisher-inline-settings' });
		this.helpPanel = body.createDiv({ cls: 'wechat-publisher-inline-help' });

		this.renderSettingsPanel();
		this.renderHelpPanel();
		this.setActivePanel(null);
		this.renderArticle();
	}

	private renderFormatToolbar(toolbar: HTMLElement): void {
		this.renderFormatToolbarRow(toolbar, '基础格式', BASIC_FORMAT_TOOLS);
		this.renderFormatToolbarRow(toolbar, '专有格式', SPECIAL_FORMAT_TOOLS);
	}

	private renderFormatToolbarRow(toolbar: HTMLElement, label: string, tools: FormatTool[]): void {
		const row = toolbar.createDiv({ cls: 'wechat-publisher-format-toolbar-row' });
		row.createSpan({ cls: 'wechat-publisher-format-toolbar-label', text: label });

		tools.forEach((tool) => {
			const button = row.createEl('button', {
				cls: 'wechat-publisher-format-button',
				attr: {
					'aria-label': tool.title,
				},
			});
			button.type = 'button';
			if (tool.icon) {
				setIcon(button, tool.icon);
			} else {
				button.setText(tool.label);
			}
			button.addEventListener('click', () => {
				this.applyFormat(tool.action);
			});
		});
	}

	async onClose(): Promise<void> {
		this.contentEl.empty();
	}

	updateArticle(article: FormattedWeChatArticle | null): void {
		this.article = article;
		this.renderArticle();
	}

	private renderArticle(): void {
		if (!this.articleEl || !this.emptyEl || !this.copyButton || !this.syncButton) {
			return;
		}

		if (!this.article) {
			this.copyButton.disabled = true;
			this.syncButton.disabled = true;
			this.articleEl.empty();
			this.articleEl.hide();
			this.emptyEl.show();
			return;
		}

		this.copyButton.disabled = false;
		this.syncButton.disabled = false;
		this.emptyEl.hide();
		this.articleEl.show();
		this.articleEl.innerHTML = this.article.html;
	}

	private setActivePanel(panel: 'settings' | 'help' | null): void {
		this.activePanel = panel;
		this.contentEl.toggleClass('is-settings-open', panel === 'settings');
		this.contentEl.toggleClass('is-help-open', panel === 'help');
		this.settingsButton.toggleClass('is-active', panel === 'settings');
		this.helpButton.toggleClass('is-active', panel === 'help');
		this.settingsPanel.toggle(panel === 'settings');
		this.helpPanel.toggle(panel === 'help');
	}

	private renderSettingsPanel(): void {
		if (!this.settingsPanel) {
			return;
		}

		const settings = this.getSettings();
		this.settingsPanel.empty();

		const header = this.settingsPanel.createDiv({ cls: 'wechat-publisher-inline-settings-header' });
		setIcon(header.createSpan(), 'settings');
		header.createEl('h3', { text: '设置' });

		const content = this.settingsPanel.createDiv({ cls: 'wechat-publisher-inline-settings-content' });
		content.createEl('h4', { text: '排版' });
		this.addThemeSelect(content, '主题', settings.layoutTheme, (value) =>
			this.savePatch({ layoutTheme: value }),
		);
		this.addSegmentedControl(content, '字重', FONT_WEIGHT_OPTIONS, settings.fontWeight, (value) =>
			this.savePatch({ fontWeight: value as FontWeight }),
		);
		this.addSegmentedControl(content, '小标题风格', SUBHEADING_STYLE_OPTIONS, settings.subheadingStyle, (value) =>
			this.savePatch({ subheadingStyle: value as SubheadingStyle }),
		);
		this.addSelect(content, '代码主题', CODE_THEME_OPTIONS, settings.codeTheme, (value) =>
			this.savePatch({ codeTheme: value as CodeTheme }),
		);

		content.createDiv({ cls: 'wechat-publisher-settings-divider' });
		content.createEl('h4', { text: '时间模块' });
		this.addToggle(content, '顶部插入时间模块', '头像 + 名字 + 阅读时间估算', settings.showReadingTime, (value) =>
			this.savePatch({ showReadingTime: value }),
		);
		this.addText(content, '作者', '作者名', settings.authorName, (value) =>
			this.savePatch({ authorName: value.trim() }),
		);
		this.addText(content, '头像 URL', 'https://...', settings.avatarUrl, (value) =>
			this.savePatch({ avatarUrl: value.trim() }),
		);
		this.addAvatarUpload(content);

		content.createDiv({ cls: 'wechat-publisher-settings-divider' });
		content.createEl('h4', { text: 'Pro 授权' });
		this.addLicenseStatus(content);
		this.addText(content, 'License Key', 'Pro License Key', settings.licenseKey, (value) =>
			this.savePatch({ licenseKey: value.trim(), entitlementCache: null }),
		);
		this.addLicenseRefresh(content);

		content.createDiv({ cls: 'wechat-publisher-settings-divider' });
		content.createEl('h4', { text: '公众号接口' });
		content.createEl('p', {
			cls: 'wechat-publisher-settings-help',
			text: '用于上传到草稿箱。AppSecret 会明文保存在当前库的插件数据里。',
		});
		this.addText(content, 'AppID', '公众号 AppID', settings.wechatAppId, (value) =>
			this.savePatch({ wechatAppId: value.trim() }),
		);
		this.addText(
			content,
			'AppSecret',
			'公众号 AppSecret',
			settings.wechatAppSecret,
			(value) => this.savePatch({ wechatAppSecret: value.trim() }),
			'password',
		);
		this.addText(content, '默认封面 media_id', '永久素材 media_id', settings.wechatThumbMediaId, (value) =>
			this.savePatch({ wechatThumbMediaId: value.trim() }),
		);
		this.addCoverUpload(content);
		this.addText(content, '原文链接', 'https://...', settings.wechatSourceUrl, (value) =>
			this.savePatch({ wechatSourceUrl: value.trim() }),
		);
		this.addToggle(content, '开启评论', '上传草稿时允许文章留言评论', settings.wechatNeedOpenComment, (value) =>
			this.savePatch({ wechatNeedOpenComment: value }),
		);

		const resetLayoutButton = content.createEl('button', {
			cls: 'wechat-publisher-clear-button',
			text: '恢复排版默认',
		});
		resetLayoutButton.type = 'button';
		resetLayoutButton.addEventListener('click', () => {
			this.isThemeDropdownOpen = false;
			void this.saveSettings({
				...this.getSettings(),
				layoutTheme: DEFAULT_SETTINGS.layoutTheme,
				fontWeight: DEFAULT_SETTINGS.fontWeight,
				subheadingStyle: DEFAULT_SETTINGS.subheadingStyle,
				codeTheme: DEFAULT_SETTINGS.codeTheme,
				showReadingTime: DEFAULT_SETTINGS.showReadingTime,
			}).then(() => this.renderSettingsPanel());
		});
	}

	private addThemeSelect(
		container: HTMLElement,
		label: string,
		value: LayoutTheme,
		onChange: (value: LayoutTheme) => Promise<void>,
	): void {
		const selected = LAYOUT_THEME_OPTIONS.find((option) => option.value === value) ?? LAYOUT_THEME_OPTIONS[0];
		const field = this.createField(container, label);
		const wrapper = field.createDiv({ cls: 'wechat-publisher-theme-select' });
		const trigger = wrapper.createEl('button', {
			cls: 'wechat-publisher-theme-trigger',
			attr: {
				'aria-expanded': String(this.isThemeDropdownOpen),
			},
		});
		trigger.type = 'button';
		trigger.createSpan({
			cls: 'wechat-publisher-theme-swatch',
			attr: { style: `background: ${selected.swatch}` },
		});
		trigger.createSpan({ cls: 'wechat-publisher-theme-label', text: selected.label });
		setIcon(trigger.createSpan({ cls: 'wechat-publisher-theme-chevron' }), 'chevron-down');
		trigger.addEventListener('click', () => {
			this.isThemeDropdownOpen = !this.isThemeDropdownOpen;
			this.renderSettingsPanel();
		});

		if (!this.isThemeDropdownOpen) {
			return;
		}

		const menu = wrapper.createDiv({ cls: 'wechat-publisher-theme-menu' });
		LAYOUT_THEME_GROUPS.forEach((group) => {
			menu.createDiv({ cls: 'wechat-publisher-theme-group-label', text: group.label });
			group.options.forEach((option) => {
				const optionButton = menu.createEl('button', {
					cls: option.value === value ? 'wechat-publisher-theme-option is-active' : 'wechat-publisher-theme-option',
				});
				optionButton.type = 'button';
				optionButton.createSpan({
					cls: 'wechat-publisher-theme-swatch',
					attr: { style: `background: ${option.swatch}` },
				});
				optionButton.createSpan({ cls: 'wechat-publisher-theme-label', text: option.label });
				if (option.value === value) {
					setIcon(optionButton.createSpan({ cls: 'wechat-publisher-theme-check' }), 'check');
				}
				optionButton.addEventListener('click', () => {
					this.isThemeDropdownOpen = false;
					void onChange(option.value).then(() => this.renderSettingsPanel());
				});
			});
		});
	}

	private addSelect<T extends string>(
		container: HTMLElement,
		label: string,
		options: Array<{ value: T; label: string }>,
		value: T,
		onChange: (value: T) => Promise<void>,
	): void {
		const field = this.createField(container, label);
		const select = field.createEl('select');
		options.forEach((option) => {
			select.createEl('option', {
				text: option.label,
				value: option.value,
			});
		});
		select.value = value;
		select.addEventListener('change', () => {
			this.isThemeDropdownOpen = false;
			void onChange(select.value as T).then(() => this.renderSettingsPanel());
		});
	}

	private addSegmentedControl<T extends string>(
		container: HTMLElement,
		label: string,
		options: Array<{ value: T; label: string }>,
		value: T,
		onChange: (value: T) => Promise<void>,
	): void {
		const field = this.createField(container, label);
		const group = field.createDiv({ cls: 'wechat-publisher-segmented-control' });
		options.forEach((option) => {
			const button = group.createEl('button', {
				text: option.label,
				cls: option.value === value ? 'is-active' : '',
			});
			button.type = 'button';
			button.addEventListener('click', () => {
				this.isThemeDropdownOpen = false;
				void onChange(option.value).then(() => this.renderSettingsPanel());
			});
		});
	}

	private addToggle(
		container: HTMLElement,
		label: string,
		desc: string,
		value: boolean,
		onChange: (value: boolean) => Promise<void>,
	): void {
		const field = container.createDiv({ cls: 'wechat-publisher-settings-toggle' });
		const text = field.createDiv();
		text.createEl('label', { text: label });
		text.createEl('p', { text: desc });
		const input = field.createEl('input', { type: 'checkbox' });
		input.checked = value;
		input.addEventListener('change', () => {
			this.isThemeDropdownOpen = false;
			void onChange(input.checked).then(() => this.renderSettingsPanel());
		});
	}

	private addText(
		container: HTMLElement,
		label: string,
		placeholder: string,
		value: string,
		onChange: (value: string) => Promise<void>,
		inputType: 'text' | 'password' = 'text',
	): void {
		const field = this.createField(container, label);
		const input = field.createEl('input', {
			type: inputType,
			attr: { placeholder },
		});
		input.value = value;
		input.addEventListener('input', () => {
			this.isThemeDropdownOpen = false;
			void onChange(input.value);
		});
	}

	private createField(container: HTMLElement, label: string): HTMLElement {
		const field = container.createDiv({ cls: 'wechat-publisher-settings-field' });
		field.createEl('label', { text: label });
		return field;
	}

	private addLicenseStatus(container: HTMLElement): void {
		const status = this.getEntitlementStatus();
		container.createEl('p', {
			cls: status.active ? 'wechat-publisher-license-status is-pro' : 'wechat-publisher-license-status',
			text: `授权状态：${formatLicenseStatus(status)}`,
		});
	}

	private addLicenseRefresh(container: HTMLElement): void {
		const button = container.createEl('button', {
			cls: 'wechat-publisher-license-check-button',
			text: '校验授权',
		});
		button.type = 'button';
		button.addEventListener('click', () => {
			this.isThemeDropdownOpen = false;
			button.disabled = true;
			void this.refreshLicense()
				.catch(() => undefined)
				.finally(() => {
					button.disabled = false;
					this.renderSettingsPanel();
				});
		});
	}

	private addCoverUpload(container: HTMLElement): void {
		const button = container.createEl('button', {
			cls: 'wechat-publisher-upload-cover-button',
			text: '上传封面图',
		});
		button.type = 'button';
		button.addEventListener('click', () => {
			this.pickCoverImage();
		});
	}

	private addAvatarUpload(container: HTMLElement): void {
		const button = container.createEl('button', {
			cls: 'wechat-publisher-upload-avatar-button',
			text: '上传头像图',
		});
		button.type = 'button';
		button.addEventListener('click', () => {
			this.pickAvatarImage();
		});
	}

	private pickCoverImage(): void {
		const input = document.createElement('input');
		input.type = 'file';
		input.accept = 'image/jpeg,image/png,image/gif';
		input.addEventListener('change', () => {
			const file = input.files?.[0];
			if (!file) {
				return;
			}
			void this.uploadSelectedCover(file);
		});
		input.click();
	}

	private pickAvatarImage(): void {
		const input = document.createElement('input');
		input.type = 'file';
		input.accept = 'image/jpeg,image/png,image/gif';
		input.addEventListener('change', () => {
			const file = input.files?.[0];
			if (!file) {
				return;
			}
			void this.uploadSelectedAvatar(file);
		});
		input.click();
	}

	private async uploadSelectedCover(file: File): Promise<void> {
		try {
			const result = await this.uploadCoverImage(file);
			await this.savePatch({ wechatThumbMediaId: result.mediaId });
			this.noticeView.showCoverSuccess(result.mediaId);
			this.renderSettingsPanel();
		} catch (error) {
			this.noticeView.showCoverError(error);
		}
	}

	private async uploadSelectedAvatar(file: File): Promise<void> {
		try {
			const result = await this.uploadAvatarImage(file);
			await this.savePatch({ avatarUrl: result.url });
			this.noticeView.showAvatarSuccess(result.url);
			this.renderSettingsPanel();
		} catch (error) {
			this.noticeView.showAvatarError(error);
		}
	}

	private async uploadDraftFromButton(): Promise<void> {
		if (!this.article) {
			return;
		}
		this.syncButton.disabled = true;
		try {
			await this.uploadDraft();
		} finally {
			this.syncButton.disabled = !this.article;
		}
	}

	private async savePatch(patch: Partial<PluginSettings>): Promise<void> {
		await this.saveSettings({
			...this.getSettings(),
			...patch,
		});
	}

	private async copy(): Promise<void> {
		if (!this.article) {
			return;
		}

		try {
			await this.clipboardService.copyArticle(this.article);
			this.noticeView.showSuccess();
		} catch (error) {
			this.noticeView.showError(error);
		}
	}

	private renderHelpPanel(): void {
		if (!this.helpPanel) {
			return;
		}

		this.helpPanel.empty();
		const header = this.helpPanel.createDiv({ cls: 'wechat-publisher-inline-settings-header' });
		setIcon(header.createSpan(), 'circle-help');
		header.createEl('h3', { text: '帮助' });

		const content = this.helpPanel.createDiv({ cls: 'wechat-publisher-inline-settings-content wechat-publisher-help-content' });
		this.addHelpSection(content, '风格说明', [
			'因为自己非常喜欢这种简约高级的排版风格，可能吧的排版完全在我的审美上，所以这个插件参考引用了可能吧公众号排版器的风格排版。',
			{ text: '可能吧公众号排版器', href: 'https://mp.knb.im/' },
		]);
		this.addHelpSection(content, '快速使用', [
			'打开一篇 Markdown 笔记，点击左侧功能区的公众号预览图标，右侧会出现实时预览。',
			'没有选中文本时，复制和上传会使用整篇笔记；有选中文本时，复制会优先使用选区。',
			'写完后点击右上角复制图标，把内容粘贴到微信公众号后台。',
		]);
		this.addHelpSection(content, '支持语法', [
			'支持标题、段落、粗体、斜体、引用、列表、图片、分割线、链接、代码块和 Markdown 表格。',
			'公众号内链会保留，其他外链会改写成“文字（URL）”，避免粘贴后链接丢失。',
			'代码块支持深色/浅色主题和横向滚动，适合粘贴较长代码。',
		]);
		this.addHelpSection(content, '专有格式', [
			'工具栏提供全能导航、摘要、高亮、提示、说明、笔记、注意、危险、想说的话和多角色对话。',
			'全能导航会根据二级标题生成文章导航；对话格式会让同名角色保持一致图标。',
			'这些格式都写回 Markdown，后续可以继续编辑。',
		]);
		this.addHelpSection(content, '排版设置', [
			'右上角齿轮可以调整主题、字重、小标题风格、代码主题和顶部时间模块。',
			'作者名和头像 URL 会显示在顶部时间模块里，也可以上传本地头像图自动生成公众号可用图片链接。',
		]);
		this.addHelpSection(content, '公众号上传配置', [
			'上传到草稿箱需要填写公众号 AppID、AppSecret 和默认封面 media_id。',
			'AppID 和 AppSecret 在微信公众平台的“设置与开发”里获取；服务器 IP 白名单也在公众号后台“设置与开发”里配置。',
			'默认封面 media_id 可以手填，也可以点击上传封面图，让插件自动上传为永久素材后写回。',
			'原文链接可选；开启评论后，上传草稿时会允许文章留言评论。',
			'AppSecret 会明文保存在当前 Obsidian 库插件数据里；文章内容和公众号密钥不会发到授权服务器。',
		]);
		this.addHelpSection(content, 'Pro 激活码', [
			'实时预览、复制到公众号、排版工具栏和主题设置免费使用。',
			'上传草稿箱、上传封面图、上传头像图属于 Pro 功能，需要填写 License Key 后校验授权。',
			'Pro 权限：19元/年，58元/永久；期间享受免费插件版本升级。',
			'后续计划添加多公众号账号切换管理。',
			'联系渣姐微信：237219265 获取激活码。',
		]);
	}

	private addHelpSection(container: HTMLElement, title: string, paragraphs: HelpItem[]): void {
		const section = container.createEl('section');
		section.createEl('h4', { text: title });
		paragraphs.forEach((item) => {
			if (typeof item === 'string') {
				section.createEl('p', { text: item });
				return;
			}
			const paragraph = section.createEl('p');
			const link = paragraph.createEl('a', {
				text: item.text,
				href: item.href,
				attr: {
					target: '_blank',
					rel: 'noopener noreferrer',
				},
			});
			link.setAttr('aria-label', `${item.text}：${item.href}`);
		});
	}
}
