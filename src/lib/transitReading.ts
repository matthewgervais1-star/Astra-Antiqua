import type { Culture, Planet } from "@/data/cultures";
import { DEITY_MATRIX } from "@/data/deities";
import type { TransitAspect } from "@/lib/transits";
import { ASPECT_REFLECTIONS } from "@/data/interpretations";
import { ASPECT_VERBS } from "@/data/aspectVerbs";
import type { AspectKind } from "@/data/sampleChart";

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
