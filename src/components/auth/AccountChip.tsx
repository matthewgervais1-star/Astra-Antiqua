"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/components/auth/AuthProvider";
import { cn } from "@/lib/classNames";

export function AccountChip() {
  const { status, user, signOut } = useAuth();
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement | null>(null);

  // Dismiss the menu on outside click or Escape, so it never stays stuck open.
  useEffect(() => {
    if (!open) return;
    const onPointer = (e: PointerEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  if (status === "loading") {
    return (
      <span className="text-ink-tertiary font-mono text-[10px] uppercase tracking-[0.25em]">
        ...
      </span>
    );
  }

  if (status === "anonymous") {
    return (
      <Link
        href="/sign-in"
        className="border-gold-soft text-gold-leaf hover:bg-gold-leaf/10 font-mono inline-flex shrink-0 items-center whitespace-nowrap rounded-full border px-4 py-1.5 text-[10px] uppercase tracking-[0.22em] transition-colors"
      >
        Sign in
      </Link>
    );
  }

  return (
    <div className="relative" ref={wrapRef}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "border-hairline hover:border-gold-soft text-ink-secondary hover:text-ink-primary font-mono inline-flex max-w-[180px] shrink-0 items-center gap-2 whitespace-nowrap rounded-full border px-3 py-1.5 text-[10px] uppercase tracking-[0.22em] transition-colors",
        )}
        aria-haspopup="menu"
        aria-expanded={open}
      >
        <span className="bg-gold-leaf h-1.5 w-1.5 rounded-full" aria-hidden />
        <span className="truncate">{user?.displayName ?? user?.email ?? "Signed in"}</span>
      </button>
      {open ? (
        <div
          role="menu"
          className="border-gold-soft bg-bg-deep absolute right-0 mt-2 w-56 rounded-xl border p-2 shadow-2xl"
        >
          <div className="text-ink-tertiary font-mono px-2 py-1 text-[9px] uppercase tracking-[0.3em]">
            Signed in as
          </div>
          <div className="text-ink-primary font-body truncate px-2 pb-2 text-sm">
            {user?.email}
          </div>
          <div className="border-border-hairline border-t pt-1">
            <Link
              href="/charts"
              onClick={() => setOpen(false)}
              className="text-ink-secondary hover:text-ink-primary hover:bg-gold-leaf/10 block rounded-lg px-2 py-1.5 text-sm"
            >
              Your charts
            </Link>
            <Link
              href="/account"
              onClick={() => setOpen(false)}
              className="text-ink-secondary hover:text-ink-primary hover:bg-gold-leaf/10 block rounded-lg px-2 py-1.5 text-sm"
            >
              Account settings
            </Link>
            <button
              type="button"
              onClick={async () => {
                setOpen(false);
                await signOut();
              }}
              className="text-conflict-red hover:bg-conflict-red/10 block w-full rounded-lg px-2 py-1.5 text-left text-sm"
            >
              Sign out
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
