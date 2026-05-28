import type { Culture, Planet } from "@/data/cultures";
import { DEITY_MATRIX } from "@/data/deities";
import type { TransitAspect } from "@/lib/transits";
import { ASPECT_REFLECTIONS } from "@/data/interpretations";
import type { AspectKind } from "@/data/sampleChart";

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

export interface TransitReadingLine {
  verbLine: string;
  reflection: string;
  transitDeityName: string;
  natalDeityName: string;
  transitPlanet: Planet;
  natalPlanet: Planet;
  kind: AspectKind;
  orb: number;
}

export function buildTransitLine(
  culture: Culture,
  t: TransitAspect,
): TransitReadingLine {
  const deityT = DEITY_MATRIX[culture][t.transit];
  const deityN = DEITY_MATRIX[culture][t.natal];
  const verb = ASPECT_VERBS[culture][t.kind];
  return {
    verbLine: `${deityT.name} ${verb} your ${deityN.name}.`,
    reflection: ASPECT_REFLECTIONS[culture][t.kind],
    transitDeityName: deityT.name,
    natalDeityName: deityN.name,
    transitPlanet: t.transit,
    natalPlanet: t.natal,
    kind: t.kind,
    orb: t.orb,
  };
}
