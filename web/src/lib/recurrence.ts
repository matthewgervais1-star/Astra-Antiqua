import type { Culture, Planet } from "@/data/cultures";
import { FIGURE_BANKS } from "@/data/figureBanks";
import { orbFor, type AspectKind } from "@/data/sampleChart";
import { computeGeocentricLongitude } from "@/lib/ephemeris";

/**
 * How often a figure comes round, and how long it holds.
 *
 * A figure returns when the sky brings it back, so the interval comes from
 * how fast the two ends move apart. Each body has a mean geocentric rate in
 * degrees a day (Mercury and Venus keep pace with the Sun on average). A
 * natal contact, a moving body against a fixed point, returns every
 * 360 / rate days; a sky figure, two moving bodies, every 360 / |rate a -
 * rate b| days. When the two rates are the same the difference says
 * nothing, so the interval is measured instead: the Sun meets Mercury or
 * Venus twice in each synodic period (at inferior and superior
 * conjunction), every 57.9 and 291.9 days on average, and Mercury and Venus
 * meet anywhere from 3.5 to 294 days apart (ephemeris, 2000 to 2040), which
 * no "about every" can honestly round. A conjunction or an opposition comes
 * once in the cycle; a sextile, a square or a trine twice, once waxing and
 * once waning.
 */
export const MEAN_RATE: Readonly<Record<Planet, number>> = {
  moon: 13.176,
  sun: 0.9856,
  mercury: 0.9856,
  venus: 0.9856,
  mars: 0.524,
  jupiter: 0.0831,
  saturn: 0.0335,
  uranus: 0.011733,
  neptune: 0.005981,
  pluto: 0.003975,
};

/**
 * The pairs whose mean rates are equal: the mean days between their
 * conjunctions, or null for Mercury and Venus, whose meetings keep no steady
 * interval.
 */
const EQUAL_RATE_DAYS: Readonly<Record<string, number | null>> = {
  "mercury|sun": 57.9,
  "sun|venus": 291.9,
  "mercury|venus": null,
};

const ONCE_PER_CYCLE: ReadonlySet<AspectKind> = new Set(["conjunction", "opposition"]);

const perKind = (cycle: number, kind: AspectKind) => cycle / (ONCE_PER_CYCLE.has(kind) ? 1 : 2);

/** Days between returns of a moving body's figure to a fixed natal point. */
export function natalRecurrenceDays(body: Planet, kind: AspectKind): number {
  return perKind(360 / MEAN_RATE[body], kind);
}

/** Days between returns of a figure between two moving bodies, or null when the pair keeps no steady interval. */
export function skyRecurrenceDays(a: Planet, b: Planet, kind: AspectKind): number | null {
  const key = [a, b].sort().join("|");
  if (key in EQUAL_RATE_DAYS) {
    const days = EQUAL_RATE_DAYS[key];
    return days == null ? null : perKind(days, kind);
  }
  return perKind(360 / Math.abs(MEAN_RATE[a] - MEAN_RATE[b]), kind);
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
const YEAR_DAYS = 365.25;

/**
 * "about every two weeks", said in words the culture's calendar can say
 * truthfully, at the nearest sensible unit: days under sixty, months under
 * twenty-four, years beyond. Inside a month the calendars differ: Egypt
 * counts ten-day decans (three to the civil month), the Greek, Canaanite and
 * Carthaginian months are lunar, and Rome's market week is eight days, so
 * Rome counts the half month in days rather than borrow a seven-day week it
 * did not keep. Egypt's year ran in three seasons of four months each.
 */
export function recurrenceInterval(culture: Culture, days: number): string {
  if (days < 20) {
    if (culture === "egypt") return "about every decan and a half";
    if (culture === "rome") return `about every ${numberWords(Math.round(days))} days`;
    return "about twice a month";
  }
  if (days < 45) {
    return culture === "egypt" ? "about every three decans" : "about once a month";
  }
  if (days < 60) return `about every ${numberWords(Math.round(days))} days`;
  const months = Math.round(days / MONTH_DAYS);
  if (months < 24) {
    if (culture === "egypt" && months === 4) return "about once a season";
    if (months === 12) return "about once a year";
    return `about every ${numberWords(months)} months`;
  }
  return `about every ${numberWords(Math.round(days / YEAR_DAYS))} years`;
}

/** "This figure comes round on the river again about every three decans." Null days: the culture's irregular line. */
export function composeRecurrence(culture: Culture, days: number | null): string {
  const bank = FIGURE_BANKS[culture];
  return days == null ? bank.recurrenceIrregular : bank.recurrenceFrame.replace("{interval}", recurrenceInterval(culture, days));
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
