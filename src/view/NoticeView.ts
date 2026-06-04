export interface NoticeView {
	showSuccess(): void;
	showDraftSuccess(mediaId: string): void;
	showEmpty(): void;
	showError(error: unknown): void;
	showDraftError(error: unknown): void;
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
}

export const silentNoticeView: NoticeView = {
	showSuccess() {},
	showDraftSuccess() {},
	showEmpty() {},
	showError() {},
	showDraftError() {},
};
