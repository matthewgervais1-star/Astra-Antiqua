"use client";

import { useMemo } from "react";
import type { Culture } from "@/data/cultures";
import { PLANET_LABELS, PLANET_SYMBOLS } from "@/data/cultures";
import { DEITY_MATRIX } from "@/data/deities";
import { computeUpcomingIngresses, type SkyEvent } from "@/lib/skyEvents";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { DeityGlyph } from "@/components/glyphs/DeityGlyph";

interface UpcomingEventsProps {
  now: Date;
  culture: Culture | null;
  days?: number;
}

function formatDate(date: Date): string {
  return date.toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

function eventLine(culture: Culture | null, event: SkyEvent): string {
  if (!culture) {
    return `${PLANET_LABELS[event.planet]} enters ${event.toSign}, leaving ${event.fromSign}.`;
  }
  const deity = DEITY_MATRIX[culture][event.planet];
  return `${deity.name} enters ${event.toSign}, leaving ${event.fromSign}.`;
}

export function UpcomingEvents({ now, culture, days = 14 }: UpcomingEventsProps) {
  const events = useMemo(() => computeUpcomingIngresses(now, days), [now, days]);

  if (events.length === 0) {
    return (
      <GlassPanel tone="solid" className="p-6 md:p-7">
        <div className="text-gold-leaf font-mono text-[10px] uppercase tracking-[0.3em]">
          Coming sky
        </div>
        <p className="text-ink-secondary font-body mt-3 text-sm italic">
          No sign ingresses in the next {days} days. The wheel holds.
        </p>
      </GlassPanel>
    );
  }

  return (
    <GlassPanel tone="solid" className="p-6 md:p-7">
      <div className="text-gold-leaf font-mono text-[10px] uppercase tracking-[0.3em]">
        Coming sky · next {days} days
      </div>
      <ul className="mt-4 flex flex-col gap-3">
        {events.map((event, idx) => (
          <li
            key={`${event.planet}-${idx}`}
            className="border-border-hairline flex items-start gap-3 border-t pt-3 first:border-t-0 first:pt-0"
          >
            {culture ? (
              <DeityGlyph
                culture={culture}
                planet={event.planet}
                size={28}
                decorative
                className="shrink-0"
              />
            ) : (
              <span className="text-ink-secondary font-display w-7 text-center text-xl">
                {PLANET_SYMBOLS[event.planet]}
              </span>
            )}
            <div className="min-w-0 flex-1">
              <div className="text-ink-tertiary font-mono text-[10px] uppercase tracking-[0.2em]">
                {formatDate(event.date)} · ingress
              </div>
              <p className="text-ink-primary font-body mt-1 text-sm leading-snug md:text-[15px]">
                {eventLine(culture, event)}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </GlassPanel>
  );
}
