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
  findMoonPhases,
  findRetrogradeStations,
  findSolarReturn,
  findYearIngresses,
  SLOW_BODIES,
} from "@/lib/yearForecast";
import { buildAnnualReport, type AnnualReport } from "@/lib/annualReport";
import { computeTransitSpans, type TransitSpan } from "@/lib/transitSpans";
import { CULTURE_VOICES } from "@/data/cultureVoice";
import { formatMonthYear, toRoman } from "@/components/horizons/format";
import { fmt, str } from "@/strings";
import {
  SKY_ONLY_OPENING,
  yearVotive,
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
        className={cn("font-mono text-data-xs leading-data", isCurrent ? "text-accent" : "text-dim")}
      >
        {seg.label}
        <br />
        {seg.dateRange}
      </span>
      <span className={cn("font-body text-prose-s leading-prose", isCurrent ? "text-bone" : "text-bone/70")}>
        {seg.summary || "The sky holds no single dominant beat here."}
      </span>
      <span
        className={cn("whitespace-nowrap font-mono text-data-xs", isCurrent ? "text-accent" : "text-dim")}
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
    // year.countLine names lunations, so n counts the window's moon quarters
    // with the stations and ingresses the timeline lists.
    const lunations = findMoonPhases(now, YEAR_DAYS).length;
    return { stations, ingresses, lunations };
  }, [now, natal]);

  if (!culture || !now) {
    return <Skeleton />;
  }

  const voice = CULTURE_VOICES[culture];
  const roman = toRoman(now.getFullYear());
  const segments = report ? buildYearSegments(culture, report.quarters, now) : [];
  const isFestivals = voice.yearStructure === "festivals";
  const votiveTone = report ? yearVotiveTone(report.yearTheme.dominantTransit?.aspectKind) : null;
  const timeline = skyOnly ? buildSkyOnlyTimeline(culture, skyOnly.stations, skyOnly.ingresses) : null;

  return (
    <div className="mx-auto max-w-[640px]">
      <NaveHead
        culture={culture}
        kicker={str("year.kicker", culture, {
          date: fmt("date.dayMonthYear", now, "local"),
          institution: str("common.institution", culture),
        })}
        sub={
          timeline ? (
            <div className="font-mono text-data-xs tracking-label text-dim">
              {str("year.countLine", culture, { n: timeline.length + (skyOnly?.lunations ?? 0) })}
            </div>
          ) : undefined
        }
      >
        {str("year.title", culture, { roman })}
      </NaveHead>

      <p className="mx-auto max-w-[560px] text-left font-body text-prose-m leading-prose text-prose">
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
            <div className="mx-auto mt-3 max-w-[560px] text-center font-mono text-data-xs tracking-label text-dim">
              MARKED BY THE ATHENIAN CIRCUIT, NOT QUARTERS
            </div>
          ) : null}

          {spans.length > 0 ? (
            <div className="mx-auto mt-8 max-w-[560px] border border-[var(--accent-strong-border)] px-[var(--space-4)] py-[var(--space-3)] text-left">
              <div className="mb-3 font-mono text-data-xs tracking-label text-accent">
                {str("year.spine.label", culture)}
              </div>
              <div className="flex flex-col gap-2.5">
                {spans.slice(0, 6).map((span) => (
                  <Link
                    key={span.id}
                    href={`/transits/${span.id}`}
                    className="flex items-baseline justify-between gap-3 text-prose no-underline hover:text-bone"
                  >
                    <span className="font-display text-display-xs tracking-[0.08em]">
                      {spanHeadline(culture, span)}
                    </span>
                    <span className="whitespace-nowrap font-mono text-data-xs text-dim">
                      → {formatMonthYear(span.end)}
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          ) : null}

          {votiveTone ? (
            <div className="mt-8">
              <Votive>{yearVotive(culture, votiveTone)}</Votive>
            </div>
          ) : null}
        </>
      ) : skyOnly ? (
        <>
          <div className="mx-auto mt-8 max-w-[560px] border border-rule px-[var(--space-4)] py-[var(--space-3)] text-left">
            <div className="flex max-h-[420px] flex-col gap-2 overflow-y-auto font-mono text-data-xs leading-data text-prose">
              {(timeline ?? []).map((row, i, all) => {
                const month = formatMonthYear(row.date);
                const prev = i > 0 ? all[i - 1] : undefined;
                const opensMonth = !prev || formatMonthYear(prev.date) !== month;
                return (
                  <div key={row.key}>
                    {opensMonth ? (
                      <div className="mt-2 text-dim">{str("year.monthLabel", culture, { date: month })}</div>
                    ) : null}
                    <span className={row.tone === "conflict" ? "text-conflict" : undefined}>{row.label}</span>
                  </div>
                );
              })}
            </div>
          </div>
          <div className="mx-auto mt-8 max-w-[560px] border border-[var(--accent-strong-border)] px-[var(--space-4)] py-[var(--space-3)] text-center">
            <div className="font-display text-display-xs tracking-[0.1em] text-bone">
              {str("year.noChart.title", culture)}
            </div>
            <Link
              href="/reading"
              className="mt-4 inline-block border border-[var(--accent-strong-border)] px-5 py-2.5 font-mono text-data-xs tracking-label text-accent"
            >
              {str("year.noChart.link", culture)}
            </Link>
          </div>
        </>
      ) : null}

      <div className="mt-6 flex justify-center">
        <FeedbackRow readingId={yearReadingId(now)} noun={str("year.feedback.noun", culture)} />
      </div>

      <div className="mt-9 flex flex-wrap items-center justify-center gap-8 font-mono text-data-xs tracking-microcopy">
        <Link href="/season" className="text-bone/65 hover:text-bone">
          {str("chrome.footer.backSeason", culture)}
        </Link>
        <Link href="/forecast" className="text-bone/65 hover:text-bone">
          {str("chrome.footer.toForecast", culture)}
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
