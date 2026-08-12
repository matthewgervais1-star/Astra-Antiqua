/**
 * Small date/number formatting helpers shared by the three horizon pages
 * (week/season/year). No React here; plain data in, plain strings out, so
 * lib/weekReading.ts can import from this file too.
 */

const WEEKDAY_ABBR = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"] as const;
const MONTH_ABBR = [
  "JAN",
  "FEB",
  "MAR",
  "APR",
  "MAY",
  "JUN",
  "JUL",
  "AUG",
  "SEP",
  "OCT",
  "NOV",
  "DEC",
] as const;

export function weekdayAbbr(date: Date): string {
  return WEEKDAY_ABBR[date.getDay()] ?? "MON";
}

export function monthAbbr(date: Date): string {
  return MONTH_ABBR[date.getMonth()] ?? "JAN";
}

/** "23 JUL" */
export function formatDayMonth(date: Date): string {
  return `${date.getDate()} ${monthAbbr(date)}`;
}

/** "MAY 2027" */
export function formatMonthYear(date: Date): string {
  return `${monthAbbr(date)} ${date.getFullYear()}`;
}

/** Joins two already-formatted strings with the house en dash (never an em dash). */
export function enDashRange(a: string, b: string): string {
  return `${a} – ${b}`;
}

const ROMAN: ReadonlyArray<readonly [number, string]> = [
  [1000, "M"],
  [900, "CM"],
  [500, "D"],
  [400, "CD"],
  [100, "C"],
  [90, "XC"],
  [50, "L"],
  [40, "XL"],
  [10, "X"],
  [9, "IX"],
  [5, "V"],
  [4, "IV"],
  [1, "I"],
];

export function toRoman(value: number): string {
  let n = Math.max(1, Math.round(value));
  let out = "";
  for (const [amount, symbol] of ROMAN) {
    while (n >= amount) {
      out += symbol;
      n -= amount;
    }
  }
  return out;
}

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
