import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/users";
import { listChartsForUser } from "@/lib/auth/charts";
import { assertSameOrigin } from "@/lib/auth/origin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  // This GET returns the full account dump. The session cookie is SameSite=Lax,
  // so a cross-site top-level navigation would otherwise carry it; block any
  // cross-site trigger and require a same-origin Origin/Referer.
  if (request.headers.get("sec-fetch-site") === "cross-site") {
    return NextResponse.json({ ok: false, error: "Cross-site request blocked." }, { status: 403 });
  }
  const origin = assertSameOrigin(request);
  if (!origin.ok) {
    return NextResponse.json({ ok: false, error: origin.reason }, { status: 403 });
  }
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ ok: false, error: "Not signed in." }, { status: 401 });
  }
  const charts = listChartsForUser(user.id);
  const payload = {
    exportedAt: new Date().toISOString(),
    user: {
      id: user.id,
      email: user.email,
      displayName: user.displayName,
      createdAt: new Date(user.createdAt).toISOString(),
    },
    charts,
  };
  const filename = `astra-antiqua-${user.email.replace(/[^a-z0-9._-]/gi, "_")}-${new Date().toISOString().slice(0, 10)}.json`;
  return new NextResponse(JSON.stringify(payload, null, 2), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
