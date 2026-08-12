"use client";

import { useEffect, useState } from "react";

function pad2(n: number): string {
  return n.toString().padStart(2, "0");
}

function isoDate(d: Date): string {
  return `${d.getUTCFullYear()}-${pad2(d.getUTCMonth() + 1)}-${pad2(d.getUTCDate())}`;
}

function isoTime(d: Date): string {
  return `${pad2(d.getUTCHours())}:${pad2(d.getUTCMinutes())}`;
}

/**
 * The sub-bar's "2026-08-11 · 14:32 UTC · LIVE" context. The date renders
 * directly (both server and client compute it the same way almost always;
 * the tiny risk sits at the UTC midnight boundary). The time is left blank
 * until after mount, then ticks every 30s, so the server-rendered markup
 * never disagrees with the client's first paint on the minute.
 */
export function LiveClock() {
  const [time, setTime] = useState<string | null>(null);

  useEffect(() => {
    const tick = () => setTime(isoTime(new Date()));
    tick();
    const id = window.setInterval(tick, 30_000);
    return () => window.clearInterval(id);
  }, []);

  return (
    <span className="whitespace-nowrap">
      {isoDate(new Date())} · {time ?? "--:--"} UTC · LIVE
    </span>
  );
}
