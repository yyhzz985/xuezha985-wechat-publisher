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
import { type NoticeView, silentNoticeView } from './NoticeView';

export class WeChatPublisherSettingTab extends PluginSettingTab {
	constructor(
		app: App,
		plugin: Plugin,
		private readonly getSettings: () => PluginSettings,
		private readonly saveSettings: (settings: PluginSettings) => Promise<void>,
		private readonly uploadCoverImage: (file: File) => Promise<{ mediaId: string; url: string }> = async () => {
			throw new Error('未配置封面图上传服务');
		},
		private readonly noticeView: NoticeView = silentNoticeView,
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

		containerEl.createEl('h3', { text: '公众号接口' });
		containerEl.createEl('p', {
			cls: 'wechat-publisher-setting-note',
			text: '用于上传到草稿箱。AppSecret 会明文保存在当前库的插件数据里，微信后台还需要配置服务器 IP 白名单。',
		});
		new Setting(containerEl)
			.setName('AppID')
			.addText((text) =>
				text
					.setPlaceholder('公众号 AppID')
					.setValue(settings.wechatAppId)
					.onChange((value) => this.savePatch({ wechatAppId: value.trim() })),
			);

		new Setting(containerEl)
			.setName('AppSecret')
			.addText((text) => {
				text.inputEl.type = 'password';
				text
					.setPlaceholder('公众号 AppSecret')
					.setValue(settings.wechatAppSecret)
					.onChange((value) => this.savePatch({ wechatAppSecret: value.trim() }));
			});

		new Setting(containerEl)
			.setName('默认封面 media_id')
			.setDesc('可手填，也可点击上传封面图自动生成。')
			.addText((text) =>
				text
					.setPlaceholder('永久素材 media_id')
					.setValue(settings.wechatThumbMediaId)
					.onChange((value) => this.savePatch({ wechatThumbMediaId: value.trim() })),
			);

		new Setting(containerEl)
			.setName('上传封面图')
			.setDesc('选择 JPG、PNG 或 GIF，插件会上传为公众号永久图片素材并写回 media_id。')
			.addButton((button) => {
				button
					.setButtonText('上传封面图')
					.onClick(() => {
						this.pickCoverImage();
					});
				button.buttonEl.addClass('wechat-publisher-upload-cover-button');
			});

		new Setting(containerEl)
			.setName('原文链接')
			.addText((text) =>
				text
					.setPlaceholder('https://...')
					.setValue(settings.wechatSourceUrl)
					.onChange((value) => this.savePatch({ wechatSourceUrl: value.trim() })),
			);

		new Setting(containerEl)
			.setName('开启评论')
			.setDesc('上传草稿时允许文章留言评论')
			.addToggle((toggle) =>
				toggle
					.setValue(settings.wechatNeedOpenComment)
					.onChange((value) => this.savePatch({ wechatNeedOpenComment: value })),
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

	private async uploadSelectedCover(file: File): Promise<void> {
		try {
			const result = await this.uploadCoverImage(file);
			await this.savePatch({ wechatThumbMediaId: result.mediaId });
			this.noticeView.showCoverSuccess(result.mediaId);
			this.display();
		} catch (error) {
			this.noticeView.showCoverError(error);
		}
	}
}
