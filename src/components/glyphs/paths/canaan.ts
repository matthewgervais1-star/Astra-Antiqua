import type { Glyph } from "@/components/glyphs/types";
import type { Planet } from "@/data/cultures";

const VB: readonly [number, number] = [64, 64];

/**
 * Canaanite glyphs from Northwest Semitic iconography:
 *   Shapash            the winged sun disc
 *   Yarikh             the lunar crescent standard on a pole
 *   Kothar-wa-Khasis   the smith's hammer and tongs
 *   Astarte            the eight-pointed star (star of Ishtar / Astarte)
 *   Resheph            the plague-archer's drawn bow with fire
 *   Baal Hadad         the storm-god's triple thunderbolt
 *   El                 the bull-head of "Bull El"
 */
export const CANAAN_GLYPHS: Readonly<Record<Planet, Glyph>> = {
  sun: {
    label: "Shapash",
    viewBox: VB,
    d: "M 32 26 A 6 6 0 1 0 32 38 A 6 6 0 1 0 32 26 M 26 31 Q 14 27 3 31 M 26 35 Q 14 35 5 39 M 38 31 Q 50 27 61 31 M 38 35 Q 50 35 59 39",
  },
  moon: {
    label: "Yarikh",
    viewBox: VB,
    d: "M 18 24 A 15 15 0 0 0 46 24 M 32 27 V 54 M 24 54 H 40",
  },
  mercury: {
    label: "Kothar-wa-Khasis",
    viewBox: VB,
    d: "M 14 16 H 38 V 23 H 14 Z M 26 23 V 50 M 44 16 L 49 50 M 53 16 L 48 50 M 44 16 Q 48.5 12 53 16",
  },
  venus: {
    label: "Astarte",
    viewBox: VB,
    d: "M 32 8 V 56 M 8 32 H 56 M 15 15 L 49 49 M 49 15 L 15 49 M 29 32 A 3 3 0 1 0 35 32 A 3 3 0 1 0 29 32",
  },
  mars: {
    label: "Resheph",
    viewBox: VB,
    d: "M 16 14 Q 38 32 16 50 M 16 14 V 50 M 16 32 H 50 M 50 32 L 44 28 M 50 32 L 44 36 M 54 29 Q 58 32 54 36 Q 52 33 54 29",
  },
  jupiter: {
    label: "Baal Hadad",
    viewBox: VB,
    d: "M 20 20 H 44 M 25 20 L 29 30 L 23 33 L 27 46 M 32 20 L 36 30 L 30 33 L 34 48 M 39 20 L 43 30 L 37 33 L 41 46",
  },
  saturn: {
    label: "El",
    viewBox: VB,
    d: "M 24 28 Q 14 26 14 16 Q 14 12 18 12 M 40 28 Q 50 26 50 16 Q 50 12 46 12 M 24 28 Q 24 46 32 48 Q 40 46 40 28 Z M 27 34 A 1 1 0 1 0 29 34 A 1 1 0 1 0 27 34 M 35 34 A 1 1 0 1 0 37 34 A 1 1 0 1 0 35 34",
  },
};
