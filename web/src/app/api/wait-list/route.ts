import { NextResponse } from "next/server";
import { waitListSchema, type WaitListEntry } from "@/lib/waitlistSchema";
import { getWaitListStore } from "@/lib/waitlistStore";
import { assertSameOrigin } from "@/lib/auth/origin";
import { clientIdentifier, rateLimit } from "@/lib/auth/rateLimit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const origin = assertSameOrigin(request);
  if (!origin.ok) {
    return NextResponse.json({ ok: false, error: origin.reason }, { status: 403 });
  }
  const limit = rateLimit(`waitlist:${clientIdentifier(request)}`, 5, 60 * 60 * 1000);
  if (!limit.allowed) {
    return NextResponse.json(
      { ok: false, error: "Too many sign-ups from here. Try again later." },
      { status: 429 },
    );
  }

  let raw: unknown;
  try {
    raw = await request.json();
  } catch {
    return NextResponse.json(
      { ok: false, error: "Request body must be valid JSON." },
      { status: 400 },
    );
  }

  const parsed = waitListSchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json(
      {
        ok: false,
        error: "Validation failed.",
        fieldErrors: parsed.error.flatten().fieldErrors,
      },
      { status: 400 },
    );
  }

  const entry: WaitListEntry = {
    ...parsed.data,
    receivedAt: new Date().toISOString(),
  };

  try {
    const store = getWaitListStore();
    const result = await store.append(entry);
    return NextResponse.json({
      ok: true,
      persisted: result.persisted,
      duplicate: result.duplicate,
      position: result.position,
    });
  } catch (err) {
    console.error("[waitlist] storage error", err);
    return NextResponse.json(
      { ok: false, error: "We could not record your entry. Please try again." },
      { status: 500 },
    );
  }
}
