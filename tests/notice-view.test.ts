import test from 'node:test';
import assert from 'node:assert/strict';
import { ObsidianNoticeView } from '../src/view/NoticeView';

test('shows pro required draft notice without failure prefix', () => {
	const messages: string[] = [];
	class FakeNotice {
		constructor(message: string) {
			messages.push(message);
		}
	}

	const noticeView = new ObsidianNoticeView(FakeNotice);
	noticeView.showDraftError(new Error('需 Pro 授权后可用'));

	assert.deepEqual(messages, ['需 Pro 授权后可用']);
});

test('keeps failure prefix for normal draft upload errors', () => {
	const messages: string[] = [];
	class FakeNotice {
		constructor(message: string) {
			messages.push(message);
		}
	}

	const noticeView = new ObsidianNoticeView(FakeNotice);
	noticeView.showDraftError(new Error('network down'));

	assert.deepEqual(messages, ['上传草稿失败：network down']);
});
