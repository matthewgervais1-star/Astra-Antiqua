"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { NaveShell } from "@/components/chrome/NaveShell";
import { CultureGate } from "@/components/chrome/CultureGate";
import { NaveHead } from "@/components/chrome/NaveHead";
import { DeityGlyph } from "@/components/chrome/DeityGlyph";
import { Votive } from "@/components/chrome/Votive";
import { FeedbackRow } from "@/components/chrome/FeedbackRow";
import { Skeleton } from "@/components/chrome/Skeleton";
import { useActivePantheon } from "@/components/pantheon/PantheonContext";
import { loadSavedNatal, type SavedNatal } from "@/lib/savedNatal";
import {
  ASPECT_GLYPH,
  SIGN_ABBR,
  buildWeekDays,
  type WeekDay,
  type WeekShorthand,
  type WeekTone,
} from "@/lib/weekReading";
import { CULTURE_VOICES } from "@/data/cultureVoice";
import type { Culture } from "@/data/cultures";
import { cn } from "@/lib/classNames";
import { formatDayMonth, isoWeek, mondayOf, monthAbbr } from "@/components/horizons/format";

function weekContextLine(weekStart: Date): string {
  const { week } = isoWeek(weekStart);
  const sunday = new Date(weekStart.getFullYear(), weekStart.getMonth(), weekStart.getDate() + 6);
  const sameMonth =
    weekStart.getMonth() === sunday.getMonth() && weekStart.getFullYear() === sunday.getFullYear();
  const range = sameMonth
    ? `${weekStart.getDate()}–${sunday.getDate()} ${monthAbbr(sunday)} ${sunday.getFullYear()}`
    : `${formatDayMonth(weekStart)} – ${formatDayMonth(sunday)} ${sunday.getFullYear()}`;
  return `WEEK ${String(week).padStart(2, "0")} · ${range}`;
}

function weekReadingId(weekStart: Date): string {
  const { year, week } = isoWeek(weekStart);
  return `week-${year}-W${String(week).padStart(2, "0")}`;
}

function pickHardestDay(days: readonly WeekDay[]): WeekDay | null {
  return days.find((d) => d.tone === "tension") ?? days.find((d) => d.tone === "harmony") ?? days[0] ?? null;
}

/** Two-line votive per culture, keyed by the tone of the week's hardest day. */
const WEEK_VOTIVE: Readonly<Record<Culture, Readonly<Record<WeekTone, string>>>> = {
  egypt: {
    tension: "WEIGH WHAT IS HEAVY BEFORE\nYOU CARRY IT INTO FRIDAY",
    harmony: "TAKE THE CURRENT WHILE\nIT RUNS WITH YOU",
    quiet: "ORDINARY DAYS ARE NOT\nEMPTY DAYS",
  },
  greece: {
    tension: "ASK THE HARD QUESTION\nBEFORE THE WEEK ASKS IT FOR YOU",
    harmony: "TAKE THE ANSWER GIVEN FREELY,\nWITHOUT A SECOND ASKING",
    quiet: "SILENCE FROM THE SHRINE\nIS ALSO AN ANSWER",
  },
  canaan: {
    tension: "LET THE WITNESS SPEAK\nBEFORE THE COUNCIL CLOSES",
    harmony: "SEAL THE VOW WHILE\nTHE RAINS STILL FAVOR IT",
    quiet: "THE TENT STANDS EVEN ON\nA DAY WITH NO MATTER BEFORE IT",
  },
  carthage: {
    tension: "LEAVE THE BOOKS OPEN\nUNTIL THE ACCOUNT IS TRUE",
    harmony: "LOAD WHILE THE HARBOR\nIS STILL OPEN TO YOU",
    quiet: "A STEADY LEDGER IS\nSTILL A PROFITABLE ONE",
  },
  rome: {
    tension: "PROCEED, BUT KEEP\nTHE DEFENSE READY",
    harmony: "TAKE THE RIGHT HAND OFFERED\nWITHOUT A SECOND READING",
    quiet: "AN ORDINARY DAY IS STILL\nTAKEN UNDER AUSPICES",
  },
};

/**
 * The items of the shorthand column. The wrapping span in WeekRow is an
 * inline-flex row aligned on the baseline, so the text items keep the same
 * baseline as the other two grid columns; each glyph centres itself on the
 * text with self-center. Measured in Chrome: items-center on the row would
 * make the row's baseline the svg's bottom edge and lift the shorthand
 * about 4px on event days.
 */
function ShorthandItems({ shorthand, culture }: { shorthand: WeekShorthand; culture: Culture }) {
  if (shorthand.kind === "aspect") {
    return (
      <>
        <DeityGlyph body={shorthand.a} culture={culture} size={16} className="self-center" />
        {ASPECT_GLYPH[shorthand.aspect]}
        <DeityGlyph body={shorthand.b} culture={culture} size={16} className="self-center" />
        {shorthand.tight ? "TIGHT" : null}
      </>
    );
  }
  if (shorthand.kind === "ingress") {
    return (
      <>
        <DeityGlyph body={shorthand.planet} culture={culture} size={16} className="self-center" />
        {"→"}
        {SIGN_ABBR[shorthand.sign]}
      </>
    );
  }
  return "QUIET";
}

function WeekRow({ day, culture }: { day: WeekDay; culture: Culture }) {
  return (
    <div
      className={cn(
        "grid grid-cols-[104px_1fr_auto] items-baseline gap-4 border-t border-rule px-3 py-3.5 last:border-b",
        day.isToday && "bg-[color-mix(in_srgb,var(--accent)_7%,transparent)]",
      )}
    >
      <span
        className={cn(
          "font-mono text-data-xs leading-data",
          day.isToday ? "text-accent" : "text-dim",
        )}
      >
        {day.label}
        {day.flag ? ` ${day.flag}` : ""}
        {day.isToday ? (
          <>
            <br />
            TODAY
          </>
        ) : null}
      </span>
      <span className="flex flex-col gap-1">
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
          "inline-flex items-baseline gap-[4px] whitespace-nowrap font-mono text-data-xs",
          day.tone === "tension" ? "text-conflict" : "text-dim",
        )}
      >
        <ShorthandItems shorthand={day.shorthand} culture={culture} />
      </span>
    </div>
  );
}

function WeekContent({
  weekStart,
  natal,
}: {
  weekStart: Date | null;
  natal: SavedNatal | null;
}) {
  const culture = useActivePantheon();
  const days = useMemo(
    () => (culture && weekStart ? buildWeekDays(culture, weekStart, natal) : null),
    [culture, weekStart, natal],
  );

  if (!culture || !days || !weekStart) {
    return <Skeleton />;
  }

  const voice = CULTURE_VOICES[culture];
  const hardest = pickHardestDay(days);

  return (
    <div className="mx-auto max-w-[640px]">
      <NaveHead kicker={`${voice.institution} · THE WEEK`}>{voice.weekTitle}</NaveHead>
      <p className="mx-auto max-w-[560px] text-left font-body text-prose-m leading-prose text-prose">
        {voice.weekThesis}
      </p>
      <div className="mt-8 flex flex-col">
        {days.map((day) => (
          <WeekRow key={day.date.toISOString()} day={day} culture={culture} />
        ))}
      </div>
      <div className="mx-auto mt-6 max-w-[560px] text-center font-mono text-data-xs tracking-label text-dim">
        {voice.weekNote}
        {voice.dayFlags ? " · F LAWFUL · N UNLAWFUL · C MIXED" : ""}
      </div>
      <div className="mt-8">
        <Votive>{WEEK_VOTIVE[culture][hardest?.tone ?? "quiet"]}</Votive>
      </div>
      <div className="mt-6 flex justify-center">
        <FeedbackRow readingId={weekReadingId(weekStart)} noun="WEEK" />
      </div>
      <div className="mt-9 flex flex-wrap items-center justify-center gap-8 font-mono text-data-xs tracking-microcopy">
        <Link href="/" className="text-bone/65 hover:text-bone">
          ← THE DAY
        </Link>
        <Link href="/season" className="text-bone/65 hover:text-bone">
          THE SEASON →
        </Link>
        <Link href="/transits" className="text-accent">
          THE LONG TRANSITS →
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
        <WeekContent weekStart={weekStart} natal={natal} />
      </CultureGate>
    </NaveShell>
  );
}
