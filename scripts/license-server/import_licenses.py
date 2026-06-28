#!/usr/bin/env python3
"""Build a local SQLite license database from exported license CSV files.

The generated database stores license hashes and device hashes only. It does
not store plaintext license keys or device ids.
"""

import argparse
import csv
import hashlib
import json
import os
import sqlite3
from datetime import datetime


FEATURES = '["wechat_upload"]'


def now_iso():
    return datetime.utcnow().replace(microsecond=0).isoformat() + "Z"


def sha256_hex(value):
    return hashlib.sha256(value.encode("utf-8")).hexdigest()


def hash_license(secret, license_key):
    return sha256_hex("%s:%s" % (secret, license_key.strip()))


def hash_device(secret, device_id):
    return sha256_hex("%s:device:%s" % (secret, device_id.strip()))


def connect(path):
    os.makedirs(os.path.dirname(os.path.abspath(path)), exist_ok=True)
    conn = sqlite3.connect(path)
    conn.execute("PRAGMA foreign_keys = ON")
    conn.execute("PRAGMA journal_mode = WAL")
    return conn


def create_schema(conn):
    conn.executescript(
        """
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
            device_hash TEXT NOT NULL,
            plugin_version TEXT NOT NULL DEFAULT '',
            created_at TEXT NOT NULL,
            last_seen_at TEXT NOT NULL,
            UNIQUE (license_id, device_hash),
            FOREIGN KEY (license_id) REFERENCES licenses(id) ON DELETE CASCADE
        );

        CREATE TABLE IF NOT EXISTS license_events (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            license_id INTEGER,
            license_hash TEXT NOT NULL,
            event_type TEXT NOT NULL,
            device_hash TEXT NOT NULL DEFAULT '',
            message TEXT NOT NULL DEFAULT '',
            created_at TEXT NOT NULL
        );

        CREATE TABLE IF NOT EXISTS legacy_device_entitlements (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            device_hash TEXT NOT NULL UNIQUE,
            plan TEXT NOT NULL,
            features TEXT NOT NULL,
            expires_at TEXT NOT NULL,
            max_devices INTEGER NOT NULL DEFAULT 1,
            active INTEGER NOT NULL DEFAULT 1,
            note TEXT NOT NULL DEFAULT '',
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL
        );

        CREATE INDEX IF NOT EXISTS idx_license_activations_license_id
            ON license_activations (license_id);
        CREATE INDEX IF NOT EXISTS idx_license_events_license_hash
            ON license_events (license_hash);
        """
    )


def read_wranger_results(path):
    if not path:
        return []
    with open(path, "rb") as file:
        raw = file.read()
    for encoding in ("utf-8-sig", "utf-16"):
        try:
            payload = json.loads(raw.decode(encoding))
            break
        except UnicodeError:
            continue
    else:
        payload = json.loads(raw.decode("utf-8"))
    if not payload:
        return []
    return payload[0].get("results") or []


def import_csv(conn, secret, csv_paths):
    imported = 0
    note_to_hash = {}
    timestamp = now_iso()
    for csv_path in csv_paths:
        with open(csv_path, "r", encoding="utf-8-sig", newline="") as file:
            reader = csv.DictReader(file)
            for row in reader:
                license_key = (row.get("licenseKey") or "").strip()
                expires_at = (row.get("expiresAt") or "").strip()
                if not license_key or not expires_at:
                    continue
                license_hash = hash_license(secret, license_key)
                max_devices = int(row.get("maxDevices") or "1")
                note = (row.get("note") or "").strip()
                conn.execute(
                    """
                    INSERT INTO licenses
                        (license_hash, plan, features, expires_at, max_devices, active, note, message, created_at, updated_at)
                    VALUES (?, 'pro', ?, ?, ?, 1, ?, '', ?, ?)
                    ON CONFLICT(license_hash) DO UPDATE SET
                        plan = excluded.plan,
                        features = excluded.features,
                        expires_at = excluded.expires_at,
                        max_devices = excluded.max_devices,
                        active = excluded.active,
                        note = excluded.note,
                        updated_at = excluded.updated_at
                    """,
                    (license_hash, FEATURES, expires_at, max_devices, note, timestamp, timestamp),
                )
                if note:
                    note_to_hash[note] = license_hash
                imported += 1
    return imported, note_to_hash


def import_activations(conn, secret, rows, note_to_hash):
    imported = 0
    legacy = 0
    timestamp = now_iso()
    for row in rows:
        note = (row.get("note") or "").strip()
        device_id = (row.get("device_id") or "").strip()
        if not note or not device_id:
            continue
        device_hash = hash_device(secret, device_id)
        created_at = row.get("created_at") or timestamp
        last_seen_at = row.get("last_seen_at") or created_at
        license_hash = note_to_hash.get(note)
        if license_hash:
            conn.execute(
                """
                INSERT OR IGNORE INTO license_activations
                    (license_id, device_hash, plugin_version, created_at, last_seen_at)
                VALUES ((SELECT id FROM licenses WHERE license_hash = ?), ?, '', ?, ?)
                """,
                (license_hash, device_hash, created_at, last_seen_at),
            )
            imported += 1
            continue

        expires_at = row.get("expires_at") or "2126-05-18T06:47:36.065Z"
        max_devices = int(row.get("max_devices") or "1")
        active = int(row.get("active") or "1")
        conn.execute(
            """
            INSERT INTO legacy_device_entitlements
                (device_hash, plan, features, expires_at, max_devices, active, note, created_at, updated_at)
            VALUES (?, 'pro', ?, ?, ?, ?, ?, ?, ?)
            ON CONFLICT(device_hash) DO UPDATE SET
                features = excluded.features,
                expires_at = excluded.expires_at,
                max_devices = excluded.max_devices,
                active = excluded.active,
                note = excluded.note,
                updated_at = excluded.updated_at
            """,
            (device_hash, FEATURES, expires_at, max_devices, active, note, created_at, timestamp),
        )
        legacy += 1
    return imported, legacy


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--db", required=True)
    parser.add_argument("--secret", required=True)
    parser.add_argument("--activation-json", default="")
    parser.add_argument("csv", nargs="+")
    args = parser.parse_args()

    conn = connect(args.db)
    try:
        create_schema(conn)
        imported, note_to_hash = import_csv(conn, args.secret, args.csv)
        activation_rows = read_wranger_results(args.activation_json)
        activations, legacy = import_activations(conn, args.secret, activation_rows, note_to_hash)
        conn.commit()
    finally:
        conn.close()

    print("licenses=%d activations=%d legacy_device_entitlements=%d" % (imported, activations, legacy))


if __name__ == "__main__":
    main()
