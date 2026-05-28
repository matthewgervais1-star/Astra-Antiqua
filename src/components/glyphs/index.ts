import { EGYPT_GLYPHS } from "@/components/glyphs/paths/egypt";
import { GREECE_GLYPHS } from "@/components/glyphs/paths/greece";
import { CANAAN_GLYPHS } from "@/components/glyphs/paths/canaan";
import { CARTHAGE_GLYPHS } from "@/components/glyphs/paths/carthage";
import { ROME_GLYPHS } from "@/components/glyphs/paths/rome";
import type { Glyph } from "@/components/glyphs/types";
import type { Culture, Planet } from "@/data/cultures";

export type { Glyph } from "@/components/glyphs/types";

export const GLYPHS: Readonly<Record<Culture, Readonly<Record<Planet, Glyph>>>> = {
  egypt: EGYPT_GLYPHS,
  greece: GREECE_GLYPHS,
  canaan: CANAAN_GLYPHS,
  carthage: CARTHAGE_GLYPHS,
  rome: ROME_GLYPHS,
};

export function getGlyph(culture: Culture, planet: Planet): Glyph {
  return GLYPHS[culture][planet];
}

export { DeityGlyph } from "@/components/glyphs/DeityGlyph";
