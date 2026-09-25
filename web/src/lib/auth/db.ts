import { Pool, types, type PoolClient, type QueryResultRow } from "pg";

/**
 * The auth + charts store, on Postgres.
 *
 * This was a local SQLite file, which cannot survive a serverless deploy: each
 * invocation gets its own filesystem, so a signup written by one request is
 * gone by the next. Postgres is a connection rather than a file, so every
 * instance reads the same rows.
 *
 * One consequence runs through the rest of the auth code: SQLite's driver was
 * synchronous and this one is not, so every read and write here returns a
 * promise and every caller awaits it.
 */

/**
 * Postgres returns BIGINT as a string, because its range is wider than a JS
 * number. Both bigint columns here hold epoch milliseconds, which stay inside
 * the safe-integer range until the year 287396, so parsing them to numbers
 * keeps `created_at` the number the rest of the code already expects.
 */
types.setTypeParser(types.builtins.INT8, (value) => Number(value));

let cachedPool: Pool | null = null;
let schemaReady: Promise<void> | null = null;

function connectionString(): string {
  const url = process.env.DATABASE_URL;
  if (!url || url.length === 0) {
    throw new Error(
      "DATABASE_URL is not set. The app stores accounts and charts in Postgres; " +
        "point this at a database (Neon, Supabase, or any Postgres) before starting.",
    );
  }
  return url;
}

/**
 * A pool rather than a client, and a module-level one rather than a per-request
 * one. A warm serverless instance serves many requests, and each would
 * otherwise pay a fresh TCP and TLS handshake.
 *
 * Keep `max` small. The ceiling that matters is the database's, and it is
 * shared across every instance the platform decides to run, so a generous
 * per-instance pool is how a deploy exhausts its connection limit under load.
 * Against Neon, prefer the pooled (`-pooler`) host, which fronts this with
 * PgBouncer.
 */
export function getPool(): Pool {
  if (cachedPool) return cachedPool;
  cachedPool = new Pool({
    connectionString: connectionString(),
    max: 3,
    idleTimeoutMillis: 30_000,
    connectionTimeoutMillis: 10_000,
  });
  // A dead backend must not take the process with it. Without this listener an
  // idle client erroring out is an unhandled 'error' event, which is fatal.
  cachedPool.on("error", (err) => {
    console.error("[db] idle client error", err);
  });
  return cachedPool;
}

const SCHEMA = `
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    display_name TEXT,
    created_at BIGINT NOT NULL
  );

  -- Retention needs to know when the account was last used, and whether the
  -- reader has already been warned that it is about to go. Added rather than
  -- baked into the CREATE above so an existing database picks them up.
  ALTER TABLE users ADD COLUMN IF NOT EXISTS last_seen_at BIGINT;
  ALTER TABLE users ADD COLUMN IF NOT EXISTS deletion_warned_at BIGINT;

  -- The two statutory holds. s. 11 keeps information used to make a decision
  -- about a person for at least a year after that decision; s. 36 keeps
  -- information that is the subject of an access or rectification request
  -- until the applicant's recourses are exhausted. A scheduled deletion that
  -- ignored these would destroy evidence the Act requires be kept, so the
  -- sweep reads this table rather than trusting anyone to remember.
  CREATE TABLE IF NOT EXISTS legal_holds (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    reason TEXT NOT NULL,
    placed_at BIGINT NOT NULL,
    -- NULL means the hold has no end date yet, which is the s. 36 case while
    -- recourses are still open. An open hold blocks deletion indefinitely.
    expires_at BIGINT
  );

  CREATE INDEX IF NOT EXISTS legal_holds_user_id_idx ON legal_holds (user_id);

  -- One chart per account, the account holder's own. The unique constraint is
  -- not an optimization: it is the schema refusing to hold a second person's
  -- birth data. A chart about anyone else is computed in the browser and
  -- never sent here. See src/lib/savedCharts.ts.
  CREATE TABLE IF NOT EXISTS charts (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    date TEXT NOT NULL,
    time TEXT NOT NULL,
    city_label TEXT NOT NULL,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    created_at BIGINT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS wait_list (
    email TEXT PRIMARY KEY,
    entry JSONB NOT NULL,
    created_at BIGINT NOT NULL
  );
`;

/** Any constant will do; it only has to be the same number in every instance. */
const SCHEMA_LOCK_KEY = 8_314_207;

/**
 * Creates the tables if they are not there yet, once per process.
 *
 * `CREATE TABLE IF NOT EXISTS` is idempotent but not concurrency-safe: two cold
 * starts hitting an empty database at the same moment can deadlock against each
 * other in the system catalogs. The advisory lock makes them take turns, so a
 * deploy that wakes several instances at once still ends with one schema and no
 * failed requests.
 */
export function ensureSchema(): Promise<void> {
  if (schemaReady) return schemaReady;
  schemaReady = (async () => {
    const client = await getPool().connect();
    try {
      await client.query("SELECT pg_advisory_lock($1)", [SCHEMA_LOCK_KEY]);
      try {
        await client.query(SCHEMA);
      } finally {
        await client.query("SELECT pg_advisory_unlock($1)", [SCHEMA_LOCK_KEY]);
      }
    } catch (err) {
      // A failed attempt must not be cached as success, or the process spends
      // the rest of its life querying tables that were never created.
      schemaReady = null;
      throw err;
    } finally {
      client.release();
    }
  })();
  return schemaReady;
}

/** Every row a statement returned. */
export async function query<T extends QueryResultRow>(
  text: string,
  params: unknown[] = [],
): Promise<T[]> {
  await ensureSchema();
  const result = await getPool().query<T>(text, params);
  return result.rows;
}

/** The first row, or null. For lookups by a key that is unique. */
export async function queryOne<T extends QueryResultRow>(
  text: string,
  params: unknown[] = [],
): Promise<T | null> {
  const rows = await query<T>(text, params);
  return rows[0] ?? null;
}

/** How many rows a write touched. */
export async function execute(text: string, params: unknown[] = []): Promise<number> {
  await ensureSchema();
  const result = await getPool().query(text, params);
  return result.rowCount ?? 0;
}

/**
 * Runs `fn` inside a transaction on one client, rolling back if it throws.
 *
 * The chart writes need this: deciding which chart is primary is a read and
 * then a write, and two requests interleaving there leave an account with two
 * primary charts or none.
 */
export async function transaction<T>(fn: (client: PoolClient) => Promise<T>): Promise<T> {
  await ensureSchema();
  const client = await getPool().connect();
  try {
    await client.query("BEGIN");
    const result = await fn(client);
    await client.query("COMMIT");
    return result;
  } catch (err) {
    await client.query("ROLLBACK").catch(() => undefined);
    throw err;
  } finally {
    client.release();
  }
}
