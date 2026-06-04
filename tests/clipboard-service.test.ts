import test from 'node:test';
import assert from 'node:assert/strict';
import { ClipboardService } from '../src/service/ClipboardService';

test('copies html and plain text through electron clipboard when available', async () => {
	let copied: { html: string; text: string } | null = null;
	const globals = globalThis as unknown as {
		window?: {
			require?: (moduleName: string) => {
				clipboard: {
					write(data: { html: string; text: string }): void;
				};
			};
		};
	};
	const originalWindow = globals.window;

	globals.window = {
		require(moduleName: string) {
			assert.equal(moduleName, 'electron');
			return {
				clipboard: {
					write(data: { html: string; text: string }) {
						copied = data;
					},
				},
			};
		},
	};

	try {
		await new ClipboardService().copyArticle({
			html: '<section><strong>正文</strong></section>',
			plainText: '正文',
		});
	} finally {
		globals.window = originalWindow;
	}

	assert.deepEqual(copied, {
		html: '<section><strong>正文</strong></section>',
		text: '正文',
	});
});
