"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { CULTURES, CULTURE_LABELS, type Culture } from "@/data/cultures";
import {
  PantheonSelector,
  useActivePantheon,
} from "@/components/pantheon/PantheonSelector";
import { useAuth } from "@/components/auth/AuthProvider";
import { loadSavedNatal, type SavedNatal } from "@/lib/savedNatal";
import {
  buildSeasonStandouts,
  getCurrentSeason,
  getSeasonHouse,
  getSeasonPersonalTransits,
  getSeasonSkyEvents,
  seasonAspectToNatalSun,
  type SeasonSkyEvents,
  type SeasonWindow,
} from "@/lib/season";
import type { NatalTransitPeak } from "@/lib/yearForecast";
import { SEASON_READINGS } from "@/data/seasonReadings";
import { ZODIAC_SIGN_INFO } from "@/data/zodiacSigns";
import { SIGN_REGISTERS } from "@/data/interpretations";
import { PLACEMENT_VERBS, ASPECT_VERBS } from "@/data/aspectVerbs";
import { DEITY_MATRIX } from "@/data/deities";
import { longitudeToSign, type AspectKind } from "@/data/sampleChart";
import type { HouseMeaning } from "@/data/houses";
import { TONE_LABELS, toneOf, type Tone } from "@/lib/tone";
import { SectionContainer } from "@/components/ui/SectionContainer";
import { GoldText } from "@/components/ui/GoldText";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { HorizonLinks } from "@/components/HorizonLinks";
import { cn } from "@/lib/classNames";

const SUN_TONE_BODIES: Readonly<Record<Tone, string>> = {
  harmony:
    "The month's light falls at an easy angle to who you are. Work started now moves with less friction than it deserves, so start the bigger version.",
  tension:
    "The month's light falls across your grain, and the friction is the point. What the season contests in you is exactly what it is trying to strengthen.",
  union:
    "This is your own season: the year's light and your nature run on the same track for a month. You are more visible than usual, so aim the visibility.",
};

interface SeasonSky {
  window: SeasonWindow;
  events: SeasonSkyEvents;
}

interface SeasonPersonal {
  natal: SavedNatal;
  transits: readonly NatalTransitPeak[];
  house: HouseMeaning;
  sunAspect: AspectKind | null;
}

function formatDay(d: Date): string {
  return d.toLocaleDateString(undefined, { month: "long", day: "numeric" });
}

function ToneChip({ tone }: { tone: Tone }) {
  return (
    <span
      className={cn(
        "rounded-full border px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.3em]",
        tone === "harmony" && "border-gold-soft text-gold-leaf",
        tone === "tension" && "border-conflict-red/50 text-conflict-red",
        tone === "union" && "border-hairline text-ink-secondary",
      )}
    >
      {TONE_LABELS[tone]}
    </span>
  );
}

function SeasonExperienceImpl({
  explicitCulture,
  showSelector,
}: {
  explicitCulture: Culture | null;
  showSelector: boolean;
}) {
  const ctxCulture = useActivePantheon();
  const culture = explicitCulture ?? ctxCulture;
  const { status } = useAuth();
  const [sky, setSky] = useState<SeasonSky | null>(null);
  const [personal, setPersonal] = useState<SeasonPersonal | null>(null);

  useEffect(() => {
    // One ephemeris scan per visit: the season's boundaries and sky beats are
    // the same in every culture and for every chart, so this never re-runs on
    // pantheon changes.
    const window = getCurrentSeason(new Date());
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSky({ window, events: getSeasonSkyEvents(window) });
  }, []);

  useEffect(() => {
    // Re-read the saved natal whenever auth resolves: a signed-in user's
    // charts land in localStorage only after the session loads, so a
    // mount-only read would leave the season unpersonalized until a reload.
    if (!sky) return;
    const natal = loadSavedNatal();
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPersonal(
      natal
        ? {
            natal,
            transits: getSeasonPersonalTransits(sky.window, natal),
            house: getSeasonHouse(natal, sky.window.sign),
            sunAspect: seasonAspectToNatalSun(natal, sky.window.sign),
          }
        : null,
    );
  }, [sky, status]);

  const standouts = useMemo(
    () =>
      sky
        ? buildSeasonStandouts(
            culture,
            { ...sky.events, transits: personal?.transits ?? [] },
            6,
          )
        : [],
    [culture, sky, personal],
  );

  if (!sky) {
    return (
      <SectionContainer size="default" spacing="default">
        <div className="text-ink-tertiary font-mono text-xs uppercase tracking-[0.3em]">
          Reading the season
        </div>
      </SectionContainer>
    );
  }

  const { window } = sky;
  const natal = personal?.natal ?? null;
  const house = personal?.house ?? null;
  const sunAspect = personal?.sunAspect ?? null;
  const reading = SEASON_READINGS[window.sign];
  const info = ZODIAC_SIGN_INFO.find((s) => s.sign === window.sign);
  const sunDeity = culture ? DEITY_MATRIX[culture].sun : null;
  const narratorLine = sunDeity
    ? `${sunDeity.name} ${culture ? PLACEMENT_VERBS[culture] : "rides"} ${SIGN_REGISTERS[window.sign]}.`
    : `The Sun rides ${SIGN_REGISTERS[window.sign]}.`;
  const natalSunSign = natal ? longitudeToSign(natal.chart.sun).sign : null;

  return (
    <>
      <SectionContainer size="default" spacing="tight">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="text-ink-tertiary font-mono text-xs uppercase tracking-[0.3em]">
            The season
          </div>
          <HorizonLinks active="season" culture={explicitCulture} />
        </div>
        <GoldText as="h1" className="mt-4 max-w-3xl text-5xl leading-tight md:text-6xl">
          {window.sign} season.
        </GoldText>
        <p className="text-ink-secondary font-body mt-6 max-w-2xl text-lg leading-relaxed md:text-xl">
          {formatDay(window.start)} to {formatDay(window.end)}, day {window.dayOfSeason} of{" "}
          {window.totalDays}. The Sun crosses one whole sign and the month takes its
          character from the crossing.
        </p>
        <p className="text-gold-leaf/60 font-body mt-3 text-sm italic">{narratorLine}</p>
        {info ? (
          <div className="mt-5 flex flex-wrap gap-2">
            <span className="border-hairline text-ink-secondary rounded-full border px-3 py-1 font-mono text-[10px] uppercase tracking-[0.25em]">
              {info.element}
            </span>
            <span className="border-hairline text-ink-secondary rounded-full border px-3 py-1 font-mono text-[10px] uppercase tracking-[0.25em]">
              {info.modality}
            </span>
            <span className="border-hairline text-ink-secondary rounded-full border px-3 py-1 font-mono text-[10px] uppercase tracking-[0.25em]">
              {window.daysRemaining} days remain
            </span>
          </div>
        ) : null}
      </SectionContainer>

      {showSelector ? (
        <SectionContainer size="default" spacing="tight">
          <div className="text-ink-tertiary font-mono text-[11px] uppercase tracking-[0.3em]">
            Read it in another voice
          </div>
          <div className="mt-4">
            <PantheonSelector mode="filter" />
          </div>
        </SectionContainer>
      ) : null}

      <SectionContainer size="default" spacing="tight">
        <GlassPanel tone="solid" className="p-6 md:p-8">
          <div className="text-gold-leaf font-mono text-[10px] uppercase tracking-[0.3em]">
            The month&apos;s instruction
          </div>
          <h2 className="font-display text-gold-leaf mt-3 text-3xl leading-snug md:text-4xl">
            {reading.headline}
          </h2>
          <p className="text-ink-primary font-body mt-4 max-w-3xl text-base leading-relaxed md:text-lg">
            {reading.body}
          </p>
        </GlassPanel>
      </SectionContainer>

      {!culture ? (
        <SectionContainer size="default" spacing="tight">
          <div className="mb-6">
            <div className="text-ink-tertiary font-mono text-[11px] uppercase tracking-[0.3em]">
              Five voices, one season
            </div>
            <p className="text-ink-secondary font-body mt-3 max-w-2xl text-base leading-relaxed">
              The same Sun crosses the same sign; only the names of the gods change.
              Choose whose eyes to read the month through.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
            {CULTURES.map((c) => (
              <GlassPanel key={c} tone="solid" className="flex h-full flex-col p-5">
                <div className="text-gold-leaf font-mono text-[10px] uppercase tracking-[0.3em]">
                  {CULTURE_LABELS[c]}
                </div>
                <p className="font-display text-ink-primary mt-3 text-lg leading-snug">
                  {DEITY_MATRIX[c].sun.name} {PLACEMENT_VERBS[c]}{" "}
                  {SIGN_REGISTERS[window.sign]}.
                </p>
                <p className="text-ink-secondary font-body mt-2 text-xs italic leading-relaxed">
                  {DEITY_MATRIX[c].sun.epithet}
                </p>
                <Link
                  href={`/pantheon/${c}/season`}
                  className="text-gold-leaf font-mono mt-auto pt-4 text-[10px] uppercase tracking-[0.25em] underline-offset-4 hover:underline"
                >
                  Read in this voice →
                </Link>
              </GlassPanel>
            ))}
          </div>
        </SectionContainer>
      ) : null}

      <SectionContainer size="default" spacing="tight">
        {natal && house ? (
          <GlassPanel tone="glass" className="p-6 md:p-8">
            <div className="text-ink-tertiary font-mono text-[10px] uppercase tracking-[0.3em]">
              Where the season lands for you
            </div>
            <h3 className="font-display text-ink-primary mt-3 text-2xl md:text-3xl">
              The Sun crosses your {house.ordinal} House: {house.title}.
            </h3>
            <p className="text-ink-secondary font-body mt-3 max-w-3xl text-base leading-relaxed md:text-lg">
              {house.domain} For this month the season&apos;s whole instruction is aimed at{" "}
              {house.arena}.
            </p>
            {sunAspect && natalSunSign ? (
              <div className="border-border-hairline mt-5 border-t pt-5">
                <div className="flex flex-wrap items-center gap-3">
                  <ToneChip tone={toneOf(sunAspect)} />
                  <span className="text-gold-leaf/60 font-body text-sm italic">
                    {culture && sunDeity
                      ? `${sunDeity.name} ${ASPECT_VERBS[culture][sunAspect]} your natal Sun in ${natalSunSign}.`
                      : `The season stands in ${sunAspect} to your natal Sun in ${natalSunSign}.`}
                  </span>
                </div>
                <p className="text-ink-secondary font-body mt-3 max-w-3xl text-base leading-relaxed">
                  {SUN_TONE_BODIES[toneOf(sunAspect)]}
                </p>
              </div>
            ) : null}
          </GlassPanel>
        ) : (
          <GlassPanel tone="glass" className="p-6 md:p-8">
            <div className="text-gold-leaf font-mono text-[10px] uppercase tracking-[0.3em]">
              Make it yours
            </div>
            <h3 className="font-display text-ink-primary mt-3 text-2xl md:text-3xl">
              Cast your chart to see where the season lands.
            </h3>
            <p className="text-ink-secondary font-body mt-3 max-w-2xl text-base leading-relaxed">
              With a saved chart, the season gains its personal layer: the house of your
              life the Sun is walking through, and the angle it makes to your natal Sun.
            </p>
            <Link
              href="/reading"
              className="border-gold-soft text-gold-leaf hover:bg-gold-leaf/10 mt-5 inline-flex items-center gap-2 rounded-full border px-5 py-3 text-xs uppercase tracking-[0.2em] transition-colors"
            >
              Cast your chart →
            </Link>
          </GlassPanel>
        )}
      </SectionContainer>

      <SectionContainer size="default" spacing="default">
        <div className="mb-8">
          <div className="text-ink-tertiary font-mono text-[11px] uppercase tracking-[0.3em]">
            Key dates
          </div>
          <h2 className="font-display text-ink-primary mt-3 text-3xl md:text-4xl">
            The beats of the season
          </h2>
          <p className="text-ink-secondary font-body mt-3 max-w-2xl text-base leading-relaxed">
            {natal
              ? "Eclipses, lunations, stations, and the moments the moving sky touches your chart, in order."
              : "Eclipses, lunations, and stations inside the window. Cast a chart and the dates that touch your own placements join this list."}
          </p>
        </div>
        <ul className="flex flex-col gap-3">
          {standouts.map((s) => (
            <li key={`${s.date.toISOString()}-${s.tag}`}>
              <GlassPanel tone="solid" className="p-5 md:p-6">
                <div className="flex flex-wrap items-baseline justify-between gap-3">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="text-gold-leaf font-mono text-[10px] uppercase tracking-[0.3em]">
                      {formatDay(s.date)}
                    </span>
                    {s.tone ? <ToneChip tone={s.tone} /> : null}
                  </div>
                  <span className="text-ink-tertiary font-mono text-[9px] uppercase tracking-[0.2em]">
                    {s.tag}
                  </span>
                </div>
                <h3 className="font-display text-ink-primary mt-2 text-xl md:text-2xl">
                  {s.title}
                </h3>
                <p className="text-ink-secondary font-body mt-2 max-w-3xl text-sm leading-relaxed md:text-base">
                  {s.body}
                </p>
              </GlassPanel>
            </li>
          ))}
        </ul>
      </SectionContainer>
    </>
  );
}

export function SeasonExperience({
  culture,
  showSelector,
}: {
  culture?: Culture;
  showSelector: boolean;
}) {
  return (
    <Suspense
      fallback={
        <SectionContainer size="default" spacing="default">
          <div className="text-ink-tertiary font-mono text-xs uppercase tracking-[0.3em]">
            Reading the season
          </div>
        </SectionContainer>
      }
    >
      <SeasonExperienceImpl explicitCulture={culture ?? null} showSelector={showSelector} />
    </Suspense>
  );
}
