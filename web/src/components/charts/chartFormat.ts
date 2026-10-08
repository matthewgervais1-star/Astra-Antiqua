import type { ZodiacSign } from "@/data/sampleChart";

/**
 * Three-letter mono abbreviations for the zodiac signs, used in the charts
 * instrument's placement table (BODY / LONG / SIGN column). Web's one sign
 * table: the week shorthand (lib/weekReading.ts) and the home rail
 * (components/home/format.ts) print these values, and Android's
 * ZodiacSign.abbr is pinned to them by ZodiacSignAbbrTest.
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
 * The sign's mythic-figure phrase, used in the placement headline:
 * "YOUR RA IN THE FISHES".
 */
export const SIGN_PHRASE: Readonly<Record<ZodiacSign, string>> = {
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

/** "13°22′" from a 0-30 degree-in-sign float. */
export function formatDegMin(degreeInSign: number): string {
  const totalMinutes = Math.round(degreeInSign * 60);
  const deg = Math.min(29, Math.floor(totalMinutes / 60));
  const min = Math.min(59, totalMinutes - deg * 60);
  return `${String(deg).padStart(2, "0")}°${String(min).padStart(2, "0")}′`;
}

/** "Tyre" out of "Tyre, Lebanon"; falls back to the whole label. */
export function cityShort(cityLabel: string): string {
  const first = cityLabel.split(",")[0]?.trim();
  return (first && first.length > 0 ? first : cityLabel).toUpperCase();
}
