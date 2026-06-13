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

function deg(n: number): string {
  return `${n.toFixed(0)}°`;
}

/**
 * Per-culture, per-planet placement verb. The verb carries both the pantheon's
 * register (Egypt voyages the sky-river, Rome commands and reads omens) and the
 * nature of the planet, so the seven placement lines of a chart each read
 * differently instead of repeating one cadence seven times over. Every phrase
 * ends in a preposition so it composes cleanly with any sign register:
 *   `${deity} ${verb} ${register}, at ${degree} ${sign}.`
 */
const PLACEMENT_VERBS: Readonly<Record<Culture, Readonly<Record<Planet, string>>>> = {
  // The gods voyage the river of the sky; the dead king's barque, the scribe's
  // crossing, the king-god's reign.
  egypt: {
    sun: "sails through",
    moon: "drifts through",
    mercury: "crosses through",
    venus: "is adorned in",
    mars: "does battle in",
    jupiter: "reigns over",
    saturn: "endures in",
  },
  // Spare Hellenistic prose, each god in its own clear motion.
  greece: {
    sun: "shines over",
    moon: "moves through",
    mercury: "runs through",
    venus: "rests in",
    mars: "takes arms in",
    jupiter: "presides over",
    saturn: "keeps to",
  },
  // The voice of the divine council, in the cadence of Ugaritic tablet poetry.
  canaan: {
    sun: "rises over",
    moon: "wanders through",
    mercury: "carries word through",
    venus: "is enthroned in",
    mars: "draws the bow in",
    jupiter: "rules over",
    saturn: "keeps the long watch in",
  },
  // Punic register: fire, harbor, the standard raised at sea.
  carthage: {
    sun: "burns over",
    moon: "rides over",
    mercury: "ferries word through",
    venus: "is honored in",
    mars: "raises the standard in",
    jupiter: "reigns over",
    saturn: "keeps the fire in",
  },
  // Roman augural register: the field commanded, the omen read.
  rome: {
    sun: "commands from",
    moon: "rides through",
    mercury: "carries word through",
    venus: "is courted in",
    mars: "holds the line in",
    jupiter: "presides over",
    saturn: "keeps the long watch over",
  },
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
    const culturalLine = `${deity.name} ${PLACEMENT_VERBS[culture][planet]} ${SIGN_REGISTERS[sign]}, at ${deg(degree)} ${sign}.`;
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
