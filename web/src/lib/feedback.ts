/**
 * Reading feedback ("IT WAS SO" / "IT WAS NOT SO"), kept entirely on-device.
 * There is no backend for this: the localStorage record below is the whole
 * state. SSR-safe: every function guards on `typeof window`, matching the
 * pattern in lib/pantheonPreference.ts and lib/savedCharts.ts.
 */

export type FeedbackVerdict = "so" | "notso";

const STORAGE_KEY = "astra-antiqua.feedback.v1";

function safeParse(raw: string | null): Record<string, FeedbackVerdict> {
  if (!raw) return {};
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return {};
    return parsed as Record<string, FeedbackVerdict>;
  } catch {
    return {};
  }
}

export function readFeedback(): Record<string, FeedbackVerdict> {
  if (typeof window === "undefined") return {};
  return safeParse(window.localStorage.getItem(STORAGE_KEY));
}

/** Pass `null` to clear a reading's verdict (used when re-clicking the same choice). */
export function writeFeedback(readingId: string, value: FeedbackVerdict | null): void {
  if (typeof window === "undefined") return;
  try {
    const current = safeParse(window.localStorage.getItem(STORAGE_KEY));
    if (value === null) {
      delete current[readingId];
    } else {
      current[readingId] = value;
    }
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(current));
  } catch {
    // localStorage may be unavailable; silently continue
  }
}

export function feedbackCount(): number {
  return Object.keys(readFeedback()).length;
}
