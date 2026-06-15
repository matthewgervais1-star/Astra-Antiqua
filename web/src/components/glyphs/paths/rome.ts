import type { Glyph } from "@/components/glyphs/types";
import type { Planet } from "@/data/cultures";

const VB: readonly [number, number] = [64, 64];

/**
 * Roman glyphs, each a distinctly Roman attribute (chosen to differ from the
 * Greek forms even where the deity is "the same"):
 *   Sol         the radiate crown of Sol Invictus
 *   Luna        the crescent with the torch she carries
 *   Mercurius   the winged petasos (the traveler's hat), not the caduceus
 *   Venus       the hand mirror (the source of the planet's symbol)
 *   Mars        the legionary scutum and spear
 *   Iuppiter    the aquila, the eagle of the legions
 *   Saturnus    the harvest sickle and a tied sheaf of grain
 */
export const ROME_GLYPHS: Readonly<Record<Planet, Glyph>> = {
  sun: {
    label: "Sol",
    viewBox: VB,
    d: "M 32 23 A 9 9 0 1 0 32 41 A 9 9 0 1 0 32 23 M 32 14 V 20 M 32 44 V 50 M 14 32 H 20 M 44 32 H 50 M 19 19 L 23 23 M 45 19 L 41 23 M 19 45 L 23 41 M 45 45 L 41 41",
  },
  moon: {
    label: "Luna",
    viewBox: VB,
    d: "M 42 16 A 15 15 0 1 0 42 46 A 11 11 0 1 1 42 16 M 16 50 V 30 M 16 30 C 12 26 14 21 16 18 C 18 21 20 26 16 30",
  },
  mercury: {
    label: "Mercurius",
    viewBox: VB,
    d: "M 22 32 Q 22 18 32 18 Q 42 18 42 32 M 16 32 H 48 M 22 28 Q 14 24 10 28 M 42 28 Q 50 24 54 28",
  },
  venus: {
    label: "Venus",
    viewBox: VB,
    d: "M 32 12 A 10 10 0 1 0 32 32 A 10 10 0 1 0 32 12 M 32 32 V 52 M 24 44 H 40",
  },
  mars: {
    label: "Mars",
    viewBox: VB,
    d: "M 20 18 H 32 V 46 H 20 Z M 24.5 32 A 1.5 1.5 0 1 0 27.5 32 A 1.5 1.5 0 1 0 24.5 32 M 38 48 L 50 14 M 50 14 L 45 16 M 50 14 L 49 20",
  },
  jupiter: {
    label: "Iuppiter",
    viewBox: VB,
    d: "M 32 26 L 28 30 L 30 44 L 34 44 L 36 30 Z M 30 30 Q 16 22 6 30 M 34 30 Q 48 22 58 30 M 32 26 Q 30 20 34 21 L 38 23 L 34 24 M 30 44 L 28 50 M 34 44 L 36 50",
  },
  saturn: {
    label: "Saturnus",
    viewBox: VB,
    d: "M 12 18 Q 34 13 50 32 M 12 18 L 7 24 M 24 52 L 28 34 M 30 52 L 30 34 M 36 52 L 32 34 M 22 44 H 38",
  },
};
