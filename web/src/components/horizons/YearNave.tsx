"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { NaveShell } from "@/components/chrome/NaveShell";
import { CultureGate } from "@/components/chrome/CultureGate";
import { NaveHead } from "@/components/chrome/NaveHead";
import { Votive } from "@/components/chrome/Votive";
import { FeedbackRow } from "@/components/chrome/FeedbackRow";
import { Skeleton } from "@/components/chrome/Skeleton";
import { useActivePantheon } from "@/components/pantheon/PantheonContext";
import { loadSavedNatal, type SavedNatal } from "@/lib/savedNatal";
import {
  findEclipses,
  findMajorTransits,
  findRetrogradeStations,
  findSolarReturn,
  findYearIngresses,
  SLOW_BODIES,
} from "@/lib/yearForecast";
import { buildAnnualReport, type AnnualReport } from "@/lib/annualReport";
import { computeTransitSpans, type TransitSpan } from "@/lib/transitSpans";
import { CULTURE_VOICES } from "@/data/cultureVoice";
import { formatMonthYear, toRoman } from "@/components/horizons/format";
import {
  SKY_ONLY_OPENING,
  YEAR_VOTIVE,
  buildSkyOnlyTimeline,
  buildYearSegments,
  spanHeadline,
  yearVotiveTone,
  type YearSegment,
} from "@/components/horizons/yearContent";
import { cn } from "@/lib/classNames";

const YEAR_DAYS = 365;
const DAY_MS = 86_400_000;

function yearReadingId(now: Date): string {
  return `year-${now.getFullYear()}`;
}

function dayOfYear(date: Date): { day: number; total: number } {
  const start = new Date(date.getFullYear(), 0, 1);
  const day = Math.floor((date.getTime() - start.getTime()) / DAY_MS) + 1;
  const isLeap = (y: number) => (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0;
  return { day, total: isLeap(date.getFullYear()) ? 366 : 365 };
}

function SegmentRow({ seg }: { seg: YearSegment }) {
  const isCurrent = seg.status.startsWith("DAY ");
  return (
    <div
      className={cn(
        "grid grid-cols-[150px_1fr_auto] items-baseline gap-4 border-t border-rule px-3 py-3.5 last:border-b",
        isCurrent && "bg-[color-mix(in_srgb,var(--accent)_7%,transparent)]",
      )}
    >
      <span
        className={cn("font-mono text-[11px] leading-[1.5]", isCurrent ? "text-[var(--accent)]" : "text-dim")}
      >
        {seg.label}
        <br />
        {seg.dateRange}
      </span>
      <span className={cn("font-body text-[14.5px] leading-[1.55]", isCurrent ? "text-bone" : "text-bone/70")}>
        {seg.summary || "The sky holds no single dominant beat here."}
      </span>
      <span
        className={cn("whitespace-nowrap font-mono text-[11px]", isCurrent ? "text-[var(--accent)]" : "text-dim")}
      >
        {seg.status}
      </span>
    </div>
  );
}

function YearContent({ now, natal }: { now: Date | null; natal: SavedNatal | null }) {
  const culture = useActivePantheon();

  const natalPoints = useMemo(
    () =>
      natal
        ? [
            { key: "sun", longitude: natal.chart.sun },
            { key: "moon", longitude: natal.chart.moon },
            { key: "asc", longitude: natal.angles.ascendant },
            { key: "mc", longitude: natal.angles.midheaven },
          ]
        : null,
    [natal],
  );

  const report: AnnualReport | null = useMemo(() => {
    if (!culture || !now || !natal || !natalPoints) return null;
    const majorTransits = findMajorTransits(natalPoints, SLOW_BODIES, now, YEAR_DAYS);
    const eclipses = findEclipses(now, YEAR_DAYS);
    const retrogrades = findRetrogradeStations(now, YEAR_DAYS);
    const solarReturn = findSolarReturn(natal.chart.sun, now);
    return buildAnnualReport({
      now,
      natalName: natal.meta.name,
      culture,
      majorTransits,
      eclipses,
      retrogrades,
      solarReturn,
    });
  }, [culture, now, natal, natalPoints]);

  const spans: readonly TransitSpan[] = useMemo(() => {
    if (!now || !natalPoints) return [];
    const all = computeTransitSpans(natalPoints, SLOW_BODIES, now, YEAR_DAYS);
    return all.filter((s) => s.end.getTime() >= now.getTime()).sort((a, b) => a.start.getTime() - b.start.getTime());
  }, [now, natalPoints]);

  const skyOnly = useMemo(() => {
    if (!now || natal) return null;
    const stations = findRetrogradeStations(now, YEAR_DAYS);
    const ingresses = findYearIngresses(now, YEAR_DAYS, SLOW_BODIES);
    return { stations, ingresses };
  }, [now, natal]);

  if (!culture || !now) {
    return <Skeleton />;
  }

  const voice = CULTURE_VOICES[culture];
  const roman = toRoman(now.getFullYear());
  const segments = report ? buildYearSegments(culture, report.quarters, now) : [];
  const isFestivals = voice.yearStructure === "festivals";
  const votiveTone = report ? yearVotiveTone(report.yearTheme.dominantTransit?.aspectKind) : null;

  return (
    <div className="mx-auto max-w-[640px]">
      <NaveHead kicker={`${voice.institution} · THE YEAR`}>
        {roman} · {voice.yearTitle}
      </NaveHead>

      <p className="mx-auto max-w-[560px] text-left font-body text-[17px] leading-[1.7] text-prose">
        {report ? report.yearTheme.body : SKY_ONLY_OPENING[culture]}
      </p>

      {report ? (
        <>
          <div className="mt-8 flex flex-col">
            {segments.map((seg) => (
              <SegmentRow key={seg.label} seg={seg} />
            ))}
          </div>
          {isFestivals ? (
            <div className="mx-auto mt-3 max-w-[560px] text-center font-mono text-[11px] tracking-[0.14em] text-dim">
              MARKED BY THE ATHENIAN CIRCUIT, NOT QUARTERS
            </div>
          ) : null}

          {spans.length > 0 ? (
            <div className="mx-auto mt-8 max-w-[560px] border border-[var(--accent-strong-border)] px-[22px] py-[18px] text-left">
              <div className="mb-3 font-mono text-[11px] tracking-[0.16em] text-[var(--accent)]">
                THE YEAR&apos;S LONG TRANSITS · ITS SPINE
              </div>
              <div className="flex flex-col gap-2.5">
                {spans.slice(0, 6).map((span) => (
                  <Link
                    key={span.id}
                    href={`/transits/${span.id}`}
                    className="flex items-baseline justify-between gap-3 text-bone no-underline hover:text-[var(--accent)]"
                  >
                    <span className="font-display text-[13px] tracking-[0.08em]">
                      {spanHeadline(culture, span)}
                    </span>
                    <span className="whitespace-nowrap font-mono text-[11px] text-dim">
                      → {formatMonthYear(span.end)}
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          ) : null}

          {votiveTone ? (
            <div className="mt-8">
              <Votive>{YEAR_VOTIVE[culture][votiveTone]}</Votive>
            </div>
          ) : null}
        </>
      ) : skyOnly ? (
        <>
          <div className="mx-auto mt-8 max-w-[560px] border border-rule px-[22px] py-[18px] text-left">
            <div className="mb-3 font-mono text-[11px] tracking-[0.16em] text-dim">
              STATIONS AND INGRESSES · THE YEAR AHEAD
            </div>
            <div className="flex max-h-[420px] flex-col gap-2 overflow-y-auto font-mono text-[11px] leading-[1.5] text-prose">
              {buildSkyOnlyTimeline(culture, skyOnly.stations, skyOnly.ingresses).map((row) => (
                <div key={row.key}>
                  <span className={row.tone === "conflict" ? "text-conflict" : "text-dim"}>
                    {formatMonthYear(row.date)}
                  </span>{" "}
                  {row.label}
                </div>
              ))}
            </div>
          </div>
          <div className="mx-auto mt-8 max-w-[560px] border border-[var(--accent-strong-border)] px-[22px] py-[18px] text-center">
            <div className="font-display text-[15px] tracking-[0.1em] text-bone">
              CAST A CHART TO READ THE YEAR AGAINST YOUR OWN SKY
            </div>
            <Link
              href="/reading"
              className="mt-4 inline-block border border-[var(--accent-strong-border)] px-5 py-2.5 font-mono text-[11px] tracking-[0.14em] text-[var(--accent)]"
            >
              CAST A CHART →
            </Link>
          </div>
        </>
      ) : null}

      <div className="mt-6 flex justify-center">
        <FeedbackRow readingId={yearReadingId(now)} noun="YEAR" />
      </div>

      <div className="mt-9 flex flex-wrap items-center justify-center gap-8 font-display text-[11.5px] tracking-[0.2em]">
        <Link href="/season" className="text-bone/65 hover:text-bone">
          ← THE SEASON
        </Link>
        <Link href="/forecast" className="text-bone/65 hover:text-bone">
          THE FORECAST →
        </Link>
      </div>
    </div>
  );
}

/**
 * The full `/year` client experience. With a saved chart: buildAnnualReport
 * mapped into the culture's yearStructure segments plus the long-transit
 * spine. Without one: an honest sky-only stations/ingresses timeline and a
 * CAST A CHART call to action.
 */
export function YearNave() {
  const [now, setNow] = useState<Date | null>(null);
  const [natal, setNatal] = useState<SavedNatal | null>(null);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setNow(new Date());
    setNatal(loadSavedNatal());
  }, []);

  const context = now ? `${toRoman(now.getFullYear())} · DAY ${dayOfYear(now).day} / ${dayOfYear(now).total}` : "THE YEAR";

  return (
    <NaveShell context={context} horizon="year" active="today">
      <CultureGate>
        <YearContent now={now} natal={natal} />
      </CultureGate>
    </NaveShell>
  );
}
