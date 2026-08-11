"use client";

import { useAuth } from "@/components/auth/AuthProvider";

/**
 * Tiny client island for the SubBar's SYNC indicator, so the rest of the
 * SubBar (and every page that renders it) can stay a server component.
 */
export function SyncFlag() {
  const { status } = useAuth();
  const label = status === "authenticated" ? "SYNC ON" : "SYNC OFF";
  return <span className="whitespace-nowrap font-mono text-[11px] text-dim">{label}</span>;
}
