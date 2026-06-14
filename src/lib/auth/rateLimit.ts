/**
 * In-memory sliding-window rate limiter. Process-local; for multi-instance
 * production use, replace with Redis / Upstash.
 *
 * Two helpers exported:
 *   rateLimit(key, max, windowMs): throttles by composite key (typically IP+route)
 *   recordLoginAttempt(email, success): per-email lockout after N consecutive failures
 */

interface Bucket {
  hits: number[];
}

const buckets = new Map<string, Bucket>();

function pruneAndCount(bucket: Bucket, windowMs: number, now: number): number {
  const cutoff = now - windowMs;
  // bucket.hits is kept sorted ascending by insertion; find first index >= cutoff
  let i = 0;
  while (i < bucket.hits.length && bucket.hits[i]! < cutoff) i += 1;
  if (i > 0) bucket.hits.splice(0, i);
  return bucket.hits.length;
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetMs: number;
}

export function rateLimit(
  key: string,
  max: number,
  windowMs: number,
): RateLimitResult {
  const now = Date.now();
  let bucket = buckets.get(key);
  if (!bucket) {
    bucket = { hits: [] };
    buckets.set(key, bucket);
  }
  const count = pruneAndCount(bucket, windowMs, now);
  if (count >= max) {
    const firstHit = bucket.hits[0] ?? now;
    return { allowed: false, remaining: 0, resetMs: firstHit + windowMs - now };
  }
  bucket.hits.push(now);
  return { allowed: true, remaining: max - (count + 1), resetMs: windowMs };
}

interface LoginFailureRecord {
  count: number;
  lockedUntil: number | null;
  firstFailureAt: number;
}

const loginFailures = new Map<string, LoginFailureRecord>();

const MAX_LOGIN_FAILURES = 5;
const LOGIN_FAILURE_WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const LOGIN_LOCKOUT_MS = 15 * 60 * 1000; // lockout duration after threshold

export interface LoginThrottleResult {
  locked: boolean;
  remainingMs: number;
  failuresInWindow: number;
}

export function loginThrottleCheck(email: string): LoginThrottleResult {
  const key = email.trim().toLowerCase();
  const rec = loginFailures.get(key);
  if (!rec) return { locked: false, remainingMs: 0, failuresInWindow: 0 };
  const now = Date.now();
  if (rec.lockedUntil && rec.lockedUntil > now) {
    return {
      locked: true,
      remainingMs: rec.lockedUntil - now,
      failuresInWindow: rec.count,
    };
  }
  if (rec.lockedUntil && rec.lockedUntil <= now) {
    loginFailures.delete(key);
    return { locked: false, remainingMs: 0, failuresInWindow: 0 };
  }
  // Reset window if outside the failure window
  if (now - rec.firstFailureAt > LOGIN_FAILURE_WINDOW_MS) {
    loginFailures.delete(key);
    return { locked: false, remainingMs: 0, failuresInWindow: 0 };
  }
  return { locked: false, remainingMs: 0, failuresInWindow: rec.count };
}

export function recordLoginAttempt(email: string, success: boolean): void {
  const key = email.trim().toLowerCase();
  if (success) {
    loginFailures.delete(key);
    return;
  }
  const now = Date.now();
  const existing = loginFailures.get(key);
  if (!existing) {
    loginFailures.set(key, { count: 1, lockedUntil: null, firstFailureAt: now });
    return;
  }
  // Reset window if outside
  if (now - existing.firstFailureAt > LOGIN_FAILURE_WINDOW_MS) {
    loginFailures.set(key, { count: 1, lockedUntil: null, firstFailureAt: now });
    return;
  }
  existing.count += 1;
  if (existing.count >= MAX_LOGIN_FAILURES) {
    existing.lockedUntil = now + LOGIN_LOCKOUT_MS;
  }
}

/**
 * Extract a "client identifier" from a request. Used as the IP key for rate
 * limiting. Falls back to user-agent + accept-language hash when no IP is
 * available (e.g. local dev without proxy headers).
 */
export function clientIdentifier(request: Request): string {
  // Prefer platform-set client-IP headers, which a hosting layer (e.g. Vercel)
  // sets itself and the client cannot override, over the raw x-forwarded-for
  // first hop, which any client can spoof to mint a fresh rate-limit bucket.
  const vercel = request.headers.get("x-vercel-forwarded-for");
  if (vercel) {
    const first = vercel.split(",")[0]?.trim();
    if (first) return first;
  }
  const realIp = request.headers.get("x-real-ip");
  if (realIp) return realIp;
  const fwd = request.headers.get("x-forwarded-for");
  if (fwd) {
    const first = fwd.split(",")[0]?.trim();
    if (first) return first;
  }
  const ua = request.headers.get("user-agent") ?? "";
  const lang = request.headers.get("accept-language") ?? "";
  return `local:${ua.slice(0, 32)}:${lang.slice(0, 16)}`;
}
