import assert from "node:assert/strict";
import test from "node:test";
import { ensureSchema, execute, getPool, queryOne } from "@/lib/auth/db";
import { authenticateUser, createUser, getUserById, AuthError } from "@/lib/auth/users";
import { deleteChartForUser, getChartForUser, saveChartForUser } from "@/lib/auth/charts";

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

test("an account holds exactly one chart, and saving again replaces it", RUN, async () => {
  const user = await createUser({ email: email("charts"), password: "correct horse battery" });
  const base = {
    date: "1990-01-01",
    time: "12:00",
    cityLabel: "Carthage",
    latitude: 36.85,
    longitude: 10.32,
  };

  const first = await saveChartForUser(user.id, { ...base, name: "First" });
  assert.equal(first.name, "First");
  assert.equal((await getChartForUser(user.id))?.name, "First");

  // The invariant this whole change exists to create: a second save is the
  // same chart rewritten, never a second person's birth data alongside it.
  const second = await saveChartForUser(user.id, { ...base, name: "Second", cityLabel: "Tyre" });
  assert.equal(second.id, first.id, "the chart keeps its identity across a rewrite");
  assert.equal(second.createdAt, first.createdAt, "and its original creation time");
  const stored = await getChartForUser(user.id);
  assert.equal(stored?.name, "Second");
  assert.equal(stored?.cityLabel, "Tyre");

  const rows = await queryOne<{ n: number }>(
    "SELECT COUNT(*)::int AS n FROM charts WHERE user_id = $1",
    [user.id],
  );
  assert.equal(rows?.n, 1, "the unique constraint, not this code, is what guarantees one row");
});

test("two accounts keep their own charts apart", RUN, async () => {
  const base = {
    date: "1990-01-01",
    time: "12:00",
    cityLabel: "Carthage",
    latitude: 36.85,
    longitude: 10.32,
  };
  const a = await createUser({ email: email("sep-a"), password: "correct horse battery" });
  const b = await createUser({ email: email("sep-b"), password: "correct horse battery" });
  await saveChartForUser(a.id, { ...base, name: "Hers" });
  await saveChartForUser(b.id, { ...base, name: "Theirs" });
  assert.equal((await getChartForUser(a.id))?.name, "Hers");
  assert.equal((await getChartForUser(b.id))?.name, "Theirs");
});

test("a chart can be removed, and removing nothing reports nothing", RUN, async () => {
  const user = await createUser({ email: email("del"), password: "correct horse battery" });
  assert.equal(await deleteChartForUser(user.id), false, "there is nothing to delete yet");
  await saveChartForUser(user.id, {
    name: "Mine",
    date: "1990-01-01",
    time: "12:00",
    cityLabel: "Carthage",
    latitude: 36.85,
    longitude: 10.32,
  });
  assert.equal(await deleteChartForUser(user.id), true);
  assert.equal(await getChartForUser(user.id), null);
});

test("deleting an account takes its charts with it", RUN, async () => {
  const user = await createUser({ email: email("cascade"), password: "correct horse battery" });
  await saveChartForUser(user.id, {
    name: "Doomed",
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
