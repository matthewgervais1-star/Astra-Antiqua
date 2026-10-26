"use client";

import { useEffect, useState } from "react";
import { useDatedDay } from "@/components/home/datedDay";

function pad2(n: number): string {
  return n.toString().padStart(2, "0");
}

function isoDate(d: Date): string {
  return `${d.getUTCFullYear()}-${pad2(d.getUTCMonth() + 1)}-${pad2(d.getUTCDate())}`;
}

function isoTime(d: Date): string {
  return `${pad2(d.getUTCHours())}:${pad2(d.getUTCMinutes())}`;
}

/** A slot that holds its width and shows nothing: invisible, and hidden from
 * screen readers. The text is a stand-in of the same length as the real one.
 * Inline style, so no frame shows it before the stylesheet lands. */
function Unset({ children }: { children: string }) {
  return (
    <span aria-hidden="true" style={{ visibility: "hidden" }}>
      {children}
    </span>
  );
}

/**
 * The sub-bar's "2026-08-11 · 14:32 UTC · LIVE" context. The date renders
 * directly (both server and client compute it the same way almost always;
 * the tiny risk sits at the UTC midnight boundary). The time slot is blank
 * until after mount, then ticks every 30s, so the server-rendered markup
 * never disagrees with the client's first paint on the minute. The blank
 * keeps the width of a time, so the line does not shift when it arrives.
 *
 * A dated view (`/?date=YYYY-MM-DD`) is not live: it shows the instant the
 * page reads, "2026-09-29 · 00:00 UTC", and no LIVE flag.
 */
export function LiveClock() {
  const [time, setTime] = useState<string | null>(null);
  const dated = useDatedDay();

  useEffect(() => {
    if (dated) return;
    const tick = () => setTime(isoTime(new Date()));
    tick();
    const id = window.setInterval(tick, 30_000);
    return () => window.clearInterval(id);
  }, [dated]);

  if (dated) {
    return <span className="whitespace-nowrap">{isoDate(dated)} · 00:00 UTC</span>;
  }

  return (
    <span className="whitespace-nowrap">
      {isoDate(new Date())} · {time ?? <Unset>00:00</Unset>} UTC · LIVE
    </span>
  );
}

/**
 * The line while `?date` is still being read (the Suspense fallback). Neither
 * the date nor the time is known yet, so the whole line is a blank of its own
 * width rather than a guess.
 */
export function LiveClockPending() {
  return (
    <span className="whitespace-nowrap">
      <Unset>0000-00-00 · 00:00 UTC · LIVE</Unset>
    </span>
  );
}
