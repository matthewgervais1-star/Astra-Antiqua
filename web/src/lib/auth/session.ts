import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";

const SESSION_COOKIE = "astra_session";
const SESSION_TTL_DAYS = 30;

// Home-LAN installs (PWA on a phone pointed at this PC) serve the production
// build over plain HTTP, where Secure cookies are silently dropped and sign-in
// breaks with no error. ASTRA_ALLOW_HTTP=1 opts out of Secure for that case
// only — never set it on an internet-facing deploy.
const SECURE_COOKIES =
  process.env.NODE_ENV === "production" && process.env.ASTRA_ALLOW_HTTP !== "1";

function getSecret(): Uint8Array {
  const raw = process.env.AUTH_SECRET;
  if (!raw || raw.length < 16) {
    if (process.env.NODE_ENV === "production") {
      throw new Error(
        "AUTH_SECRET is required in production and must be at least 16 characters. Set it in your environment before deploying.",
      );
    }
    // Dev fallback. Warned once at process start in db.ts so the noise is bounded.
    return new TextEncoder().encode("astra-antiqua-dev-secret-please-override-in-prod");
  }
  return new TextEncoder().encode(raw);
}

export interface SessionPayload {
  sub: string; // user id
  email: string;
}

export async function signSession(payload: SessionPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(payload.sub)
    .setIssuedAt()
    .setExpirationTime(`${SESSION_TTL_DAYS}d`)
    .sign(getSecret());
}

export async function verifySession(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret());
    if (typeof payload.sub !== "string" || typeof payload.email !== "string") return null;
    return { sub: payload.sub, email: payload.email };
  } catch {
    return null;
  }
}

export async function setSessionCookie(token: string): Promise<void> {
  const jar = await cookies();
  jar.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: SECURE_COOKIES,
    path: "/",
    maxAge: SESSION_TTL_DAYS * 24 * 60 * 60,
  });
}

export async function clearSessionCookie(): Promise<void> {
  const jar = await cookies();
  jar.set(SESSION_COOKIE, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: SECURE_COOKIES,
    path: "/",
    maxAge: 0,
  });
}

export async function readSession(): Promise<SessionPayload | null> {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  return verifySession(token);
}
