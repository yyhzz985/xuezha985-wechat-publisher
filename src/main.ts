import { MarkdownView, Notice, Plugin, requestUrl, type WorkspaceLeaf } from 'obsidian';
import { PublisherController } from './controller/PublisherController';
import { ObsidianImageRepository } from './repository/ObsidianImageRepository';
import { SettingsRepository } from './repository/SettingsRepository';
import { ClipboardService } from './service/ClipboardService';
import { EntitlementService, type LicenseHttpClient, type LicenseVerifyResponse } from './service/EntitlementService';
import { WeChatDraftService, type WeChatHttpClient } from './service/WeChatDraftService';
import type { FormattedWeChatArticle } from './service/WeChatFormatService';
import type { PluginSettings } from './settings';
import { ObsidianNoticeView } from './view/NoticeView';
import { VIEW_TYPE_WECHAT_PUBLISHER_PREVIEW, WeChatPublisherPreviewView } from './view/PreviewView';
import { WeChatPublisherSettingTab } from './view/SettingsTab';

export default class WeChatPublisherPlugin extends Plugin {
	settings!: PluginSettings;
	private settingsRepository!: SettingsRepository;
	private publisherController!: PublisherController;

	async onload(): Promise<void> {
		this.settingsRepository = new SettingsRepository(this);
		this.settings = await this.settingsRepository.load();
		const noticeView = new ObsidianNoticeView(Notice);
		const clipboardService = new ClipboardService();
		const imageRepository = new ObsidianImageRepository(this.app);
		const draftService = new WeChatDraftService(this.createWeChatHttpClient(), imageRepository);
		const entitlementService = new EntitlementService(
			() => this.settings,
			(settings) => this.saveSettings(settings),
			this.createLicenseHttpClient(),
			{
				pluginId: this.manifest.id,
				pluginVersion: this.manifest.version,
			},
		);

		this.publisherController = new PublisherController(
			this,
			MarkdownView,
			() => this.settings,
			noticeView,
			(article, reveal) => {
				void this.updatePreviewPane(article, reveal);
			},
			() => this.isPreviewPaneOpen(),
			undefined,
			clipboardService,
			draftService,
			entitlementService,
			imageRepository,
		);

		this.registerView(
			VIEW_TYPE_WECHAT_PUBLISHER_PREVIEW,
			(leaf) => new WeChatPublisherPreviewView(
				leaf,
				noticeView,
				() => this.settings,
				(settings) => this.saveSettings(settings),
				() => this.publisherController.copyPreviewArticle(),
				(action) => this.publisherController.applyFormat(action),
				() => this.publisherController.uploadDraft(),
				(file) => this.publisherController.uploadCoverImage(file),
				(file) => this.publisherController.uploadAvatarImage(file),
				() => this.publisherController.refreshLicense(),
				() => this.publisherController.getEntitlementStatus(),
			),
		);

		this.publisherController.register();
		this.addSettingTab(
			new WeChatPublisherSettingTab(
				this.app,
				this,
				() => this.settings,
				(settings) => this.saveSettings(settings),
				(file) => this.publisherController.uploadCoverImage(file),
				(file) => this.publisherController.uploadAvatarImage(file),
				() => this.publisherController.refreshLicense(),
				() => this.publisherController.getEntitlementStatus(),
				noticeView,
			),
		);
	}

	private createLicenseHttpClient(): LicenseHttpClient {
		return {
			async verify(request, serverUrl) {
				if (!serverUrl) {
					throw new Error('授权服务未配置，请重新安装插件');
				}
				const response = await requestUrl({
					url: serverUrl,
					method: 'POST',
					body: JSON.stringify(request),
					headers: {
						'Content-Type': 'application/json',
					},
				});
				return response.json as LicenseVerifyResponse;
			},
		};
	}

	private createWeChatHttpClient(): WeChatHttpClient {
		return {
			async requestJson(request) {
				const hasJsonBody = request.body !== undefined;
				const response = await requestUrl({
					url: request.url,
					method: request.method,
					body: request.bodyBytes ?? (hasJsonBody ? JSON.stringify(request.body) : undefined),
					headers: request.headers ?? (hasJsonBody ? { 'Content-Type': 'application/json' } : undefined),
				});
				return response.json;
			},
			async requestBytes(request) {
				const response = await requestUrl({
					url: request.url,
					method: request.method,
					body: request.bodyBytes,
					headers: request.headers,
				});
				return {
					data: response.arrayBuffer,
					mimeType: response.headers['content-type'] ?? response.headers['Content-Type'],
				};
			},
		};
	}

	async saveSettings(settings: PluginSettings): Promise<void> {
		this.settings = settings;
		await this.settingsRepository.save(settings);
		this.publisherController.refreshPreviewFromActiveView();
	}

	private isPreviewPaneOpen(): boolean {
		return this.app.workspace
			.getLeavesOfType(VIEW_TYPE_WECHAT_PUBLISHER_PREVIEW)
			.some((leaf) => leaf.view instanceof WeChatPublisherPreviewView);
	}

	private async updatePreviewPane(article: FormattedWeChatArticle | null, reveal: boolean): Promise<void> {
		const leaf = reveal
			? await this.ensurePreviewLeaf()
			: this.app.workspace.getLeavesOfType(VIEW_TYPE_WECHAT_PUBLISHER_PREVIEW)[0];
		if (!leaf) {
			return;
		}

		await leaf.loadIfDeferred();
		if (leaf.view instanceof WeChatPublisherPreviewView) {
			leaf.view.updateArticle(article);
		}
		if (reveal) {
			await this.app.workspace.revealLeaf(leaf);
		}
	}

	private async ensurePreviewLeaf(): Promise<WorkspaceLeaf> {
		const existingLeaf = this.app.workspace.getLeavesOfType(VIEW_TYPE_WECHAT_PUBLISHER_PREVIEW)[0];
		if (existingLeaf) {
			return existingLeaf;
		}

		const leaf = this.app.workspace.getRightLeaf(false) ?? this.app.workspace.getRightLeaf(true);
		if (!leaf) {
			throw new Error('无法打开右侧公众号预览面板');
		}

		await leaf.setViewState({
			type: VIEW_TYPE_WECHAT_PUBLISHER_PREVIEW,
			active: true,
		});
		return leaf;
	}
}
