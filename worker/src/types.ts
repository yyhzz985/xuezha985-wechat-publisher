export interface D1Result {
	success: boolean;
}

export interface D1PreparedStatement {
	bind(...values: unknown[]): D1PreparedStatement;
	first<T = Record<string, unknown>>(): Promise<T | null>;
	run(): Promise<D1Result>;
}

export interface D1Database {
	prepare(query: string): D1PreparedStatement;
}

export interface WorkerEnv {
	DB: D1Database;
	ADMIN_TOKEN?: string;
	LICENSE_HASH_SECRET?: string;
	MBD_APP_ID?: string;
	MBD_APP_KEY?: string;
	MBD_PRO_YEAR_AMOUNT_CENTS?: string;
	PUBLIC_BASE_URL?: string;
}

export type ProFeature = 'wechat_upload';
export type LicensePlan = 'free' | 'pro';
export type LicenseStatus = 'active' | 'disabled' | 'refunded';
export type OrderStatus = 'pending' | 'paid' | 'issued' | 'refunded' | 'complaint';
export type Payway = 'wechat_h5' | 'alipay';

export interface LicenseRow {
	id?: number;
	license_hash: string;
	plan: LicensePlan;
	features: string;
	expires_at: string;
	max_devices: number;
	active: number;
	note: string;
	message: string;
	created_at: string;
	updated_at: string;
}

export interface ActivationRow {
	id?: number;
	license_id?: number;
	device_id: string;
	plugin_version?: string;
	created_at: string;
	last_seen_at: string;
}

export interface OrderRow {
	order_no: string;
	public_token: string;
	status: OrderStatus;
	plan: LicensePlan;
	amount_cents: number;
	payway: Payway;
	payment_provider: string;
	payment_url: string | null;
	license_hash: string | null;
	license_key_ciphertext?: string | null;
	created_at: string;
	updated_at: string;
	paid_at?: string | null;
	issued_at?: string | null;
	provider_charge_id?: string | null;
	raw_query_json?: string | null;
}

export interface VerifyRequest {
	licenseKey: string;
	deviceId: string;
	pluginId: string;
	pluginVersion: string;
	feature: ProFeature;
}

export interface VerifyResponse {
	active: boolean;
	plan: LicensePlan;
	features: ProFeature[];
	expiresAt: string;
	message: string;
	maxDevices?: number;
	usedDevices?: number;
	deviceBound?: boolean;
}
