import type { Planet } from "@/data/cultures";

export type Longitude = number;

export const SAMPLE_CHART: Readonly<Record<Planet, Longitude>> = {
  sun: 15, // 15 degrees Aries
  moon: 135, // 15 degrees Leo (trine to sun)
  mercury: 25, // 25 degrees Aries (conjunct sun)
  venus: 105, // 15 degrees Cancer (square sun)
  mars: 195, // 15 degrees Libra (opposition to sun)
  jupiter: 255, // 15 degrees Sagittarius (trine to sun)
  saturn: 75, // 15 degrees Gemini (sextile to sun)
};

export const ZODIAC_SIGNS = [
  "Aries",
  "Taurus",
  "Gemini",
  "Cancer",
  "Leo",
  "Virgo",
  "Libra",
  "Scorpio",
  "Sagittarius",
  "Capricorn",
  "Aquarius",
  "Pisces",
] as const;
export type ZodiacSign = (typeof ZODIAC_SIGNS)[number];

export function longitudeToSign(longitude: Longitude): { sign: ZodiacSign; degree: number } {
  const normalized = ((longitude % 360) + 360) % 360;
  const signIndex = Math.floor(normalized / 30);
  const sign = ZODIAC_SIGNS[signIndex] ?? "Aries";
  const degree = normalized - signIndex * 30;
  return { sign, degree };
}

export type AspectKind = "conjunction" | "sextile" | "square" | "trine" | "opposition";

export interface Aspect {
  a: Planet;
  b: Planet;
  kind: AspectKind;
  exactAngle: number;
  orb: number;
}

const ASPECT_RULES: ReadonlyArray<{ kind: AspectKind; angle: number; orb: number }> = [
  { kind: "conjunction", angle: 0, orb: 8 },
  { kind: "sextile", angle: 60, orb: 4 },
  { kind: "square", angle: 90, orb: 6 },
  { kind: "trine", angle: 120, orb: 6 },
  { kind: "opposition", angle: 180, orb: 8 },
];

export function computeAspects(chart: Readonly<Record<Planet, Longitude>>): readonly Aspect[] {
  const planets = Object.keys(chart) as Planet[];
  const aspects: Aspect[] = [];
  for (let i = 0; i < planets.length; i += 1) {
    for (let j = i + 1; j < planets.length; j += 1) {
      const a = planets[i];
      const b = planets[j];
      if (!a || !b) continue;
      const la = chart[a];
      const lb = chart[b];
      const raw = Math.abs(la - lb) % 360;
      const angle = raw > 180 ? 360 - raw : raw;
      for (const rule of ASPECT_RULES) {
        const delta = Math.abs(angle - rule.angle);
        if (delta <= rule.orb) {
          aspects.push({ a, b, kind: rule.kind, exactAngle: angle, orb: delta });
          break;
        }
      }
    }
  }
  return aspects;
}
