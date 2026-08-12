import type { ZodiacSign } from "@/data/sampleChart";

/**
 * The universal, culture-neutral epithet for each sign, used everywhere the
 * horizon pages need a poetic noun instead of the Latin sign name (season
 * headlines, week/year prose). Fixed and finite; every culture's prose reads
 * through the same twelve nouns.
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
