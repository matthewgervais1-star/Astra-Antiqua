/**
 * Read the post-auth redirect target from the current URL's `next` query
 * param, accepting only same-origin absolute paths so it can never be used to
 * bounce a user to an external site. Falls back to the home page.
 */
export function safeNextPath(fallback = "/"): string {
  if (typeof window === "undefined") return fallback;
  const next = new URLSearchParams(window.location.search).get("next");
  if (next && next.startsWith("/") && !next.startsWith("//")) return next;
  return fallback;
}
