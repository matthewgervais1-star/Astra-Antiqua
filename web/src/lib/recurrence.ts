import type { Culture, Planet } from "@/data/cultures";
import { FIGURE_BANKS } from "@/data/figureBanks";
import { orbFor, type AspectKind } from "@/data/sampleChart";
import { computeGeocentricLongitude } from "@/lib/ephemeris";

/**
 * How often a figure comes round, and how long it holds.
 *
 * The cycle is the transiting body's: the Moon's sidereal month, the Sun's
 * year, Mercury's and Venus's synodic periods, and the sidereal periods of
 * Mars and the slow bodies. A conjunction or an opposition comes once in a
 * cycle; a sextile, a square or a trine comes twice, once waxing and once
 * waning. The figures are the ones the plan names
 * (.superpowers/sdd/2026-09-29-planned-work-closeout/task-16-brief.md).
 */
export const CYCLE_DAYS: Readonly<Record<Planet, number>> = {
  moon: 27.32,
  sun: 365.25,
  mercury: 115.9,
  venus: 583.9,
  mars: 687,
  jupiter: 11.86 * 365.25,
  saturn: 29.46 * 365.25,
  uranus: 84 * 365.25,
  neptune: 164.8 * 365.25,
  pluto: 248 * 365.25,
};

const ONCE_PER_CYCLE: ReadonlySet<AspectKind> = new Set(["conjunction", "opposition"]);

/** Days between two returns of the same kind of figure for this body. */
export function recurrenceDays(body: Planet, kind: AspectKind): number {
  return CYCLE_DAYS[body] / (ONCE_PER_CYCLE.has(kind) ? 1 : 2);
}

const UNITS = ["", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten", "eleven", "twelve",
  "thirteen", "fourteen", "fifteen", "sixteen", "seventeen", "eighteen", "nineteen"] as const;
const TENS = ["", "", "twenty", "thirty", "forty", "fifty", "sixty", "seventy", "eighty", "ninety"] as const;

/** 1 to 999 in words: "two hundred and forty-eight". */
export function numberWords(n: number): string {
  if (!Number.isInteger(n) || n < 1 || n > 999) throw new Error(`numberWords: ${n}`);
  const hundreds = Math.floor(n / 100);
  const rest = n % 100;
  const restWords =
    rest === 0 ? "" : rest < 20 ? UNITS[rest]! : `${TENS[Math.floor(rest / 10)]}${rest % 10 ? `-${UNITS[rest % 10]}` : ""}`;
  if (hundreds === 0) return restWords;
  return restWords ? `${UNITS[hundreds]} hundred and ${restWords}` : `${UNITS[hundreds]} hundred`;
}

const MONTH_DAYS = 30.44;

/**
 * "about every two weeks", said in words the culture's calendar can say
 * truthfully. Only the Moon's figures return inside a month, and there the
 * calendars differ: Egypt counts ten-day decans (three to the civil month),
 * the Greek, Canaanite and Carthaginian months are lunar, and Rome's market
 * week is eight days, so Rome counts the half month in days rather than
 * borrow a seven-day week it did not keep. Past a month every culture counts
 * months, then years.
 */
export function recurrenceInterval(culture: Culture, days: number): string {
  if (days < 45) {
    const half = days < 20;
    if (culture === "egypt") return half ? "about every decan and a half" : "about every three decans";
    if (culture === "rome") return half ? `about every ${numberWords(Math.round(days))} days` : "about once a month";
    return half ? "about twice a month" : "about once a month";
  }
  if (days < 330) {
    // Egypt's year ran in three seasons of four months each.
    if (culture === "egypt" && Math.abs(days - 120) < 10) return "about once a season";
    return `about every ${numberWords(Math.round(days / MONTH_DAYS))} months`;
  }
  if (days < 548) return "about once a year";
  if (days < 640) return `about every ${numberWords(Math.round(days / MONTH_DAYS))} months`;
  return `about every ${numberWords(Math.round(days / 365.25))} years`;
}

/** "This figure comes round on the river again about every three decans." */
export function composeRecurrence(culture: Culture, body: Planet, kind: AspectKind): string {
  return FIGURE_BANKS[culture].recurrenceFrame.replace("{interval}", recurrenceInterval(culture, recurrenceDays(body, kind)));
}

// --- the window in orb --------------------------------------------------------

export const ASPECT_ANGLE: Readonly<Record<AspectKind, number>> = {
  conjunction: 0,
  sextile: 60,
  square: 90,
  trine: 120,
  opposition: 180,
};

const HOUR_MS = 3_600_000;
const DAY_MS = 86_400_000;
/** The step the ephemeris is sampled at while finding a window's edges. */
export const WINDOW_STEP_HOURS = 6;
/** No window is walked further than this either side of its instant. */
const WINDOW_CAP_DAYS = 400;

function separation(x: number, y: number): number {
  const raw = Math.abs(x - y) % 360;
  return raw > 180 ? 360 - raw : raw;
}

export interface OrbWindow {
  start: Date;
  end: Date;
}

/**
 * The stretch around `instant` during which `distance` (degrees from exact)
 * stays inside the kind's orb, found by stepping six hours at a time out to
 * the first sample past the orb. The edges are the last samples inside it.
 */
function walkWindow(distance: (t: Date) => number, kind: AspectKind, instant: Date): OrbWindow {
  const orb = orbFor(kind);
  const step = WINDOW_STEP_HOURS * HOUR_MS;
  const steps = Math.ceil((WINDOW_CAP_DAYS * DAY_MS) / step);
  const edge = (direction: -1 | 1): Date => {
    let last = instant;
    for (let i = 1; i <= steps; i += 1) {
      const probe = new Date(instant.getTime() + direction * i * step);
      if (distance(probe) > orb) break;
      last = probe;
    }
    return last;
  };
  return { start: edge(-1), end: edge(1) };
}

/** The window during which two moving bodies hold the figure. */
export function skyWindow(a: Planet, b: Planet, kind: AspectKind, instant: Date): OrbWindow {
  return walkWindow(
    (t) => Math.abs(separation(computeGeocentricLongitude(a, t), computeGeocentricLongitude(b, t)) - ASPECT_ANGLE[kind]),
    kind,
    instant,
  );
}

/** The window during which a moving body holds the figure to a fixed natal longitude. */
export function natalWindow(body: Planet, natalLongitude: number, kind: AspectKind, instant: Date): OrbWindow {
  return walkWindow(
    (t) => Math.abs(separation(computeGeocentricLongitude(body, t), natalLongitude) - ASPECT_ANGLE[kind]),
    kind,
    instant,
  );
}

// --- the four-tick timeline ---------------------------------------------------

const MONTHS = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"] as const;

export interface TimelineTick {
  /** Percent along the window, 0 to 100. */
  pct: number;
  /** "OCT 3", "EARLY OCT", and so on, in UTC. */
  label: string;
  /** "06:00" under a window shorter than four days, the year under one that crosses a year; else "". */
  sub: string;
}

export interface Timeline {
  ticks: readonly TimelineTick[];
  /** Where the present sits, 0 to 100. */
  presentPct: number;
  /** True when the present falls inside the window; the marker is then the present itself. */
  presentInside: boolean;
}

function partOfMonth(d: Date): string {
  const day = d.getUTCDate();
  return day <= 10 ? "EARLY" : day <= 20 ? "MID" : "LATE";
}

/**
 * Four ticks across the window, evenly spaced, labelled at the scale the
 * window runs at: hours for a figure of a day or two, dates for one of weeks,
 * parts of a month beyond. All in UTC, so the page and its tests agree
 * wherever they run. The present is marked where it falls; a page read for
 * another day marks that day's instant instead.
 */
export function buildTimeline(window: OrbWindow, present: Date, fallback: Date): Timeline {
  const start = window.start.getTime();
  const span = Math.max(1, window.end.getTime() - start);
  const days = span / DAY_MS;
  const crossesYear = window.start.getUTCFullYear() !== window.end.getUTCFullYear();
  const ticks: TimelineTick[] = [0, 1, 2, 3].map((i) => {
    const d = new Date(start + (span * i) / 3);
    const month = MONTHS[d.getUTCMonth()]!;
    if (days < 4) {
      const hour = String(d.getUTCHours()).padStart(2, "0");
      const minute = String(d.getUTCMinutes()).padStart(2, "0");
      return { pct: (i * 100) / 3, label: `${month} ${d.getUTCDate()}`, sub: `${hour}:${minute}` };
    }
    if (days < 60) return { pct: (i * 100) / 3, label: `${month} ${d.getUTCDate()}`, sub: crossesYear ? String(d.getUTCFullYear()) : "" };
    return { pct: (i * 100) / 3, label: `${partOfMonth(d)} ${month}`, sub: crossesYear || days > 300 ? String(d.getUTCFullYear()) : "" };
  });
  const inside = present.getTime() >= start && present.getTime() <= window.end.getTime();
  const marker = inside ? present : fallback;
  const presentPct = Math.min(100, Math.max(0, ((marker.getTime() - start) / span) * 100));
  return { ticks, presentPct, presentInside: inside };
}
