import type { Culture, Planet } from "@/data/cultures";
import { DEITY_MATRIX } from "@/data/deities";
import { longitudeToSign, type Longitude, type ZodiacSign } from "@/data/sampleChart";

/** Pure formatting helpers local to the home route: degree/minute display,
 * three-letter sign codes, the classical sign images used in the long-transit
 * headline, and small date formatters. Nothing here touches React. */

function pad2(n: number): string {
  return Math.trunc(n).toString().padStart(2, "0");
}

export const SIGN3: Readonly<Record<ZodiacSign, string>> = {
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
  Aquarius: "AQU",
  Pisces: "PSC",
};

/** The classical figure each sign is named for, used in "{DEITY} IN THE
 *  {IMAGE}" headlines ("SATURNUS IN THE RAM"). */
export const SIGN_IMAGE: Readonly<Record<ZodiacSign, string>> = {
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
  Pisces: "FISH",
};

export interface LongitudeParts {
  deg: string;
  min: string;
  sign: ZodiacSign;
  sign3: string;
}

/** Two-digit degree, two-digit minute: "19°08′ LEO". Used for the ephemeris
 * rail, where every row lines up in a fixed-width mono column. */
export function formatLongitude(longitude: Longitude): LongitudeParts {
  const { sign, degree } = longitudeToSign(longitude);
  const deg = Math.floor(degree);
  const min = Math.round((degree - deg) * 60);
  const carried = min === 60 ? { deg: (deg + 1) % 30, min: 0 } : { deg, min };
  return {
    deg: pad2(carried.deg),
    min: pad2(carried.min),
    sign,
    sign3: SIGN3[sign],
  };
}

/** Un-padded degree, two-digit minute: "2°35′". Matches the mock's orb
 * display, which never zero-pads the degree. */
export function formatOrbDegMin(orbDegrees: number): string {
  const deg = Math.floor(orbDegrees);
  const min = Math.round((orbDegrees - deg) * 60);
  const carried = min === 60 ? { deg: deg + 1, min: 0 } : { deg, min };
  return `${carried.deg}°${pad2(carried.min)}′`;
}

export function formatMonthYear(date: Date): string {
  return date
    .toLocaleDateString("en-US", { month: "short", year: "numeric", timeZone: "UTC" })
    .toUpperCase();
}

export function weekdayUpper(date: Date): string {
  return date.toLocaleDateString("en-US", { weekday: "long", timeZone: "UTC" }).toUpperCase();
}

export function dateLongUpper(date: Date): string {
  return date
    .toLocaleDateString("en-US", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" })
    .toUpperCase();
}

export function shortDateUpper(date: Date): string {
  return date
    .toLocaleDateString("en-US", { day: "2-digit", month: "short", timeZone: "UTC" })
    .toUpperCase();
}

/** The label for a natal point in a long-transit headline or spine: deity
 * name for the seven ancient bodies and the three received ones, plain
 * English for the angles (asc/mc), which carry no deity. */
export function natalPointLabel(culture: Culture, key: string): string {
  if (key === "asc") return "ASCENDANT";
  if (key === "mc") return "MIDHEAVEN";
  const planet = key as Planet;
  const deity = DEITY_MATRIX[culture]?.[planet];
  return deity ? deity.name.toUpperCase() : key.toUpperCase();
}

/** A short uppercase clause pulled from an ASPECT_RULINGS sentence: the
 * first clause (up to the first period), capped at four words. Formulaic by
 * design, so every culture x kind pairing gets a label without hand-authored
 * per-pair copy. */
export function shortRulingClause(ruling: string, maxWords = 4): string {
  const firstClause = ruling.split(".")[0] ?? ruling;
  const words = firstClause.trim().split(/\s+/).slice(0, maxWords);
  return words.join(" ").toUpperCase();
}

/** "2026-08-11" in UTC, used to key the day's FeedbackRow and permissions
 * seed so the id matches the calendar day the ephemeris rail is pinned to. */
export function isoDateUtc(date: Date): string {
  return `${date.getUTCFullYear()}-${pad2(date.getUTCMonth() + 1)}-${pad2(date.getUTCDate())}`;
}

export function capFirst(s: string): string {
  return s.length === 0 ? s : s[0]!.toUpperCase() + s.slice(1);
}
