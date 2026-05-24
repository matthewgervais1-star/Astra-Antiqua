"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";
import {
  CULTURES,
  CULTURE_LABELS,
  PLANET_LABELS,
  PLANET_SYMBOLS,
  type Culture,
  type Planet,
} from "@/data/cultures";
import { DEITY_MATRIX } from "@/data/deities";
import { useActivePantheon } from "@/components/pantheon/PantheonSelector";
import { computeChart } from "@/lib/ephemeris";
import { buildReading, type AspectReading, type Reading } from "@/lib/reading";
import { longitudeToSign, type Longitude, type ZodiacSign } from "@/data/sampleChart";
import { SIGN_REGISTERS } from "@/data/interpretations";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { DeityGlyph } from "@/components/glyphs/DeityGlyph";
import { usePrefersReducedMotion } from "@/lib/reducedMotion";
import { cn } from "@/lib/classNames";

const MOON_HEADLINE_VERBS: Readonly<Record<Culture, string>> = {
  egypt: "walks",
  greece: "crosses",
  canaan: "keeps",
  carthage: "stands in",
};

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(date);
}

function topAspects(reading: Reading, count: number): readonly AspectReading[] {
  return [...reading.aspects]
    .sort((a, b) => a.orb - b.orb)
    .slice(0, count);
}

function moonHeadline(culture: Culture, chart: Readonly<Record<Planet, Longitude>>): {
  deityName: string;
  sign: ZodiacSign;
  line: string;
} {
  const deity = DEITY_MATRIX[culture].moon;
  const { sign } = longitudeToSign(chart.moon);
  const verb = MOON_HEADLINE_VERBS[culture];
  const line = `${deity.name} ${verb} ${SIGN_REGISTERS[sign]}.`;
  return { deityName: deity.name, sign, line };
}

function SingleVoiceCard({
  culture,
  now,
  chart,
}: {
  culture: Culture;
  now: Date;
  chart: Readonly<Record<Planet, Longitude>>;
}) {
  const reduce = usePrefersReducedMotion();
  const reading = useMemo(() => buildReading(culture, chart), [culture, chart]);
  const headlineMoon = useMemo(() => moonHeadline(culture, chart), [culture, chart]);
  const headlineAspects = useMemo(() => topAspects(reading, 2), [reading]);

  return (
    <motion.div
      key={culture}
      initial={reduce ? false : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={reduce ? { opacity: 0 } : { opacity: 0, y: -8 }}
      transition={{ duration: reduce ? 0.01 : 0.5, ease: "easeOut" }}
    >
      <GlassPanel tone="glass" glow className="relative p-8 md:p-12">
        <div className="flex flex-wrap items-baseline justify-between gap-3">
          <div className="text-gold-leaf font-mono text-[10px] uppercase tracking-[0.35em]">
            Today, in the voice of {CULTURE_LABELS[culture]}
          </div>
          <time className="text-ink-tertiary font-mono text-[10px] uppercase tracking-[0.25em]">
            {formatDate(now)}
          </time>
        </div>

        <h3 className="font-display text-ink-primary mt-6 max-w-3xl text-3xl leading-tight md:text-[44px]">
          {headlineMoon.line}
        </h3>

        <div className="mt-10 grid gap-6 md:grid-cols-2">
          {headlineAspects.length > 0 ? (
            headlineAspects.map((aspect, idx) => (
              <article
                key={`${aspect.a}-${aspect.b}-${idx}`}
                className="border-border-hairline border-t pt-5"
              >
                <div className="text-ink-tertiary font-mono text-[10px] uppercase tracking-[0.25em]">
                  {aspect.kind} · {PLANET_SYMBOLS[aspect.a]} {PLANET_LABELS[aspect.a]} / {PLANET_SYMBOLS[aspect.b]} {PLANET_LABELS[aspect.b]} · orb {aspect.orb.toFixed(1)}°
                </div>
                <p className="font-display text-gold-leaf mt-2 text-xl leading-snug md:text-2xl">
                  {aspect.verbLine}
                </p>
                <p className="text-ink-primary font-body mt-3 text-[15px] leading-relaxed md:text-base">
                  {aspect.culturalReflection}
                </p>
              </article>
            ))
          ) : (
            <p className="text-ink-secondary font-body text-base italic">
              No tight aspects today. The seven walk separately; whatever you build today, you build alone.
            </p>
          )}
        </div>

        <div className="mt-10 flex flex-wrap items-center justify-between gap-4">
          <p className="text-ink-tertiary font-mono text-[10px] uppercase tracking-[0.3em]">
            Sample transit · For your own chart, enter your birth data
          </p>
          <Link
            href="/reading"
            className="border-gold-soft text-gold-leaf hover:bg-gold-leaf/10 inline-flex items-center gap-2 rounded-full border px-5 py-2 text-[11px] uppercase tracking-[0.2em] transition-colors"
          >
            Compute your natal reading
            <span aria-hidden>→</span>
          </Link>
        </div>
      </GlassPanel>
    </motion.div>
  );
}

function FourVoiceShowcase({
  now,
  chart,
}: {
  now: Date;
  chart: Readonly<Record<Planet, Longitude>>;
}) {
  const reduce = usePrefersReducedMotion();
  const headlines = useMemo(
    () =>
      CULTURES.map((culture) => ({
        culture,
        moon: moonHeadline(culture, chart),
        topAspect: topAspects(buildReading(culture, chart), 1)[0] ?? null,
      })),
    [chart],
  );

  return (
    <motion.div
      key="four-voice"
      initial={reduce ? false : { opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: reduce ? 0.01 : 0.4 }}
    >
      <div className="text-ink-tertiary font-mono mb-4 text-[10px] uppercase tracking-[0.3em]">
        Today · {formatDate(now)} · The four voices in parallel
      </div>
      <p className="text-ink-secondary font-body mb-8 max-w-2xl text-base md:text-lg">
        The same sky, four traditions. Select a pantheon above for the expanded reading; the panels below show how each tradition narrates the same moment.
      </p>
      <div className="grid gap-4 md:grid-cols-2 md:gap-5">
        {headlines.map(({ culture, moon, topAspect }) => (
          <article
            key={culture}
            className="border-border-hairline bg-bg-deep hover:border-border-gold rounded-2xl border p-6 transition-colors md:p-7"
          >
            <div className="flex items-center justify-between">
              <div className="text-gold-leaf font-mono text-[10px] uppercase tracking-[0.3em]">
                {CULTURE_LABELS[culture]}
              </div>
              <DeityGlyph culture={culture} planet="moon" size={28} decorative />
            </div>
            <p className="font-display text-ink-primary mt-3 text-lg leading-snug md:text-xl">
              {moon.line}
            </p>
            {topAspect ? (
              <p className="text-ink-secondary font-body mt-4 text-sm italic leading-relaxed md:text-base">
                {topAspect.verbLine}
              </p>
            ) : null}
            <Link
              href={`/?pantheon=${culture}#daily`}
              scroll={false}
              className="text-ink-tertiary font-mono hover:text-gold-leaf mt-5 inline-block text-[10px] uppercase tracking-[0.25em] underline-offset-4 hover:underline"
            >
              Read in this voice
            </Link>
          </article>
        ))}
      </div>
    </motion.div>
  );
}

function DailyReadingImpl() {
  const culture = useActivePantheon();
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    // Capture today's date on mount. Recomputed once when the user reloads.
    // The Sun, planets, and aspects do not change meaningfully across hours
    // for a daily-headline reading, so a single mount-time snapshot is enough.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setNow(new Date());
  }, []);

  const chart = useMemo(() => {
    if (!now) return null;
    return computeChart(now);
  }, [now]);

  if (!now || !chart) {
    return (
      <GlassPanel tone="glass" className="min-h-[260px] p-8 md:p-12">
        <div className="text-ink-tertiary font-mono text-[10px] uppercase tracking-[0.35em]">
          Aligning today&apos;s sky
        </div>
      </GlassPanel>
    );
  }

  return (
    <div id="daily" className={cn("scroll-mt-24")}>
      <AnimatePresence mode="wait">
        {culture ? (
          <SingleVoiceCard key={culture} culture={culture} now={now} chart={chart} />
        ) : (
          <FourVoiceShowcase key="four" now={now} chart={chart} />
        )}
      </AnimatePresence>
    </div>
  );
}

function DailyReadingFallback() {
  return (
    <GlassPanel tone="glass" className="min-h-[260px] p-8 md:p-12">
      <div className="text-ink-tertiary font-mono text-[10px] uppercase tracking-[0.35em]">
        Loading
      </div>
    </GlassPanel>
  );
}

export function DailyReading() {
  return (
    <Suspense fallback={<DailyReadingFallback />}>
      <DailyReadingImpl />
    </Suspense>
  );
}
