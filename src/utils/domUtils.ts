import { sanitizeHTMLToDom } from 'obsidian';

export function replaceWithSanitizedHtml(containerEl: HTMLElement, html: string): void {
	containerEl.empty();
	containerEl.appendChild(sanitizeHTMLToDom(html));
}
