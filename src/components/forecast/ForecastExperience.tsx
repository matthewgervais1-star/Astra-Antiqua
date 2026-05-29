"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  PLANET_SYMBOLS,
  type Culture,
  type Planet,
} from "@/data/cultures";
import {
  PantheonSelector,
  useActivePantheon,
} from "@/components/pantheon/PantheonSelector";
import { loadSavedNatal, type SavedNatal } from "@/lib/savedNatal";
import {
  findEclipses,
  findMajorTransits,
  findMoonPhases,
  findRetrogradeStations,
  findSolarReturn,
  findYearIngresses,
  type EclipseEvent,
  type MoonPhaseEvent,
  type NatalTransitPeak,
  type RetrogradeEvent,
  type SolarReturnEvent,
  type YearIngressEvent,
} from "@/lib/yearForecast";
import { longitudeToSign } from "@/data/sampleChart";
import { SectionContainer } from "@/components/ui/SectionContainer";
import { GoldText } from "@/components/ui/GoldText";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { DeityGlyph } from "@/components/glyphs/DeityGlyph";
import { PrintButton } from "@/components/ui/PrintButton";
import { deityWithPlanet } from "@/lib/deityLabel";
import { AnnualReportSection } from "@/components/forecast/AnnualReportSection";

const YEAR_DAYS = 365;
const TRANSIT_PLANETS: readonly Planet[] = ["jupiter", "saturn"];
const OUTER_INGRESS_PLANETS: readonly Planet[] = [
  "mercury",
  "venus",
  "mars",
  "jupiter",
  "saturn",
];

function formatLongDate(d: Date): string {
  return d.toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function daysUntil(target: Date, now: Date): number {
  return Math.round((target.getTime() - now.getTime()) / (24 * 60 * 60 * 1000));
}

interface ForecastBundle {
  now: Date;
  natal: SavedNatal | null;
  moonPhases: readonly MoonPhaseEvent[];
  eclipses: readonly EclipseEvent[];
  retrogrades: readonly RetrogradeEvent[];
  ingresses: readonly YearIngressEvent[];
  solarReturn: SolarReturnEvent | null;
  majorTransits: readonly NatalTransitPeak[];
  computeMs: number;
}

function ForecastExperienceImpl({
  explicitCulture,
  showSelector,
}: {
  explicitCulture: Culture | null;
  showSelector: boolean;
}) {
  const ctxCulture = useActivePantheon();
  const culture = explicitCulture ?? ctxCulture;
  const [bundle, setBundle] = useState<ForecastBundle | null>(null);

  useEffect(() => {
    // Compute the full year forecast on mount. The retrograde and transit
    // searches sample many days; doing this once in a useEffect avoids
    // re-running on every keystroke or render. ~150-400ms total on a modern
    // CPU.
    const now = new Date();
    const natal = loadSavedNatal();
    const t0 = performance.now();
    const moonPhases = findMoonPhases(now, YEAR_DAYS);
    const eclipses = findEclipses(now, YEAR_DAYS);
    const retrogrades = findRetrogradeStations(now, YEAR_DAYS);
    const ingresses = findYearIngresses(now, YEAR_DAYS, OUTER_INGRESS_PLANETS);
    let solarReturn: SolarReturnEvent | null = null;
    let majorTransits: readonly NatalTransitPeak[] = [];
    if (natal) {
      solarReturn = findSolarReturn(natal.chart.sun, now);
      const natalPoints = [
        { key: "sun", longitude: natal.chart.sun },
        { key: "moon", longitude: natal.chart.moon },
        { key: "asc", longitude: natal.angles.ascendant },
        { key: "mc", longitude: natal.angles.midheaven },
      ];
      majorTransits = findMajorTransits(natalPoints, TRANSIT_PLANETS, now, YEAR_DAYS);
    }
    const computeMs = performance.now() - t0;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setBundle({
      now,
      natal,
      moonPhases,
      eclipses,
      retrogrades,
      ingresses,
      solarReturn,
      majorTransits,
      computeMs,
    });
  }, []);

  if (!bundle) {
    return (
      <SectionContainer size="default" spacing="default">
        <div className="text-ink-tertiary font-mono text-xs uppercase tracking-[0.3em]">
          Casting the year ahead
        </div>
        <p className="font-display text-ink-secondary mt-3 text-2xl">
          One moment. Computing every moon phase, eclipse, retrograde station, ingress, and transit peak in the next twelve months.
        </p>
      </SectionContainer>
    );
  }

  return (
    <>
      <SectionContainer size="default" spacing="tight">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="text-ink-tertiary font-mono text-xs uppercase tracking-[0.3em]">
            Year ahead · from {formatLongDate(bundle.now)}
          </div>
          <PrintButton label="Save as PDF" />
        </div>
        <GoldText as="h1" className="mt-4 max-w-3xl text-5xl leading-tight md:text-6xl">
          The next twelve months of sky.
        </GoldText>
        <p className="text-ink-secondary font-body mt-6 max-w-2xl text-lg leading-relaxed md:text-xl">
          Every event below was computed in your browser from a Meeus-derived ephemeris.{" "}
          {bundle.natal
            ? `Personal transits use your saved chart for ${bundle.natal.meta.name}.`
            : "Save a chart on the reading page to add personal transits to your year ahead."}
        </p>
        <p className="text-ink-tertiary font-body mt-3 max-w-2xl text-xs uppercase tracking-[0.2em]">
          Forecast computed in {bundle.computeMs.toFixed(0)}ms · {bundle.moonPhases.length} moon phases · {bundle.eclipses.length} eclipses · {bundle.retrogrades.length} retrograde stations · {bundle.ingresses.length} sign ingresses · {bundle.majorTransits.length} transits to your chart
        </p>
      </SectionContainer>

      {showSelector ? (
        <SectionContainer size="default" spacing="tight">
          <PantheonSelector />
        </SectionContainer>
      ) : null}

      {bundle.natal ? (
        <SectionContainer size="default" spacing="default">
          <AnnualReportSection
            now={bundle.now}
            natalName={bundle.natal.meta.name}
            culture={culture}
            majorTransits={bundle.majorTransits}
            eclipses={bundle.eclipses}
            retrogrades={bundle.retrogrades}
            solarReturn={bundle.solarReturn}
          />
        </SectionContainer>
      ) : null}

      {bundle.natal ? (
        <SectionContainer size="default" spacing="tight">
          <SolarReturnSection
            natal={bundle.natal}
            culture={culture}
            solarReturn={bundle.solarReturn}
            now={bundle.now}
          />
        </SectionContainer>
      ) : (
        <SectionContainer size="default" spacing="tight">
          <GlassPanel tone="solid" className="border-gold-soft border p-6 md:p-8">
            <div className="text-gold-leaf font-mono text-[10px] uppercase tracking-[0.3em]">
              Personalize the forecast
            </div>
            <h2 className="font-display text-ink-primary mt-2 text-2xl md:text-3xl">
              Enter your birth chart to see transits to your natal points and your solar return.
            </h2>
            <p className="text-ink-secondary font-body mt-3 max-w-2xl text-base">
              Without a saved chart, you still get the universal sky events below: moon phases, eclipses, retrogrades, ingresses. With one, the year is read against the chart you were born under.
            </p>
            <Link
              href="/reading"
              className="border-gold-soft text-gold-leaf hover:bg-gold-leaf/10 mt-5 inline-flex items-center gap-2 rounded-full border px-5 py-3 text-xs uppercase tracking-[0.2em] transition-colors"
            >
              Cast your chart →
            </Link>
          </GlassPanel>
        </SectionContainer>
      )}

      {bundle.natal && bundle.majorTransits.length > 0 ? (
        <SectionContainer size="default" spacing="default">
          <MajorTransitsSection
            natal={bundle.natal}
            culture={culture}
            transits={bundle.majorTransits}
            now={bundle.now}
          />
        </SectionContainer>
      ) : null}

      <SectionContainer size="default" spacing="default">
        <EclipseSection
          eclipses={bundle.eclipses}
          culture={culture}
          now={bundle.now}
        />
      </SectionContainer>

      <SectionContainer size="default" spacing="default">
        <RetrogradeSection
          retrogrades={bundle.retrogrades}
          culture={culture}
        />
      </SectionContainer>

      <SectionContainer size="default" spacing="default">
        <IngressSection
          ingresses={bundle.ingresses}
          culture={culture}
          now={bundle.now}
        />
      </SectionContainer>

      <SectionContainer size="default" spacing="default">
        <MoonPhaseSection
          phases={bundle.moonPhases}
          culture={culture}
        />
      </SectionContainer>
    </>
  );
}

// =============================================================================
// Sub-sections
// =============================================================================

function SectionHeader({
  kicker,
  title,
  subtitle,
}: {
  kicker: string;
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="mb-8">
      <div className="text-gold-leaf font-mono text-[11px] uppercase tracking-[0.3em]">
        {kicker}
      </div>
      <h2 className="font-display text-ink-primary mt-3 text-2xl md:text-4xl">
        {title}
      </h2>
      {subtitle ? (
        <p className="text-ink-secondary font-body mt-3 max-w-2xl text-base md:text-lg">
          {subtitle}
        </p>
      ) : null}
    </div>
  );
}

function SolarReturnSection({
  natal,
  culture,
  solarReturn,
  now,
}: {
  natal: SavedNatal;
  culture: Culture | null;
  solarReturn: SolarReturnEvent | null;
  now: Date;
}) {
  const sunLabel = deityWithPlanet(culture, "sun");
  const days = solarReturn ? daysUntil(solarReturn.date, now) : null;
  return (
    <GlassPanel tone="solid" className="p-6 md:p-8">
      <div className="text-gold-leaf font-mono text-[10px] uppercase tracking-[0.3em]">
        Your solar return
      </div>
      {solarReturn ? (
        <>
          <h2 className="font-display text-ink-primary mt-3 text-2xl md:text-3xl">
            {sunLabel} returns to your natal degree on {formatLongDate(solarReturn.date)}.
          </h2>
          <p className="text-ink-secondary font-body mt-3 max-w-2xl text-base md:text-lg">
            The Sun comes back to exactly {solarReturn.degree.toFixed(1)}° {solarReturn.sign}, the position it held the moment you were born. It is your astrological birthday. The chart cast for this moment is what astrology calls your solar return, and it sets the tone for your year from this date to the next.
          </p>
          <p className="text-ink-tertiary font-mono mt-4 text-[10px] uppercase tracking-[0.25em]">
            In {days} day{days === 1 ? "" : "s"} · Natal {sunLabel} at {longitudeToSign(natal.chart.sun).degree.toFixed(1)}° {longitudeToSign(natal.chart.sun).sign}
          </p>
        </>
      ) : (
        <p className="text-ink-secondary font-body mt-3 text-base">
          Solar return calculation unavailable. Confirm the saved chart has a valid Sun longitude.
        </p>
      )}
    </GlassPanel>
  );
}

function MajorTransitsSection({
  natal,
  culture,
  transits,
  now,
}: {
  natal: SavedNatal;
  culture: Culture | null;
  transits: readonly NatalTransitPeak[];
  now: Date;
}) {
  const NATAL_LABEL: Readonly<Record<string, string>> = {
    sun: deityWithPlanet(culture, "sun"),
    moon: deityWithPlanet(culture, "moon"),
    asc: "Ascendant",
    mc: "Midheaven",
  };
  return (
    <>
      <SectionHeader
        kicker="Major transits to your chart"
        title={`How Jupiter and Saturn touch ${natal.meta.name} this year`}
        subtitle="These are the slowest, weightiest movements of the year. Each row is an exact peak; the influence usually feels detectable for a week or two on either side."
      />
      <GlassPanel tone="solid" className="p-6 md:p-8">
        <ul className="flex flex-col gap-4">
          {transits.map((t, idx) => {
            const tDeity = deityWithPlanet(culture, t.transitPlanet);
            const days = daysUntil(t.date, now);
            return (
              <li
                key={`${t.transitPlanet}-${t.natalKey}-${t.aspectKind}-${idx}`}
                className="border-border-hairline flex items-start gap-4 border-t pt-4 first:border-t-0 first:pt-0"
              >
                {culture ? (
                  <DeityGlyph
                    culture={culture}
                    planet={t.transitPlanet}
                    size={32}
                    decorative
                    className="shrink-0"
                  />
                ) : (
                  <span className="text-gold-leaf font-display w-8 shrink-0 text-center text-2xl">
                    {PLANET_SYMBOLS[t.transitPlanet]}
                  </span>
                )}
                <div className="min-w-0 flex-1">
                  <div className="text-ink-tertiary font-mono text-[10px] uppercase tracking-[0.25em]">
                    {formatLongDate(t.date)} · in {days} day{days === 1 ? "" : "s"}
                  </div>
                  <p className="font-display text-gold-leaf mt-1 text-lg leading-snug md:text-xl">
                    {tDeity} {t.aspectKind} your natal {NATAL_LABEL[t.natalKey] ?? t.natalKey}
                  </p>
                  <p className="text-ink-tertiary font-mono mt-1 text-[10px] uppercase tracking-[0.2em]">
                    Transit at {t.transitDegree.toFixed(1)}° {t.transitSign}
                  </p>
                </div>
              </li>
            );
          })}
        </ul>
      </GlassPanel>
    </>
  );
}

function EclipseSection({
  eclipses,
  culture,
  now,
}: {
  eclipses: readonly EclipseEvent[];
  culture: Culture | null;
  now: Date;
}) {
  return (
    <>
      <SectionHeader
        kicker="Eclipses"
        title="The year's eclipses"
        subtitle="The hinges of the astrological year. Eclipses come in pairs (or triples) every six months. The sign in which an eclipse falls marks a doorway that will not look the same on the other side."
      />
      {eclipses.length === 0 ? (
        <GlassPanel tone="solid" className="p-6 md:p-8">
          <p className="text-ink-secondary font-body text-base italic">
            No eclipses in the next twelve months. The sky is letting the year be the year.
          </p>
        </GlassPanel>
      ) : (
        <GlassPanel tone="solid" className="p-6 md:p-8">
          <ul className="flex flex-col gap-4">
            {eclipses.map((e, idx) => {
              const moonOrSun = e.scope === "lunar" ? "moon" : "sun";
              const deityKey: Planet = moonOrSun;
              const dDeity = deityWithPlanet(culture, deityKey);
              const days = daysUntil(e.date, now);
              return (
                <li
                  key={`${e.date.toISOString()}-${idx}`}
                  className="border-border-hairline flex items-start gap-4 border-t pt-4 first:border-t-0 first:pt-0"
                >
                  {culture ? (
                    <DeityGlyph
                      culture={culture}
                      planet={deityKey}
                      size={32}
                      decorative
                      className="shrink-0"
                    />
                  ) : (
                    <span className="text-gold-leaf font-display w-8 shrink-0 text-center text-2xl">
                      {e.scope === "lunar" ? "☽" : "☉"}
                    </span>
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="text-ink-tertiary font-mono text-[10px] uppercase tracking-[0.25em]">
                      {formatLongDate(e.date)} · in {days} day{days === 1 ? "" : "s"}
                    </div>
                    <p className="font-display text-gold-leaf mt-1 text-lg leading-snug md:text-xl">
                      {capFirst(e.kind)} {e.scope} eclipse of {dDeity} in {e.sign}
                    </p>
                    <p className="text-ink-tertiary font-mono mt-1 text-[10px] uppercase tracking-[0.2em]">
                      {e.scope === "lunar" ? "Lunar" : "Solar"} · {(e.obscuration * 100).toFixed(0)}% obscuration · {e.degree.toFixed(1)}° {e.sign}
                    </p>
                  </div>
                </li>
              );
            })}
          </ul>
        </GlassPanel>
      )}
    </>
  );
}

function RetrogradeSection({
  retrogrades,
  culture,
}: {
  retrogrades: readonly RetrogradeEvent[];
  culture: Culture | null;
}) {
  // Pair retrograde + direct stations into periods for display.
  const periods = useMemo(() => {
    const result: Array<{
      planet: Planet;
      start: RetrogradeEvent | null;
      end: RetrogradeEvent | null;
    }> = [];
    for (const ev of retrogrades) {
      if (ev.kind === "retrograde") {
        result.push({ planet: ev.planet, start: ev, end: null });
      } else {
        const last = [...result].reverse().find((p) => p.planet === ev.planet && p.end === null);
        if (last) {
          last.end = ev;
        } else {
          result.push({ planet: ev.planet, start: null, end: ev });
        }
      }
    }
    return result;
  }, [retrogrades]);

  return (
    <>
      <SectionHeader
        kicker="Retrogrades"
        title="When the planets walk backwards"
        subtitle="A retrograde is the optical illusion of a planet reversing direction in the sky. The planet is still moving forward in its orbit; from Earth, it appears to back up. Astrology treats these periods as reviews: the principle of that planet reorganizes itself before moving on."
      />
      {periods.length === 0 ? (
        <GlassPanel tone="solid" className="p-6 md:p-8">
          <p className="text-ink-secondary font-body text-base italic">
            No retrograde stations in the next twelve months. All the planets walk forward this year.
          </p>
        </GlassPanel>
      ) : (
        <GlassPanel tone="solid" className="p-6 md:p-8">
          <ul className="flex flex-col gap-4">
            {periods.map((p, idx) => {
              const dName = deityWithPlanet(culture, p.planet);
              const startD = p.start;
              const endD = p.end;
              return (
                <li
                  key={`${p.planet}-${idx}`}
                  className="border-border-hairline flex items-start gap-4 border-t pt-4 first:border-t-0 first:pt-0"
                >
                  {culture ? (
                    <DeityGlyph culture={culture} planet={p.planet} size={32} decorative className="shrink-0" />
                  ) : (
                    <span className="text-gold-leaf font-display w-8 shrink-0 text-center text-2xl">
                      {PLANET_SYMBOLS[p.planet]}
                    </span>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="font-display text-gold-leaf text-lg leading-snug md:text-xl">
                      {dName} retrograde
                    </p>
                    <p className="text-ink-primary font-body mt-1 text-sm md:text-base">
                      {startD
                        ? `Begins ${formatLongDate(startD.date)} at ${startD.degree.toFixed(1)}° ${startD.sign}`
                        : "Already retrograde at the start of the year"}
                      {endD
                        ? `, returns to direct motion ${formatLongDate(endD.date)} at ${endD.degree.toFixed(1)}° ${endD.sign}`
                        : ", does not turn direct within the year"}
                      .
                    </p>
                  </div>
                </li>
              );
            })}
          </ul>
        </GlassPanel>
      )}
    </>
  );
}

function IngressSection({
  ingresses,
  culture,
  now,
}: {
  ingresses: readonly YearIngressEvent[];
  culture: Culture | null;
  now: Date;
}) {
  return (
    <>
      <SectionHeader
        kicker="Sign ingresses"
        title="When the planets change rooms"
        subtitle="Each time a planet crosses into a new zodiac sign, the register of that planet shifts. Inner-planet ingresses come every few weeks; Jupiter changes signs about once a year, Saturn every two and a half years."
      />
      {ingresses.length === 0 ? (
        <GlassPanel tone="solid" className="p-6 md:p-8">
          <p className="text-ink-secondary font-body text-base italic">
            No sign changes in the next twelve months for the planets shown.
          </p>
        </GlassPanel>
      ) : (
        <GlassPanel tone="solid" className="p-6 md:p-8">
          <ul className="flex flex-col gap-3">
            {ingresses.slice(0, 30).map((ev, idx) => {
              const dName = deityWithPlanet(culture, ev.planet);
              const days = daysUntil(ev.date, now);
              return (
                <li
                  key={`${ev.planet}-${idx}`}
                  className="border-border-hairline flex items-start gap-4 border-t pt-3 first:border-t-0 first:pt-0"
                >
                  {culture ? (
                    <DeityGlyph
                      culture={culture}
                      planet={ev.planet}
                      size={28}
                      decorative
                      className="shrink-0"
                    />
                  ) : (
                    <span className="text-gold-leaf font-display w-7 shrink-0 text-center text-xl">
                      {PLANET_SYMBOLS[ev.planet]}
                    </span>
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="text-ink-tertiary font-mono text-[10px] uppercase tracking-[0.25em]">
                      {formatLongDate(ev.date)} · in {days} day{days === 1 ? "" : "s"}
                    </div>
                    <p className="text-ink-primary font-body mt-1 text-sm md:text-base">
                      {dName} leaves {ev.fromSign}, enters {ev.toSign}.
                    </p>
                  </div>
                </li>
              );
            })}
          </ul>
          {ingresses.length > 30 ? (
            <p className="text-ink-tertiary font-mono mt-4 text-[10px] uppercase tracking-[0.25em]">
              Showing the next 30 of {ingresses.length} ingresses.
            </p>
          ) : null}
        </GlassPanel>
      )}
    </>
  );
}

function MoonPhaseSection({
  phases,
  culture,
}: {
  phases: readonly MoonPhaseEvent[];
  culture: Culture | null;
}) {
  const moonDeity = deityWithPlanet(culture, "moon");
  // Group by month for readability.
  const byMonth = useMemo(() => {
    const map = new Map<string, MoonPhaseEvent[]>();
    for (const p of phases) {
      const key = p.date.toLocaleDateString(undefined, { month: "long", year: "numeric" });
      const arr = map.get(key);
      if (arr) arr.push(p);
      else map.set(key, [p]);
    }
    return Array.from(map.entries());
  }, [phases]);

  return (
    <>
      <SectionHeader
        kicker="Moon phases"
        title={`Every phase of ${moonDeity} this year`}
        subtitle="Fifty-one quarters in twelve months, give or take. New moons are beginnings, full moons are visibilities. The sign each phase falls in colors what is starting or what is being seen."
      />
      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {byMonth.map(([month, items]) => (
          <GlassPanel key={month} tone="solid" className="p-5 md:p-6">
            <div className="text-gold-leaf font-mono text-[10px] uppercase tracking-[0.3em]">
              {month}
            </div>
            <ul className="mt-4 flex flex-col gap-2">
              {items.map((p, idx) => (
                <li
                  key={`${p.date.toISOString()}-${idx}`}
                  className="text-ink-primary font-body flex items-baseline justify-between gap-3 text-sm md:text-[15px]"
                >
                  <span className="font-display text-gold-leaf">
                    {p.name}
                  </span>
                  <span className="text-ink-secondary font-mono text-[10px] uppercase tracking-[0.2em]">
                    {p.date.toLocaleDateString(undefined, { month: "short", day: "numeric" })} · {p.degree.toFixed(0)}° {p.sign}
                  </span>
                </li>
              ))}
            </ul>
            <p className="text-ink-tertiary font-body mt-4 text-xs italic">
              {items.length} quarter{items.length === 1 ? "" : "s"} this month.
            </p>
          </GlassPanel>
        ))}
      </div>
    </>
  );
}

function capFirst(s: string): string {
  return s.length === 0 ? s : s[0]!.toUpperCase() + s.slice(1);
}

function Fallback() {
  return (
    <SectionContainer size="default" spacing="default">
      <div className="text-ink-tertiary font-mono text-xs uppercase tracking-[0.3em]">
        Loading
      </div>
    </SectionContainer>
  );
}

interface ForecastExperienceProps {
  /** When set, locks the forecast voice to this culture and hides the selector. */
  culture?: Culture;
  /** Whether to show the pantheon voice selector (global page). */
  showSelector?: boolean;
}

export function ForecastExperience({
  culture,
  showSelector = true,
}: ForecastExperienceProps) {
  return (
    <Suspense fallback={<Fallback />}>
      <ForecastExperienceImpl
        explicitCulture={culture ?? null}
        showSelector={showSelector}
      />
    </Suspense>
  );
}
