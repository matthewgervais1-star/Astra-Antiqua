/**
 * Small date/number formatting helpers shared by the three horizon pages
 * (week/season/year). No React here; plain data in, plain strings out, so
 * lib/weekReading.ts can import from this file too.
 */

import { fmt, toRoman } from "@/strings/formats";

/** Week and Season count local calendar days (format rule F2), so these read the runtime's zone. */
export function weekdayAbbr(date: Date): string {
  return fmt("date.weekday", date, "local");
}

export function monthAbbr(date: Date): string {
  return fmt("date.monthYear", date, "local").slice(0, 3);
}

/** "23 JUL" (F3, local). */
export function formatDayMonth(date: Date): string {
  return fmt("date.dayMonth", date, "local");
}

/** "MAY 2027" (F3, local). */
export function formatMonthYear(date: Date): string {
  return fmt("date.monthYear", date, "local");
}

/** Joins two already-formatted dates with the spaced arrow (F13: no en dash in chrome). */
export function arrowRange(a: string, b: string): string {
  return `${a} → ${b}`;
}

export { toRoman };

/** ISO-8601 week number (Monday-start, week 1 contains the year's first Thursday). */
export function isoWeek(date: Date): { year: number; week: number } {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const week = Math.ceil(((d.getTime() - yearStart.getTime()) / 86_400_000 + 1) / 7);
  return { year: d.getUTCFullYear(), week };
}

/** The Monday (local calendar) of the week `date` falls in. */
export function mondayOf(date: Date): Date {
  const day = date.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  return new Date(date.getFullYear(), date.getMonth(), date.getDate() + diff);
}

export function sameLocalDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

/** The ephemeris instant used to represent a calendar day: noon UTC of that day. */
export function noonUTCFor(date: Date): Date {
  return new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), 12, 0, 0));
}

/** "WATER-BEARER" -> "Water-Bearer"; for dropping an all-caps mono label into prose. */
export function properCase(s: string): string {
  return s
    .toLowerCase()
    .split(/([\s-])/)
    .map((part) => (part === " " || part === "-" ? part : part.charAt(0).toUpperCase() + part.slice(1)))
    .join("");
}
