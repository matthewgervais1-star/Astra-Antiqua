import { buildWeekDays, shorthandText, type WeekDay } from "@/lib/weekReading";
import { computeMoonPhase } from "@/lib/moonPhase";
import { mondayOf } from "@/components/horizons/format";
import { fmt, str } from "@/strings";
import { footerLinks, lines, moonNames, nextQuarterDate } from "@/lib/screens/common";
import type { ScreenInput, SlotMap } from "@/lib/screens/types";

/** The day the week's votive follows: its first tension day, else its first harmony day, else its first day. */
export function pickHardestDay(days: readonly WeekDay[]): WeekDay | null {
  return days.find((d) => d.tone === "tension") ?? days.find((d) => d.tone === "harmony") ?? days[0] ?? null;
}

/** The Monday (local) of the instant's week, and its Sunday. */
export function weekBounds(instant: Date): { start: Date; end: Date } {
  const start = mondayOf(instant);
  return { start, end: new Date(start.getFullYear(), start.getMonth(), start.getDate() + 6) };
}

/**
 * The Week screen's slots (board Glass-Week; table section "Week"). Week
 * counts local calendar days (F2), so the dates read in `zone`. The rows are
 * sky-only; the birth record changes nothing here.
 */
export function buildWeekModel(input: ScreenInput): SlotMap {
  const { start } = weekBounds(input.instant);
  return weekModelFromDays(input, buildWeekDays(input.culture, start, input.birth, input.instant));
}

/** As buildWeekModel, from rows already composed for the same input. */
export function weekModelFromDays(input: ScreenInput, days: readonly WeekDay[]): SlotMap {
  const { culture, instant, zone } = input;
  const { start, end } = weekBounds(instant);
  const quiet = days.filter((d) => d.tone === "quiet").length;
  const moon = computeMoonPhase(instant);
  const { phase, quarter } = moonNames(culture, moon);
  const hardest = pickHardestDay(days);
  const kind = (d: WeekDay, k: WeekDay["shorthand"]["kind"]) => (d.shorthand.kind === k ? shorthandText(culture, d.shorthand) : "");

  return {
    "week.kicker": str("week.kicker", culture, {
      range: fmt("range.days", [start, end], zone),
      institution: str("common.institution", culture),
    }),
    "week.title": str("week.title", culture),
    "week.countLine": str("week.countLine", culture, {
      days: fmt("count.word", days.length),
      weighed: fmt("count.word", days.length - quiet),
      quiet: fmt("count.word", quiet),
    }),
    "week.thesis": str("week.thesis", culture),
    "week.moon": lines(
      str("week.moon.label", culture),
      str("week.moon.phase", culture, { phase }),
      str("week.moon.lit", culture, { percent: fmt("percent", moon.illuminationFraction) }),
      str("week.moon.nextQuarter", culture, { quarter }),
      str("week.moon.nextQuarter.date", culture, { date: nextQuarterDate(moon, zone) }),
    ),
    // The weekday over the day of the month; Rome adds the day's flag after the number.
    "week.row.weekday": days.map((d) =>
      lines(
        str("week.row.weekday", culture, { weekday: fmt("date.weekday", d.date, zone) }),
        str("week.row.date", culture, { d: fmt("date.dayOfMonth", d.date, zone) }) + (d.flag ? ` ${d.flag}` : ""),
      ),
    ),
    "week.row.today": days.map((d) => (d.isToday ? str("week.row.today", culture) : "")),
    "week.row.headline": days.map((d) => d.headline ?? ""),
    "week.row.line": days.map((d) => d.line),
    "week.row.shorthand.aspect": days.map((d) => kind(d, "aspect")),
    "week.row.shorthand.ingress": days.map((d) => kind(d, "ingress")),
    "week.row.shorthand.quiet": days.map((d) => kind(d, "quiet")),
    "week.note": str("week.note", culture),
    "week.votive": str(`week.votive.${hardest?.tone ?? "quiet"}`, culture),
    "week.footer": footerLinks(["chrome.footer.toDay", "chrome.footer.toSeason", "chrome.footer.toTransits"]),
  };
}
