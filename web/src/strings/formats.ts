import type { AspectKind, ZodiacSign } from "@/data/sampleChart";
import type { Planet } from "@/data/cultures";

/**
 * The format rules F1 to F14 of the ruled shared strings table
 * (docs/design/shared-strings-table-2026-11.md, "Format rules"). Every
 * surface prints dates, angles, counts, ordinals, houses and signs through
 * these rules; web is canonical and scripts/export-strings.mjs writes them to
 * shared/strings/formats.json with input and output pairs in
 * shared/goldens/formats.json.
 *
 * Zone rule: a date format reads the calendar day in the zone the caller
 * names. "UTC" reads the UTC day (the Day screen, F1). An IANA zone such as
 * "Europe/Rome" reads that zone's day; "local" reads the runtime's own zone
 * (the Week and Season screens count local calendar days, F2). Formats that
 * take no date ignore the zone.
 *
 * Case rule (F14): every output below is in the case the reader sees. No
 * caller transforms it.
 */

/** "UTC", "local", or an IANA zone name. */
export type Zone = "UTC" | "local" | (string & {});

// ---- Word lists (exported to formats.json and to Android's SharedFormats.kt) ----

/** F3: three-letter month abbreviations, upper. */
export const MONTH_ABBR = [
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

/** Full month names for prose ("October 2026"). */
export const MONTH_FULL = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
] as const;

/** F1: three-letter weekday abbreviations, upper, Sunday first (JavaScript's getDay order). */
export const WEEKDAY_ABBR = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"] as const;

/** F7: count words, index = count. Zero prints NONE; over twelve prints digits. */
export const COUNT_WORDS = [
  "NONE",
  "ONE",
  "TWO",
  "THREE",
  "FOUR",
  "FIVE",
  "SIX",
  "SEVEN",
  "EIGHT",
  "NINE",
  "TEN",
  "ELEVEN",
  "TWELVE",
] as const;

/** F12: ordinal words, lower, index = number (1 to 12; index 0 unused). */
export const ORDINAL_WORDS = [
  "",
  "first",
  "second",
  "third",
  "fourth",
  "fifth",
  "sixth",
  "seventh",
  "eighth",
  "ninth",
  "tenth",
  "eleventh",
  "twelfth",
] as const;

/** F8: full sign names, upper. */
export const SIGN_FULL: Readonly<Record<ZodiacSign, string>> = {
  Aries: "ARIES",
  Taurus: "TAURUS",
  Gemini: "GEMINI",
  Cancer: "CANCER",
  Leo: "LEO",
  Virgo: "VIRGO",
  Libra: "LIBRA",
  Scorpio: "SCORPIO",
  Sagittarius: "SAGITTARIUS",
  Capricorn: "CAPRICORN",
  Aquarius: "AQUARIUS",
  Pisces: "PISCES",
};

/**
 * F8: three-letter sign codes for web's desktop placements table only. Android's
 * ZodiacSign.abbr is pinned to this table by ZodiacSignAbbrTest, which reads
 * this file.
 */
export const SIGN_ABBR3: Readonly<Record<ZodiacSign, string>> = {
  Aries: "ARI",
  Taurus: "TAU",
  Gemini: "GEM",
  Cancer: "CNC",
  Leo: "LEO",
  Virgo: "VIR",
  Libra: "LIB",
  Scorpio: "SCO",
  Sagittarius: "SAG",
  Capricorn: "CAP",
  Aquarius: "AQR",
  Pisces: "PSC",
};

/**
 * The one sign-phrase source: the classical figure each sign is named for, upper
 * ("THE SEASON OF THE SCALES", "SATURNUS IN THE RAM", "YOUR RA IN THE FISHES").
 */
export const SIGN_PHRASES: Readonly<Record<ZodiacSign, string>> = {
  Aries: "RAM",
  Taurus: "BULL",
  Gemini: "TWINS",
  Cancer: "CRAB",
  Leo: "LION",
  Virgo: "MAIDEN",
  Libra: "SCALES",
  Scorpio: "SCORPION",
  Sagittarius: "ARCHER",
  Capricorn: "GOAT",
  Aquarius: "WATER-BEARER",
  Pisces: "FISHES",
};

/** Planet names as the board prints them in data lines, upper. */
export const PLANET_NAMES: Readonly<Record<Planet, string>> = {
  sun: "SUN",
  moon: "MOON",
  mercury: "MERCURY",
  venus: "VENUS",
  mars: "MARS",
  jupiter: "JUPITER",
  saturn: "SATURN",
  uranus: "URANUS",
  neptune: "NEPTUNE",
  pluto: "PLUTO",
};

/** F9: the tone word for an aspect kind. */
export const TONE_WORDS: Readonly<Record<AspectKind, string>> = {
  conjunction: "UNION",
  sextile: "EASE",
  trine: "EASE",
  square: "TENSION",
  opposition: "TENSION",
};

/** F9: spans keep two tones, as all four surfaces do. */
export const SPAN_TONE_WORDS = { ease: "EASE", tension: "TENSION" } as const;

/** F11: the retrograde mark in chart rows. Event rows use words; the ℞ sign leaves the printed chrome. */
export const RETROGRADE_MARK = "R";
/** F11: ℞ (U+211E), kept for reference; no catalog value prints it. */
export const RX_SIGN = "℞";

/** F13: separators. */
export const SEP = " · ";
export const ARROW = " → ";

// ---- Calendar parts in a zone ----

interface CalendarParts {
  year: number;
  /** 0 to 11 */
  month: number;
  day: number;
  /** 0 (Sunday) to 6 */
  weekday: number;
  hour: number;
  minute: number;
}

const WEEKDAY_INDEX: Readonly<Record<string, number>> = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };

const zoneFormatters = new Map<string, Intl.DateTimeFormat>();

function formatterFor(zone: string): Intl.DateTimeFormat {
  let f = zoneFormatters.get(zone);
  if (!f) {
    f = new Intl.DateTimeFormat("en-US", {
      timeZone: zone,
      year: "numeric",
      month: "numeric",
      day: "numeric",
      weekday: "short",
      hour: "numeric",
      minute: "numeric",
      hourCycle: "h23",
    });
    zoneFormatters.set(zone, f);
  }
  return f;
}

/** The calendar fields of `date` read in `zone` (see the zone rule at the top). */
export function calendarParts(date: Date, zone: Zone): CalendarParts {
  if (zone === "UTC") {
    return {
      year: date.getUTCFullYear(),
      month: date.getUTCMonth(),
      day: date.getUTCDate(),
      weekday: date.getUTCDay(),
      hour: date.getUTCHours(),
      minute: date.getUTCMinutes(),
    };
  }
  if (zone === "local") {
    return {
      year: date.getFullYear(),
      month: date.getMonth(),
      day: date.getDate(),
      weekday: date.getDay(),
      hour: date.getHours(),
      minute: date.getMinutes(),
    };
  }
  const parts: Record<string, string> = {};
  for (const p of formatterFor(zone).formatToParts(date)) parts[p.type] = p.value;
  return {
    year: Number(parts.year),
    month: Number(parts.month) - 1,
    day: Number(parts.day),
    weekday: WEEKDAY_INDEX[parts.weekday ?? "Sun"] ?? 0,
    hour: Number(parts.hour) % 24,
    minute: Number(parts.minute),
  };
}

// ---- The rules ----

function pad2(n: number): string {
  return String(n).padStart(2, "0");
}

function monthAbbr(month: number): string {
  return MONTH_ABBR[month] ?? "JAN";
}

/** F1 `date.day`: "WED 21 OCT 2026". */
function dateDay(date: Date, zone: Zone): string {
  const p = calendarParts(date, zone);
  return `${WEEKDAY_ABBR[p.weekday] ?? "SUN"} ${p.day} ${monthAbbr(p.month)} ${p.year}`;
}

/** F2 `range.days`: Android's three shapes, spaced arrow, days counted in the zone. */
function rangeDays(from: Date, to: Date, zone: Zone): string {
  const a = calendarParts(from, zone);
  const b = calendarParts(to, zone);
  if (a.year !== b.year) {
    return `${a.day} ${monthAbbr(a.month)} ${a.year}${ARROW}${b.day} ${monthAbbr(b.month)} ${b.year}`;
  }
  if (a.month !== b.month) {
    return `${a.day} ${monthAbbr(a.month)}${ARROW}${b.day} ${monthAbbr(b.month)} ${b.year}`;
  }
  return `${a.day}${ARROW}${b.day} ${monthAbbr(b.month)} ${b.year}`;
}

/** F4 `range.months`: "OCT 2026 → JUN 2027". */
function rangeMonths(from: Date, to: Date, zone: Zone): string {
  const a = calendarParts(from, zone);
  const b = calendarParts(to, zone);
  return `${monthAbbr(a.month)} ${a.year}${ARROW}${monthAbbr(b.month)} ${b.year}`;
}

/**
 * F5 `angle.degMin`: degree unpadded, minutes two digits and rounded, "°" and
 * "′" (U+2032). A degree-in-sign under 30 that rounds up to 30°00′ prints
 * 29°59′, so a body never reads as standing in the next sign.
 */
function angleDegMin(degrees: number): string {
  const v = Math.max(0, degrees);
  const total = Math.round(v * 60);
  let deg = Math.floor(total / 60);
  let min = total - deg * 60;
  if (v < 30 && deg >= 30) {
    deg = 29;
    min = 59;
  }
  return `${deg}°${pad2(min)}′`;
}

/** F6 `angle.orbDecimal`: one decimal with "°": "3.0°". */
function angleOrbDecimal(degrees: number): string {
  return `${(Math.round(Math.abs(degrees) * 10) / 10).toFixed(1)}°`;
}

/** F6 `percent`: a 0 to 1 fraction as a whole percent, no space: "74%". */
function percent(fraction: number): string {
  return `${Math.round(fraction * 100)}%`;
}

/** F7 `count.word`: NONE, ONE to TWELVE, digits above twelve. */
function countWord(n: number): string {
  const i = Math.round(n);
  if (i >= 0 && i < COUNT_WORDS.length) return COUNT_WORDS[i] ?? String(i);
  return String(i);
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

/** F12 `house.roman` and `year.roman`: "II", "XII", "MMXXVI". */
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

/** F12 `ordinal.word`: "eleventh"; digits outside 1 to 12. */
function ordinalWord(n: number): string {
  const i = Math.round(n);
  return (i >= 1 && i <= 12 ? ORDINAL_WORDS[i] : undefined) ?? String(i);
}

/** The value each named format takes. */
export interface FormatInput {
  "date.day": Date;
  "date.dayMonth": Date;
  "date.dayMonthYear": Date;
  "date.monthYear": Date;
  "date.weekday": Date;
  "date.dayOfMonth": Date;
  "date.year": Date;
  "time.hm": Date;
  "range.days": readonly [Date, Date];
  "range.months": readonly [Date, Date];
  "angle.degMin": number;
  "angle.orbDecimal": number;
  percent: number;
  "count.word": number;
  "count.digits": number;
  "ordinal.word": number;
  "ordinal.wordUpper": number;
  "ordinal.wordTitle": number;
  "house.roman": number;
  "year.roman": number;
  "sign.full": ZodiacSign;
  "sign.abbr": ZodiacSign;
  "sign.phrase": ZodiacSign;
  "planet.name": Planet;
  "tone.word": AspectKind;
  "motion.mark": boolean;
}

export type FormatName = keyof FormatInput;

/** Each format's rule id in the table, its pattern, and its zone rule. Exported as formats.json. */
export const FORMAT_RULES: Readonly<Record<FormatName, { rule: string; pattern: string; zone: "UTC" | "slot" | "none" }>> = {
  "date.day": { rule: "F1", pattern: "EEE d MMM yyyy, upper", zone: "UTC" },
  "date.dayMonth": { rule: "F3", pattern: "d MMM, upper", zone: "slot" },
  "date.dayMonthYear": { rule: "F3", pattern: "d MMM yyyy, upper", zone: "slot" },
  "date.monthYear": { rule: "F3", pattern: "MMM yyyy, upper", zone: "slot" },
  "date.weekday": { rule: "F1", pattern: "EEE, upper", zone: "slot" },
  "date.dayOfMonth": { rule: "F3", pattern: "d", zone: "slot" },
  "date.year": { rule: "F3", pattern: "yyyy", zone: "slot" },
  "time.hm": { rule: "F3", pattern: "HH:mm, 24 hour", zone: "slot" },
  "range.days": {
    rule: "F2",
    pattern: "same month: d → d MMM yyyy; across months: d MMM → d MMM yyyy; across years: d MMM yyyy → d MMM yyyy",
    zone: "slot",
  },
  "range.months": { rule: "F4", pattern: "MMM yyyy → MMM yyyy", zone: "slot" },
  "angle.degMin": { rule: "F5", pattern: "d°mm′, degree unpadded, minutes rounded, 29°59′ ceiling inside a sign", zone: "none" },
  "angle.orbDecimal": { rule: "F6", pattern: "0.0°", zone: "none" },
  percent: { rule: "F6", pattern: "fraction × 100, whole, then %", zone: "none" },
  "count.word": { rule: "F7", pattern: "NONE, ONE to TWELVE, digits above", zone: "none" },
  "count.digits": { rule: "F7", pattern: "digits (data lines)", zone: "none" },
  "ordinal.word": { rule: "F12", pattern: "first to twelfth, lower", zone: "none" },
  "ordinal.wordUpper": { rule: "F12", pattern: "FIRST to TWELFTH, upper", zone: "none" },
  "ordinal.wordTitle": { rule: "F12", pattern: "First to Twelfth, first letter upper", zone: "none" },
  "house.roman": { rule: "F12", pattern: "I to XII", zone: "none" },
  "year.roman": { rule: "F12", pattern: "roman numerals", zone: "slot" },
  "sign.full": { rule: "F8", pattern: "full sign name, upper", zone: "none" },
  "sign.abbr": { rule: "F8", pattern: "three letters, upper (web desktop table only)", zone: "none" },
  "sign.phrase": { rule: "F8", pattern: "the sign's figure, upper", zone: "none" },
  "planet.name": { rule: "F8", pattern: "planet name, upper", zone: "none" },
  "tone.word": { rule: "F9", pattern: "EASE (trine, sextile), TENSION (square, opposition), UNION (conjunction)", zone: "none" },
  "motion.mark": { rule: "F11", pattern: "R when retrograde, nothing when direct", zone: "none" },
};

/** The rules that constrain characters rather than fill a slot. Exported with formats.json. */
export const CHARACTER_RULES = {
  F10: "Apostrophe: ’ (U+2019) in every catalog value; no ASCII apostrophe.",
  F11: "Chart rows print R for retrograde and nothing for direct; event rows print TURNS RETROGRADE and TURNS DIRECT; ℞ leaves the printed chrome.",
  F13: "Separators: · (U+00B7) with one space each side; → (U+2192) spaced between dates; no – in chrome.",
  F14: "Case: the catalog stores the printed case; no surface transforms a catalog string.",
} as const;

/**
 * Formats `value` under the named rule. `zone` follows the zone rule at the
 * top of this file; formats that take no date ignore it.
 */
export function fmt<N extends FormatName>(name: N, value: FormatInput[N], zone: Zone = "UTC"): string {
  const v = value as unknown;
  switch (name) {
    case "date.day":
      return dateDay(v as Date, zone);
    case "date.dayMonth": {
      const p = calendarParts(v as Date, zone);
      return `${p.day} ${monthAbbr(p.month)}`;
    }
    case "date.dayMonthYear": {
      const p = calendarParts(v as Date, zone);
      return `${p.day} ${monthAbbr(p.month)} ${p.year}`;
    }
    case "date.monthYear": {
      const p = calendarParts(v as Date, zone);
      return `${monthAbbr(p.month)} ${p.year}`;
    }
    case "date.weekday":
      return WEEKDAY_ABBR[calendarParts(v as Date, zone).weekday] ?? "SUN";
    case "date.dayOfMonth":
      return String(calendarParts(v as Date, zone).day);
    case "date.year":
      return String(calendarParts(v as Date, zone).year);
    case "time.hm": {
      const p = calendarParts(v as Date, zone);
      return `${pad2(p.hour)}:${pad2(p.minute)}`;
    }
    case "range.days": {
      const [a, b] = v as readonly [Date, Date];
      return rangeDays(a, b, zone);
    }
    case "range.months": {
      const [a, b] = v as readonly [Date, Date];
      return rangeMonths(a, b, zone);
    }
    case "angle.degMin":
      return angleDegMin(v as number);
    case "angle.orbDecimal":
      return angleOrbDecimal(v as number);
    case "percent":
      return percent(v as number);
    case "count.word":
      return countWord(v as number);
    case "count.digits":
      return String(Math.round(v as number));
    case "ordinal.word":
      return ordinalWord(v as number);
    case "ordinal.wordUpper":
      return ordinalWord(v as number).toUpperCase();
    case "ordinal.wordTitle": {
      const w = ordinalWord(v as number);
      return w.charAt(0).toUpperCase() + w.slice(1);
    }
    case "house.roman":
    case "year.roman":
      return toRoman(v as number);
    case "sign.full":
      return SIGN_FULL[v as ZodiacSign];
    case "sign.abbr":
      return SIGN_ABBR3[v as ZodiacSign];
    case "sign.phrase":
      return SIGN_PHRASES[v as ZodiacSign];
    case "planet.name":
      return PLANET_NAMES[v as Planet];
    case "tone.word":
      return TONE_WORDS[v as AspectKind];
    case "motion.mark":
      return v ? RETROGRADE_MARK : "";
    default: {
      const never: never = name as never;
      throw new Error(`fmt: unknown format ${String(never)}`);
    }
  }
}

/** F7 plural nouns, as web prints them: PASS or PASSES, RETURN or RETURNS. */
export function plural(n: number, one: string, many: string): string {
  return n === 1 ? one : many;
}

/** The runtime's own IANA zone, for the Week and Season screens' local days. */
export function localZone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
  } catch {
    return "UTC";
  }
}
