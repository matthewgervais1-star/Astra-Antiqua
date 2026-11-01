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
import { buildWeekDays, type WeekDay } from "@/lib/weekReading";
import { weekModelFromDays } from "@/lib/screens/week";
import type { SlotMap } from "@/lib/screens/types";
import { fmt, str } from "@/strings";
import { localZone } from "@/strings/formats";
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

/** Row `i` of a row slot (see SlotMap): "" where the row prints nothing. */
function rowOf(slots: SlotMap, key: string, i: number): string {
  return (slots[key] as string[] | undefined)?.[i] ?? "";
}

function WeekRow({ day, slots, i }: { day: WeekDay; slots: SlotMap; i: number }) {
  // week.row.weekday stacks the weekday over the day of the month; web sets them on one line.
  const [weekday = "", date = ""] = rowOf(slots, "week.row.weekday", i).split("\n");
  const today = rowOf(slots, "week.row.today", i);
  const headline = rowOf(slots, "week.row.headline", i);
  const shorthand =
    rowOf(slots, "week.row.shorthand.aspect", i) ||
    rowOf(slots, "week.row.shorthand.ingress", i) ||
    rowOf(slots, "week.row.shorthand.quiet", i);
  return (
    <div
      className={cn(
        "grid grid-cols-[1fr_auto] items-baseline gap-x-4 gap-y-1 sm:grid-cols-[104px_1fr_auto] border-t border-rule px-3 py-3.5 last:border-b",
        today && "bg-[color-mix(in_srgb,var(--accent)_7%,transparent)]",
      )}
    >
      <span className={cn("font-mono text-data-xs leading-data", today ? "text-accent" : "text-dim")}>
        {weekday} {date}
        {today ? (
          <>
            <br />
            {today}
          </>
        ) : null}
      </span>
      <span className="order-3 col-span-2 flex flex-col gap-1 sm:order-none sm:col-span-1">
        {headline ? (
          day.figureHref ? (
            <Link href={day.figureHref} className="font-display text-display-xs leading-display text-bone hover:text-accent">
              {headline}
            </Link>
          ) : (
            <span className="font-display text-display-xs leading-display text-bone">{headline}</span>
          )
        ) : null}
        <span className="font-body text-prose-s leading-prose text-prose">{rowOf(slots, "week.row.line", i)}</span>
      </span>
      <span
        className={cn(
          "order-2 inline-flex items-baseline gap-[4px] whitespace-nowrap font-mono text-data-xs sm:order-none",
          day.tone === "tension" ? "text-conflict" : "text-dim",
        )}
      >
        {shorthand}
      </span>
    </div>
  );
}

const FOOTER_HREFS = ["/", "/season", "/transits"] as const;

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
    () => (culture && weekStart && today ? buildWeekDays(culture, weekStart, natal, today) : null),
    [culture, weekStart, today, natal],
  );
  const slots = useMemo(
    () => (culture && today && days ? weekModelFromDays({ culture, instant: today, zone: localZone(), birth: natal }, days) : null),
    [culture, today, natal, days],
  );

  if (!culture || !days || !weekStart || !slots) {
    return <Skeleton />;
  }

  // week.moon stacks five lines: label, phase, lit, next quarter, its date.
  const [moonLabel, moonPhase, moonLit, quarter, quarterDate] = (slots["week.moon"] as string).split("\n");
  const footer = slots["week.footer"] as string[];

  return (
    <div className="mx-auto max-w-[640px]">
      <NaveHead
        culture={culture}
        kicker={slots["week.kicker"]}
        sub={<div className="font-mono text-data-xs tracking-label text-dim">{slots["week.countLine"]}</div>}
      >
        {slots["week.title"]}
      </NaveHead>
      <p className="mx-auto max-w-[560px] text-left font-body text-prose-m leading-prose text-prose">
        {slots["week.thesis"]}
      </p>
      <div className="mx-auto mt-6 grid max-w-[560px] grid-cols-2 gap-x-4 border border-rule px-4 py-[var(--space-2)] text-left font-mono text-data-xs leading-data">
        <div>
          <div className="text-dim">{moonLabel}</div>
          <div className="text-bone">{moonPhase}</div>
          <div className="text-dim">{moonLit}</div>
        </div>
        <div>
          <div className="text-dim">{quarter}</div>
          <div className="text-bone">{quarterDate}</div>
        </div>
      </div>
      <div className="mt-8 flex flex-col">
        {days.map((day, i) => (
          <WeekRow key={day.date.toISOString()} day={day} slots={slots} i={i} />
        ))}
      </div>
      <div className="mx-auto mt-6 max-w-[560px] text-center font-mono text-data-xs tracking-label text-dim">
        {slots["week.note"]}
      </div>
      <div className="mt-8">
        <Votive>{slots["week.votive"]}</Votive>
      </div>
      <div className="mt-6 flex justify-center">
        <FeedbackRow readingId={weekReadingId(weekStart)} noun={str("week.feedback.noun", culture)} />
      </div>
      <div className="mt-9 flex flex-wrap items-center justify-center gap-8 font-mono text-data-xs tracking-microcopy">
        {footer.map((label, i) => (
          <Link
            key={label}
            href={FOOTER_HREFS[i] ?? "/"}
            className={i === footer.length - 1 ? "text-accent" : "text-bone/65 hover:text-bone"}
          >
            {label}
          </Link>
        ))}
      </div>
    </div>
  );
}

/**
 * The full `/week` client experience: chassis, seven day-rows composed by
 * lib/weekReading.ts and printed from the week's screen model
 * (lib/screens/week.ts), votive, feedback, and the horizon nav. Owns its own
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
