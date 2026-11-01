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
import { SLOW_BODIES } from "@/lib/yearForecast";
import { computeTransitSpans, type TransitSpan } from "@/lib/transitSpans";
import { CULTURE_VOICES } from "@/data/cultureVoice";
import { formatMonthYear, toRoman } from "@/components/horizons/format";
import { str } from "@/strings";
import { localZone } from "@/strings/formats";
import { buildYearScreen, yearNatalPoints, YEAR_DAYS } from "@/lib/screens/year";
import {
  SKY_ONLY_OPENING,
  buildYearSegments,
  spanHeadline,
  type YearSegment,
} from "@/components/horizons/yearContent";
import { cn } from "@/lib/classNames";

const DAY_MS = 86_400_000;
const FOOTER_HREFS = ["/season", "/forecast"] as const;

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

  const screen = useMemo(
    () => (culture && now ? buildYearScreen({ culture, instant: now, zone: localZone(), birth: natal }) : null),
    [culture, now, natal],
  );
  const report = screen?.report ?? null;

  const spans: readonly TransitSpan[] = useMemo(() => {
    if (!now || !natal) return [];
    const all = computeTransitSpans(yearNatalPoints(natal), SLOW_BODIES, now, YEAR_DAYS);
    return all.filter((s) => s.end.getTime() >= now.getTime()).sort((a, b) => a.start.getTime() - b.start.getTime());
  }, [now, natal]);

  if (!culture || !now || !screen) {
    return <Skeleton />;
  }

  const { slots, rowTones } = screen;
  const voice = CULTURE_VOICES[culture];
  const segments = report ? buildYearSegments(culture, report.quarters, now) : [];
  const isFestivals = voice.yearStructure === "festivals";
  const heads = slots["year.row.head"] as string[];
  const months = slots["year.monthLabel"] as string[];
  const prose = slots["year.row.prose"] as string[];
  const noChart = slots["year.noChart"] as string[] | undefined;

  return (
    <div className="mx-auto max-w-[640px]">
      <NaveHead
        culture={culture}
        kicker={slots["year.kicker"]}
        sub={
          report ? undefined : (
            <div className="font-mono text-data-xs tracking-label text-dim">{slots["year.countLine"]}</div>
          )
        }
      >
        {slots["year.title"]}
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

          {slots["year.votive"] ? (
            <div className="mt-8">
              <Votive>{slots["year.votive"]}</Votive>
            </div>
          ) : null}
        </>
      ) : (
        <>
          <div className="mx-auto mt-8 max-w-[560px] border border-rule px-[var(--space-4)] py-[var(--space-3)] text-left">
            <div className="mb-2 font-mono text-data-xs tracking-label text-accent">{slots["year.today"]}</div>
            <div className="flex max-h-[420px] flex-col gap-2 overflow-y-auto font-mono text-data-xs leading-data text-prose">
              {heads.map((head, i) => (
                <div key={`${i}-${head}`}>
                  {months[i] ? <div className="mt-2 text-dim">{months[i]}</div> : null}
                  <span className={rowTones[i] === "conflict" ? "text-conflict" : undefined}>{head}</span>
                  {prose[i] ? <div className="font-body text-prose-s leading-prose text-dim">{prose[i]}</div> : null}
                </div>
              ))}
            </div>
          </div>
          {noChart ? (
            <div className="mx-auto mt-8 max-w-[560px] border border-[var(--accent-strong-border)] px-[var(--space-4)] py-[var(--space-3)] text-center">
              <div className="font-display text-display-xs tracking-[0.1em] text-bone">{noChart[0]}</div>
              <Link
                href="/reading"
                className="mt-4 inline-block border border-[var(--accent-strong-border)] px-5 py-2.5 font-mono text-data-xs tracking-label text-accent"
              >
                {noChart[1]}
              </Link>
            </div>
          ) : null}
        </>
      )}

      <div className="mt-6 flex justify-center">
        <FeedbackRow readingId={yearReadingId(now)} noun={str("year.feedback.noun", culture)} />
      </div>

      <div className="mt-9 flex flex-wrap items-center justify-center gap-8 font-mono text-data-xs tracking-microcopy">
        {(slots["year.footer"] as string[]).map((label, i) => (
          <Link key={label} href={FOOTER_HREFS[i] ?? "/"} className="text-bone/65 hover:text-bone">
            {label}
          </Link>
        ))}
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
