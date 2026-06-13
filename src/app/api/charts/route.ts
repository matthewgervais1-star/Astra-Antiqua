import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth/users";
import { listChartsForUser, upsertChartForUser } from "@/lib/auth/charts";
import { assertSameOrigin } from "@/lib/auth/origin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const RELATIONSHIPS = ["self", "partner", "family", "friend", "other"] as const;

const upsertSchema = z.object({
  id: z.string().min(1).max(120).optional(),
  name: z.string().trim().min(1).max(120),
  relationship: z.enum(RELATIONSHIPS),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format."),
  time: z.string().regex(/^\d{2}:\d{2}(:\d{2})?$/, "Invalid time format."),
  cityLabel: z.string().trim().max(200),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  primary: z.boolean().optional(),
});

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ ok: false, error: "Not signed in." }, { status: 401 });
  }
  const charts = listChartsForUser(user.id);
  return NextResponse.json({ ok: true, charts });
}

export async function POST(request: Request) {
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
  const parsed = upsertSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: parsed.error.errors[0]?.message ?? "Invalid chart." },
      { status: 400 },
    );
  }
  const saved = upsertChartForUser(user.id, parsed.data);
  return NextResponse.json({ ok: true, chart: saved });
}
