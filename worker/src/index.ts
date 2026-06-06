interface LicenseRecord {
	active: boolean;
	plan: 'free' | 'pro';
	features: string[];
	expiresAt: string;
	message?: string;
	note?: string;
}

interface VerifyRequest {
	licenseKey: string;
	deviceId: string;
	pluginId: string;
	pluginVersion: string;
	feature: string;
}

interface VerifyResponse {
	active: boolean;
	plan: 'free' | 'pro';
	features: string[];
	expiresAt: string;
	message: string;
}

interface KvNamespace {
	get(key: string): Promise<string | null>;
}

interface WorkerEnv {
	LICENSES: KvNamespace;
}

const jsonHeaders = {
	'Content-Type': 'application/json; charset=utf-8',
	'Access-Control-Allow-Origin': '*',
	'Access-Control-Allow-Methods': 'POST, OPTIONS',
	'Access-Control-Allow-Headers': 'Content-Type',
};

export default {
	async fetch(request: Request, env: WorkerEnv): Promise<Response> {
		const url = new URL(request.url);
		if (request.method === 'OPTIONS') {
			return new Response(null, { status: 204, headers: jsonHeaders });
		}
		if (request.method !== 'POST' || url.pathname !== '/v1/licenses/verify') {
			return json({ active: false, plan: 'free', features: [], expiresAt: '', message: 'Not found' }, 404);
		}

		let body: VerifyRequest;
		try {
			body = await request.json() as VerifyRequest;
		} catch {
			return json({ active: false, plan: 'free', features: [], expiresAt: '', message: '请求 JSON 无效' });
		}

		const validationError = validateRequest(body);
		if (validationError) {
			return json({ active: false, plan: 'free', features: [], expiresAt: '', message: validationError });
		}

		const rawRecord = await env.LICENSES.get(`license:${body.licenseKey}`);
		if (!rawRecord) {
			return json({ active: false, plan: 'free', features: [], expiresAt: '', message: 'License 不存在' });
		}

		let record: LicenseRecord;
		try {
			record = JSON.parse(rawRecord) as LicenseRecord;
		} catch {
			return json({ active: false, plan: 'free', features: [], expiresAt: '', message: 'License 数据无效' });
		}

		return json(verifyRecord(record, body.feature));
	},
};

function verifyRecord(record: LicenseRecord, feature: string): VerifyResponse {
	if (!record.active) {
		return toDenied(record, record.message ?? 'License 已禁用');
	}
	if (record.plan !== 'pro') {
		return toDenied(record, 'License 未开通 Pro');
	}
	if (!record.features.includes(feature)) {
		return toDenied(record, 'License 未开通该功能');
	}
	if (!isFuture(record.expiresAt)) {
		return toDenied(record, 'License 已过期');
	}
	return {
		active: true,
		plan: 'pro',
		features: record.features,
		expiresAt: record.expiresAt,
		message: 'ok',
	};
}

function toDenied(record: LicenseRecord, message: string): VerifyResponse {
	return {
		active: false,
		plan: 'free',
		features: [],
		expiresAt: record.expiresAt ?? '',
		message,
	};
}

function validateRequest(body: Partial<VerifyRequest>): string | null {
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
	if (!isNonEmptyString(body.feature)) {
		return '缺少 feature';
	}
	return null;
}

function isNonEmptyString(value: unknown): value is string {
	return typeof value === 'string' && value.trim().length > 0;
}

function isFuture(date: string): boolean {
	const timestamp = Date.parse(date);
	return Number.isFinite(timestamp) && timestamp > Date.now();
}

function json(body: VerifyResponse, status = 200): Response {
	return Response.json(body, {
		status,
		headers: jsonHeaders,
	});
}
