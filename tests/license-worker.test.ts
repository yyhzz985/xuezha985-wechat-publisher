import test from 'node:test';
import assert from 'node:assert/strict';
import worker from '../worker/src/index';

type Row = Record<string, unknown>;

class MemoryD1 {
	licenses = new Map<string, Row>();
	activations: Row[] = [];
	orders = new Map<string, Row>();
	paymentEvents: Row[] = [];
	licenseEvents: Row[] = [];

	prepare(sql: string) {
		return new MemoryD1Statement(this, sql);
	}
}

class MemoryD1Statement {
	private params: unknown[] = [];

	constructor(private readonly db: MemoryD1, private readonly sql: string) {}

	bind(...params: unknown[]) {
		this.params = params;
		return this;
	}

	async first<T = Row>(): Promise<T | null> {
		const sql = this.sql;
		if (sql.startsWith('SELECT * FROM licenses WHERE license_hash = ?')) {
			return (this.db.licenses.get(String(this.params[0])) ?? null) as T | null;
		}
		if (sql.includes('COUNT(*) AS count FROM license_activations')) {
			const count = this.db.activations.filter((row) => row.license_hash === this.params[0]).length;
			return { count } as T;
		}
		if (sql.includes('FROM license_activations WHERE license_hash = ? AND device_id = ?')) {
			return (this.db.activations.find((row) => row.license_hash === this.params[0] && row.device_id === this.params[1]) ?? null) as T | null;
		}
		if (sql.includes('FROM license_activations WHERE license_id = (SELECT id FROM licenses WHERE license_hash = ?) AND device_id = ?')) {
			return (this.db.activations.find((row) => row.license_hash === this.params[0] && row.device_id === this.params[1]) ?? null) as T | null;
		}
		if (sql.includes('FROM orders WHERE order_no = ? AND public_token = ?')) {
			const order = this.db.orders.get(String(this.params[0]));
			return (order && order.public_token === this.params[1] ? order : null) as T | null;
		}
		if (sql.includes('FROM orders WHERE order_no = ?')) {
			return (this.db.orders.get(String(this.params[0])) ?? null) as T | null;
		}
		throw new Error(`Unhandled first SQL: ${sql}`);
	}

	async run(): Promise<{ success: boolean }> {
		const sql = this.sql;
		if (sql.startsWith('INSERT INTO licenses')) {
			const [
				license_hash,
				plan,
				features,
				expires_at,
				max_devices,
				active,
				note,
				message,
				created_at,
				updated_at,
			] = this.params;
			this.db.licenses.set(String(license_hash), {
				license_hash,
				plan,
				features,
				expires_at,
				max_devices,
				active,
				note,
				message,
				created_at,
				updated_at,
			});
			return { success: true };
		}
		if (sql.startsWith('INSERT INTO license_activations')) {
			const [license_hash, device_id, created_at, last_seen_at] = this.params;
			this.db.activations.push({ license_hash, device_id, created_at, last_seen_at });
			return { success: true };
		}
		if (sql.startsWith('UPDATE license_activations SET last_seen_at')) {
			for (const row of this.db.activations) {
				if (row.license_hash === this.params[1] && row.device_id === this.params[2]) {
					row.last_seen_at = this.params[0];
				}
			}
			return { success: true };
		}
		if (sql.startsWith('DELETE FROM license_activations')) {
			this.db.activations = this.db.activations.filter((row) => row.license_hash !== this.params[0]);
			return { success: true };
		}
		if (sql.startsWith('INSERT INTO orders')) {
			const [
				order_no,
				public_token,
				status,
				plan,
				amount_cents,
				payway,
				payment_provider,
				payment_url,
				license_hash,
				license_key_ciphertext,
				created_at,
				updated_at,
			] = this.params;
			this.db.orders.set(String(order_no), {
				order_no,
				public_token,
				status,
				plan,
				amount_cents,
				payway,
				payment_provider,
				payment_url,
				license_hash,
				license_key_ciphertext,
				created_at,
				updated_at,
			});
			return { success: true };
		}
		if (sql.startsWith('UPDATE orders SET status = ?')) {
			const order = this.db.orders.get(String(this.params[9]));
			if (order) {
				order.status = this.params[0];
				order.provider_charge_id = this.params[1];
				order.paid_at = this.params[2];
				order.issued_at = this.params[3];
				order.license_hash = this.params[4];
				order.license_key_ciphertext = this.params[5];
				order.payment_url = this.params[6];
				order.raw_query_json = this.params[7];
				order.updated_at = this.params[8];
			}
			return { success: true };
		}
		if (sql.startsWith('UPDATE licenses SET active = 0')) {
			const license = this.db.licenses.get(String(this.params[2]));
			if (license) {
				license.active = 0;
				license.message = this.params[0];
				license.updated_at = this.params[1];
			}
			return { success: true };
		}
		if (sql.startsWith('UPDATE licenses SET expires_at = ?')) {
			const license = this.db.licenses.get(String(this.params[2]));
			if (license) {
				license.expires_at = this.params[0];
				license.updated_at = this.params[1];
			}
			return { success: true };
		}
		if (sql.startsWith('INSERT INTO payment_events')) {
			this.db.paymentEvents.push({
				event_id: this.params[0],
				provider: this.params[1],
				event_type: this.params[2],
				order_no: this.params[3],
				payload_json: this.params[4],
				created_at: this.params[5],
			});
			return { success: true };
		}
		if (sql.startsWith('INSERT INTO license_events')) {
			this.db.licenseEvents.push({
				license_hash: this.params[0],
				event_type: this.params[1],
				device_id: this.params[2],
				message: this.params[3],
				created_at: this.params[4],
			});
			return { success: true };
		}
		throw new Error(`Unhandled run SQL: ${sql}`);
	}
}

interface TestEnv {
	DB: MemoryD1;
	ADMIN_TOKEN: string;
	LICENSE_HASH_SECRET: string;
	MBD_APP_ID: string;
	MBD_APP_KEY: string;
	MBD_PRO_YEAR_AMOUNT_CENTS: string;
	PUBLIC_BASE_URL: string;
}

function createEnv(): TestEnv {
	return {
		DB: new MemoryD1(),
		ADMIN_TOKEN: 'admin-token',
		LICENSE_HASH_SECRET: 'hash-secret',
		MBD_APP_ID: 'mbd-app-id',
		MBD_APP_KEY: 'mbd-app-key',
		MBD_PRO_YEAR_AMOUNT_CENTS: '9900',
		PUBLIC_BASE_URL: 'https://license.example.com',
	};
}

function jsonRequest(path: string, body: unknown, headers: Record<string, string> = {}): Request {
	return new Request(`https://license.example.com${path}`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json', ...headers },
		body: JSON.stringify(body),
	});
}

async function issueLicense(env: TestEnv): Promise<string> {
	const response = await worker.fetch(
		jsonRequest('/v1/admin/licenses/issue', { days: 365, note: 'test key' }, { Authorization: 'Bearer admin-token' }),
		env,
	);
	assert.equal(response.status, 200);
	const body = await response.json() as { licenseKey: string };
	assert.match(body.licenseKey, /^PRO-/);
	return body.licenseKey;
}

async function verify(env: TestEnv, licenseKey: string, deviceId: string): Promise<Record<string, unknown>> {
	const response = await worker.fetch(
		jsonRequest('/v1/licenses/verify', {
			licenseKey,
			deviceId,
			pluginId: 'wechat-publisher',
			pluginVersion: '0.1.0',
			feature: 'wechat_upload',
		}),
		env,
	);
	assert.equal(response.status, 200);
	return response.json() as Promise<Record<string, unknown>>;
}

test('worker binds a pro license to one device by default', async () => {
	const env = createEnv();
	const licenseKey = await issueLicense(env);

	const firstDevice = await verify(env, licenseKey, 'device-a');
	assert.equal(firstDevice.active, true);
	assert.equal(firstDevice.plan, 'pro');
	assert.deepEqual(firstDevice.features, ['wechat_upload']);
	assert.match(String(firstDevice.expiresAt), /^\d{4}-\d{2}-\d{2}T/);
	assert.equal(firstDevice.message, 'ok');
	assert.equal(firstDevice.maxDevices, 1);
	assert.equal(firstDevice.usedDevices, 1);
	assert.equal(firstDevice.deviceBound, true);
	const sameDevice = await verify(env, licenseKey, 'device-a');
	assert.equal(sameDevice.active, true);
	assert.equal(sameDevice.usedDevices, 1);

	const otherDevice = await verify(env, licenseKey, 'device-b');
	assert.equal(otherDevice.active, false);
	assert.match(String(otherDevice.message), /已绑定其他设备/);

	const reset = await worker.fetch(
		jsonRequest('/v1/admin/licenses/reset-device', { licenseKey }, { Authorization: 'Bearer admin-token' }),
		env,
	);
	assert.equal(reset.status, 200);
	const afterReset = await verify(env, licenseKey, 'device-b');
	assert.equal(afterReset.active, true);
	assert.equal(afterReset.usedDevices, 1);
});

test('worker creates payment order and issues one license after verified webhook', async () => {
	const env = createEnv();
	const originalFetch = globalThis.fetch;
	const fetchCalls: Array<{ url: string; body: Record<string, unknown> }> = [];
	globalThis.fetch = (async (input: RequestInfo | URL, init?: RequestInit) => {
		const url = String(input);
		const body = JSON.parse(String(init?.body ?? '{}')) as Record<string, unknown>;
		fetchCalls.push({ url, body });
		if (url.includes('/wx/prepay')) {
			return Response.json({ h5_url: 'https://wx-pay.example.com/pay' });
		}
		if (url.includes('/search_order')) {
			return Response.json({
				order_id: body.out_trade_no,
				charge_id: 'charge-1',
				description: '公众号排版器 Pro 年费',
				amount: '9900',
				state: '1',
				payway: '1',
				refund_state: '0',
				refund_amount: '0',
			});
		}
		return Response.json({ error: 'unexpected request' }, { status: 500 });
	}) as typeof fetch;

	try {
		const createResponse = await worker.fetch(
			jsonRequest('/v1/orders/create', { payway: 'wechat_h5' }),
			env,
		);
		assert.equal(createResponse.status, 200);
		const order = await createResponse.json() as { orderNo: string; orderUrl: string; paymentUrl: string };
		assert.match(order.orderNo, /^WP/);
		assert.equal(order.paymentUrl, 'https://wx-pay.example.com/pay');

		const webhookBody = {
			type: 'charge_succeeded',
			data: {
				out_trade_no: order.orderNo,
				amount: 9900,
				charge_id: 'charge-1',
				payway: 1,
			},
		};
		const firstWebhook = await worker.fetch(jsonRequest('/v1/pay/mbd/webhook', webhookBody), env);
		const secondWebhook = await worker.fetch(jsonRequest('/v1/pay/mbd/webhook', webhookBody), env);
		assert.equal(firstWebhook.status, 200);
		assert.equal(secondWebhook.status, 200);
		assert.equal(env.DB.licenses.size, 1);

		const orderPage = await worker.fetch(new Request(order.orderUrl), env);
		const html = await orderPage.text();
		assert.match(html, /PRO-/);
		assert.match(html, /复制这个 License Key/);
		assert.equal(fetchCalls.filter((call) => call.url.includes('/search_order')).length, 1);
	} finally {
		globalThis.fetch = originalFetch;
	}
});
