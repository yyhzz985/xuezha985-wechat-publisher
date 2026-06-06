import type { ActivationRow, D1Database, LicenseRow, OrderStatus, OrderRow } from '../types';

export class D1Repository {
	constructor(private readonly db: D1Database) {}

	async createLicense(record: LicenseRow): Promise<void> {
		await this.db.prepare(
			'INSERT INTO licenses (license_hash, plan, features, expires_at, max_devices, active, note, message, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
		).bind(
			record.license_hash,
			record.plan,
			record.features,
			record.expires_at,
			record.max_devices,
			record.active,
			record.note,
			record.message,
			record.created_at,
			record.updated_at,
		).run();
	}

	async findLicenseByHash(licenseHash: string): Promise<LicenseRow | null> {
		return this.db.prepare('SELECT * FROM licenses WHERE license_hash = ?')
			.bind(licenseHash)
			.first<LicenseRow>();
	}

	async countActivations(licenseHash: string): Promise<number> {
		const row = await this.db.prepare(
			'SELECT COUNT(*) AS count FROM license_activations WHERE license_id = (SELECT id FROM licenses WHERE license_hash = ?)',
		)
			.bind(licenseHash)
			.first<{ count: number }>();
		return Number(row?.count ?? 0);
	}

	async findActivation(licenseHash: string, deviceId: string): Promise<ActivationRow | null> {
		return this.db.prepare(
			'SELECT * FROM license_activations WHERE license_id = (SELECT id FROM licenses WHERE license_hash = ?) AND device_id = ?',
		)
			.bind(licenseHash, deviceId)
			.first<ActivationRow>();
	}

	async createActivation(licenseHash: string, record: ActivationRow): Promise<void> {
		await this.db.prepare(
			'INSERT INTO license_activations (license_id, device_id, created_at, last_seen_at) VALUES ((SELECT id FROM licenses WHERE license_hash = ?), ?, ?, ?)',
		).bind(
			licenseHash,
			record.device_id,
			record.created_at,
			record.last_seen_at,
		).run();
	}

	async touchActivation(licenseHash: string, deviceId: string, now: string): Promise<void> {
		await this.db.prepare(
			'UPDATE license_activations SET last_seen_at = ? WHERE license_id = (SELECT id FROM licenses WHERE license_hash = ?) AND device_id = ?',
		)
			.bind(now, licenseHash, deviceId)
			.run();
	}

	async resetActivations(licenseHash: string): Promise<void> {
		await this.db.prepare('DELETE FROM license_activations WHERE license_id = (SELECT id FROM licenses WHERE license_hash = ?)')
			.bind(licenseHash)
			.run();
	}

	async createOrder(record: OrderRow): Promise<void> {
		await this.db.prepare(
			'INSERT INTO orders (order_no, public_token, status, plan, amount_cents, payway, payment_provider, payment_url, license_hash, license_key_ciphertext, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
		).bind(
			record.order_no,
			record.public_token,
			record.status,
			record.plan,
			record.amount_cents,
			record.payway,
			record.payment_provider,
			record.payment_url,
			record.license_hash,
			record.license_key_ciphertext ?? null,
			record.created_at,
			record.updated_at,
		).run();
	}

	async findOrder(orderNo: string): Promise<OrderRow | null> {
		return this.db.prepare('SELECT * FROM orders WHERE order_no = ?')
			.bind(orderNo)
			.first<OrderRow>();
	}

	async findPublicOrder(orderNo: string, publicToken: string): Promise<OrderRow | null> {
		return this.db.prepare('SELECT * FROM orders WHERE order_no = ? AND public_token = ?')
			.bind(orderNo, publicToken)
			.first<OrderRow>();
	}

	async markOrderIssued(
		orderNo: string,
		status: OrderStatus,
		chargeId: string,
		paidAt: string,
		issuedAt: string,
		licenseHash: string,
		licenseKeyCiphertext: string,
		paymentUrl: string | null,
		rawQueryJson: string,
		now: string,
	): Promise<void> {
		await this.db.prepare('UPDATE orders SET status = ?, provider_charge_id = ?, paid_at = ?, issued_at = ?, license_hash = ?, license_key_ciphertext = ?, payment_url = ?, raw_query_json = ?, updated_at = ? WHERE order_no = ?')
			.bind(status, chargeId, paidAt, issuedAt, licenseHash, licenseKeyCiphertext, paymentUrl, rawQueryJson, now, orderNo)
			.run();
	}

	async disableLicense(licenseHash: string, message: string, now: string): Promise<void> {
		await this.db.prepare('UPDATE licenses SET active = 0, message = ?, updated_at = ? WHERE license_hash = ?')
			.bind(message, now, licenseHash)
			.run();
	}

	async extendLicense(licenseHash: string, expiresAt: string, now: string): Promise<void> {
		await this.db.prepare('UPDATE licenses SET expires_at = ?, updated_at = ? WHERE license_hash = ?')
			.bind(expiresAt, now, licenseHash)
			.run();
	}

	async createPaymentEvent(eventId: string, eventType: string, orderNo: string | null, payloadJson: string, now: string): Promise<void> {
		await this.db.prepare('INSERT INTO payment_events (event_id, provider, event_type, order_no, payload_json, created_at) VALUES (?, ?, ?, ?, ?, ?)')
			.bind(eventId, 'mbd', eventType, orderNo, payloadJson, now)
			.run();
	}

	async createLicenseEvent(eventId: string, licenseHash: string | null, orderNo: string | null, eventType: string, message: string, now: string): Promise<void> {
		await this.db.prepare('INSERT INTO license_events (license_hash, event_type, device_id, message, created_at) VALUES (?, ?, ?, ?, ?)')
			.bind(licenseHash, eventType, orderNo ?? eventId, message, now)
			.run();
	}
}
