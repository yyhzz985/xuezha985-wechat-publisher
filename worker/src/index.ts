import { D1Repository } from './repository/D1Repository';
import { LicenseService } from './service/LicenseService';
import type { VerifyRequest, WorkerEnv } from './types';
import { denied, escapeHtml, html, json, options, readJson } from './utils/http';

export default {
	async fetch(request: Request, env: WorkerEnv): Promise<Response> {
		if (request.method === 'OPTIONS') {
			return options();
		}

		const url = new URL(request.url);
		const repository = new D1Repository(env.DB);
		const licenseService = new LicenseService(repository, requireSecret(env.LICENSE_HASH_SECRET, 'LICENSE_HASH_SECRET'));

		try {
			if (request.method === 'POST' && url.pathname === '/v1/licenses/verify') {
				return handleVerify(request, licenseService);
			}
			if (request.method === 'GET' && url.pathname === '/buy') {
				return html(renderMessagePage('购买入口暂未开放', '当前版本先使用手动发放激活码。请联系渣姐微信 237219265 获取 License Key。'), 404);
			}
			if (request.method === 'POST' && url.pathname === '/v1/orders/create') {
				return json({ error: '购买入口暂未开放，请联系渣姐微信 237219265 获取激活码' }, 404);
			}
			if (request.method === 'POST' && url.pathname === '/v1/pay/mbd/webhook') {
				return json({ error: '购买入口暂未开放' }, 404);
			}
			if (request.method === 'GET' && url.pathname.startsWith('/order/')) {
				return handleOrderPage(url, repository, licenseService);
			}
			if (url.pathname.startsWith('/v1/admin/')) {
				return handleAdmin(request, url, licenseService, env);
			}
			return json({ active: false, plan: 'free', features: [], expiresAt: '', message: 'Not found' }, 404);
		} catch (error) {
			return json({ error: error instanceof Error ? error.message : String(error) }, 500);
		}
	},
};

async function handleVerify(request: Request, licenseService: LicenseService): Promise<Response> {
	let body: Partial<VerifyRequest>;
	try {
		body = await readJson<Partial<VerifyRequest>>(request);
	} catch {
		return denied('请求 JSON 无效');
	}

	const validationError = validateVerifyRequest(body);
	if (validationError) {
		return denied(validationError);
	}

	return json(await licenseService.verify(body as VerifyRequest));
}

async function handleOrderPage(url: URL, repository: D1Repository, licenseService: LicenseService): Promise<Response> {
	const orderNo = decodeURIComponent(url.pathname.replace('/order/', '')).trim();
	const token = url.searchParams.get('token') ?? '';
	const order = await repository.findPublicOrder(orderNo, token);
	if (!order) {
		return html(renderMessagePage('订单不存在', '请确认链接是否完整。'), 404);
	}
	const licenseKey = await licenseService.getLicenseKeyForOrder(orderNo);
	if (!licenseKey) {
		return html(renderMessagePage('等待支付确认', '如果你已经完成支付，请稍后刷新这个页面。'));
	}
	return html(renderLicensePage(licenseKey, orderNo));
}

async function handleAdmin(request: Request, url: URL, licenseService: LicenseService, env: WorkerEnv): Promise<Response> {
	if (!isAdminRequest(request, env)) {
		return json({ error: 'Unauthorized' }, 401);
	}
	if (request.method !== 'POST') {
		return json({ error: 'Method not allowed' }, 405);
	}

	const body = await readJson<Record<string, unknown>>(request);
	if (url.pathname === '/v1/admin/licenses/issue') {
		const days = normalizeDays(body.days);
		return json(await licenseService.issue({
			days,
			note: typeof body.note === 'string' ? body.note : '',
			source: 'admin',
		}));
	}
	if (url.pathname === '/v1/admin/licenses/reset-device') {
		await licenseService.resetDevice(requireLicenseKey(body));
		return json({ ok: true });
	}
	if (url.pathname === '/v1/admin/licenses/disable') {
		await licenseService.disable(requireLicenseKey(body));
		return json({ ok: true });
	}
	if (url.pathname === '/v1/admin/licenses/extend') {
		const expiresAt = await licenseService.extend(requireLicenseKey(body), normalizeDays(body.days));
		return json({ ok: true, expiresAt });
	}
	return json({ error: 'Not found' }, 404);
}

function validateVerifyRequest(body: Partial<VerifyRequest>): string | null {
	if (!isNonEmptyString(body.licenseKey)) {
		return '缺少 licenseKey';
	}
	if (!isNonEmptyString(body.deviceId)) {
		return '缺少 deviceId';
	}
	if (!isNonEmptyString(body.pluginId)) {
		return '缺少 pluginId';
	}
	if (!isNonEmptyString(body.pluginVersion)) {
		return '缺少 pluginVersion';
	}
	if (body.feature !== 'wechat_upload') {
		return '缺少 feature';
	}
	return null;
}

function requireSecret(value: string | undefined, name: string): string {
	if (!value?.trim()) {
		throw new Error(`${name} 未配置`);
	}
	return value.trim();
}

function isAdminRequest(request: Request, env: WorkerEnv): boolean {
	const token = env.ADMIN_TOKEN?.trim();
	return Boolean(token) && request.headers.get('Authorization') === `Bearer ${token}`;
}

function requireLicenseKey(body: Record<string, unknown>): string {
	if (typeof body.licenseKey !== 'string' || !body.licenseKey.trim()) {
		throw new Error('缺少 licenseKey');
	}
	return body.licenseKey.trim();
}

function normalizeDays(value: unknown): number {
	const days = Number(value ?? 365);
	if (!Number.isInteger(days) || days < 1) {
		throw new Error('days 必须大于 0');
	}
	return days;
}

function isNonEmptyString(value: unknown): value is string {
	return typeof value === 'string' && value.trim().length > 0;
}

function renderLicensePage(licenseKey: string, orderNo: string): string {
	return `<!doctype html>
<html lang="zh-CN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>License Key</title><style>body{font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;margin:0;background:#f6f7f8;color:#222}main{max-width:560px;margin:0 auto;padding:48px 20px}.card{background:#fff;border:1px solid #e7e7e7;border-radius:12px;padding:24px}.key{padding:14px;border:1px dashed #2a9d8f;border-radius:8px;font-size:20px;font-weight:700;word-break:break-all}</style></head>
<body><main><section class="card"><h1>支付成功</h1><p>复制这个 License Key，回到 Obsidian 插件设置里粘贴并校验。</p><p class="key">${escapeHtml(licenseKey)}</p><p>订单号：${escapeHtml(orderNo)}</p></section></main></body></html>`;
}

function renderMessagePage(title: string, message: string): string {
	return `<!doctype html><html lang="zh-CN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escapeHtml(title)}</title></head><body><main style="max-width:560px;margin:48px auto;font-family:sans-serif"><h1>${escapeHtml(title)}</h1><p>${escapeHtml(message)}</p></main></body></html>`;
}
