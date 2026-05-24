"use client";

import type { Culture, Planet } from "@/data/cultures";
import { PLANET_LABELS, PLANET_SYMBOLS } from "@/data/cultures";
import { DEITY_MATRIX } from "@/data/deities";
import { longitudeToSign, type Longitude } from "@/data/sampleChart";

interface WheelTooltipProps {
  culture: Culture | null;
  planet: Planet;
  x: number;
  y: number;
  containerWidth: number;
  chart: Readonly<Record<Planet, Longitude>>;
}

export function WheelTooltip({
  culture,
  planet,
  x,
  y,
  containerWidth,
  chart,
}: WheelTooltipProps) {
  const deity = culture ? DEITY_MATRIX[culture][planet] : null;
  const { sign, degree } = longitudeToSign(chart[planet]);

  const tooltipWidth = 240;
  const flipped = x + tooltipWidth + 16 > containerWidth;
  const left = flipped ? x - tooltipWidth - 12 : x + 12;
  const top = Math.max(8, y - 60);

  return (
    <div
      role="status"
      aria-live="polite"
      className="border-gold-soft bg-bg-deep/95 pointer-events-none absolute z-10 w-[240px] rounded-2xl border p-4 shadow-[0_20px_60px_-20px_rgba(0,0,0,0.8)] backdrop-blur-md"
      style={{ left, top }}
    >
      <div className="flex items-baseline justify-between gap-2">
        <div className="text-gold-leaf font-mono text-[10px] uppercase tracking-[0.3em]">
          {PLANET_SYMBOLS[planet]} {PLANET_LABELS[planet]}
        </div>
        <div className="text-ink-tertiary font-mono text-[10px] tracking-[0.15em]">
          {degree.toFixed(0)}° {sign}
        </div>
      </div>
      {deity ? (
        <>
          <h4 className="font-display text-gold-leaf mt-2 text-xl">{deity.name}</h4>
          <p className="text-ink-secondary font-body mt-1 text-sm italic">
            {deity.epithet}
          </p>
          <p className="text-ink-primary font-body mt-3 text-[13px] leading-relaxed">
            {deity.note}
          </p>
        </>
      ) : (
        <p className="text-ink-secondary font-body mt-3 text-sm">
          Select a pantheon to see the cultural translation for this planet.
        </p>
      )}
    </div>
  );
}
