import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { getCurrentUser, AuthError } from "@/lib/auth/users";
import { getDb } from "@/lib/auth/db";
import { assertSameOrigin } from "@/lib/auth/origin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const patchSchema = z
  .object({
    displayName: z.string().trim().max(120).optional(),
    currentPassword: z.string().min(1).max(200).optional(),
    newPassword: z.string().min(8, "New password must be at least eight characters.").max(200).optional(),
  })
  .refine(
    (v) =>
      (v.newPassword === undefined && v.currentPassword === undefined) ||
      (v.newPassword !== undefined && v.currentPassword !== undefined),
    { message: "Password change requires both current and new password." },
  );

export async function PATCH(request: Request) {
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
  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: parsed.error.errors[0]?.message ?? "Invalid input." },
      { status: 400 },
    );
  }

  const db = getDb();
  try {
    if (parsed.data.newPassword && parsed.data.currentPassword) {
      const row = db
        .prepare("SELECT password_hash FROM users WHERE id = ?")
        .get(user.id) as { password_hash: string } | undefined;
      if (!row) {
        throw new AuthError("Account not found.");
      }
      const ok = await bcrypt.compare(parsed.data.currentPassword, row.password_hash);
      if (!ok) {
        throw new AuthError("Current password is incorrect.");
      }
      const hash = await bcrypt.hash(parsed.data.newPassword, 11);
      db.prepare("UPDATE users SET password_hash = ? WHERE id = ?").run(hash, user.id);
    }
    if (parsed.data.displayName !== undefined) {
      db.prepare("UPDATE users SET display_name = ? WHERE id = ?").run(
        parsed.data.displayName || null,
        user.id,
      );
    }
    const refreshed = db.prepare("SELECT id, email, display_name FROM users WHERE id = ?").get(user.id) as
      | { id: string; email: string; display_name: string | null }
      | undefined;
    return NextResponse.json({
      ok: true,
      user: refreshed
        ? { id: refreshed.id, email: refreshed.email, displayName: refreshed.display_name }
        : null,
    });
  } catch (err) {
    if (err instanceof AuthError) {
      return NextResponse.json({ ok: false, error: err.message }, { status: 400 });
    }
    console.error("[me.patch] error", err);
    return NextResponse.json(
      { ok: false, error: "Could not update account." },
      { status: 500 },
    );
  }
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
  const db = getDb();
  // FK ON DELETE CASCADE removes the user's charts automatically.
  db.prepare("DELETE FROM users WHERE id = ?").run(user.id);
  // Also clear the session cookie so the client signs out.
  const { clearSessionCookie } = await import("@/lib/auth/session");
  await clearSessionCookie();
  return NextResponse.json({ ok: true });
}
