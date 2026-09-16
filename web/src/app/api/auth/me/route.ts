import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/currentUser";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ ok: true, user: null });
  }
  return NextResponse.json({
    ok: true,
    user: { id: user.id, email: user.email, displayName: user.displayName },
  });
}
