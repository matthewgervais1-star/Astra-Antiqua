import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth/currentUser";
import { deleteChartForUser, getChartForUser, saveChartForUser } from "@/lib/auth/charts";
import { assertSameOrigin } from "@/lib/auth/origin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * The account holder's own chart. One per account, so there is no id in the
 * path and no list to page through.
 *
 * There is deliberately no way to send a chart about someone else here. A
 * comparison is computed in the browser against details that are never
 * transmitted, which is what keeps other people's birth data out of the
 * database entirely.
 */
const saveSchema = z.object({
  name: z.string().trim().min(1).max(120),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format."),
  time: z.string().regex(/^\d{2}:\d{2}(:\d{2})?$/, "Invalid time format."),
  cityLabel: z.string().trim().max(200),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
});

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ ok: false, error: "Not signed in." }, { status: 401 });
  }
  const chart = await getChartForUser(user.id);
  return NextResponse.json({ ok: true, chart });
}

export async function PUT(request: Request) {
  const origin = assertSameOrigin(request);
  if (!origin.ok) {
    return NextResponse.json({ ok: false, error: origin.reason }, { status: 403 });
  }
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ ok: false, error: "Not signed in." }, { status: 401 });
  }
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Body must be JSON." }, { status: 400 });
  }
  const parsed = saveSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: parsed.error.errors[0]?.message ?? "Invalid chart." },
      { status: 400 },
    );
  }
  const saved = await saveChartForUser(user.id, parsed.data);
  return NextResponse.json({ ok: true, chart: saved });
}

export async function DELETE(request: Request) {
  const origin = assertSameOrigin(request);
  if (!origin.ok) {
    return NextResponse.json({ ok: false, error: origin.reason }, { status: 403 });
  }
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ ok: false, error: "Not signed in." }, { status: 401 });
  }
  const removed = await deleteChartForUser(user.id);
  return NextResponse.json({ ok: true, removed });
}
