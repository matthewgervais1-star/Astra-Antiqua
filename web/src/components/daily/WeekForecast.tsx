"use client";

import { useEffect, useMemo, useState } from "react";
import { PLANET_LABELS, type Culture } from "@/data/cultures";
import { DEITY_MATRIX } from "@/data/deities";
import { computeChart } from "@/lib/ephemeris";
import { longitudeToSign, computeAspects, type ZodiacSign } from "@/data/sampleChart";
import { SIGN_REGISTERS } from "@/data/interpretations";
import { WEEK_READINGS, type WeekReading } from "@/data/weekReadings";
import { getAspectReading } from "@/data/aspectReadings";
import { PLACEMENT_VERBS } from "@/data/aspectVerbs";
import { loadSavedNatal, type SavedNatal } from "@/lib/savedNatal";
import { computeTransits, topTransits, type TransitAspect } from "@/lib/transits";
import { buildTransitLine } from "@/lib/transitReading";
import { transitPlanetWeight } from "@/lib/season";
import { TONE_LABELS, toneOf, type Tone } from "@/lib/tone";
import { HorizonLinks } from "@/components/HorizonLinks";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { cn } from "@/lib/classNames";

interface WeekForecastProps {
  now: Date;
  culture: Culture | null;
  /** Culture for the horizon links only when the page itself is culture-scoped. */
  linkCulture?: Culture | null;
  days?: number;
}

interface PersonalDayHit {
  aspect: TransitAspect;
  line: string;
  tone: Tone;
}

interface DayForecast {
  date: Date;
  moonSign: ZodiacSign;
  reading: WeekReading;
  /** The ancient sourcing: deity placement plus the day's tightest aspect. */
  contextLine: string;
  tightestAspectLine: string | null;
  /** The day's strongest touch on the visitor's own chart, when one exists. */
  personal: PersonalDayHit | null;
}

interface WeekSynthesis {
  headline: string;
  body: string;
  contextLine: string;
  tone: Tone;
}

function personalLine(culture: Culture | null, t: TransitAspect): string {
  if (culture) return buildTransitLine(culture, t).verbLine;
  return `${PLANET_LABELS[t.transit]} ${t.kind} your natal ${PLANET_LABELS[t.natal]}.`;
}

function buildDay(date: Date, culture: Culture | null, natal: SavedNatal | null): DayForecast {
  const chart = computeChart(date);
  const moonSign = longitudeToSign(chart.moon).sign;
  const moonDeity = culture ? DEITY_MATRIX[culture].moon : null;
  const verb = culture ? PLACEMENT_VERBS[culture] : null;
  const contextLine =
    culture && moonDeity && verb
      ? `${moonDeity.name} ${verb} ${SIGN_REGISTERS[moonSign]}.`
      : `The Moon in ${moonSign}, ${SIGN_REGISTERS[moonSign]}.`;
  const aspects = computeAspects(chart);
  const tightest = [...aspects].sort((a, b) => a.orb - b.orb)[0];
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
  let personal: PersonalDayHit | null = null;
  if (natal) {
    const hit = topTransits(computeTransits(chart, natal.chart), 1)[0];
    if (hit) {
      personal = {
        aspect: hit,
        line: personalLine(culture, hit),
        tone: toneOf(hit.kind),
      };
    }
  }
  return {
    date,
    moonSign,
    reading: WEEK_READINGS[moonSign],
    contextLine,
    tightestAspectLine,
    personal,
  };
}

/**
 * The week's dominant personal transit: across all seven days, the touch with
 * the heaviest planet at the tightest orb. This is the "shape of the week",
 * one reading instead of seven disconnected days.
 */
function buildWeekSynthesis(
  culture: Culture | null,
  forecast: readonly DayForecast[],
): WeekSynthesis | null {
  let best: { day: DayForecast; hit: PersonalDayHit; score: number } | null = null;
  for (const day of forecast) {
    if (!day.personal) continue;
    const t = day.personal.aspect;
    const score = transitPlanetWeight(t.transit) * (1 - t.orb / 6);
    if (!best || score > best.score) best = { day, hit: day.personal, score };
  }
  if (!best) return null;
  const t = best.hit.aspect;
  const reading = getAspectReading(t.transit, t.natal, t.kind);
  const weekday = best.day.date.toLocaleDateString(undefined, { weekday: "long" });
  return {
    headline: reading.headline,
    body: reading.body,
    contextLine: `${best.hit.line} Tightest on ${weekday}.`,
    tone: best.hit.tone,
  };
}

export function WeekForecast({ now, culture, linkCulture = null, days = 7 }: WeekForecastProps) {
  const [natal, setNatal] = useState<SavedNatal | null>(null);

  useEffect(() => {
    // The saved chart lives in localStorage, so it can only be read on the
    // client after mount.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setNatal(loadSavedNatal());
  }, []);

  const forecast = useMemo<readonly DayForecast[]>(() => {
    const out: DayForecast[] = [];
    for (let i = 0; i < days; i += 1) {
      const d = new Date(now.getTime() + i * 24 * 60 * 60 * 1000);
      out.push(buildDay(d, culture, natal));
    }
    return out;
  }, [now, culture, days, natal]);

  const synthesis = useMemo(
    () => buildWeekSynthesis(culture, forecast),
    [culture, forecast],
  );

  return (
    <div id="week" className="scroll-mt-24">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h3 className="font-display text-ink-primary text-2xl md:text-3xl">
            The coming week
          </h3>
          <p className="text-ink-tertiary font-mono mt-2 text-[11px] uppercase tracking-[0.3em]">
            Seven days, read by the Moon
          </p>
        </div>
        <HorizonLinks active="week" culture={linkCulture} />
      </div>
      {synthesis ? (
        <GlassPanel tone="glass" className="mb-6 p-5 md:p-6">
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-gold-leaf font-mono text-[10px] uppercase tracking-[0.3em]">
              The shape of the week
            </span>
            <span
              className={cn(
                "rounded-full border px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.3em]",
                synthesis.tone === "harmony" && "border-gold-soft text-gold-leaf",
                synthesis.tone === "tension" && "border-conflict-red/50 text-conflict-red",
                synthesis.tone === "union" && "border-hairline text-ink-secondary",
              )}
            >
              {TONE_LABELS[synthesis.tone]}
            </span>
          </div>
          <p className="font-display text-gold-leaf mt-3 text-xl leading-snug md:text-2xl">
            {synthesis.headline}
          </p>
          <p className="text-ink-secondary font-body mt-2 max-w-3xl text-sm leading-relaxed md:text-base">
            {synthesis.body}
          </p>
          <p className="text-gold-leaf/60 font-body mt-3 text-xs italic">
            {synthesis.contextLine}
          </p>
        </GlassPanel>
      ) : null}
      <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 xl:gap-4">
        {forecast.map((day, idx) => (
          <GlassPanel
            key={day.date.toISOString()}
            tone="solid"
            className="flex h-full flex-col gap-1.5 p-4 md:p-5"
          >
            <div className="flex items-baseline justify-between gap-2">
              <span className="text-gold-leaf font-mono text-[10px] uppercase tracking-[0.3em]">
                {idx === 0
                  ? "Today"
                  : day.date.toLocaleDateString(undefined, { weekday: "short" })}
              </span>
              <span className="text-ink-tertiary font-mono text-[10px] uppercase tracking-[0.2em]">
                {day.date.toLocaleDateString(undefined, { month: "short", day: "numeric" })}
              </span>
            </div>
            {day.personal ? (
              <span
                className={cn(
                  "mt-1 self-start rounded-full border px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.3em]",
                  day.personal.tone === "harmony" && "border-gold-soft text-gold-leaf",
                  day.personal.tone === "tension" && "border-conflict-red/50 text-conflict-red",
                  day.personal.tone === "union" && "border-hairline text-ink-secondary",
                )}
              >
                {TONE_LABELS[day.personal.tone]}
              </span>
            ) : null}
            <p className="font-display text-gold-leaf mt-2 text-base leading-snug md:text-lg">
              {day.reading.headline}
            </p>
            <p className="text-ink-secondary font-body text-[13px] leading-relaxed">
              {day.reading.body}
            </p>
            <div className="mt-auto pt-3">
              {day.personal ? (
                <p className="text-gold-leaf/60 font-body text-xs italic leading-relaxed">
                  {day.personal.line}
                </p>
              ) : null}
              <p className="text-gold-leaf/60 font-body text-xs italic leading-relaxed">
                {day.contextLine}
              </p>
            </div>
            {day.tightestAspectLine ? (
              <p className="text-ink-tertiary font-mono text-[9px] uppercase tracking-[0.2em]">
                {day.tightestAspectLine}
              </p>
            ) : null}
          </GlassPanel>
        ))}
      </div>
    </div>
  );
}
