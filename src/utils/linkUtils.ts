export function isWeChatLink(url: string): boolean {
	try {
		const parsed = new URL(url);
		return parsed.hostname === 'mp.weixin.qq.com';
	} catch {
		return false;
	}
}
