import { App, Plugin, PluginSettingTab, Setting } from 'obsidian';
import {
	CODE_THEME_OPTIONS,
	DEFAULT_SETTINGS,
	FONT_WEIGHT_OPTIONS,
	LAYOUT_THEME_OPTIONS,
	SUBHEADING_STYLE_OPTIONS,
	type CodeTheme,
	type FontWeight,
	type LayoutTheme,
	type PluginSettings,
	type SubheadingStyle,
} from '../settings';

export class WeChatPublisherSettingTab extends PluginSettingTab {
	constructor(
		app: App,
		plugin: Plugin,
		private readonly getSettings: () => PluginSettings,
		private readonly saveSettings: (settings: PluginSettings) => Promise<void>,
	) {
		super(app, plugin);
	}

	display(): void {
		const { containerEl } = this;
		const settings = this.getSettings();

		containerEl.empty();
		containerEl.createEl('p', {
			cls: 'wechat-publisher-setting-note',
			text: '用于复制到微信公众号后台的排版设置。',
		});

		containerEl.createEl('h3', { text: '排版' });
		new Setting(containerEl)
			.setName('主题')
			.addDropdown((dropdown) => {
				LAYOUT_THEME_OPTIONS.forEach((option) => dropdown.addOption(option.value, option.label));
				dropdown
					.setValue(settings.layoutTheme)
					.onChange((value) => this.savePatch({ layoutTheme: value as LayoutTheme }));
			});

		this.addSegmentedSetting(
			containerEl,
			'字重',
			FONT_WEIGHT_OPTIONS,
			settings.fontWeight,
			(value) => this.savePatch({ fontWeight: value }),
		);

		this.addSegmentedSetting(
			containerEl,
			'小标题风格',
			SUBHEADING_STYLE_OPTIONS,
			settings.subheadingStyle,
			(value) => this.savePatch({ subheadingStyle: value }),
		);

		new Setting(containerEl)
			.setName('代码主题')
			.addDropdown((dropdown) => {
				CODE_THEME_OPTIONS.forEach((option) => dropdown.addOption(option.value, option.label));
				dropdown
					.setValue(settings.codeTheme)
					.onChange((value) => this.savePatch({ codeTheme: value as CodeTheme }));
			});

		containerEl.createEl('h3', { text: '时间模块' });
		new Setting(containerEl)
			.setName('顶部插入时间模块')
			.setDesc('头像 + 名字 + 阅读时间估算')
			.addToggle((toggle) =>
				toggle
					.setValue(settings.showReadingTime)
					.onChange((value) => this.savePatch({ showReadingTime: value })),
			);

		new Setting(containerEl)
			.setName('作者')
			.addText((text) =>
				text
					.setPlaceholder('作者名')
					.setValue(settings.authorName)
					.onChange((value) => this.savePatch({ authorName: value.trim() })),
			);

		new Setting(containerEl)
			.setName('头像 URL')
			.addText((text) =>
				text
					.setPlaceholder('https://...')
					.setValue(settings.avatarUrl)
					.onChange((value) => this.savePatch({ avatarUrl: value.trim() })),
			);

		new Setting(containerEl)
			.setName('清空本地设置')
			.addButton((button) =>
				button
					.setButtonText('清空本地存储')
					.onClick(() => {
						void this.saveSettings({ ...DEFAULT_SETTINGS }).then(() => this.display());
					}),
			);
	}

	private addSegmentedSetting<T extends string>(
		containerEl: HTMLElement,
		name: string,
		options: Array<{ value: T; label: string }>,
		currentValue: T,
		onSelect: (value: T) => Promise<void>,
	): void {
		const setting = new Setting(containerEl).setName(name);
		const group = setting.controlEl.createDiv({ cls: 'wechat-publisher-segmented-control' });
		options.forEach((option) => {
			const button = group.createEl('button', {
				text: option.label,
				cls: option.value === currentValue ? 'is-active' : '',
			});
			button.type = 'button';
			button.addEventListener('click', () => {
				void onSelect(option.value).then(() => this.display());
			});
		});
	}

	private async savePatch(patch: Partial<PluginSettings>): Promise<void> {
		await this.saveSettings({
			...this.getSettings(),
			...patch,
		});
	}
}
