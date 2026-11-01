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
import { buildWeekDays, shorthandText, type WeekDay } from "@/lib/weekReading";
import { computeMoonPhase } from "@/lib/moonPhase";
import { fmt, moonPhaseKey, str } from "@/strings";
import type { Culture } from "@/data/cultures";
import { cn } from "@/lib/classNames";
import { isoWeek, mondayOf } from "@/components/horizons/format";

function weekContextLine(weekStart: Date): string {
  const { week } = isoWeek(weekStart);
  const sunday = new Date(weekStart.getFullYear(), weekStart.getMonth(), weekStart.getDate() + 6);
  return `WEEK ${String(week).padStart(2, "0")} · ${fmt("range.days", [weekStart, sunday], "local")}`;
}

function weekReadingId(weekStart: Date): string {
  const { year, week } = isoWeek(weekStart);
  return `week-${year}-W${String(week).padStart(2, "0")}`;
}

function pickHardestDay(days: readonly WeekDay[]): WeekDay | null {
  return days.find((d) => d.tone === "tension") ?? days.find((d) => d.tone === "harmony") ?? days[0] ?? null;
}

function WeekRow({ day, culture }: { day: WeekDay; culture: Culture }) {
  return (
    <div
      className={cn(
        "grid grid-cols-[1fr_auto] items-baseline gap-x-4 gap-y-1 sm:grid-cols-[104px_1fr_auto] border-t border-rule px-3 py-3.5 last:border-b",
        day.isToday && "bg-[color-mix(in_srgb,var(--accent)_7%,transparent)]",
      )}
    >
      <span
        className={cn(
          "font-mono text-data-xs leading-data",
          day.isToday ? "text-accent" : "text-dim",
        )}
      >
        {str("week.row.weekday", culture, { weekday: fmt("date.weekday", day.date, "local") })}{" "}
        {str("week.row.date", culture, { d: fmt("date.dayOfMonth", day.date, "local") })}
        {day.flag ? ` ${day.flag}` : ""}
        {day.isToday ? (
          <>
            <br />
            {str("week.row.today", culture)}
          </>
        ) : null}
      </span>
      <span className="order-3 col-span-2 flex flex-col gap-1 sm:order-none sm:col-span-1">
        {day.headline ? (
          day.figureHref ? (
            <Link href={day.figureHref} className="font-display text-display-xs leading-display text-bone hover:text-accent">
              {day.headline}
            </Link>
          ) : (
            <span className="font-display text-display-xs leading-display text-bone">{day.headline}</span>
          )
        ) : null}
        <span className="font-body text-prose-s leading-prose text-prose">{day.line}</span>
      </span>
      <span
        className={cn(
          "order-2 inline-flex items-baseline gap-[4px] whitespace-nowrap font-mono text-data-xs sm:order-none",
          day.tone === "tension" ? "text-conflict" : "text-dim",
        )}
      >
        {shorthandText(culture, day.shorthand)}
      </span>
    </div>
  );
}

function WeekContent({
  weekStart,
  today,
  natal,
}: {
  weekStart: Date | null;
  today: Date | null;
  natal: SavedNatal | null;
}) {
  const culture = useActivePantheon();
  const days = useMemo(
    () => (culture && weekStart ? buildWeekDays(culture, weekStart, natal) : null),
    [culture, weekStart, natal],
  );

  if (!culture || !days || !weekStart || !today) {
    return <Skeleton />;
  }

  const hardest = pickHardestDay(days);
  const sunday = new Date(weekStart.getFullYear(), weekStart.getMonth(), weekStart.getDate() + 6);
  const quietDays = days.filter((d) => d.tone === "quiet").length;
  const moon = computeMoonPhase(today);

  return (
    <div className="mx-auto max-w-[640px]">
      <NaveHead
        culture={culture}
        kicker={str("week.kicker", culture, {
          range: fmt("range.days", [weekStart, sunday], "local"),
          institution: str("common.institution", culture),
        })}
        sub={
          <div className="font-mono text-data-xs tracking-label text-dim">
            {str("week.countLine", culture, {
              days: fmt("count.word", days.length),
              weighed: fmt("count.word", days.length - quietDays),
              quiet: fmt("count.word", quietDays),
            })}
          </div>
        }
      >
        {str("week.title", culture)}
      </NaveHead>
      <p className="mx-auto max-w-[560px] text-left font-body text-prose-m leading-prose text-prose">
        {str("week.thesis", culture)}
      </p>
      <div className="mx-auto mt-6 grid max-w-[560px] grid-cols-2 gap-x-4 border border-rule px-4 py-[var(--space-2)] text-left font-mono text-data-xs leading-data">
        <div>
          <div className="text-dim">{str("week.moon.label", culture)}</div>
          <div className="text-bone">{str("week.moon.phase", culture, { phase: str(moonPhaseKey(moon.name), culture) })}</div>
          <div className="text-dim">{str("week.moon.lit", culture, { percent: fmt("percent", moon.illuminationFraction) })}</div>
        </div>
        <div>
          <div className="text-dim">
            {str("week.moon.nextQuarter", culture, { quarter: str(moonPhaseKey(moon.nextQuarter.name), culture) })}
          </div>
          <div className="text-bone">
            {str("week.moon.nextQuarter.date", culture, { date: fmt("date.dayMonthYear", moon.nextQuarter.date, "local") })}
          </div>
        </div>
      </div>
      <div className="mt-8 flex flex-col">
        {days.map((day) => (
          <WeekRow key={day.date.toISOString()} day={day} culture={culture} />
        ))}
      </div>
      <div className="mx-auto mt-6 max-w-[560px] text-center font-mono text-data-xs tracking-label text-dim">
        {str("week.note", culture)}
      </div>
      <div className="mt-8">
        <Votive>{str(`week.votive.${hardest?.tone ?? "quiet"}`, culture)}</Votive>
      </div>
      <div className="mt-6 flex justify-center">
        <FeedbackRow readingId={weekReadingId(weekStart)} noun={str("week.feedback.noun", culture)} />
      </div>
      <div className="mt-9 flex flex-wrap items-center justify-center gap-8 font-mono text-data-xs tracking-microcopy">
        <Link href="/" className="text-bone/65 hover:text-bone">
          {str("chrome.footer.toDay", culture)}
        </Link>
        <Link href="/season" className="text-bone/65 hover:text-bone">
          {str("chrome.footer.toSeason", culture)}
        </Link>
        <Link href="/transits" className="text-accent">
          {str("chrome.footer.toTransits", culture)}
        </Link>
      </div>
    </div>
  );
}

/**
 * The full `/week` client experience: chassis, seven day-rows composed by
 * lib/weekReading.ts, votive, feedback, and the horizon nav. Owns its own
 * "today" state (client-only, matching the rest of the reading surfaces)
 * so the sub-bar context line and the day rows never disagree on the date.
 */
export function WeekNave() {
  const [today, setToday] = useState<Date | null>(null);
  const [natal, setNatal] = useState<SavedNatal | null>(null);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setToday(new Date());
    setNatal(loadSavedNatal());
  }, []);

  const weekStart = today ? mondayOf(today) : null;
  const context = weekStart ? weekContextLine(weekStart) : "THE WEEK";

  return (
    <NaveShell context={context} horizon="week" active="today">
      <CultureGate>
        <WeekContent weekStart={weekStart} today={today} natal={natal} />
      </CultureGate>
    </NaveShell>
  );
}
