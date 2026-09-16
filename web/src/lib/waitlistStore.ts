import { promises as fs } from "node:fs";
import path from "node:path";
import { query, queryOne } from "@/lib/auth/db";
import type { WaitListEntry } from "@/lib/waitlistSchema";

export interface AppendResult {
  persisted: boolean;
  /** True when this email was already on the list (no new record written). */
  duplicate: boolean;
  /** 1-based position on the roll. The file-backed store returns the entry's
   * real index; the noop store (no durable backend configured) returns a
   * plausible fixed number, since it has nothing to count. */
  position: number;
}

interface WaitListStore {
  append(entry: WaitListEntry): Promise<AppendResult>;
  /** Total entries currently on the roll. Noop store returns the same fixed
   * number `append` uses, for the same reason. */
  count(): Promise<number>;
}

let warned = false;

/** Used by the noop store as both the count and every entry's reported
 * position: there is nothing durable to count, so a plausible constant is
 * more honest than a random or ever-incrementing number that resets on
 * every cold start anyway. */
const NOOP_ROLL_LENGTH = 240;

function loggedNoOpStore(reason: string): WaitListStore {
  return {
    async append(entry) {
      if (!warned) {
        console.warn(
          `[waitlist] ${reason}. Submissions are visible in runtime logs but are not durably persisted. Replace src/lib/waitlistStore.ts when a real backend is wired.`,
        );
        warned = true;
      }
      console.info("[waitlist] entry", entry);
      return { persisted: false, duplicate: false, position: NOOP_ROLL_LENGTH };
    },
    async count() {
      return NOOP_ROLL_LENGTH;
    },
  };
}

async function readEntries(absoluteFilePath: string): Promise<WaitListEntry[]> {
  try {
    const raw = await fs.readFile(absoluteFilePath, "utf8");
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as WaitListEntry[]) : [];
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code !== "ENOENT") {
      throw err;
    }
    return [];
  }
}

function fileBackedStore(absoluteFilePath: string): WaitListStore {
  let tail: Promise<void> = Promise.resolve();
  return {
    async append(entry) {
      const work = async () => {
        await fs.mkdir(path.dirname(absoluteFilePath), { recursive: true });
        const current = await readEntries(absoluteFilePath);
        const email = entry.email.trim().toLowerCase();
        const existingIndex = current.findIndex((e) => e.email.trim().toLowerCase() === email);
        if (existingIndex !== -1) {
          return { persisted: true, duplicate: true, position: existingIndex + 1 };
        }
        current.push(entry);
        await fs.writeFile(absoluteFilePath, JSON.stringify(current, null, 2), "utf8");
        return { persisted: true, duplicate: false, position: current.length };
      };
      const next = tail.then(work, work);
      tail = next.then(
        () => undefined,
        () => undefined,
      );
      return await next;
    },
    async count() {
      const current = await readEntries(absoluteFilePath);
      return current.length;
    },
  };
}

/**
 * The durable store, and the only one a deploy should ever use.
 *
 * The roll is a table rather than a file for the same reason accounts are: a
 * serverless filesystem is per-invocation, so a file-backed roll loses every
 * signup it takes. The email is the primary key, which makes a repeat
 * submission a no-op at the database rather than a scan for a match.
 */
function postgresStore(): WaitListStore {
  return {
    async append(entry) {
      const email = entry.email.trim().toLowerCase();
      const inserted = await query<{ email: string }>(
        `INSERT INTO wait_list (email, entry, created_at)
         VALUES ($1, $2, $3)
         ON CONFLICT (email) DO NOTHING
         RETURNING email`,
        [email, JSON.stringify(entry), Date.now()],
      );
      // Position counts everyone who joined no later than this address did, so
      // a repeat submission is told the place it already holds rather than a
      // new one at the end of the roll.
      const row = await queryOne<{ position: number }>(
        `SELECT COUNT(*)::int AS position FROM wait_list
         WHERE created_at <= (SELECT created_at FROM wait_list WHERE email = $1)`,
        [email],
      );
      return {
        persisted: true,
        duplicate: inserted.length === 0,
        position: row?.position ?? 1,
      };
    },
    async count() {
      const row = await queryOne<{ total: number }>(
        "SELECT COUNT(*)::int AS total FROM wait_list",
      );
      return row?.total ?? 0;
    },
  };
}

export function getWaitListStore(): WaitListStore {
  const override = process.env.WAITLIST_STORE;
  if (override === "noop") {
    return loggedNoOpStore("WAITLIST_STORE=noop set");
  }

  const overridePath = process.env.WAITLIST_FILE;
  if (overridePath && overridePath.length > 0) {
    return fileBackedStore(path.resolve(overridePath));
  }

  if (process.env.DATABASE_URL) {
    return postgresStore();
  }

  if (process.env.VERCEL === "1") {
    return loggedNoOpStore(
      "Running on Vercel serverless without DATABASE_URL configured (the filesystem is ephemeral)",
    );
  }

  return fileBackedStore(path.join(process.cwd(), "data", "wait-list.json"));
}
