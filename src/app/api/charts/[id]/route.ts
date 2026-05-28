import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/users";
import {
  deleteChartForUser,
  getChartForUser,
  setPrimaryChartForUser,
} from "@/lib/auth/charts";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface Params {
  params: Promise<{ id: string }>;
}

export async function GET(_request: Request, { params }: Params) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ ok: false, error: "Not signed in." }, { status: 401 });
  }
  const { id } = await params;
  const chart = getChartForUser(user.id, id);
  if (!chart) {
    return NextResponse.json({ ok: false, error: "Chart not found." }, { status: 404 });
  }
  return NextResponse.json({ ok: true, chart });
}

export async function DELETE(_request: Request, { params }: Params) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ ok: false, error: "Not signed in." }, { status: 401 });
  }
  const { id } = await params;
  const ok = deleteChartForUser(user.id, id);
  if (!ok) {
    return NextResponse.json({ ok: false, error: "Chart not found." }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}

export async function POST(request: Request, { params }: Params) {
  // Used by /api/charts/[id]/primary endpoint shape; this POST sets primary
  // when the body includes { action: "setPrimary" }.
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ ok: false, error: "Not signed in." }, { status: 401 });
  }
  const { id } = await params;
  let body: { action?: string } = {};
  try {
    body = (await request.json()) as { action?: string };
  } catch {
    // ignore: default to setPrimary
  }
  if (body.action === "setPrimary" || !body.action) {
    const ok = setPrimaryChartForUser(user.id, id);
    if (!ok) {
      return NextResponse.json({ ok: false, error: "Chart not found." }, { status: 404 });
    }
    return NextResponse.json({ ok: true });
  }
  return NextResponse.json({ ok: false, error: "Unknown action." }, { status: 400 });
}
