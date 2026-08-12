import type { Culture } from "@/data/cultures";
import type { ZodiacSign } from "@/data/sampleChart";

/**
 * The plain-word sign phrases used in mono microcopy across the forecast
 * ("→ THE RAM", "STATIONS RETROGRADE AT THE BULL"), per the build brief.
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

/** Short per-culture verb phrase for a retrograde station, in institutional register. */
export const STATION_PHRASES: Readonly<Record<Culture, { retrograde: string; direct: string }>> = {
  egypt: {
    retrograde: "turns back to re-count the granary",
    direct: "closes the count and moves the barque forward again",
  },
  greece: {
    retrograde: "turns back to reopen the question",
    direct: "finishes the hearing and walks forward again",
  },
  canaan: {
    retrograde: "turns back to reconvene the council",
    direct: "closes the session and moves forward again",
  },
  carthage: {
    retrograde: "turns back to audit the ledger",
    direct: "closes the books and sails forward again",
  },
  rome: {
    retrograde: "turns back to review the record",
    direct: "closes the census and marches forward again",
  },
};

const SEASON_NAMES = ["WINTER", "SPRING", "SUMMER", "FALL"] as const;

/** Meteorological season (Dec-Feb winter, etc.), used for "THROUGH {SEASON} {YYYY}" mono lines. */
export function seasonOf(date: Date): string {
  const month = date.getMonth(); // 0-11
  const idx = Math.floor(((month + 1) % 12) / 3);
  return SEASON_NAMES[idx] ?? "SPRING";
}

const MONTH_SHORT = [
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

export function monthShort(date: Date): string {
  return MONTH_SHORT[date.getMonth()] ?? "JAN";
}

/** The single initial shown in the 12-month header row above the span bars. */
export function monthInitial(date: Date): string {
  return (MONTH_SHORT[date.getMonth()] ?? "J").charAt(0);
}

export function formatDMonYY(date: Date): string {
  const dd = String(date.getDate()).padStart(2, "0");
  const yy = String(date.getFullYear()).slice(-2);
  return `${dd} ${monthShort(date)} ${yy}`;
}

/** "in November" if this year, "in November 2027" if not. */
export function monthPhrase(date: Date, now: Date): string {
  const monthName = date.toLocaleDateString("en-US", { month: "long" });
  return date.getFullYear() === now.getFullYear() ? `in ${monthName}` : `in ${monthName} ${date.getFullYear()}`;
}
