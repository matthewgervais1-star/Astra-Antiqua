import { PLANETS, PLANET_LABELS, type Culture, type Planet } from "@/data/cultures";
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
  SIGN_REGISTERS,
  getPairTheme,
} from "@/data/interpretations";
import { PLANET_IN_SIGN } from "@/data/planetInSign";
import { ASPECT_VERBS } from "@/data/aspectVerbs";

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

/**
 * Per-culture placement-line formatter. Each pantheon gets its own
 * inscriptional cadence: Egypt as funerary barque, Greece as Hellenistic
 * prose, Canaan as Ugaritic-tablet council voice, Carthage as Punic stele
 * with a fire-closing clause.
 */
type PlacementFormatter = (args: {
  deityName: string;
  registerImage: string;
  degree: number;
  sign: string;
}) => string;

function deg(n: number): string {
  return `${n.toFixed(0)}°`;
}

const PLACEMENT_FORMATS: Readonly<Record<Culture, PlacementFormatter>> = {
  // Funerary / barque register: the deity carried across its place in the sky.
  egypt: ({ deityName, registerImage, degree, sign }) =>
    `${deityName} crosses ${registerImage}, at ${deg(degree)} ${sign}.`,

  // Spare Hellenistic prose: subject, place, position.
  greece: ({ deityName, registerImage, degree, sign }) =>
    `${deityName} stands in ${registerImage}, at ${deg(degree)} ${sign}.`,

  // Council voice, in the cadence of Ugaritic tablet poetry: a seated god,
  // declared by the assembly.
  canaan: ({ deityName, registerImage, degree, sign }) =>
    `${deityName} is seated in ${registerImage}, at ${deg(degree)} ${sign}, and the council marks it so.`,

  // Punic stele register, closing with the fire of Melqart's pyre.
  carthage: ({ deityName, registerImage, degree, sign }) =>
    `${deityName} burns in ${registerImage}, at ${deg(degree)} ${sign}.`,

  // Roman augural register: the god holds its quarter, the college reads it.
  rome: ({ deityName, registerImage, degree, sign }) =>
    `${deityName} holds ${registerImage}, at ${deg(degree)} ${sign}, and the augurs read it true.`,
};

const SUMMARY_INTRO: Readonly<Record<Culture, string>> = {
  egypt: "The barque of Ra has been read for the moment of your arrival in the world.",
  greece: "The Hellenistic chart for the moment of your birth has been cast in the names of Olympus.",
  canaan: "The divine council convenes around the hour of your naming.",
  carthage: "The Council's roll is opened to the day you were born into the city.",
  rome: "The chart has been read under Roman auspices for the hour of your birth.",
};

export function buildReading(
  culture: Culture,
  chart: Readonly<Record<Planet, Longitude>>,
): Reading {
  const placements: PlanetPlacement[] = PLANETS.map((planet) => {
    const longitude = chart[planet];
    const { sign, degree } = longitudeToSign(longitude);
    const deity = DEITY_MATRIX[culture][planet];
    const culturalLine = PLACEMENT_FORMATS[culture]({
      deityName: deity.name,
      registerImage: SIGN_REGISTERS[sign],
      degree,
      sign,
    });
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
      ? "The hard angles outweigh the soft ones. This is a chart read as effort: what it gives, you earn."
      : harmonyCount > tensionCount
        ? "The soft angles outweigh the hard ones. Much of what this chart promises comes without a fight."
        : "Hard angles and soft fall in even number. The chart neither spares you nor blocks you; it leaves the work to you.";
  const conjunctionLine =
    conjunctionCount === 0
      ? ""
      : conjunctionCount === 1
        ? " One pair of powers sits fused, a single doubled force."
        : ` ${conjunctionCount} pairs of powers sit fused, each a single doubled force.`;
  const summary = `${SUMMARY_INTRO[culture]} ${tone}${conjunctionLine}`;

  return {
    culture,
    placements,
    aspects,
    summary,
  };
}

export function describePlanet(planet: Planet): string {
  return PLANET_LABELS[planet];
}
