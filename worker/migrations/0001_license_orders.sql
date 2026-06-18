CREATE TABLE IF NOT EXISTS licenses (
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	license_hash TEXT NOT NULL UNIQUE,
	plan TEXT NOT NULL,
	features TEXT NOT NULL,
	expires_at TEXT NOT NULL,
	max_devices INTEGER NOT NULL DEFAULT 1,
	active INTEGER NOT NULL DEFAULT 1,
	note TEXT NOT NULL DEFAULT '',
	message TEXT NOT NULL DEFAULT '',
	created_at TEXT NOT NULL,
	updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS license_activations (
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	license_id INTEGER NOT NULL,
	device_id TEXT NOT NULL,
	created_at TEXT NOT NULL,
	last_seen_at TEXT NOT NULL,
	UNIQUE (license_id, device_id),
	FOREIGN KEY (license_id) REFERENCES licenses(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS license_events (
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	license_id INTEGER,
	license_hash TEXT NOT NULL,
	event_type TEXT NOT NULL,
	device_id TEXT NOT NULL DEFAULT '',
	message TEXT NOT NULL DEFAULT '',
	created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS orders (
	order_no TEXT PRIMARY KEY,
	public_token TEXT NOT NULL,
	status TEXT NOT NULL,
	plan TEXT NOT NULL,
	amount_cents INTEGER NOT NULL,
	payway TEXT NOT NULL,
	payment_provider TEXT NOT NULL,
	payment_url TEXT,
	license_hash TEXT,
	license_key_ciphertext TEXT,
	provider_charge_id TEXT,
	paid_at TEXT,
	issued_at TEXT,
	raw_query_json TEXT,
	created_at TEXT NOT NULL,
	updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS payment_events (
	event_id TEXT PRIMARY KEY,
	provider TEXT NOT NULL,
	event_type TEXT NOT NULL,
	order_no TEXT,
	payload_json TEXT NOT NULL,
	created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_license_activations_license_id ON license_activations (license_id);
CREATE INDEX IF NOT EXISTS idx_license_events_license_hash ON license_events (license_hash);
CREATE INDEX IF NOT EXISTS idx_license_events_created_at ON license_events (created_at);
CREATE INDEX IF NOT EXISTS idx_orders_license_hash ON orders (license_hash);
