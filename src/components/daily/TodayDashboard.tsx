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
import { buildReading, type AspectReading } from "@/lib/reading";
import { longitudeToSign, type Longitude, type ZodiacSign } from "@/data/sampleChart";
import { SIGN_REGISTERS } from "@/data/interpretations";
import { loadSavedNatal, type SavedNatal } from "@/lib/savedNatal";
import { BigThree } from "@/components/daily/BigThree";
import { PersonalTransits } from "@/components/daily/PersonalTransits";
import { CategoryHoroscope } from "@/components/daily/CategoryHoroscope";
import { MoonPhasePanel } from "@/components/daily/MoonPhasePanel";
import { UpcomingEvents } from "@/components/daily/UpcomingEvents";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { DeityGlyph } from "@/components/glyphs/DeityGlyph";
import { usePrefersReducedMotion } from "@/lib/reducedMotion";

const MOON_HEADLINE_VERBS: Readonly<Record<Culture, string>> = {
  egypt: "walks",
  greece: "crosses",
  canaan: "keeps",
  carthage: "stands in",
};

function formatLongDate(date: Date): string {
  return new Intl.DateTimeFormat(undefined, {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(date);
}

function moonHeadline(
  culture: Culture,
  chart: Readonly<Record<Planet, Longitude>>,
): { sign: ZodiacSign; line: string } {
  const deity = DEITY_MATRIX[culture].moon;
  const { sign } = longitudeToSign(chart.moon);
  return {
    sign,
    line: `${deity.name} ${MOON_HEADLINE_VERBS[culture]} ${SIGN_REGISTERS[sign]}.`,
  };
}

function topAspects(
  aspects: readonly AspectReading[],
  count: number,
): readonly AspectReading[] {
  return [...aspects].sort((a, b) => a.orb - b.orb).slice(0, count);
}

function SingleVoiceHeadline({
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
  const headline = useMemo(() => moonHeadline(culture, chart), [culture, chart]);
  const aspects = useMemo(() => topAspects(reading.aspects, 2), [reading]);

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
            Today · {CULTURE_LABELS[culture]}
          </div>
          <time className="text-ink-tertiary font-mono text-[10px] uppercase tracking-[0.25em]">
            {formatLongDate(now)}
          </time>
        </div>
        <h3 className="font-display text-ink-primary mt-6 max-w-3xl text-3xl leading-tight md:text-[44px]">
          {headline.line}
        </h3>
        <div className="mt-10 grid gap-6 md:grid-cols-2">
          {aspects.length > 0 ? (
            aspects.map((aspect, idx) => (
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
      </GlassPanel>
    </motion.div>
  );
}

function FourVoiceCompact({
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
        headline: moonHeadline(culture, chart),
        topAspect: topAspects(buildReading(culture, chart).aspects, 1)[0] ?? null,
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
        Today · {formatLongDate(now)} · The four voices in parallel
      </div>
      <p className="text-ink-secondary font-body mb-8 max-w-2xl text-base md:text-lg">
        The same sky, four traditions. Select a pantheon above for the expanded reading; the panels below show how each tradition narrates the same moment.
      </p>
      <div className="grid gap-4 md:grid-cols-2 md:gap-5">
        {headlines.map(({ culture, headline, topAspect }) => (
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
              {headline.line}
            </p>
            {topAspect ? (
              <p className="text-ink-secondary font-body mt-4 text-sm italic leading-relaxed md:text-base">
                {topAspect.verbLine}
              </p>
            ) : null}
            <Link
              href={`/?pantheon=${culture}#today`}
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

function NoNatalPrompt() {
  return (
    <GlassPanel tone="solid" className="border-gold-soft border p-6 md:p-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between md:gap-8">
        <div>
          <div className="text-gold-leaf font-mono text-[10px] uppercase tracking-[0.3em]">
            Personalize the reading
          </div>
          <h4 className="font-display text-ink-primary mt-2 text-xl md:text-2xl">
            Enter your birth date, time, and place once.
          </h4>
          <p className="text-ink-secondary font-body mt-2 text-sm md:text-base">
            Your Big Three (Sun, Moon, Rising) and the day&apos;s transits against your natal chart will then appear here on every visit. All computation runs in your browser.
          </p>
        </div>
        <Link
          href="/reading"
          className="border-gold-soft text-gold-leaf hover:bg-gold-leaf/10 shrink-0 self-start rounded-full border px-5 py-3 text-xs uppercase tracking-[0.2em] transition-colors md:self-center"
        >
          Compute your chart →
        </Link>
      </div>
    </GlassPanel>
  );
}

function TodayDashboardImpl() {
  const culture = useActivePantheon();
  const [now, setNow] = useState<Date | null>(null);
  const [natal, setNatal] = useState<SavedNatal | null>(null);

  useEffect(() => {
    // Capture today's date and any saved natal chart on mount.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setNow(new Date());
    setNatal(loadSavedNatal());
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
    <div id="today" className="scroll-mt-24 flex flex-col gap-8 md:gap-10">
      {natal ? <BigThree culture={culture} natal={natal} /> : <NoNatalPrompt />}

      <AnimatePresence mode="wait">
        {culture ? (
          <SingleVoiceHeadline key={culture} culture={culture} now={now} chart={chart} />
        ) : (
          <FourVoiceCompact key="four" now={now} chart={chart} />
        )}
      </AnimatePresence>

      {natal && culture ? (
        <PersonalTransits
          culture={culture}
          natalChart={natal.chart}
          transitChart={chart}
        />
      ) : null}

      {culture ? <CategoryHoroscope culture={culture} chart={chart} /> : null}

      <div className="grid gap-5 md:grid-cols-2">
        <MoonPhasePanel now={now} />
        <UpcomingEvents now={now} culture={culture} />
      </div>
    </div>
  );
}

function Fallback() {
  return (
    <GlassPanel tone="glass" className="min-h-[260px] p-8 md:p-12">
      <div className="text-ink-tertiary font-mono text-[10px] uppercase tracking-[0.35em]">
        Loading
      </div>
    </GlassPanel>
  );
}

export function TodayDashboard() {
  return (
    <Suspense fallback={<Fallback />}>
      <TodayDashboardImpl />
    </Suspense>
  );
}
