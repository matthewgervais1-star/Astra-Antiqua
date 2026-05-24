import { promises as fs } from "node:fs";
import path from "node:path";
import type { WaitListEntry } from "@/lib/waitlistSchema";

export interface AppendResult {
  persisted: boolean;
}

interface WaitListStore {
  append(entry: WaitListEntry): Promise<AppendResult>;
}

let warned = false;

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
      return { persisted: false };
    },
  };
}

function fileBackedStore(absoluteFilePath: string): WaitListStore {
  let tail: Promise<void> = Promise.resolve();
  return {
    async append(entry) {
      const work = async () => {
        await fs.mkdir(path.dirname(absoluteFilePath), { recursive: true });
        let current: WaitListEntry[] = [];
        try {
          const raw = await fs.readFile(absoluteFilePath, "utf8");
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed)) current = parsed as WaitListEntry[];
        } catch (err) {
          if ((err as NodeJS.ErrnoException).code !== "ENOENT") {
            throw err;
          }
        }
        current.push(entry);
        await fs.writeFile(absoluteFilePath, JSON.stringify(current, null, 2), "utf8");
      };
      const next = tail.then(work, work);
      tail = next.then(
        () => undefined,
        () => undefined,
      );
      await next;
      return { persisted: true };
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

  if (process.env.VERCEL === "1") {
    return loggedNoOpStore(
      "Running on Vercel serverless without WAITLIST_FILE configured (filesystem is ephemeral)",
    );
  }

  return fileBackedStore(path.join(process.cwd(), "data", "wait-list.json"));
}
