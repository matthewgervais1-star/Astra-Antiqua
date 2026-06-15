/**
 * Defense-in-depth Origin / Referer check for state-changing API routes.
 *
 * SameSite=Lax on the session cookie already blocks most cross-site CSRF
 * attempts, but rejecting requests whose Origin/Referer does not match our
 * own host is cheap and catches edge cases (browsers that strip SameSite,
 * subdomain misconfigurations, etc.).
 */
export function assertSameOrigin(request: Request): { ok: true } | { ok: false; reason: string } {
  const origin = request.headers.get("origin");
  const referer = request.headers.get("referer");
  const host = request.headers.get("host");
  if (!host) {
    return { ok: false, reason: "Missing host header." };
  }

  const candidate = origin ?? referer;
  if (!candidate) {
    // Some browsers omit Origin and Referer (e.g. file:// or strict privacy
    // settings). In that case we err on the side of accepting; the cookie's
    // SameSite policy is the primary defense.
    return { ok: true };
  }

  try {
    const url = new URL(candidate);
    if (url.host === host) return { ok: true };
    return { ok: false, reason: `Cross-origin request from ${url.host}.` };
  } catch {
    return { ok: false, reason: "Malformed Origin/Referer header." };
  }
}
