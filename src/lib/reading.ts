import { PLANETS, PLANET_LABELS, type Culture, type Planet } from "@/data/cultures";
import { DEITY_MATRIX } from "@/data/deities";
import {
  computeAspects,
  longitudeToSign,
  type Aspect,
  type AspectKind,
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
  // Funerary / barque register. Participial "crossing" suggests motion of
  // the solar barque across the daily voyage.
  egypt: ({ deityName, registerImage, degree, sign }) =>
    `${deityName} crossing ${registerImage}, at ${deg(degree)} ${sign}.`,

  // Spare Hellenistic prose: subject, position, location.
  greece: ({ deityName, registerImage, degree, sign }) =>
    `${deityName} at ${deg(degree)} ${sign}, in ${registerImage}.`,

  // Council voice: enthroned + parallel clause, in the cadence of Ugaritic
  // tablet poetry where each line is a stand-alone declaration.
  canaan: ({ deityName, registerImage, degree, sign }) =>
    `${deityName} enthroned in ${registerImage}, at ${deg(degree)} ${sign}; thus the council records it.`,

  // Punic stele inscription: subject, position, then the fire-image closing
  // that imitates votive dedications at the Tophet.
  carthage: ({ deityName, registerImage, degree, sign }) =>
    `${deityName} at ${deg(degree)} ${sign}, set in ${registerImage}; the fire turned toward this name.`,

  // Roman augural register: the field taken, the sign read by the college.
  rome: ({ deityName, registerImage, degree, sign }) =>
    `${deityName} holds the field of ${registerImage}, at ${deg(degree)} ${sign}; so the augurs read the sign.`,
};

const ASPECT_VERBS: Readonly<Record<Culture, Readonly<Record<AspectKind, string>>>> = {
  egypt: {
    conjunction: "joins the barque of",
    sextile: "extends a steady hand to",
    square: "weighs against the heart of",
    trine: "lifts the gaze of",
    opposition: "faces across the river from",
  },
  greece: {
    conjunction: "stands shoulder to shoulder with",
    sextile: "offers fair counsel to",
    square: "challenges",
    trine: "harmonizes with",
    opposition: "stands across the agora from",
  },
  canaan: {
    conjunction: "shares the throne of the council with",
    sextile: "exchanges tribute with",
    square: "draws the bow against",
    trine: "speaks favor over",
    opposition: "convenes the council against",
  },
  carthage: {
    conjunction: "raises the standard alongside",
    sextile: "trades safe passage with",
    square: "raises the hand against",
    trine: "lights the fire alongside",
    opposition: "demands a price of",
  },
  rome: {
    conjunction: "marches under the same eagle as",
    sextile: "treats for alliance with",
    square: "raises the spear against",
    trine: "clasps the right hand of",
    opposition: "stands across the forum from",
  },
};

const SUMMARY_INTRO: Readonly<Record<Culture, string>> = {
  egypt: "The barque of Ra has been read for the moment of your arrival in the world.",
  greece: "The Hellenistic chart for the moment of your birth has been cast in the names of Olympus.",
  canaan: "The divine council convenes around the hour of your naming.",
  carthage: "The Tophet's record turns to the day you were born into the city.",
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
      ? "the lines that challenge outnumber the lines that ease"
      : harmonyCount > tensionCount
        ? "the lines that ease outnumber the lines that challenge"
        : "the lines that challenge and the lines that ease stand in balance";
  const summary = `${SUMMARY_INTRO[culture]} ${aspects.length} principal aspects are recorded; ${tone}.${
    conjunctionCount > 0 ? ` ${conjunctionCount} conjunction${conjunctionCount === 1 ? "" : "s"} mark${conjunctionCount === 1 ? "s" : ""} a doubling of force.` : ""
  }`;

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
