/**
 * Whether a `next` redirect target is a same-origin absolute path. Rejects
 * "//host" and "/\host": browsers normalize backslashes to slashes, so both
 * become protocol-relative external URLs.
 */
export function isSafeNextPath(value: string): boolean {
  return /^\/(?![/\\])/.test(value);
}

/**
 * Read the post-auth redirect target from the current URL's `next` query
 * param, accepting only same-origin absolute paths so it can never be used to
 * bounce a user to an external site. Falls back to the home page.
 */
export function safeNextPath(fallback = "/"): string {
  if (typeof window === "undefined") return fallback;
  const next = new URLSearchParams(window.location.search).get("next");
  if (next && isSafeNextPath(next)) return next;
  return fallback;
}
