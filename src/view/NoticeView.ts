export interface NoticeView {
	showSuccess(): void;
	showDraftSuccess(mediaId: string): void;
	showCoverSuccess(mediaId: string): void;
	showAvatarSuccess(url: string): void;
	showEmpty(): void;
	showError(error: unknown): void;
	showDraftError(error: unknown): void;
	showCoverError(error: unknown): void;
	showAvatarError(error: unknown): void;
}

type NoticeConstructor = new (message: string) => unknown;

export class ObsidianNoticeView implements NoticeView {
	constructor(private readonly NoticeType: NoticeConstructor) {}

	showSuccess(): void {
		new this.NoticeType('已复制公众号排版 HTML');
	}

	showDraftSuccess(mediaId: string): void {
		new this.NoticeType(`已上传到公众号草稿箱：${mediaId}`);
	}

	showCoverSuccess(mediaId: string): void {
		new this.NoticeType(`已上传封面图：${mediaId}`);
	}

	showAvatarSuccess(): void {
		new this.NoticeType('已上传头像图');
	}

	showEmpty(): void {
		new this.NoticeType('当前笔记没有可复制内容');
	}

	showError(error: unknown): void {
		const message = error instanceof Error ? error.message : String(error);
		new this.NoticeType(`复制失败：${message}`);
	}

	showDraftError(error: unknown): void {
		const message = error instanceof Error ? error.message : String(error);
		new this.NoticeType(`上传草稿失败：${message}`);
	}

	showCoverError(error: unknown): void {
		const message = error instanceof Error ? error.message : String(error);
		new this.NoticeType(`上传封面图失败：${message}`);
	}

	showAvatarError(error: unknown): void {
		const message = error instanceof Error ? error.message : String(error);
		new this.NoticeType(`上传头像图失败：${message}`);
	}
}

export const silentNoticeView: NoticeView = {
	showSuccess() {},
	showDraftSuccess() {},
	showCoverSuccess() {},
	showAvatarSuccess() {},
	showEmpty() {},
	showError() {},
	showDraftError() {},
	showCoverError() {},
	showAvatarError() {},
};
