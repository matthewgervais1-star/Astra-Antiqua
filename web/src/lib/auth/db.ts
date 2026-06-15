import path from "node:path";
import fs from "node:fs";
import Database from "better-sqlite3";

let cachedDb: Database.Database | null = null;

function resolveDbPath(): string {
  const override = process.env.AUTH_DB_PATH;
  if (override && override.length > 0) return path.resolve(override);
  return path.join(process.cwd(), "data", "astra-antiqua.sqlite");
}

function ensureDirectory(filePath: string): void {
  const dir = path.dirname(filePath);
  fs.mkdirSync(dir, { recursive: true });
}

function migrate(db: Database.Database): void {
  db.exec(`
    PRAGMA journal_mode = WAL;
    PRAGMA foreign_keys = ON;

    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      display_name TEXT,
      created_at INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS charts (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      relationship TEXT NOT NULL,
      date TEXT NOT NULL,
      time TEXT NOT NULL,
      city_label TEXT NOT NULL,
      latitude REAL NOT NULL,
      longitude REAL NOT NULL,
      is_primary INTEGER NOT NULL DEFAULT 0,
      created_at INTEGER NOT NULL
    );

    CREATE INDEX IF NOT EXISTS charts_user_id_idx ON charts (user_id);
  `);
}

/**
 * Returns a process-wide SQLite handle for the auth + charts database. Lazy
 * initialization, with PRAGMA + schema migration on first open.
 *
 * Production note: this is a local SQLite file and will not persist across
 * Vercel serverless invocations. For production, swap to a Postgres-backed
 * implementation (Neon, Supabase, Vercel Postgres) by replacing this file.
 */
export function getDb(): Database.Database {
  if (cachedDb) return cachedDb;
  const file = resolveDbPath();
  ensureDirectory(file);
  const db = new Database(file);
  migrate(db);
  cachedDb = db;
  return db;
}
