import { NextResponse } from "next/server";
import { waitListSchema, type WaitListEntry } from "@/lib/waitlistSchema";
import { getWaitListStore } from "@/lib/waitlistStore";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
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
    });
  } catch (err) {
    console.error("[waitlist] storage error", err);
    return NextResponse.json(
      { ok: false, error: "We could not record your entry. Please try again." },
      { status: 500 },
    );
  }
}
