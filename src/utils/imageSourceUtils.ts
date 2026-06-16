export function isVaultLocalImageSource(src: string): boolean {
	const trimmed = src.trim();
	return Boolean(trimmed) && !/^\/\//.test(trimmed) && !/^[a-z][a-z0-9+.-]*:/i.test(trimmed);
}

