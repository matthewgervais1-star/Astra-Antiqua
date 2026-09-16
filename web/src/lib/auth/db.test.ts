import assert from "node:assert/strict";
import test from "node:test";
import { ensureSchema, execute, getPool, queryOne } from "@/lib/auth/db";
import { authenticateUser, createUser, getUserById, AuthError } from "@/lib/auth/users";
import {
  deleteChartForUser,
  getChartForUser,
  listChartsForUser,
  setPrimaryChartForUser,
  upsertChartForUser,
} from "@/lib/auth/charts";

/**
 * The auth store against a real Postgres.
 *
 * These are the only tests here that need a server, so they skip themselves
 * when DATABASE_URL is unset and the rest of the suite runs as before. Point
 * DATABASE_URL at a scratch database (a Neon branch is the cheapest one) and
 * they run:
 *
 *   DATABASE_URL=postgres://... pnpm test
 *
 * Every row they write carries a unique email prefix and is deleted at the
 * end, so they are safe against a database that holds other data. They never
 * drop a table.
 */
const CONFIGURED = Boolean(process.env.DATABASE_URL);
const RUN = { skip: CONFIGURED ? false : "DATABASE_URL is not set" };

/** Unique per run, so two runs at once do not collide. */
const STAMP = `dbtest-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
const email = (name: string) => `${STAMP}-${name}@example.invalid`;

test("the schema is created and is safe to ask for twice", RUN, async () => {
  await ensureSchema();
  await ensureSchema();
  const users = await queryOne<{ n: number }>(
    "SELECT COUNT(*)::int AS n FROM information_schema.tables WHERE table_name IN ('users','charts','wait_list')",
  );
  assert.equal(users?.n, 3);
});

test("an account round-trips, and the same address cannot take two", RUN, async () => {
  const address = email("signup");
  const user = await createUser({ email: address, password: "correct horse battery" });
  assert.equal(user.email, address);
  assert.equal(typeof user.createdAt, "number", "created_at must come back a number, not a BIGINT string");

  const fetched = await getUserById(user.id);
  assert.equal(fetched?.email, address);

  await assert.rejects(
    () => createUser({ email: address.toUpperCase(), password: "another password" }),
    AuthError,
    "the address is normalized, so a different case is still the same account",
  );
});

test("authentication accepts the password and rejects everything else", RUN, async () => {
  const address = email("auth");
  await createUser({ email: address, password: "correct horse battery" });

  const ok = await authenticateUser(address, "correct horse battery");
  assert.equal(ok.email, address);

  await assert.rejects(() => authenticateUser(address, "wrong"), AuthError);
  await assert.rejects(() => authenticateUser(email("nobody"), "wrong"), AuthError);
});

test("the first chart becomes primary and only one ever is", RUN, async () => {
  const user = await createUser({ email: email("charts"), password: "correct horse battery" });
  const base = {
    relationship: "self" as const,
    date: "1990-01-01",
    time: "12:00",
    cityLabel: "Carthage",
    latitude: 36.85,
    longitude: 10.32,
  };

  const first = await upsertChartForUser(user.id, { ...base, name: "First" });
  assert.equal(first.primary, true, "a lone chart is primary whether or not it asked to be");

  const second = await upsertChartForUser(user.id, { ...base, name: "Second" });
  assert.equal(second.primary, false, "a second chart does not take primary uninvited");

  const promoted = await setPrimaryChartForUser(user.id, second.id!);
  assert.equal(promoted, true);
  let charts = await listChartsForUser(user.id);
  assert.equal(charts.filter((c) => c.primary).length, 1, "exactly one chart is primary");
  assert.equal(charts[0]?.name, "Second", "the primary chart sorts first");

  // Deleting the primary hands primary to whatever remains.
  assert.equal(await deleteChartForUser(user.id, second.id!), true);
  charts = await listChartsForUser(user.id);
  assert.equal(charts.length, 1);
  assert.equal(charts[0]?.primary, true, "the survivor is promoted rather than left with none");

  assert.equal(await deleteChartForUser(user.id, "no-such-chart"), false);
  assert.equal(await getChartForUser(user.id, "no-such-chart"), null);
});

test("an edit keeps the chart's own id and creation time", RUN, async () => {
  const user = await createUser({ email: email("edit"), password: "correct horse battery" });
  const created = await upsertChartForUser(user.id, {
    name: "Before",
    relationship: "self",
    date: "1990-01-01",
    time: "12:00",
    cityLabel: "Carthage",
    latitude: 36.85,
    longitude: 10.32,
  });
  const edited = await upsertChartForUser(user.id, {
    id: created.id,
    name: "After",
    relationship: "self",
    date: "1990-01-02",
    time: "13:00",
    cityLabel: "Tyre",
    latitude: 33.27,
    longitude: 35.19,
  });
  assert.equal(edited.id, created.id);
  assert.equal(edited.createdAt, created.createdAt);
  assert.equal(edited.name, "After");
  assert.equal(edited.latitude, 33.27, "a float column comes back a float, not a string");
  assert.equal((await listChartsForUser(user.id)).length, 1, "an edit is not a second chart");
});

test("deleting an account takes its charts with it", RUN, async () => {
  const user = await createUser({ email: email("cascade"), password: "correct horse battery" });
  await upsertChartForUser(user.id, {
    name: "Doomed",
    relationship: "self",
    date: "1990-01-01",
    time: "12:00",
    cityLabel: "Carthage",
    latitude: 36.85,
    longitude: 10.32,
  });
  await execute("DELETE FROM users WHERE id = $1", [user.id]);
  const left = await queryOne<{ n: number }>(
    "SELECT COUNT(*)::int AS n FROM charts WHERE user_id = $1",
    [user.id],
  );
  assert.equal(left?.n, 0, "ON DELETE CASCADE must actually be on");
});

test("the wait list counts a repeat address once and keeps its place", RUN, async () => {
  const { getWaitListStore } = await import("@/lib/waitlistStore");
  const store = getWaitListStore();
  const address = email("roll");
  const entry = {
    email: address,
    name: "Dido",
    pantheon: undefined,
    background: undefined,
    receivedAt: new Date().toISOString(),
  };

  const before = await store.count();
  const first = await store.append(entry);
  assert.equal(first.persisted, true);
  assert.equal(first.duplicate, false);
  assert.equal(await store.count(), before + 1);

  const again = await store.append(entry);
  assert.equal(again.duplicate, true, "a repeat submission is recognized");
  assert.equal(again.position, first.position, "and is told the place it already holds");
  assert.equal(await store.count(), before + 1, "and does not lengthen the roll");
});

test.after(async () => {
  if (!CONFIGURED) return;
  // Only this run's rows, matched by the stamp. Charts go with their users.
  await execute("DELETE FROM users WHERE email LIKE $1", [`${STAMP}-%`]);
  await execute("DELETE FROM wait_list WHERE email LIKE $1", [`${STAMP}-%`]);
  await getPool().end();
});
