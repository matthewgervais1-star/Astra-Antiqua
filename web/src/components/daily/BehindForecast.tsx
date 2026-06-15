"use client";

import { useMemo } from "react";
import {
  PLANETS,
  PLANET_LABELS,
  PLANET_SYMBOLS,
  type Culture,
  type Planet,
} from "@/data/cultures";
import { DEITY_MATRIX } from "@/data/deities";
import { longitudeToSign, type Longitude } from "@/data/sampleChart";
import { computeUpcomingIngresses } from "@/lib/skyEvents";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { DeityGlyph } from "@/components/glyphs/DeityGlyph";

interface BehindForecastProps {
  now: Date;
  culture: Culture | null;
  chart: Readonly<Record<Planet, Longitude>>;
}

const LOOKAHEAD_DAYS = 365 * 3; // up to three years out for slow planets

function formatThrough(date: Date | null, now: Date): string {
  if (!date) return "through the foreseeable sky";
  const ms = date.getTime() - now.getTime();
  const days = Math.round(ms / (24 * 60 * 60 * 1000));
  if (days <= 0) return "through today";
  if (days === 1) return "through tomorrow";
  if (days < 7) return `through ${date.toLocaleDateString(undefined, { weekday: "long" })}`;
  if (days < 60) return `through ${date.toLocaleDateString(undefined, { month: "short", day: "numeric" })}`;
  return `through ${date.toLocaleDateString(undefined, { month: "short", year: "numeric" })}`;
}

export function BehindForecast({ now, culture, chart }: BehindForecastProps) {
  // For each planet, find the next sign change. Returns null if none in window.
  const nextIngresses = useMemo<Readonly<Record<Planet, Date | null>>>(() => {
    const all = computeUpcomingIngresses(now, LOOKAHEAD_DAYS);
    const out = {} as Record<Planet, Date | null>;
    for (const planet of PLANETS) {
      const first = all.find((e) => e.planet === planet);
      out[planet] = first ? first.date : null;
    }
    return out;
  }, [now]);

  return (
    <GlassPanel tone="solid" className="p-6 md:p-8">
      <div className="text-gold-leaf font-mono text-[10px] uppercase tracking-[0.3em]">
        Behind this forecast
      </div>
      <p className="text-ink-secondary font-body mt-2 max-w-2xl text-sm md:text-base">
        Where the seven planets actually are right now, and how long each holds its current sign.
      </p>
      <ul className="border-border-hairline mt-6 flex flex-col gap-4 border-t pt-5">
        {PLANETS.map((planet) => {
          const { sign, degree } = longitudeToSign(chart[planet]);
          const deity = culture ? DEITY_MATRIX[culture][planet] : null;
          const title = deity
            ? `${deity.name} in ${sign}`
            : `${PLANET_LABELS[planet]} in ${sign}`;
          return (
            <li
              key={planet}
              className="border-border-hairline flex items-start gap-4 border-t pt-4 first:border-t-0 first:pt-0"
            >
              {culture ? (
                <DeityGlyph
                  culture={culture}
                  planet={planet}
                  size={36}
                  decorative
                  className="shrink-0"
                />
              ) : (
                <span className="text-gold-leaf font-display w-9 shrink-0 text-center text-2xl">
                  {PLANET_SYMBOLS[planet]}
                </span>
              )}
              <div className="min-w-0 flex-1">
                <div className="font-display text-ink-primary text-lg leading-snug md:text-xl">
                  {title}
                </div>
                <div className="text-ink-tertiary font-mono mt-1 text-[10px] uppercase tracking-[0.2em]">
                  {PLANET_SYMBOLS[planet]} {PLANET_LABELS[planet]} · {degree.toFixed(1)}° {sign} ·{" "}
                  {formatThrough(nextIngresses[planet], now)}
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </GlassPanel>
  );
}
