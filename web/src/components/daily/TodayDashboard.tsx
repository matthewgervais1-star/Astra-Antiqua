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
import { useActivePantheon } from "@/components/pantheon/PantheonSelector";
import { useAuth } from "@/components/auth/AuthProvider";
import { computeChart } from "@/lib/ephemeris";
import { buildReading, type AspectReading } from "@/lib/reading";
import type { Longitude } from "@/data/sampleChart";
import { loadSavedNatal, type SavedNatal } from "@/lib/savedNatal";
import { BigThree } from "@/components/daily/BigThree";
import { PersonalTransits } from "@/components/daily/PersonalTransits";
import { LifeDomainHoroscope } from "@/components/daily/LifeDomainHoroscope";
import { MoonPhasePanel } from "@/components/daily/MoonPhasePanel";
import { UpcomingEvents } from "@/components/daily/UpcomingEvents";
import { BehindForecast } from "@/components/daily/BehindForecast";
import { DayStrip } from "@/components/daily/DayStrip";
import {
  buildPersonalDailyReading,
  buildSkyDailyReading,
  type ComputedReading,
} from "@/lib/personalReading";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { DeityGlyph } from "@/components/glyphs/DeityGlyph";
import { usePrefersReducedMotion } from "@/lib/reducedMotion";

function formatLongDate(date: Date): string {
  return new Intl.DateTimeFormat(undefined, {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(date);
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
  natalChart,
}: {
  culture: Culture;
  now: Date;
  chart: Readonly<Record<Planet, Longitude>>;
  natalChart: Readonly<Record<Planet, Longitude>> | null;
}) {
  const reduce = usePrefersReducedMotion();
  const reading = useMemo(() => buildReading(culture, chart), [culture, chart]);
  const computed: ComputedReading = useMemo(
    () =>
      natalChart
        ? buildPersonalDailyReading(culture, natalChart, chart)
        : buildSkyDailyReading(culture, chart),
    [culture, chart, natalChart],
  );
  const aspects = useMemo(() => topAspects(reading.aspects, 2), [reading]);
  const isPersonal = computed.source.kind === "personal";

  return (
    <motion.div
      key={`${culture}-${isPersonal ? "personal" : "sky"}`}
      initial={reduce ? false : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={reduce ? { opacity: 0 } : { opacity: 0, y: -8 }}
      transition={{ duration: reduce ? 0.01 : 0.5, ease: "easeOut" }}
    >
      <GlassPanel tone="glass" glow className="relative p-8 md:p-12">
        <div className="flex flex-wrap items-baseline justify-between gap-3">
          <div className="text-gold-leaf font-mono text-[10px] uppercase tracking-[0.35em]">
            THE SKY FOR {formatLongDate(now).toUpperCase()}
          </div>
          <span className="text-ink-tertiary font-mono text-[10px] uppercase tracking-[0.25em]">
            {isPersonal ? `For your chart · ${CULTURE_LABELS[culture]}` : `Voice of ${CULTURE_LABELS[culture]}`}
          </span>
        </div>
        <h3 className="font-display text-gold-leaf mt-5 max-w-3xl text-3xl leading-[1.1] md:text-[40px]">
          {computed.headline}
        </h3>
        <p className="text-gold-leaf/70 font-body mt-3 max-w-2xl text-sm italic md:text-base">
          {computed.context}
        </p>
        <p className="text-ink-primary font-body mt-4 max-w-2xl text-lg leading-relaxed md:text-xl">
          {computed.meaning}
        </p>
        <div className="text-ink-tertiary font-mono mt-5 text-[10px] uppercase tracking-[0.25em]">
          {computed.toneSummary}
        </div>
        <div className="mt-10 grid gap-6 md:grid-cols-2">
          {aspects.length > 0 ? (
            aspects.map((aspect, idx) => {
              // Two cards can share an aspect kind; the per-kind cultural line
              // would then repeat verbatim. Show it only on the first card of
              // its kind, and the unique per-pair theme on any repeat.
              const firstOfKind =
                aspects.findIndex((x) => x.kind === aspect.kind) === idx;
              return (
                <article
                  key={`${aspect.a}-${aspect.b}-${idx}`}
                  className="border-border-hairline border-t pt-5"
                >
                  <div className="text-ink-tertiary font-mono text-[10px] uppercase tracking-[0.25em]">
                    {aspect.kind} · {PLANET_SYMBOLS[aspect.a]} {PLANET_LABELS[aspect.a]} and {PLANET_SYMBOLS[aspect.b]} {PLANET_LABELS[aspect.b]} · {aspect.orb.toFixed(1)}° off
                  </div>
                  <p className="font-display text-gold-leaf mt-2 text-xl leading-snug md:text-2xl">
                    {aspect.verbLine}
                  </p>
                  <p className="text-ink-primary font-body mt-3 text-[15px] leading-relaxed md:text-base">
                    {firstOfKind ? aspect.culturalReflection : aspect.pairTheme}
                  </p>
                </article>
              );
            })
          ) : (
            <p className="text-ink-secondary font-body text-base italic">
              No tight aspects today. The seven walk separately; whatever you build, you build alone.
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
  natalChart,
}: {
  now: Date;
  chart: Readonly<Record<Planet, Longitude>>;
  natalChart: Readonly<Record<Planet, Longitude>> | null;
}) {
  const reduce = usePrefersReducedMotion();
  const readings = useMemo(
    () =>
      CULTURES.map((culture) => ({
        culture,
        reading: natalChart
          ? buildPersonalDailyReading(culture, natalChart, chart)
          : buildSkyDailyReading(culture, chart),
      })),
    [chart, natalChart],
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
        {formatLongDate(now)} · Five voices, one sky
      </div>
      <p className="text-ink-secondary font-body mb-8 max-w-2xl text-base md:text-lg">
        Five traditions, one sky. Each card reads {natalChart ? "the tightest aspect today's sky makes to your saved chart" : "the tightest aspect overhead right now"}; only the names of the gods change.
      </p>
      <div className="grid gap-4 md:grid-cols-2 md:gap-5">
        {readings.map(({ culture, reading }) => (
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
            <p className="font-display text-gold-leaf mt-3 text-lg leading-snug md:text-xl">
              {reading.headline}
            </p>
            <p className="text-gold-leaf/70 font-body mt-1.5 text-xs italic">
              {reading.context}
            </p>
            <p className="text-ink-secondary font-body mt-3 text-sm leading-relaxed md:text-base">
              {reading.meaning}
            </p>
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
            For your own chart
          </div>
          <h4 className="font-display text-ink-primary mt-2 text-xl md:text-2xl">
            Enter your birth date, time, and place once.
          </h4>
          <p className="text-ink-secondary font-body mt-2 text-sm md:text-base">
            Your Big Three (Sun, Moon, Rising) and the day&apos;s transits to your own chart will be here on every visit. All of it is computed in your browser.
          </p>
        </div>
        <Link
          href="/reading"
          className="border-gold-soft text-gold-leaf hover:bg-gold-leaf/10 shrink-0 self-start rounded-full border px-5 py-3 text-xs uppercase tracking-[0.2em] transition-colors md:self-center"
        >
          Cast your chart →
        </Link>
      </div>
    </GlassPanel>
  );
}

function TodayDashboardImpl({ explicitCulture }: { explicitCulture: Culture | null }) {
  const ctxCulture = useActivePantheon();
  const culture = explicitCulture ?? ctxCulture;
  const { status } = useAuth();
  const [now, setNow] = useState<Date | null>(null);
  const [viewDate, setViewDate] = useState<Date | null>(null);
  const [natal, setNatal] = useState<SavedNatal | null>(null);

  useEffect(() => {
    // Capture today's date on mount.
    const today = new Date();
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setNow(today);
    setViewDate(today);
  }, []);

  useEffect(() => {
    // Re-read the saved natal whenever auth resolves: a signed-in user's
    // charts are written to localStorage only after the session loads, so a
    // mount-only read would miss them and show the no-chart state.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setNatal(loadSavedNatal());
  }, [status]);

  const chart = useMemo(() => {
    if (!viewDate) return null;
    return computeChart(viewDate);
  }, [viewDate]);

  // Today's sky, stable across day-strip navigation, for the "where the planets
  // are right now" panel.
  const todayChart = useMemo(() => (now ? computeChart(now) : null), [now]);

  if (!now || !viewDate || !chart) {
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

      <DayStrip today={now} viewDate={viewDate} onChange={setViewDate} span={5} />

      <AnimatePresence mode="wait">
        {culture ? (
          <SingleVoiceHeadline
            key={`${culture}-${viewDate.toISOString().slice(0, 10)}`}
            culture={culture}
            now={viewDate}
            chart={chart}
            natalChart={natal?.chart ?? null}
          />
        ) : (
          <FourVoiceCompact
            key={`four-${viewDate.toISOString().slice(0, 10)}`}
            now={viewDate}
            chart={chart}
            natalChart={natal?.chart ?? null}
          />
        )}
      </AnimatePresence>

      {natal && culture ? (
        <PersonalTransits
          culture={culture}
          natalChart={natal.chart}
          transitChart={chart}
        />
      ) : null}

      {culture ? <LifeDomainHoroscope culture={culture} chart={chart} /> : null}

      {/* "Where the planets are right now" is about today, not the selected
          day; anchoring to `now` also avoids re-running the multi-year ingress
          scan on every day-strip click. */}
      <BehindForecast now={now} culture={culture} chart={todayChart ?? chart} />

      <div className="grid gap-5 md:grid-cols-2">
        <MoonPhasePanel now={viewDate} />
        <UpcomingEvents now={viewDate} culture={culture} />
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

export function TodayDashboard({ culture }: { culture?: Culture }) {
  return (
    <Suspense fallback={<Fallback />}>
      <TodayDashboardImpl explicitCulture={culture ?? null} />
    </Suspense>
  );
}
