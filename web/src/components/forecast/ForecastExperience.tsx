"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { DEITY_MATRIX } from "@/data/deities";
import { ASPECT_VERBS } from "@/data/aspectVerbs";
import { CULTURE_VOICES } from "@/data/cultureVoice";
import type { Culture, Planet } from "@/data/cultures";
import { loadSavedNatal, type SavedNatal } from "@/lib/savedNatal";
import {
  findEclipses,
  findRetrogradeStations,
  findYearIngresses,
  SLOW_BODIES,
  type EclipseEvent,
  type RetrogradeEvent,
  type YearIngressEvent,
} from "@/lib/yearForecast";
import { computeTransitSpans, type TransitSpan } from "@/lib/transitSpans";
import { useActivePantheon } from "@/components/pantheon/PantheonContext";
import { InstrumentShell, type InstrumentSibling } from "@/components/chrome/InstrumentShell";
import { CultureGate } from "@/components/chrome/CultureGate";
import { SpanBar } from "@/components/chrome/SpanBar";
import { Skeleton } from "@/components/chrome/Skeleton";
import { ASPECT_GLYPHS } from "@/components/synastry/bondLabels";
import {
  SIGN_PHRASES,
  STATION_PHRASES,
  formatDMonYY,
  monthInitial,
  monthPhrase,
  monthShort,
  seasonOf,
} from "@/components/forecast/forecastCopy";

const YEAR_DAYS = 365;
const WINDOW_MS = YEAR_DAYS * 24 * 60 * 60 * 1000;

/** Bodies worth naming a sign-ingress for on this surface: fast enough to be
 *  interesting (Sun, Mars) plus every slow body. Mercury and Venus ingress too
 *  often to carry weight over a 12-month window and are left to the day/week
 *  horizons. */
const INGRESS_PLANETS: readonly Planet[] = ["sun", "mars", ...SLOW_BODIES];

const SIBLINGS: readonly InstrumentSibling[] = [
  { label: "CHARTS", href: "/charts" },
  { label: "SYNASTRY", href: "/synastry" },
];

interface ForecastBundle {
  now: Date;
  natal: SavedNatal | null;
  eclipses: readonly EclipseEvent[];
  retrogrades: readonly RetrogradeEvent[];
  ingresses: readonly YearIngressEvent[];
  spans: readonly TransitSpan[];
  computeMs: number;
}

interface RetroWindow {
  planet: Planet;
  start: RetrogradeEvent | null;
  end: RetrogradeEvent | null;
}

function pairRetrogradeWindows(retrogrades: readonly RetrogradeEvent[]): readonly RetroWindow[] {
  const result: RetroWindow[] = [];
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
}

function natalLabelFor(culture: Culture, natalKey: string): string {
  if (natalKey === "asc") return "ASCENDANT";
  if (natalKey === "mc") return "MIDHEAVEN";
  return DEITY_MATRIX[culture][natalKey as Planet].name.toUpperCase();
}

/** Natural-case sibling of natalLabelFor, for prose sentences rather than
 *  mono/Cinzel caps rows (deity names are not always single words, so
 *  re-deriving case from the uppercased label would mangle names like
 *  "Baal Hadad"). */
function natalNameFor(culture: Culture, natalKey: string): string {
  if (natalKey === "asc") return "Ascendant";
  if (natalKey === "mc") return "Midheaven";
  return DEITY_MATRIX[culture][natalKey as Planet].name;
}

function pctOf(date: Date, windowStart: Date): number {
  const ratio = (date.getTime() - windowStart.getTime()) / WINDOW_MS;
  return Math.min(100, Math.max(0, ratio * 100));
}

interface FeedRow {
  date: Date;
  dateClass: string;
  text: string;
}

function buildFeedRows(bundle: ForecastBundle, culture: Culture): readonly FeedRow[] {
  const rows: FeedRow[] = [];
  for (const ev of bundle.retrogrades) {
    const deity = DEITY_MATRIX[culture][ev.planet].name.toUpperCase();
    rows.push({
      date: ev.date,
      dateClass: ev.kind === "retrograde" ? "text-conflict" : "text-harmony",
      text: `${deity} STATIONS ${ev.kind === "retrograde" ? "RETROGRADE" : "DIRECT"}`,
    });
  }
  for (const ev of bundle.ingresses) {
    const deity = DEITY_MATRIX[culture][ev.planet].name.toUpperCase();
    rows.push({
      date: ev.date,
      dateClass: "text-dim",
      text: `${deity} → THE ${SIGN_PHRASES[ev.toSign]}`,
    });
  }
  for (const ev of bundle.eclipses) {
    const planet: Planet = ev.scope === "lunar" ? "moon" : "sun";
    const deity = DEITY_MATRIX[culture][planet].name.toUpperCase();
    rows.push({
      date: ev.date,
      dateClass: "text-dim",
      text: `${deity} ECLIPSED IN THE ${SIGN_PHRASES[ev.sign]}`,
    });
  }
  rows.sort((a, b) => a.date.getTime() - b.date.getTime());
  return rows.slice(0, 10);
}

interface ChartRow {
  key: string;
  label: string;
  startPct: number;
  endPct: number;
  ticks: readonly number[];
  tone: "harmony" | "conflict";
}

function buildChartRows(bundle: ForecastBundle, culture: Culture): readonly ChartRow[] {
  const rows: ChartRow[] = [];
  for (const span of bundle.spans) {
    const deity = DEITY_MATRIX[culture][span.transitPlanet].name.toUpperCase();
    const tone: ChartRow["tone"] = span.aspectKind === "square" || span.aspectKind === "opposition" ? "conflict" : "harmony";
    rows.push({
      key: span.id,
      label: `${deity} ${ASPECT_GLYPHS[span.aspectKind]} ${natalLabelFor(culture, span.natalKey)}`,
      startPct: pctOf(span.start, bundle.now),
      endPct: pctOf(span.end, bundle.now),
      ticks: span.passes.map((d) => pctOf(d, bundle.now)),
      tone,
    });
  }
  for (const w of pairRetrogradeWindows(bundle.retrogrades)) {
    const anchor = w.start ?? w.end;
    if (!anchor) continue;
    const deity = DEITY_MATRIX[culture][w.planet].name.toUpperCase();
    rows.push({
      key: `retro-${w.planet}-${anchor.date.toISOString()}`,
      label: `${deity} ℞ THE ${SIGN_PHRASES[anchor.sign]}`,
      startPct: w.start ? pctOf(w.start.date, bundle.now) : 0,
      endPct: w.end ? pctOf(w.end.date, bundle.now) : 100,
      ticks: [],
      tone: "conflict",
    });
  }
  rows.sort((a, b) => a.startPct - b.startPct);
  return rows.slice(0, 8);
}

function composeBeatsParagraph(culture: Culture, bundle: ForecastBundle): string {
  const station = bundle.retrogrades[0] ?? null;
  const sentences: string[] = [];

  if (station) {
    const deity = DEITY_MATRIX[culture][station.planet].name;
    const phrase =
      station.kind === "retrograde" ? STATION_PHRASES[culture].retrograde : STATION_PHRASES[culture].direct;
    sentences.push(`${deity} ${phrase} ${monthPhrase(station.date, bundle.now)}.`);
  }

  if (bundle.natal && bundle.spans.length > 0) {
    const span = bundle.spans[0];
    if (span) {
      const deity = DEITY_MATRIX[culture][span.transitPlanet].name;
      const natalName = natalNameFor(culture, span.natalKey);
      const verb = ASPECT_VERBS[culture][span.aspectKind];
      sentences.push(`${deity} ${verb} your natal ${natalName} through ${seasonOf(span.end)} ${span.end.getFullYear()}.`);
    }
  } else if (bundle.ingresses.length > 0) {
    const ing = bundle.ingresses[0];
    if (ing) {
      const deity = DEITY_MATRIX[culture][ing.planet].name;
      sentences.push(`${deity} enters the ${SIGN_PHRASES[ing.toSign].toLowerCase()} ${monthPhrase(ing.date, bundle.now)}.`);
    }
  }

  return sentences.length > 0
    ? sentences.join(" ")
    : "The sky holds no long station or crossing worth naming in the months just ahead.";
}

function ForecastInstrument({ culture }: { culture: Culture }) {
  const [bundle, setBundle] = useState<ForecastBundle | null>(null);

  useEffect(() => {
    // Computed once on mount: the retrograde and span searches sample many
    // days of ephemeris, so this stays out of the render path. Mirrors the
    // instrumentation the year-ahead computation has always carried.
    const now = new Date();
    const natal = loadSavedNatal();
    const t0 = performance.now();
    const eclipses = findEclipses(now, YEAR_DAYS);
    const retrogrades = findRetrogradeStations(now, YEAR_DAYS);
    const ingresses = findYearIngresses(now, YEAR_DAYS, INGRESS_PLANETS);
    let spans: readonly TransitSpan[] = [];
    if (natal) {
      const natalPoints = [
        { key: "sun", longitude: natal.chart.sun },
        { key: "moon", longitude: natal.chart.moon },
        { key: "asc", longitude: natal.angles.ascendant },
        { key: "mc", longitude: natal.angles.midheaven },
      ];
      spans = computeTransitSpans(natalPoints, SLOW_BODIES, now, YEAR_DAYS);
    }
    const computeMs = performance.now() - t0;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setBundle({ now, natal, eclipses, retrogrades, ingresses, spans, computeMs });
  }, []);

  const voice = CULTURE_VOICES[culture];

  if (!bundle) {
    return (
      <InstrumentShell context="FORECAST · COMPUTING" siblings={SIBLINGS}>
        <div style={{ gridColumn: "1 / -1" }} className="px-8 py-10">
          <Skeleton label="COMPUTING THE YEAR AHEAD…" />
        </div>
      </InstrumentShell>
    );
  }

  const windowEnd = new Date(bundle.now.getTime() + WINDOW_MS);
  const contextLabel = `FORECAST · ${monthShort(bundle.now)} ${bundle.now.getFullYear()} → ${monthShort(windowEnd)} ${windowEnd.getFullYear()}`;
  const feedRows = buildFeedRows(bundle, culture);
  const chartRows = buildChartRows(bundle, culture);
  const beatsParagraph = composeBeatsParagraph(culture, bundle);
  const monthHeaders = Array.from({ length: 12 }, (_, i) => {
    const d = new Date(bundle.now.getFullYear(), bundle.now.getMonth() + i, 1);
    return monthInitial(d);
  });

  return (
    <InstrumentShell context={contextLabel} siblings={SIBLINGS}>
      <aside className="flex flex-col gap-5 border-r border-rule px-7 py-6">
        <div className="font-mono text-data-xs tracking-label text-dim">COMING STATIONS &amp; INGRESSES</div>
        {feedRows.length === 0 ? (
          <p className="font-mono text-data-xs leading-data text-dim">
            NO STATIONS OR CROSSINGS IN THE NEXT TWELVE MONTHS.
          </p>
        ) : (
          <div className="flex flex-col gap-[var(--space-2)] font-mono text-data-xs leading-data text-prose">
            {feedRows.map((row, idx) => (
              <div key={idx}>
                <span className={row.dateClass}>{formatDMonYY(row.date)}</span> {row.text}
              </div>
            ))}
          </div>
        )}
        <div className="mt-2 border border-rule px-[var(--space-3)] py-[var(--space-2)] font-mono text-data-xs leading-data text-dim">
          DATES FROM THE EPHEMERIS, NOT VIBES →{" "}
          <Link href="/method" className="text-accent">
            METHOD
          </Link>
        </div>
      </aside>

      <div className="flex flex-col gap-4 px-8 py-6">
        <div className="font-mono text-data-xs tracking-label text-dim">THE SPANS · TWELVE MONTHS</div>
        <div
          className="grid gap-[2px] font-mono text-data-xs text-faint-ink"
          style={{ gridTemplateColumns: "150px repeat(12, 1fr)" }}
        >
          <span />
          {monthHeaders.map((letter, i) => (
            <span key={i}>{letter}</span>
          ))}
        </div>
        {chartRows.length === 0 ? (
          <p className="font-body text-prose-s italic leading-prose text-prose">
            No long station or natal span is active in the next twelve months.
          </p>
        ) : (
          <div className="flex flex-col gap-[var(--space-2)]">
            {chartRows.map((row) => (
              <div key={row.key} className="grid items-center gap-[2px]" style={{ gridTemplateColumns: "150px 1fr" }}>
                <span className="truncate font-mono text-data-xs leading-data text-prose">{row.label}</span>
                <SpanBar startPct={row.startPct} endPct={row.endPct} ticks={row.ticks} tone={row.tone} />
              </div>
            ))}
          </div>
        )}
        <div className="mt-1 font-mono text-data-xs leading-data text-faint-ink">
          BONE TICK: EXACT PASS · BARS RUN UNTIL RELEASE, NOT UNTIL INTEREST FADES
        </div>
        <div className="mt-4 border-t border-rule pt-[var(--space-3)]">
          <p className="max-w-[560px] font-body text-prose-s leading-prose text-prose">{beatsParagraph}</p>
        </div>
      </div>

      <aside className="flex flex-col gap-4 border-l border-rule px-[var(--space-5)] py-6">
        <div>
          <div className="font-mono text-data-xs tracking-label text-dim">THE LONG TRANSITS · READ EACH</div>
          <h2 className="mt-2 font-display text-display-xs tracking-[0.08em] text-bone">{voice.forecastTitle}</h2>
          <p className="mt-1 font-mono text-data-xs tracking-label text-dim">{voice.forecastNote}</p>
        </div>
        {!bundle.natal ? (
          <>
            <p className="mt-2 font-display text-display-s leading-display tracking-display text-bone">
              THE LONG TRANSITS ARE READ AGAINST A CHART
            </p>
            <Link
              href="/reading"
              className="mt-1 inline-flex w-fit border border-[var(--accent-strong-border)] px-5 py-3 font-mono text-data-xs tracking-label text-accent"
            >
              CAST THE FIRST CHART →
            </Link>
          </>
        ) : bundle.spans.length === 0 ? (
          <p className="font-body text-prose-s italic leading-prose text-prose">
            No long transit is active against this chart in the next twelve months.
          </p>
        ) : (
          <>
            <div className="flex flex-col gap-3">
              {bundle.spans.slice(0, 4).map((span) => {
                const deity = DEITY_MATRIX[culture][span.transitPlanet].name.toUpperCase();
                const natalName = natalLabelFor(culture, span.natalKey);
                const verb = ASPECT_VERBS[culture][span.aspectKind].toUpperCase();
                const active = span.start <= bundle.now && bundle.now <= span.end;
                return (
                  <Link
                    key={span.id}
                    href={`/transits/${span.id}`}
                    className={
                      active
                        ? "block border border-[var(--accent-strong-border)] px-[var(--space-3)] py-[var(--space-3)]"
                        : "block border border-rule px-[var(--space-3)] py-[var(--space-3)]"
                    }
                  >
                    <span className="block font-mono text-data-s uppercase leading-[1.4] tracking-label text-bone">
                      {deity} {verb} {natalName}
                    </span>
                    <span className="mt-1.5 block font-mono text-data-xs leading-data text-dim">
                      THROUGH {seasonOf(span.end)} {span.end.getFullYear()} · READ →
                    </span>
                  </Link>
                );
              })}
            </div>
            <div className="mt-2 font-mono text-data-xs leading-data text-dim">
              EACH OPENS AS ITS OWN QUIET PAGE, SCOPED TO THE TRANSIT&apos;S REAL SPAN.
            </div>
          </>
        )}
      </aside>
    </InstrumentShell>
  );
}

function ForecastGated() {
  const culture = useActivePantheon();
  if (!culture) return null;
  return <ForecastInstrument culture={culture} />;
}

export interface ForecastExperienceProps {
  /** Locks the forecast voice to this culture, bypassing CultureGate. Used
   *  by the legacy `/pantheon/[culture]/forecast` redirect target only. */
  culture?: Culture;
  /** @deprecated the pantheon selector no longer renders on this surface;
   *  kept so the legacy caller above still type-checks. */
  showSelector?: boolean;
}

export function ForecastExperience({ culture }: ForecastExperienceProps) {
  if (culture) {
    return <ForecastInstrument culture={culture} />;
  }
  return (
    <CultureGate>
      <ForecastGated />
    </CultureGate>
  );
}
