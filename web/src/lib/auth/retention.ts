import { execute, query } from "@/lib/auth/db";
import { POLICY_FACTS } from "@/lib/legal/policyFacts";

/**
 * Deleting accounts that nobody comes back to.
 *
 * Law 25 s. 23 obliges destruction once the purpose is achieved, and that duty
 * is triggered by the purpose ending rather than by anyone asking. A dormant
 * account holding a birth date, a birth minute and a set of coordinates is the
 * exposure this closes.
 *
 * Two rules shape the design, and both are about not destroying the wrong
 * thing:
 *
 * 1. Nothing is deleted without a warning that was actually sent. The privacy
 *    policy promises a warning, so a sweep that deleted silently would make
 *    the policy a false statement. `warnDormant` records the moment a warning
 *    goes out and `deleteExpired` refuses to touch an account that has none.
 *    With no mail sender wired up, nothing is warned, so nothing is deleted.
 *    That is the safe direction to fail in.
 *
 * 2. The statutory holds win over the schedule. s. 11 keeps information used
 *    to make a decision about a person for at least a year after it; s. 36
 *    keeps information under an access or rectification request until the
 *    applicant's recourses are exhausted. Both are read from `legal_holds`
 *    rather than remembered.
 */

/** How long after the warning before the account actually goes. */
export const GRACE_DAYS = 30;

const DAY_MS = 24 * 60 * 60 * 1000;
const MONTH_MS = 30 * DAY_MS;

export interface DormantAccount {
  id: string;
  email: string;
  lastSeenAt: number;
}

/** Records that the reader was here, so dormancy is measured from real use. */
export async function touchLastSeen(userId: string, now: number): Promise<void> {
  await execute("UPDATE users SET last_seen_at = $1 WHERE id = $2", [now, userId]);
}

/**
 * Accounts that have gone quiet long enough to warn, and have not been warned
 * already.
 *
 * `COALESCE(last_seen_at, created_at)` covers accounts created before the
 * column existed: an account nobody has signed into since is dormant from its
 * creation, which is the honest reading.
 */
export async function findDormant(
  now: number,
  dormantMonths: number = POLICY_FACTS.dormantAccountMonths,
): Promise<DormantAccount[]> {
  const cutoff = now - dormantMonths * MONTH_MS;
  const rows = await query<{ id: string; email: string; last_seen_at: number }>(
    `SELECT id, email, COALESCE(last_seen_at, created_at) AS last_seen_at
       FROM users
      WHERE COALESCE(last_seen_at, created_at) < $1
        AND deletion_warned_at IS NULL
      ORDER BY COALESCE(last_seen_at, created_at) ASC`,
    [cutoff],
  );
  return rows.map((r) => ({ id: r.id, email: r.email, lastSeenAt: r.last_seen_at }));
}

/** Marks an account as warned. Call this only after the warning actually sent. */
export async function markWarned(userId: string, now: number): Promise<void> {
  await execute("UPDATE users SET deletion_warned_at = $1 WHERE id = $2", [now, userId]);
}

/** Signing in again clears the warning: the account is in use after all. */
export async function clearWarning(userId: string): Promise<void> {
  await execute("UPDATE users SET deletion_warned_at = NULL WHERE id = $1", [userId]);
}

/**
 * Accounts warned more than the grace period ago and not under a hold.
 *
 * The `NOT EXISTS` is the whole point of the statutory holds: an account under
 * an open hold, or one whose hold has not expired, is skipped no matter how
 * long it has been dormant.
 */
export async function findDueForDeletion(now: number): Promise<DormantAccount[]> {
  const cutoff = now - GRACE_DAYS * DAY_MS;
  const rows = await query<{ id: string; email: string; last_seen_at: number }>(
    `SELECT u.id, u.email, COALESCE(u.last_seen_at, u.created_at) AS last_seen_at
       FROM users u
      WHERE u.deletion_warned_at IS NOT NULL
        AND u.deletion_warned_at < $1
        AND NOT EXISTS (
          SELECT 1 FROM legal_holds h
           WHERE h.user_id = u.id
             AND (h.expires_at IS NULL OR h.expires_at > $2)
        )`,
    [cutoff, now],
  );
  return rows.map((r) => ({ id: r.id, email: r.email, lastSeenAt: r.last_seen_at }));
}

/** Places a statutory hold. `expiresAt` of null means "until further notice". */
export async function placeHold(
  userId: string,
  reason: string,
  placedAt: number,
  expiresAt: number | null = null,
): Promise<void> {
  const id =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `hold-${placedAt}-${Math.random().toString(36).slice(2, 10)}`;
  await execute(
    "INSERT INTO legal_holds (id, user_id, reason, placed_at, expires_at) VALUES ($1, $2, $3, $4, $5)",
    [id, userId, reason, placedAt, expiresAt],
  );
}

export interface SweepResult {
  warned: number;
  deleted: number;
  heldBack: number;
}

/**
 * One pass of the retention schedule.
 *
 * `sendWarning` returns whether the warning actually reached the reader. When
 * it returns false, or when no sender is supplied at all, the account is not
 * marked warned and therefore never becomes eligible for deletion. A retention
 * job with no mail sender is a no-op rather than a silent purge.
 */
export async function runRetentionSweep(
  now: number,
  sendWarning?: (account: DormantAccount) => Promise<boolean>,
): Promise<SweepResult> {
  let warned = 0;
  if (sendWarning) {
    for (const account of await findDormant(now)) {
      if (await sendWarning(account)) {
        await markWarned(account.id, now);
        warned += 1;
      }
    }
  }

  const due = await findDueForDeletion(now);
  for (const account of due) {
    // The chart goes with the user by ON DELETE CASCADE.
    await execute("DELETE FROM users WHERE id = $1", [account.id]);
  }

  const heldBack = await query<{ n: number }>(
    `SELECT COUNT(*)::int AS n FROM users u
      WHERE u.deletion_warned_at IS NOT NULL
        AND EXISTS (
          SELECT 1 FROM legal_holds h
           WHERE h.user_id = u.id
             AND (h.expires_at IS NULL OR h.expires_at > $1)
        )`,
    [now],
  );

  return { warned, deleted: due.length, heldBack: heldBack[0]?.n ?? 0 };
}
