import type { Culture, Planet } from "@/data/cultures";
import { DEITY_MATRIX } from "@/data/deities";
import { SIGN_ABBR3, SIGN_PHRASES, fmt } from "@/strings/formats";
import { longitudeToSign, type Longitude, type ZodiacSign } from "@/data/sampleChart";

/** Pure formatting helpers local to the home route: degree/minute display,
 * three-letter sign codes, the classical sign images used in the long-transit
 * headline, and small date formatters. Nothing here touches React. */

function pad2(n: number): string {
  return Math.trunc(n).toString().padStart(2, "0");
}

/** The /charts placements table's abbreviations, the one table on web (F8). */
export const SIGN3 = SIGN_ABBR3;

/** The classical figure each sign is named for, used in "{DEITY} IN THE
 *  {IMAGE}" headlines ("SATURNUS IN THE RAM"): the one sign-phrase source. */
export const SIGN_IMAGE = SIGN_PHRASES;

export interface LongitudeParts {
  deg: string;
  min: string;
  sign: ZodiacSign;
  sign3: string;
}

/** Degree and minute of a longitude inside its sign, as F5 prints them
 * ("19°08′", "3°37′": degree unpadded, minutes two digits). */
export function formatLongitude(longitude: Longitude): LongitudeParts {
  const { sign, degree } = longitudeToSign(longitude);
  const [deg = "0", rest = "00′"] = fmt("angle.degMin", degree).split("°");
  return { deg, min: rest.replace("′", ""), sign, sign3: SIGN3[sign] };
}

/** An orb as F5 prints it: "2°35′". */
export function formatOrbDegMin(orbDegrees: number): string {
  return fmt("angle.degMin", orbDegrees);
}

/** "OCT 2026" (F3), read in UTC as the home bundle's dates are. */
export function formatMonthYear(date: Date): string {
  return fmt("date.monthYear", date, "UTC");
}

/** "WED 21 OCT 2026" (F1, the UTC day). */
export function dateDayUpper(date: Date): string {
  return fmt("date.day", date, "UTC");
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
