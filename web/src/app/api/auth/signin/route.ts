import { NextResponse } from "next/server";
import { z } from "zod";
import { AuthError, authenticateUser } from "@/lib/auth/users";
import { setSessionCookie, signSession } from "@/lib/auth/session";
import { assertSameOrigin } from "@/lib/auth/origin";
import {
  clientIdentifier,
  loginThrottleCheck,
  rateLimit,
  recordLoginAttempt,
} from "@/lib/auth/rateLimit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const schema = z.object({
  email: z.string().trim().min(1).max(254),
  password: z.string().min(1).max(200),
});

export async function POST(request: Request) {
  const origin = assertSameOrigin(request);
  if (!origin.ok) {
    return NextResponse.json({ ok: false, error: origin.reason }, { status: 403 });
  }
  const ipKey = clientIdentifier(request);
  const ipLimit = rateLimit(`signin:${ipKey}`, 20, 60 * 1000);
  if (!ipLimit.allowed) {
    return NextResponse.json(
      { ok: false, error: "Too many requests. Try again in a minute." },
      { status: 429 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Body must be JSON." }, { status: 400 });
  }
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: "Email and password are required." },
      { status: 400 },
    );
  }

  const throttle = loginThrottleCheck(parsed.data.email);
  if (throttle.locked) {
    const minutes = Math.ceil(throttle.remainingMs / (60 * 1000));
    return NextResponse.json(
      {
        ok: false,
        error: `Account temporarily locked after too many failed attempts. Try again in ${minutes} minute${minutes === 1 ? "" : "s"}.`,
      },
      { status: 429 },
    );
  }

  try {
    const user = await authenticateUser(parsed.data.email, parsed.data.password);
    recordLoginAttempt(parsed.data.email, true);
    const token = await signSession({ sub: user.id, email: user.email });
    await setSessionCookie(token);
    return NextResponse.json({
      ok: true,
      user: { id: user.id, email: user.email, displayName: user.displayName },
    });
  } catch (err) {
    recordLoginAttempt(parsed.data.email, false);
    if (err instanceof AuthError) {
      return NextResponse.json({ ok: false, error: err.message }, { status: 401 });
    }
    console.error("[auth.signin] error", err);
    return NextResponse.json(
      { ok: false, error: "Could not sign in. Please try again." },
      { status: 500 },
    );
  }
}
