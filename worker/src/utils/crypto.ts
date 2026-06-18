const textEncoder = new TextEncoder();
const textDecoder = new TextDecoder();
const HEX = '0123456789abcdef';

export async function sha256Hex(value: string): Promise<string> {
	const hash = await crypto.subtle.digest('SHA-256', textEncoder.encode(value));
	return bytesToHex(new Uint8Array(hash));
}

export async function hashLicenseKey(secret: string, licenseKey: string): Promise<string> {
	return sha256Hex(`${secret}:${licenseKey.trim()}`);
}

export function createLicenseKey(): string {
	return `PRO-${randomBase64Url(12).toUpperCase()}`;
}

export function randomId(prefix: string): string {
	return `${prefix}_${randomBase64Url(16)}`;
}

export function randomOrderNo(): string {
	return `WP${Date.now()}${randomDigits(6)}`;
}

export function randomPublicToken(): string {
	return randomBase64Url(18);
}

export async function encryptText(secret: string, value: string): Promise<string> {
	const key = await createAesKey(secret);
	const iv = crypto.getRandomValues(new Uint8Array(12));
	const encrypted = await crypto.subtle.encrypt(
		{ name: 'AES-GCM', iv: toArrayBuffer(iv) },
		key,
		textEncoder.encode(value),
	);
	return `${base64Url(iv)}.${base64Url(new Uint8Array(encrypted))}`;
}

export async function decryptText(secret: string, value: string): Promise<string> {
	const [ivText, cipherText] = value.split('.');
	if (!ivText || !cipherText) {
		throw new Error('Encrypted value is invalid');
	}
	const key = await createAesKey(secret);
	const decrypted = await crypto.subtle.decrypt(
		{ name: 'AES-GCM', iv: toArrayBuffer(fromBase64Url(ivText)) },
		key,
		toArrayBuffer(fromBase64Url(cipherText)),
	);
	return textDecoder.decode(decrypted);
}

export function signMbdParams(params: Record<string, string | number>, appKey: string): string {
	const signText = Object.keys(params)
		.filter((key) => key !== 'sign' && params[key] !== '' && params[key] !== undefined && params[key] !== null)
		.sort()
		.map((key) => `${key}=${params[key]}`)
		.join('&');
	return md5Hex(`${signText}&key=${appKey}`);
}

function randomBase64Url(byteLength: number): string {
	const bytes = crypto.getRandomValues(new Uint8Array(byteLength));
	return base64Url(bytes);
}

function randomDigits(length: number): string {
	const bytes = crypto.getRandomValues(new Uint8Array(length));
	return Array.from(bytes, (byte) => String(byte % 10)).join('');
}

function base64Url(bytes: Uint8Array): string {
	let binary = '';
	for (const byte of bytes) {
		binary += String.fromCharCode(byte);
	}
	return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

function fromBase64Url(value: string): Uint8Array {
	const padded = value.replace(/-/g, '+').replace(/_/g, '/') + '='.repeat((4 - value.length % 4) % 4);
	const binary = atob(padded);
	const bytes = new Uint8Array(binary.length);
	for (let index = 0; index < binary.length; index += 1) {
		bytes[index] = binary.charCodeAt(index);
	}
	return bytes;
}

async function createAesKey(secret: string): Promise<CryptoKey> {
	const keyBytes = await crypto.subtle.digest('SHA-256', textEncoder.encode(`license-encryption:${secret}`));
	return crypto.subtle.importKey('raw', keyBytes, 'AES-GCM', false, ['encrypt', 'decrypt']);
}

function bytesToHex(bytes: Uint8Array): string {
	let result = '';
	for (const byte of bytes) {
		result += HEX[byte >> 4] + HEX[byte & 15];
	}
	return result;
}

function toArrayBuffer(bytes: Uint8Array): ArrayBuffer {
	return bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer;
}

function md5Hex(input: string): string {
	const bytes = textEncoder.encode(input);
	const words: number[] = [];
	for (let index = 0; index < bytes.length; index += 1) {
		words[index >> 2] |= bytes[index] << ((index % 4) * 8);
	}
	const bitLength = bytes.length * 8;
	words[bitLength >> 5] |= 0x80 << (bitLength % 32);
	words[(((bitLength + 64) >>> 9) << 4) + 14] = bitLength;

	let a = 0x67452301;
	let b = 0xefcdab89;
	let c = 0x98badcfe;
	let d = 0x10325476;

	for (let index = 0; index < words.length; index += 16) {
		const oldA = a;
		const oldB = b;
		const oldC = c;
		const oldD = d;

		a = ff(a, b, c, d, words[index], 7, -680876936);
		d = ff(d, a, b, c, words[index + 1], 12, -389564586);
		c = ff(c, d, a, b, words[index + 2], 17, 606105819);
		b = ff(b, c, d, a, words[index + 3], 22, -1044525330);
		a = ff(a, b, c, d, words[index + 4], 7, -176418897);
		d = ff(d, a, b, c, words[index + 5], 12, 1200080426);
		c = ff(c, d, a, b, words[index + 6], 17, -1473231341);
		b = ff(b, c, d, a, words[index + 7], 22, -45705983);
		a = ff(a, b, c, d, words[index + 8], 7, 1770035416);
		d = ff(d, a, b, c, words[index + 9], 12, -1958414417);
		c = ff(c, d, a, b, words[index + 10], 17, -42063);
		b = ff(b, c, d, a, words[index + 11], 22, -1990404162);
		a = ff(a, b, c, d, words[index + 12], 7, 1804603682);
		d = ff(d, a, b, c, words[index + 13], 12, -40341101);
		c = ff(c, d, a, b, words[index + 14], 17, -1502002290);
		b = ff(b, c, d, a, words[index + 15], 22, 1236535329);

		a = gg(a, b, c, d, words[index + 1], 5, -165796510);
		d = gg(d, a, b, c, words[index + 6], 9, -1069501632);
		c = gg(c, d, a, b, words[index + 11], 14, 643717713);
		b = gg(b, c, d, a, words[index], 20, -373897302);
		a = gg(a, b, c, d, words[index + 5], 5, -701558691);
		d = gg(d, a, b, c, words[index + 10], 9, 38016083);
		c = gg(c, d, a, b, words[index + 15], 14, -660478335);
		b = gg(b, c, d, a, words[index + 4], 20, -405537848);
		a = gg(a, b, c, d, words[index + 9], 5, 568446438);
		d = gg(d, a, b, c, words[index + 14], 9, -1019803690);
		c = gg(c, d, a, b, words[index + 3], 14, -187363961);
		b = gg(b, c, d, a, words[index + 8], 20, 1163531501);
		a = gg(a, b, c, d, words[index + 13], 5, -1444681467);
		d = gg(d, a, b, c, words[index + 2], 9, -51403784);
		c = gg(c, d, a, b, words[index + 7], 14, 1735328473);
		b = gg(b, c, d, a, words[index + 12], 20, -1926607734);

		a = hh(a, b, c, d, words[index + 5], 4, -378558);
		d = hh(d, a, b, c, words[index + 8], 11, -2022574463);
		c = hh(c, d, a, b, words[index + 11], 16, 1839030562);
		b = hh(b, c, d, a, words[index + 14], 23, -35309556);
		a = hh(a, b, c, d, words[index + 1], 4, -1530992060);
		d = hh(d, a, b, c, words[index + 4], 11, 1272893353);
		c = hh(c, d, a, b, words[index + 7], 16, -155497632);
		b = hh(b, c, d, a, words[index + 10], 23, -1094730640);
		a = hh(a, b, c, d, words[index + 13], 4, 681279174);
		d = hh(d, a, b, c, words[index], 11, -358537222);
		c = hh(c, d, a, b, words[index + 3], 16, -722521979);
		b = hh(b, c, d, a, words[index + 6], 23, 76029189);
		a = hh(a, b, c, d, words[index + 9], 4, -640364487);
		d = hh(d, a, b, c, words[index + 12], 11, -421815835);
		c = hh(c, d, a, b, words[index + 15], 16, 530742520);
		b = hh(b, c, d, a, words[index + 2], 23, -995338651);

		a = ii(a, b, c, d, words[index], 6, -198630844);
		d = ii(d, a, b, c, words[index + 7], 10, 1126891415);
		c = ii(c, d, a, b, words[index + 14], 15, -1416354905);
		b = ii(b, c, d, a, words[index + 5], 21, -57434055);
		a = ii(a, b, c, d, words[index + 12], 6, 1700485571);
		d = ii(d, a, b, c, words[index + 3], 10, -1894986606);
		c = ii(c, d, a, b, words[index + 10], 15, -1051523);
		b = ii(b, c, d, a, words[index + 1], 21, -2054922799);
		a = ii(a, b, c, d, words[index + 8], 6, 1873313359);
		d = ii(d, a, b, c, words[index + 15], 10, -30611744);
		c = ii(c, d, a, b, words[index + 6], 15, -1560198380);
		b = ii(b, c, d, a, words[index + 13], 21, 1309151649);
		a = ii(a, b, c, d, words[index + 4], 6, -145523070);
		d = ii(d, a, b, c, words[index + 11], 10, -1120210379);
		c = ii(c, d, a, b, words[index + 2], 15, 718787259);
		b = ii(b, c, d, a, words[index + 9], 21, -343485551);

		a = add32(a, oldA);
		b = add32(b, oldB);
		c = add32(c, oldC);
		d = add32(d, oldD);
	}

	return [a, b, c, d].map(wordToHex).join('');
}

function common(q: number, a: number, b: number, x: number, s: number, t: number): number {
	return add32(rotateLeft(add32(add32(a, q), add32(x ?? 0, t)), s), b);
}

function ff(a: number, b: number, c: number, d: number, x: number, s: number, t: number): number {
	return common((b & c) | (~b & d), a, b, x, s, t);
}

function gg(a: number, b: number, c: number, d: number, x: number, s: number, t: number): number {
	return common((b & d) | (c & ~d), a, b, x, s, t);
}

function hh(a: number, b: number, c: number, d: number, x: number, s: number, t: number): number {
	return common(b ^ c ^ d, a, b, x, s, t);
}

function ii(a: number, b: number, c: number, d: number, x: number, s: number, t: number): number {
	return common(c ^ (b | ~d), a, b, x, s, t);
}

function rotateLeft(value: number, count: number): number {
	return (value << count) | (value >>> (32 - count));
}

function add32(a: number, b: number): number {
	return (a + b) | 0;
}

function wordToHex(value: number): string {
	let result = '';
	for (let index = 0; index < 4; index += 1) {
		const byte = (value >>> (index * 8)) & 255;
		result += HEX[byte >> 4] + HEX[byte & 15];
	}
	return result;
}
