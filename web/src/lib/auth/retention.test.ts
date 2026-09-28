import assert from "node:assert/strict";
import test from "node:test";
import { execute, getPool, queryOne } from "@/lib/auth/db";
import { createUser } from "@/lib/auth/users";
import { saveChartForUser } from "@/lib/auth/charts";
import type { DormantAccount } from "@/lib/auth/retention";
import {
  GRACE_DAYS,
  clearWarning,
  findDormant,
  findDueForDeletion,
  markWarned,
  placeHold,
  runRetentionSweep,
  touchLastSeen,
} from "@/lib/auth/retention";

/**
 * The retention schedule, against a real Postgres.
 *
 * These skip without DATABASE_URL, and `pnpm test:db` supplies a throwaway one.
 * Time is passed in rather than read, so a 24-month dormancy is testable
 * without waiting for it.
 */
const CONFIGURED = Boolean(process.env.DATABASE_URL);
const RUN = { skip: CONFIGURED ? false : "DATABASE_URL is not set" };

const STAMP = `ret-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
const email = (name: string) => `${STAMP}-${name}@example.invalid`;

const DAY = 24 * 60 * 60 * 1000;
const MONTH = 30 * DAY;
/** A fixed "now" so the arithmetic in the tests is readable. */
const NOW = 1_800_000_000_000;

const mine = (list: DormantAccount[]) => list.filter((a) => a.email.startsWith(STAMP));

async function anAccount(name: string, lastSeen: number) {
  const user = await createUser({ email: email(name), password: "correct horse battery" });
  await touchLastSeen(user.id, lastSeen);
  return user;
}

test("an account in use is not dormant", RUN, async () => {
  const user = await anAccount("active", NOW - MONTH);
  const dormant = mine(await findDormant(NOW, 24));
  assert.equal(
    dormant.find((d) => d.id === user.id),
    undefined,
  );
});

test("an account quiet past the threshold is found", RUN, async () => {
  const user = await anAccount("quiet", NOW - 25 * MONTH);
  const dormant = mine(await findDormant(NOW, 24));
  assert.ok(dormant.some((d) => d.id === user.id));
});

test("nothing is deleted without a warning that was actually sent", RUN, async () => {
  await anAccount("unwarned", NOW - 40 * MONTH);
  // No sender, so nothing can be warned, so nothing may be deleted. A
  // retention job with no mail configured must be a no-op, not a purge.
  const result = await runRetentionSweep(NOW);
  assert.equal(result.warned, 0);
  assert.equal(result.deleted, 0);
});

test("a warned account goes only after the grace period", RUN, async () => {
  const user = await anAccount("warned", NOW - 30 * MONTH);
  await markWarned(user.id, NOW - 5 * DAY);

  assert.equal(
    mine(await findDueForDeletion(NOW)).some((a) => a.id === user.id),
    false,
    "five days into a thirty day grace period is too early",
  );

  await markWarned(user.id, NOW - (GRACE_DAYS + 1) * DAY);
  assert.ok(
    mine(await findDueForDeletion(NOW)).some((a) => a.id === user.id),
    "past the grace period it is due",
  );
});

test("coming back cancels a pending deletion", RUN, async () => {
  const user = await anAccount("returned", NOW - 30 * MONTH);
  await markWarned(user.id, NOW - (GRACE_DAYS + 1) * DAY);
  assert.ok(mine(await findDueForDeletion(NOW)).some((a) => a.id === user.id));

  await touchLastSeen(user.id, NOW);
  await clearWarning(user.id);
  assert.equal(
    mine(await findDueForDeletion(NOW)).some((a) => a.id === user.id),
    false,
    "an account someone signed back into is not abandoned",
  );
});

test("a statutory hold outranks the schedule", RUN, async () => {
  const user = await anAccount("held", NOW - 40 * MONTH);
  await markWarned(user.id, NOW - (GRACE_DAYS + 10) * DAY);
  // s. 36: information under an access request is kept until the applicant's
  // recourses are exhausted, which has no end date while they are open.
  await placeHold(user.id, "s.36 access request open", NOW - DAY, null);

  assert.equal(
    mine(await findDueForDeletion(NOW)).some((a) => a.id === user.id),
    false,
    "an open hold blocks deletion however dormant the account is",
  );

  const sweep = await runRetentionSweep(NOW);
  assert.ok(sweep.heldBack >= 1, "the sweep reports what it held back");
  assert.ok(
    await queryOne("SELECT 1 FROM users WHERE id = $1", [user.id]),
    "the account survived the sweep",
  );
});

test("an expired hold stops blocking", RUN, async () => {
  const user = await anAccount("expired-hold", NOW - 40 * MONTH);
  await markWarned(user.id, NOW - (GRACE_DAYS + 10) * DAY);
  // s. 11: kept at least a year after the decision, then free to go.
  await placeHold(user.id, "s.11 decision record", NOW - 400 * DAY, NOW - DAY);
  assert.ok(mine(await findDueForDeletion(NOW)).some((a) => a.id === user.id));
});

test("a sweep deletes the account and its chart together", RUN, async () => {
  const user = await anAccount("swept", NOW - 40 * MONTH);
  await saveChartForUser(user.id, {
    name: "Doomed",
    date: "1990-01-01",
    time: "12:00",
    cityLabel: "Carthage",
    latitude: 36.85,
    longitude: 10.32,
  });
  await markWarned(user.id, NOW - (GRACE_DAYS + 1) * DAY);

  await runRetentionSweep(NOW);

  assert.equal(await queryOne("SELECT 1 FROM users WHERE id = $1", [user.id]), null);
  const charts = await queryOne<{ n: number }>(
    "SELECT COUNT(*)::int AS n FROM charts WHERE user_id = $1",
    [user.id],
  );
  assert.equal(charts?.n, 0, "the chart goes with the account");
});

test("a sender that fails to deliver does not mark the account warned", RUN, async () => {
  const user = await anAccount("undeliverable", NOW - 40 * MONTH);
  const result = await runRetentionSweep(NOW, async () => false);
  assert.equal(result.warned, 0);
  const row = await queryOne<{ deletion_warned_at: number | null }>(
    "SELECT deletion_warned_at FROM users WHERE id = $1",
    [user.id],
  );
  assert.equal(row?.deletion_warned_at, null, "an unsent warning is not a warning");
});

test.after(async () => {
  if (!CONFIGURED) return;
  await execute("DELETE FROM users WHERE email LIKE $1", [`${STAMP}-%`]);
  await getPool().end();
});
