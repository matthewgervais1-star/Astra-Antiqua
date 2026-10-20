import { PLANETS, type Culture, type Planet } from "@/data/cultures";
import { DEITY_MATRIX } from "@/data/deities";
import {
  computeAspects,
  longitudeToSign,
  type Aspect,
  type Longitude,
  type ZodiacSign,
} from "@/data/sampleChart";
import {
  ASPECT_REFLECTIONS,
  PLANET_DOMAINS,
  getPairTheme,
} from "@/data/interpretations";
import { PLANET_IN_SIGN } from "@/data/planetInSign";
import { ASPECT_VERBS } from "@/data/aspectVerbs";
import { getDeityInscription } from "@/data/deityInscriptions";

export interface PlanetPlacement {
  planet: Planet;
  longitude: Longitude;
  sign: ZodiacSign;
  degreeInSign: number;
  deityName: string;
  deityEpithet: string;
  domain: string;
  culturalLine: string;
  signReading: string;
}

export interface AspectReading extends Aspect {
  deityA: string;
  deityB: string;
  verbLine: string;
  pairTheme: string;
  culturalReflection: string;
}

export interface Reading {
  culture: Culture;
  placements: readonly PlanetPlacement[];
  aspects: readonly AspectReading[];
  summary: string;
}


export const SUMMARY_INTRO: Readonly<Record<Culture, string>> = {
  egypt: "The barque of Ra has been read for the moment of your arrival in the world.",
  greece: "The Hellenistic chart for the moment of your birth has been cast in the names of Olympus.",
  canaan: "The divine council convenes around the hour of your naming.",
  carthage: "The Council's roll is opened to the day you were born into the city.",
  rome: "The chart has been read under Roman auspices for the hour of your birth.",
};

/** The summary's second sentence, by which kind of angle the chart holds more of. */
export const SUMMARY_TONES = {
  tension: "The hard angles outweigh the soft ones. This is a chart read as effort: what it gives, you earn.",
  harmony: "The soft angles outweigh the hard ones. Much of what this chart promises comes without a fight.",
  even: "Hard angles and soft fall in even number. The chart neither spares you nor blocks you; it leaves the work to you.",
} as const;

/** The closing line on conjunctions: none, one, or a count of them. */
export const SUMMARY_FUSED = {
  one: " One pair of powers sits fused, a single doubled force.",
  many: (count: number): string => ` ${count} pairs of powers sit fused, each a single doubled force.`,
} as const;

export function buildReading(
  culture: Culture,
  chart: Readonly<Record<Planet, Longitude>>,
): Reading {
  const placements: PlanetPlacement[] = PLANETS.map((planet) => {
    const longitude = chart[planet];
    const { sign, degree } = longitudeToSign(longitude);
    const deity = DEITY_MATRIX[culture][planet];
    const culturalLine = getDeityInscription(culture, planet);
    return {
      planet,
      longitude,
      sign,
      degreeInSign: degree,
      deityName: deity.name,
      deityEpithet: deity.epithet,
      domain: PLANET_DOMAINS[planet],
      culturalLine,
      signReading: PLANET_IN_SIGN[planet][sign],
    };
  });

  const aspectsRaw = computeAspects(chart);
  const aspects: AspectReading[] = aspectsRaw.map((a) => {
    const deityA = DEITY_MATRIX[culture][a.a];
    const deityB = DEITY_MATRIX[culture][a.b];
    const verb = ASPECT_VERBS[culture][a.kind];
    return {
      ...a,
      deityA: deityA.name,
      deityB: deityB.name,
      verbLine: `${deityA.name} ${verb} ${deityB.name}.`,
      pairTheme: getPairTheme(a.a, a.b),
      culturalReflection: ASPECT_REFLECTIONS[culture][a.kind],
    };
  });

  const harmonyCount = aspects.filter((a) => a.kind === "trine" || a.kind === "sextile").length;
  const tensionCount = aspects.filter((a) => a.kind === "square" || a.kind === "opposition").length;
  const conjunctionCount = aspects.filter((a) => a.kind === "conjunction").length;
  const tone =
    tensionCount > harmonyCount
      ? SUMMARY_TONES.tension
      : harmonyCount > tensionCount
        ? SUMMARY_TONES.harmony
        : SUMMARY_TONES.even;
  const conjunctionLine =
    conjunctionCount === 0
      ? ""
      : conjunctionCount === 1
        ? SUMMARY_FUSED.one
        : SUMMARY_FUSED.many(conjunctionCount);
  const summary = `${SUMMARY_INTRO[culture]} ${tone}${conjunctionLine}`;

  return {
    culture,
    placements,
    aspects,
    summary,
  };
}
