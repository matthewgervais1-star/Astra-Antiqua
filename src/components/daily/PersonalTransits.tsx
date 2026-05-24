"use client";

import { useMemo } from "react";
import type { Culture, Planet } from "@/data/cultures";
import { PLANET_LABELS, PLANET_SYMBOLS } from "@/data/cultures";
import type { Longitude } from "@/data/sampleChart";
import { computeTransits, topTransits } from "@/lib/transits";
import { buildTransitLine } from "@/lib/transitReading";
import { GlassPanel } from "@/components/ui/GlassPanel";

interface PersonalTransitsProps {
  culture: Culture | null;
  natalChart: Readonly<Record<Planet, Longitude>>;
  transitChart: Readonly<Record<Planet, Longitude>>;
}

export function PersonalTransits({
  culture,
  natalChart,
  transitChart,
}: PersonalTransitsProps) {
  const hits = useMemo(
    () => topTransits(computeTransits(transitChart, natalChart), 5, true),
    [natalChart, transitChart],
  );

  if (hits.length === 0) {
    return (
      <GlassPanel tone="solid" className="p-6 md:p-8">
        <div className="text-gold-leaf font-mono text-[10px] uppercase tracking-[0.3em]">
          Today, for you
        </div>
        <p className="text-ink-secondary font-body mt-4 text-base italic md:text-lg">
          No tight transits to your natal positions today. A quiet sky for the body you were born under.
        </p>
      </GlassPanel>
    );
  }

  return (
    <GlassPanel tone="solid" className="p-6 md:p-8">
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <div className="text-gold-leaf font-mono text-[10px] uppercase tracking-[0.3em]">
          Today, for you
        </div>
        <span className="text-ink-tertiary font-mono text-[10px] uppercase tracking-[0.25em]">
          {hits.length} headline transit{hits.length === 1 ? "" : "s"}
        </span>
      </div>
      <p className="text-ink-secondary font-body mt-3 max-w-2xl text-sm md:text-base">
        Where today&apos;s sky most closely touches the chart you were born under, in the voice of {culture ? "the chosen pantheon" : "the seven"}.
      </p>
      <ul className="mt-6 flex flex-col gap-5">
        {hits.map((hit, idx) => {
          const line = culture ? buildTransitLine(culture, hit) : null;
          return (
            <li
              key={`${hit.transit}-${hit.natal}-${idx}`}
              className="border-border-hairline border-t pt-4"
            >
              <div className="text-ink-tertiary font-mono text-[10px] uppercase tracking-[0.25em]">
                Transit {PLANET_SYMBOLS[hit.transit]} {PLANET_LABELS[hit.transit]} {hit.kind} natal{" "}
                {PLANET_SYMBOLS[hit.natal]} {PLANET_LABELS[hit.natal]} · orb {hit.orb.toFixed(1)}°
              </div>
              {line ? (
                <>
                  <p className="font-display text-gold-leaf mt-2 text-lg leading-snug md:text-2xl">
                    {line.verbLine}
                  </p>
                  <p className="text-ink-primary font-body mt-2 text-[15px] leading-relaxed md:text-base">
                    {line.reflection}
                  </p>
                </>
              ) : (
                <p className="text-ink-secondary font-body mt-2 text-sm italic">
                  Select a pantheon above to read this transit in its voice.
                </p>
              )}
            </li>
          );
        })}
      </ul>
    </GlassPanel>
  );
}
