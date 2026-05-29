import type { Planet } from "@/data/cultures";
import {
  ZODIAC_SIGNS,
  longitudeToSign,
  type Longitude,
  type ZodiacSign,
} from "@/data/sampleChart";

/**
 * Whole-sign houses: the oldest Hellenistic house system, and the historically
 * correct choice for ancient astrology. The entire sign rising on the eastern
 * horizon is the 1st house; each following sign is the next house in order.
 * Unlike quadrant systems (Placidus, etc.) the cusps fall on 0 degrees of each
 * sign, so a planet's house depends only on its sign relative to the
 * Ascendant's sign. This also degrades gracefully when the birth time is
 * approximate: only the Ascendant's *sign* matters, not its exact degree.
 */

export interface HousePosition {
  /** 1 through 12. */
  house: number;
  /** The whole sign occupying this house. */
  sign: ZodiacSign;
}

export interface WholeSignHouses {
  ascendantSign: ZodiacSign;
  ascendantSignIndex: number;
  /** Houses 1..12 in order; index 0 is the 1st house. */
  houses: readonly HousePosition[];
}

function indexOfSign(sign: ZodiacSign): number {
  const idx = ZODIAC_SIGNS.indexOf(sign);
  return idx < 0 ? 0 : idx;
}

/** Build the twelve whole-sign houses from the Ascendant longitude. */
export function computeWholeSignHouses(ascendant: Longitude): WholeSignHouses {
  const { sign } = longitudeToSign(ascendant);
  const ascendantSignIndex = indexOfSign(sign);
  const houses: HousePosition[] = [];
  for (let h = 0; h < 12; h += 1) {
    const signIdx = (ascendantSignIndex + h) % 12;
    houses.push({ house: h + 1, sign: ZODIAC_SIGNS[signIdx] ?? "Aries" });
  }
  return { ascendantSign: sign, ascendantSignIndex, houses };
}

/** The whole-sign house (1..12) a given zodiac sign falls in for this chart. */
export function houseOfSign(sign: ZodiacSign, ascendantSignIndex: number): number {
  const idx = indexOfSign(sign);
  return ((idx - ascendantSignIndex + 12) % 12) + 1;
}

/** The whole-sign house (1..12) a given ecliptic longitude falls in. */
export function houseOfLongitude(
  longitude: Longitude,
  ascendantSignIndex: number,
): number {
  const { sign } = longitudeToSign(longitude);
  return houseOfSign(sign, ascendantSignIndex);
}

/** Map every planet in a chart to its whole-sign house. */
export function planetHouses(
  chart: Readonly<Record<Planet, Longitude>>,
  ascendantSignIndex: number,
): Record<Planet, number> {
  const out = {} as Record<Planet, number>;
  for (const planet of Object.keys(chart) as Planet[]) {
    out[planet] = houseOfLongitude(chart[planet], ascendantSignIndex);
  }
  return out;
}
