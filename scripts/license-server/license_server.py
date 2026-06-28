#!/usr/bin/env python3
"""Small HTTP license verification service for Kenengba WeChat Publisher."""

import hashlib
import json
import os
import sqlite3
import sys
from datetime import datetime
from http.server import BaseHTTPRequestHandler, HTTPServer
from socketserver import ThreadingMixIn


FEATURE = "wechat_upload"


def sha256_hex(value):
    return hashlib.sha256(value.encode("utf-8")).hexdigest()


def hash_license(secret, license_key):
    return sha256_hex("%s:%s" % (secret, license_key.strip()))


def hash_device(secret, device_id):
    return sha256_hex("%s:device:%s" % (secret, device_id.strip()))


def utc_now():
    return datetime.utcnow().replace(microsecond=0).isoformat() + "Z"


def is_future(value):
    try:
        normalized = value.rstrip("Z")
        if "." in normalized:
            parsed = datetime.strptime(normalized, "%Y-%m-%dT%H:%M:%S.%f")
        else:
            parsed = datetime.strptime(normalized, "%Y-%m-%dT%H:%M:%S")
        return parsed > datetime.utcnow()
    except Exception:
        return False


def parse_features(value):
    try:
        features = json.loads(value)
    except Exception:
        return []
    return [feature for feature in features if feature == FEATURE]


def allowed(row, features, used_devices, device_bound):
    return {
        "active": True,
        "plan": "pro",
        "features": features,
        "expiresAt": row["expires_at"],
        "message": "ok",
        "maxDevices": row["max_devices"],
        "usedDevices": used_devices,
        "deviceBound": device_bound,
    }


def denied(message, row=None, used_devices=0, device_bound=False):
    return {
        "active": False,
        "plan": "free",
        "features": [],
        "expiresAt": row["expires_at"] if row else "",
        "message": message,
        "maxDevices": row["max_devices"] if row else None,
        "usedDevices": used_devices,
        "deviceBound": device_bound,
    }


class ThreadingHTTPServer(ThreadingMixIn, HTTPServer):
    daemon_threads = True


class LicenseHandler(BaseHTTPRequestHandler):
    server_version = "KenengbaLicense/1.0"

    def do_OPTIONS(self):
        self.send_response(204)
        self.add_cors_headers()
        self.end_headers()

    def do_GET(self):
        if self.path in ("/health", "/v1/health"):
            self.respond_json(200, {"ok": True})
            return
        self.respond_json(404, {"error": "Not found"})

    def do_POST(self):
        if self.path != "/v1/licenses/verify":
            self.respond_json(404, {"active": False, "plan": "free", "features": [], "expiresAt": "", "message": "Not found"})
            return

        try:
            body = self.read_json()
        except Exception:
            self.respond_json(200, denied("请求 JSON 无效"))
            return

        validation_error = self.validate_verify_request(body)
        if validation_error:
            self.respond_json(200, denied(validation_error))
            return

        response = self.verify(body)
        self.respond_json(200, response)

    def read_json(self):
        length = int(self.headers.get("Content-Length") or "0")
        if length <= 0 or length > 64 * 1024:
            raise ValueError("invalid body length")
        payload = self.rfile.read(length).decode("utf-8")
        return json.loads(payload)

    def validate_verify_request(self, body):
        for key in ("licenseKey", "deviceId", "pluginId", "pluginVersion"):
            value = body.get(key)
            if not isinstance(value, str) or not value.strip():
                return "缺少 %s" % key
        if body.get("feature") != FEATURE:
            return "缺少 feature"
        return None

    def verify(self, body):
        secret = self.server.hash_secret
        license_hash = hash_license(secret, body["licenseKey"])
        device_hash = hash_device(secret, body["deviceId"])
        now = utc_now()

        with self.open_db() as conn:
            license_row = conn.execute(
                "SELECT * FROM licenses WHERE license_hash = ?",
                (license_hash,),
            ).fetchone()

            if not license_row:
                legacy = self.find_legacy_entitlement(conn, device_hash)
                if legacy:
                    return legacy
                return denied("License 不存在")

            features = parse_features(license_row["features"])
            used_devices = self.count_activations(conn, license_hash)

            if int(license_row["active"]) != 1:
                return denied(license_row["message"] or "License 已禁用", license_row, used_devices)
            if license_row["plan"] != "pro":
                return denied("License 未开通 Pro", license_row, used_devices)
            if FEATURE not in features:
                return denied("License 未开通该功能", license_row, used_devices)
            if not is_future(license_row["expires_at"]):
                return denied("License 已过期", license_row, used_devices)

            activation = conn.execute(
                """
                SELECT * FROM license_activations
                WHERE license_id = (SELECT id FROM licenses WHERE license_hash = ?)
                  AND device_hash = ?
                """,
                (license_hash, device_hash),
            ).fetchone()

            if activation:
                conn.execute(
                    """
                    UPDATE license_activations
                    SET last_seen_at = ?, plugin_version = ?
                    WHERE license_id = (SELECT id FROM licenses WHERE license_hash = ?)
                      AND device_hash = ?
                    """,
                    (now, body["pluginVersion"], license_hash, device_hash),
                )
                conn.commit()
                return allowed(license_row, features, used_devices, True)

            if used_devices >= int(license_row["max_devices"]):
                return denied("该 License 已绑定其他设备，请联系解绑", license_row, used_devices, False)

            conn.execute(
                """
                INSERT INTO license_activations (license_id, device_hash, plugin_version, created_at, last_seen_at)
                VALUES ((SELECT id FROM licenses WHERE license_hash = ?), ?, ?, ?, ?)
                """,
                (license_hash, device_hash, body["pluginVersion"], now, now),
            )
            conn.execute(
                """
                INSERT INTO license_events (license_id, license_hash, event_type, device_hash, message, created_at)
                VALUES ((SELECT id FROM licenses WHERE license_hash = ?), ?, 'device_bound', ?, '', ?)
                """,
                (license_hash, license_hash, device_hash, now),
            )
            conn.commit()
            return allowed(license_row, features, used_devices + 1, True)

    def find_legacy_entitlement(self, conn, device_hash):
        row = conn.execute(
            "SELECT * FROM legacy_device_entitlements WHERE device_hash = ?",
            (device_hash,),
        ).fetchone()
        if not row:
            return None
        features = parse_features(row["features"])
        if int(row["active"]) != 1 or row["plan"] != "pro" or FEATURE not in features or not is_future(row["expires_at"]):
            return None
        return allowed(row, features, 1, True)

    def count_activations(self, conn, license_hash):
        row = conn.execute(
            """
            SELECT COUNT(*) AS count
            FROM license_activations
            WHERE license_id = (SELECT id FROM licenses WHERE license_hash = ?)
            """,
            (license_hash,),
        ).fetchone()
        return int(row["count"] if row else 0)

    def open_db(self):
        conn = sqlite3.connect(self.server.db_path, timeout=10)
        conn.row_factory = sqlite3.Row
        conn.execute("PRAGMA foreign_keys = ON")
        return conn

    def respond_json(self, status, body):
        payload = json.dumps(body, ensure_ascii=False, separators=(",", ":")).encode("utf-8")
        self.send_response(status)
        self.add_cors_headers()
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Cache-Control", "no-store")
        self.send_header("Content-Length", str(len(payload)))
        self.end_headers()
        self.wfile.write(payload)

    def add_cors_headers(self):
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")

    def log_message(self, fmt, *args):
        sys.stderr.write("%s - - [%s] %s\n" % (self.address_string(), self.log_date_time_string(), fmt % args))


def load_env_file(path):
    if not path or not os.path.exists(path):
        return
    with open(path, "r", encoding="utf-8") as file:
        for line in file:
            line = line.strip()
            if not line or line.startswith("#") or "=" not in line:
                continue
            key, value = line.split("=", 1)
            os.environ.setdefault(key.strip(), value.strip())


def main():
    load_env_file(os.environ.get("LICENSE_ENV_FILE", ".env"))
    host = os.environ.get("HOST", "127.0.0.1")
    port = int(os.environ.get("PORT", "3101"))
    db_path = os.environ.get("LICENSE_DB_PATH", "./data/licenses.sqlite")
    hash_secret = os.environ.get("LICENSE_HASH_SECRET", "").strip()
    if not hash_secret:
        raise SystemExit("LICENSE_HASH_SECRET is required")

    server = ThreadingHTTPServer((host, port), LicenseHandler)
    server.db_path = db_path
    server.hash_secret = hash_secret
    print("listening on %s:%d" % (host, port), flush=True)
    server.serve_forever()


if __name__ == "__main__":
    main()
