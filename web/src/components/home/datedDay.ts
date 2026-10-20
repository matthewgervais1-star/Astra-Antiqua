"use client";

import { useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { parseIsoDate } from "@/lib/figureReading";

/**
 * The day a dated home view asks for: `/?date=YYYY-MM-DD` opens the day page
 * for 00:00 UTC on that date, the instant the figure page read it. Null for
 * the live day, and for any date outside 1900 to 2100, which falls back to
 * today. Read through the router so that navigating from a dated view back
 * to `/` reads the live day again. Callers sit inside a Suspense boundary.
 */
export function useDatedDay(): Date | null {
  const raw = useSearchParams().get("date") ?? "";
  return useMemo(() => parseIsoDate(raw), [raw]);
}
