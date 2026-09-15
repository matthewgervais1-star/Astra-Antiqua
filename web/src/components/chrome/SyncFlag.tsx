"use client";

import { useAuth } from "@/components/auth/AuthProvider";
import { Badge } from "@/components/chrome/Badge";

/**
 * Tiny client island for the SubBar's SYNC indicator, so the rest of the
 * SubBar (and every page that renders it) can stay a server component.
 */
export function SyncFlag() {
  const { status } = useAuth();
  const label = status === "authenticated" ? "SYNC ON" : "SYNC OFF";
  return <Badge tone="outline">{label}</Badge>;
}
