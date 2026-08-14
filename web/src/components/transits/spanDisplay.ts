import type { Culture, Planet } from "@/data/cultures";
import { PLANET_SYMBOLS } from "@/data/cultures";
import { DEITY_MATRIX } from "@/data/deities";
import type { AspectKind, ZodiacSign } from "@/data/sampleChart";
import type { TransitSpan } from "@/lib/transitSpans";

/**
 * Display helpers shared by the /transits index and /transits/[id] reading:
 * the pure formatting and small derivations that turn a TransitSpan (and the
 * culture reading it) into the strings the mock spells out literally. No
 * component state lives here, only functions of span + culture + now.
 */

export type PointPlanetKey = "sun" | "moon";

export function isPointPlanetKey(key: string): key is PointPlanetKey {
  return key === "sun" || key === "moon";
}

export const ASPECT_KIND_GLYPH: Readonly<Record<AspectKind, string>> = {
  conjunction: "☌",
  sextile: "⚹",
  square: "□",
  trine: "△",
  opposition: "☍",
};

/** sun/moon show the natal point's own deity name; asc/mc show a fixed label. */
export function natalPointLabel(culture: Culture, key: string): string {
  if (isPointPlanetKey(key)) return DEITY_MATRIX[culture][key].name;
  if (key === "asc") return "YOUR RISING";
  if (key === "mc") return "YOUR MIDHEAVEN";
  return key.toUpperCase();
}

/**
 * A span's tone for the leaves/votive banks: trine and sextile read as ease,
 * square and opposition as tension. A conjunction reads as ease only for
 * Jupiter (the one slow body whose union is traditionally a gift); every
 * other slow body's conjunction reads as tension, since a union with Saturn
 * or an outer is a pressure, not a favor.
 */
export function spanTone(span: Pick<TransitSpan, "aspectKind" | "transitPlanet">): "tension" | "ease" {
  if (span.aspectKind === "trine" || span.aspectKind === "sextile") return "ease";
  if (span.aspectKind === "square" || span.aspectKind === "opposition") return "tension";
  return span.transitPlanet === "jupiter" ? "ease" : "tension";
}

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

const MONTHS_SHORT = [
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

export function monthYear(d: Date): string {
  return `${MONTHS_SHORT[d.getMonth()] ?? "JAN"} ${d.getFullYear()}`;
}

const MONTHS_FULL = [
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

/**
 * Prose forms. The uppercase labels above are for mono chrome; inside a
 * Spectral sentence they read as shouting, so composed paragraphs use these.
 */
export function monthYearProse(d: Date): string {
  return `${MONTHS_FULL[d.getMonth()] ?? "January"} ${d.getFullYear()}`;
}

export function signPhraseProse(sign: ZodiacSign): string {
  const phrase = SIGN_PHRASES[sign];
  return phrase
    .toLowerCase()
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join("-");
}

export function monthDay(d: Date): string {
  return `${MONTHS_SHORT[d.getMonth()] ?? "JAN"} ${d.getDate()}`;
}

/** DEC-FEB winter, MAR-MAY spring, JUN-AUG summer, SEP-NOV autumn. */
export function seasonWord(d: Date): string {
  const m = d.getMonth();
  if (m === 11 || m === 0 || m === 1) return "WINTER";
  if (m >= 2 && m <= 4) return "SPRING";
  if (m >= 5 && m <= 7) return "SUMMER";
  return "AUTUMN";
}

/** "03°44′" from a fractional degree-within-sign. */
export function formatDegMin(degree: number): string {
  let wholeDeg = Math.max(0, Math.floor(degree));
  let minutes = Math.round((degree - Math.floor(degree)) * 60);
  if (minutes >= 60) {
    minutes = 0;
    wholeDeg += 1;
  }
  const dd = String(wholeDeg).padStart(2, "0");
  const mm = String(minutes).padStart(2, "0");
  return `${dd}°${mm}′`;
}

const ORDINAL_WORDS = [
  "first",
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
  "thirteenth",
  "fourteenth",
  "fifteenth",
  "sixteenth",
  "seventeenth",
  "eighteenth",
  "nineteenth",
  "twentieth",
  "twenty-first",
  "twenty-second",
  "twenty-third",
  "twenty-fourth",
  "twenty-fifth",
  "twenty-sixth",
  "twenty-seventh",
  "twenty-eighth",
  "twenty-ninth",
  "thirtieth",
] as const;

/** "the third degree" for 3.7°: the whole-degree band the body first held.
 *  Index 0 is duplicated onto "first" so a body found at 0.x° still reads. */
export function ordinalWord(degree: number): string {
  const idx = Math.max(0, Math.min(30, Math.floor(degree)));
  return ORDINAL_WORDS[idx] ?? "first";
}

const SMALL_NUMBER_WORDS = ["zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine"] as const;

export function smallNumberWord(n: number): string {
  if (n >= 0 && n < SMALL_NUMBER_WORDS.length) return SMALL_NUMBER_WORDS[n] ?? String(n);
  return String(n);
}

export function capitalize(s: string): string {
  return s.length === 0 ? s : `${s[0]!.toUpperCase()}${s.slice(1)}`;
}

/** Whole-sign house (1-12) of a point's longitude, from the natal ascendant. */
export function wholeSignHouse(pointLongitude: number, ascendantLongitude: number): number {
  const ascSign = Math.floor((((ascendantLongitude % 360) + 360) % 360) / 30);
  const pointSign = Math.floor((((pointLongitude % 360) + 360) % 360) / 30);
  return ((pointSign - ascSign + 12) % 12) + 1;
}

/**
 * The fixed house -> group-index partition behind every CULTURE_VOICES
 * houseGroups bank, which is always authored in the order work-and-substance,
 * home-and-kin, words-and-errands, inner-court.
 */
export function houseGroupIndex(house: number): 0 | 1 | 2 | 3 {
  if (house === 2 || house === 6 || house === 10) return 0;
  if (house === 4 || house === 8) return 1;
  if (house === 3 || house === 7 || house === 11) return 2;
  return 3;
}

/** 0-1 fraction of the span elapsed as of `now`, clamped. */
export function elapsedFraction(span: TransitSpan, now: Date): number {
  const total = span.end.getTime() - span.start.getTime();
  if (total <= 0) return 1;
  const elapsed = now.getTime() - span.start.getTime();
  return Math.min(1, Math.max(0, elapsed / total));
}

/** "FIRST EXACT PASS DONE · TWO RETURNS REMAIN · RELEASES APR 2028" */
export function passStatusLine(span: TransitSpan, now: Date): string {
  const first = span.passes[0] ?? span.start;
  const firstDone = first.getTime() <= now.getTime();
  const left = firstDone ? "FIRST EXACT PASS DONE" : `FIRST PASS ${monthDay(first)}`;
  const remaining = span.passes.slice(1).filter((p) => p.getTime() > now.getTime()).length;
  const returnWord = remaining === 1 ? "RETURN" : "RETURNS";
  return `${left} · ${remaining} ${returnWord} REMAIN · RELEASES ${monthYear(span.end)}`;
}

/** The "first exact meeting has passed, two more come with the
 *  retrogradations" sentence for the WHERE IT BEGINS paragraph. Avoids a
 *  gendered pronoun since the transiting deity is not always male. */
export function passNarrative(span: TransitSpan, now: Date): string {
  const total = span.passes.length;
  const doneCount = span.passes.filter((p) => p.getTime() <= now.getTime()).length;
  if (total <= 1) {
    return doneCount >= 1
      ? "The one exact meeting has already passed."
      : "The one exact meeting is still ahead.";
  }
  const remainingAfterFirst = span.passes.slice(1).filter((p) => p.getTime() > now.getTime()).length;
  if (doneCount === 0) {
    return `The first exact meeting is still ahead. ${capitalize(smallNumberWord(total - 1))} more come after it, across the retrogradations.`;
  }
  if (remainingAfterFirst === 0) {
    return "The first exact meeting has passed, and no further return remains.";
  }
  return `The first exact meeting has passed. ${capitalize(smallNumberWord(remainingAfterFirst))} more come with the retrogradations.`;
}

/** "☉ APOLLO 05°12′ TAURUS" (sun/moon) or "YOUR RISING 12°34′ LEO" (asc/mc). */
export function natalDegreeSide(culture: Culture, span: Pick<TransitSpan, "natalKey">, sign: ZodiacSign, degree: number): string {
  if (isPointPlanetKey(span.natalKey)) {
    const planet: Planet = span.natalKey;
    return `YOUR NATAL ${PLANET_SYMBOLS[planet]} ${DEITY_MATRIX[culture][planet].name.toUpperCase()} ${formatDegMin(degree)} ${sign.toUpperCase()}`;
  }
  return `${natalPointLabel(culture, span.natalKey)} ${formatDegMin(degree)} ${sign.toUpperCase()}`;
}
