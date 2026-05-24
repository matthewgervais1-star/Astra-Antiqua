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

export interface PlanetPlacement {
  planet: Planet;
  longitude: Longitude;
  sign: ZodiacSign;
  degreeInSign: number;
  deityName: string;
  deityEpithet: string;
  culturalLine: string;
}

export interface AspectReading extends Aspect {
  deityA: string;
  deityB: string;
  line: string;
}

export interface Reading {
  culture: Culture;
  placements: readonly PlanetPlacement[];
  aspects: readonly AspectReading[];
  summary: string;
}

const SIGN_ELEMENTS: Readonly<Record<ZodiacSign, string>> = {
  Aries: "the fields of fire",
  Taurus: "the bull's pasture",
  Gemini: "the wind of the twins",
  Cancer: "the sea cave of the crab",
  Leo: "the lion's noon",
  Virgo: "the gleaning floor",
  Libra: "the balanced scales",
  Scorpio: "the desert at the scorpion's hour",
  Sagittarius: "the archer's high road",
  Capricorn: "the goat's ascent",
  Aquarius: "the poured waters",
  Pisces: "the deep tide",
};

const PLACEMENT_VERBS: Readonly<Record<Culture, string>> = {
  egypt: "stands in",
  greece: "walks in",
  canaan: "takes the seat of",
  carthage: "raises the standard of",
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
};

const SUMMARY_INTRO: Readonly<Record<Culture, string>> = {
  egypt: "The barque of Ra has been read for the moment of your arrival in the world.",
  greece: "The Hellenistic chart for the moment of your birth has been cast in the names of Olympus.",
  canaan: "The divine council convenes around the hour of your naming.",
  carthage: "The Tophet's record turns to the day you came into the city.",
};

export function buildReading(
  culture: Culture,
  chart: Readonly<Record<Planet, Longitude>>,
): Reading {
  const placements: PlanetPlacement[] = PLANETS.map((planet) => {
    const longitude = chart[planet];
    const { sign, degree } = longitudeToSign(longitude);
    const deity = DEITY_MATRIX[culture][planet];
    const placementVerb = PLACEMENT_VERBS[culture];
    const culturalLine = `${deity.name} ${placementVerb} ${SIGN_ELEMENTS[sign]} at ${degree.toFixed(0)}° ${sign}.`;
    return {
      planet,
      longitude,
      sign,
      degreeInSign: degree,
      deityName: deity.name,
      deityEpithet: deity.epithet,
      culturalLine,
    };
  });

  const aspectsRaw = computeAspects(chart);
  const aspects: AspectReading[] = aspectsRaw.map((a) => {
    const deityA = DEITY_MATRIX[culture][a.a];
    const deityB = DEITY_MATRIX[culture][a.b];
    const verb = ASPECT_VERBS[culture][a.kind];
    const line = `${deityA.name} ${verb} ${deityB.name}.`;
    return {
      ...a,
      deityA: deityA.name,
      deityB: deityB.name,
      line,
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
