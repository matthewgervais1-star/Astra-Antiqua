import type { Glyph } from "@/components/glyphs/types";
import type { Planet } from "@/data/cultures";

const VB: readonly [number, number] = [64, 64];

export const CANAAN_GLYPHS: Readonly<Record<Planet, Glyph>> = {
  // Shapash: solar disc with horizontally drawn-out wings, Northwest Semitic style.
  sun: {
    label: "Shapash",
    viewBox: VB,
    d: "M 32 24 A 6 6 0 1 0 32 36 A 6 6 0 1 0 32 24 M 4 30 L 26 32 L 4 34 M 60 30 L 38 32 L 60 34",
  },

  // Yarikh: shallow lunar boat resting above two cuneiform wedges.
  moon: {
    label: "Yarikh",
    viewBox: VB,
    d: "M 12 28 C 16 42 48 42 52 28 M 24 46 L 28 52 L 20 52 Z M 40 46 L 44 52 L 36 52 Z",
  },

  // Kothar-wa-Khasis: smith's hammer above the anvil, the craftsman's mark.
  mercury: {
    label: "Kothar-wa-Khasis",
    viewBox: VB,
    d: "M 16 14 H 48 V 22 H 16 Z M 32 22 V 42 M 14 46 H 50 L 46 56 H 18 Z",
  },

  // Astarte: the eight-pointed star of the morning and evening light.
  venus: {
    label: "Astarte",
    viewBox: VB,
    d: "M 32 8 V 56 M 8 32 H 56 M 14 14 L 50 50 M 14 50 L 50 14",
  },

  // Resheph: drawn bow with the plague-arrow nocked to fly.
  mars: {
    label: "Resheph",
    viewBox: VB,
    d: "M 12 14 A 28 28 0 0 1 12 50 M 12 14 L 12 50 M 32 32 H 56 M 56 32 L 50 28 M 56 32 L 50 36",
  },

  // Baal Hadad: lightning bolt held in the upraised arm of the storm.
  jupiter: {
    label: "Baal Hadad",
    viewBox: VB,
    d: "M 36 8 L 28 26 L 36 26 L 26 50 L 38 30 L 30 30 L 40 8 Z M 16 38 L 24 34 L 24 44",
  },

  // El: bull-head with stylized horns, the father at the council mountain.
  saturn: {
    label: "El",
    viewBox: VB,
    d: "M 22 26 C 16 22 10 22 8 30 C 10 38 18 38 22 32 M 42 26 C 48 22 54 22 56 30 C 54 38 46 38 42 32 M 20 32 H 44 V 48 C 44 52 38 54 32 54 C 26 54 20 52 20 48 Z",
  },
};
