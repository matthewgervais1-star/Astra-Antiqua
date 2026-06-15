import { NextResponse } from "next/server";
import { z } from "zod";
import { AuthError, createUser } from "@/lib/auth/users";
import { setSessionCookie, signSession } from "@/lib/auth/session";
import { assertSameOrigin } from "@/lib/auth/origin";
import { clientIdentifier, rateLimit } from "@/lib/auth/rateLimit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const schema = z.object({
  email: z.string().trim().min(1).email("Enter a valid email address.").max(254),
  password: z.string().min(8, "Password must be at least eight characters.").max(200),
  displayName: z.string().trim().min(1).max(120).optional(),
});

export async function POST(request: Request) {
  const origin = assertSameOrigin(request);
  if (!origin.ok) {
    return NextResponse.json({ ok: false, error: origin.reason }, { status: 403 });
  }
  const ipKey = clientIdentifier(request);
  const ipLimit = rateLimit(`signup:${ipKey}`, 5, 60 * 60 * 1000);
  if (!ipLimit.allowed) {
    return NextResponse.json(
      { ok: false, error: "Too many sign-ups from this address. Try again later." },
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
      { ok: false, error: parsed.error.errors[0]?.message ?? "Invalid input." },
      { status: 400 },
    );
  }
  try {
    const user = await createUser(parsed.data);
    const token = await signSession({ sub: user.id, email: user.email });
    await setSessionCookie(token);
    return NextResponse.json({
      ok: true,
      user: { id: user.id, email: user.email, displayName: user.displayName },
    });
  } catch (err) {
    if (err instanceof AuthError) {
      return NextResponse.json({ ok: false, error: err.message }, { status: 400 });
    }
    console.error("[auth.signup] error", err);
    return NextResponse.json(
      { ok: false, error: "Could not create the account. Please try again." },
      { status: 500 },
    );
  }
}
