import { EGYPT_GLYPHS } from "@/components/glyphs/paths/egypt";
import { GREECE_GLYPHS } from "@/components/glyphs/paths/greece";
import { CANAAN_GLYPHS } from "@/components/glyphs/paths/canaan";
import { CARTHAGE_GLYPHS } from "@/components/glyphs/paths/carthage";
import { ROME_GLYPHS } from "@/components/glyphs/paths/rome";
import type { Glyph } from "@/components/glyphs/types";
import type { Culture, Planet } from "@/data/cultures";

export type { Glyph } from "@/components/glyphs/types";

/**
 * Hand-drawn per-culture deity iconography, seven per pantheon. The three
 * received bodies (Uranus, Neptune, Pluto) have no hand-drawn glyph yet, so
 * this is a Partial record; DeityGlyph falls back to the classical planet
 * symbol for whatever a culture's set does not carry.
 */
export const GLYPHS: Readonly<Record<Culture, Readonly<Partial<Record<Planet, Glyph>>>>> = {
  egypt: EGYPT_GLYPHS,
  greece: GREECE_GLYPHS,
  canaan: CANAAN_GLYPHS,
  carthage: CARTHAGE_GLYPHS,
  rome: ROME_GLYPHS,
};

export { DeityGlyph } from "@/components/glyphs/DeityGlyph";
