"use client";

import { useMemo } from "react";
import type { Culture } from "@/data/cultures";
import { DEITY_MATRIX } from "@/data/deities";
import { computeChart } from "@/lib/ephemeris";
import { longitudeToSign, computeAspects } from "@/data/sampleChart";
import { SIGN_REGISTERS } from "@/data/interpretations";
import { GlassPanel } from "@/components/ui/GlassPanel";

interface WeekForecastProps {
  now: Date;
  culture: Culture | null;
  days?: number;
}

const PLACEMENT_VERBS: Readonly<Record<Culture, string>> = {
  egypt: "stands in",
  greece: "walks in",
  canaan: "takes the seat of",
  carthage: "raises the standard of",
};

interface DayForecast {
  date: Date;
  moonSign: string;
  moonDeityName: string | null;
  moonHeadline: string;
  tightestAspectLine: string | null;
}

function buildDay(date: Date, culture: Culture | null): DayForecast {
  const chart = computeChart(date);
  const moonInfo = longitudeToSign(chart.moon);
  const moonSign = moonInfo.sign;
  const moonDeity = culture ? DEITY_MATRIX[culture].moon : null;
  const verb = culture ? PLACEMENT_VERBS[culture] : null;
  const moonHeadline = culture && moonDeity && verb
    ? `${moonDeity.name} ${verb} ${SIGN_REGISTERS[moonSign]}.`
    : `The Moon enters ${moonSign}, ${SIGN_REGISTERS[moonSign]}.`;
  const aspects = computeAspects(chart);
  const sortedAspects = [...aspects].sort((a, b) => a.orb - b.orb);
  const tightest = sortedAspects[0];
  let tightestAspectLine: string | null = null;
  if (tightest) {
    if (culture) {
      const deityA = DEITY_MATRIX[culture][tightest.a];
      const deityB = DEITY_MATRIX[culture][tightest.b];
      tightestAspectLine = `${deityA.name} ${tightest.kind} ${deityB.name}`;
    } else {
      tightestAspectLine = `${tightest.a} ${tightest.kind} ${tightest.b}`;
    }
  }
  return {
    date,
    moonSign,
    moonDeityName: moonDeity?.name ?? null,
    moonHeadline,
    tightestAspectLine,
  };
}

export function WeekForecast({ now, culture, days = 7 }: WeekForecastProps) {
  const forecast = useMemo<readonly DayForecast[]>(() => {
    const out: DayForecast[] = [];
    for (let i = 0; i < days; i += 1) {
      const d = new Date(now.getTime() + i * 24 * 60 * 60 * 1000);
      out.push(buildDay(d, culture));
    }
    return out;
  }, [now, culture, days]);

  return (
    <div>
      <div className="mb-6 flex items-end justify-between gap-4">
        <div>
          <h3 className="font-display text-ink-primary text-2xl md:text-3xl">
            The coming week
          </h3>
          <p className="text-ink-tertiary font-mono mt-2 text-[11px] uppercase tracking-[0.3em]">
            Moon headline + tightest aspect, day by day
          </p>
        </div>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 xl:gap-4">
        {forecast.map((day, idx) => (
          <GlassPanel
            key={day.date.toISOString()}
            tone="solid"
            className="flex h-full flex-col gap-2 p-4 md:p-5"
          >
            <div className="text-gold-leaf font-mono text-[10px] uppercase tracking-[0.3em]">
              {idx === 0
                ? "Today"
                : day.date.toLocaleDateString(undefined, { weekday: "short" })}
            </div>
            <div className="text-ink-tertiary font-mono text-[10px] uppercase tracking-[0.2em]">
              {day.date.toLocaleDateString(undefined, { month: "short", day: "numeric" })}
            </div>
            <p className="font-display text-ink-primary mt-2 text-sm leading-snug md:text-base">
              {day.moonHeadline}
            </p>
            {day.tightestAspectLine ? (
              <p className="text-ink-secondary font-body mt-auto pt-2 text-xs italic leading-relaxed">
                {day.tightestAspectLine}
              </p>
            ) : null}
          </GlassPanel>
        ))}
      </div>
    </div>
  );
}
