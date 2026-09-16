/**
 * Runs a command against a throwaway Postgres.
 *
 * PGlite is Postgres itself compiled to WebAssembly, and pglite-socket puts it
 * behind the real wire protocol, so the app's own `pg` driver connects to it
 * over TCP exactly as it will connect to Neon. That makes this a real test of
 * the SQL rather than of an emulator's idea of it, with nothing to install.
 *
 * The database lives in memory and is gone when the command exits.
 *
 *   node scripts/with-pglite.mjs pnpm test
 */
import { spawn } from "node:child_process";
import { PGlite } from "@electric-sql/pglite";
import { PGLiteSocketServer } from "@electric-sql/pglite-socket";

const PORT = Number(process.env.PGLITE_PORT ?? 55432);

const argv = process.argv.slice(2);
if (argv.length === 0) {
  console.error("usage: node scripts/with-pglite.mjs <command> [args...]");
  process.exit(2);
}

const db = await PGlite.create();
const server = new PGLiteSocketServer({ db, port: PORT, host: "127.0.0.1" });
await server.start();

// PGlite serves a single database named `postgres` and does not check
// credentials, so any user works.
const url = `postgres://postgres:postgres@127.0.0.1:${PORT}/postgres`;
console.log(`[pglite] listening on ${PORT}`);

const child = spawn(argv[0], argv.slice(1), {
  stdio: "inherit",
  shell: true,
  env: { ...process.env, DATABASE_URL: url },
});

const code = await new Promise((resolve) => {
  child.on("exit", (c) => resolve(c ?? 1));
  child.on("error", (err) => {
    console.error("[pglite] could not start the command:", err.message);
    resolve(1);
  });
});

await server.stop();
await db.close();
process.exit(code);
