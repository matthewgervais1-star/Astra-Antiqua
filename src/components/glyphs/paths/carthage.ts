import type { Glyph } from "@/components/glyphs/types";
import type { Planet } from "@/data/cultures";

const VB: readonly [number, number] = [64, 64];

export const CARTHAGE_GLYPHS: Readonly<Record<Planet, Glyph>> = {
  // Semes: solar disc with the horizontal arms of the Tanit symbol extending outward.
  sun: {
    label: "Semes",
    viewBox: VB,
    d: "M 32 16 A 10 10 0 1 0 32 36 A 10 10 0 1 0 32 16 M 14 40 H 50 M 4 38 L 14 40 L 4 42 M 60 38 L 50 40 L 60 42",
  },

  // Tanit: the canonical Tanit-sign, disc above the bar, triangle to the ground.
  moon: {
    label: "Tanit",
    viewBox: VB,
    d: "M 32 6 A 6 6 0 1 0 32 18 A 6 6 0 1 0 32 6 M 12 22 H 52 M 12 22 L 14 18 M 52 22 L 50 18 M 18 22 L 32 58 L 46 22 Z",
  },

  // Sakun: angular Punic caduceus, the staff of the maritime guide.
  mercury: {
    label: "Sakun",
    viewBox: VB,
    d: "M 32 10 V 54 M 24 16 L 32 24 L 40 16 M 24 32 L 32 40 L 40 32 M 22 16 L 16 10 M 42 16 L 48 10",
  },

  // Astarte: eight-rayed Punic star above the Tanit triangular base.
  venus: {
    label: "Astarte",
    viewBox: VB,
    d: "M 32 16 L 36 26 L 46 26 L 38 32 L 42 42 L 32 36 L 22 42 L 26 32 L 18 26 L 28 26 Z M 22 54 H 42 L 40 50 H 24 Z",
  },

  // Melqart: hero's club crossing the Tyrian murex shell of the mother city.
  mars: {
    label: "Melqart",
    viewBox: VB,
    d: "M 22 8 L 14 14 L 44 50 L 52 50 L 46 42 Z M 12 36 A 8 8 0 1 0 12 52 A 8 8 0 1 0 12 36 M 12 36 V 28 M 6 36 L 2 30 M 18 36 L 22 30",
  },

  // Baal Hammon (Jupiter aspect): the enthroned sky-sovereign with the solar disc above.
  jupiter: {
    label: "Baal Hammon",
    viewBox: VB,
    d: "M 18 32 H 46 V 56 H 18 Z M 22 32 V 24 H 42 V 32 M 32 8 A 6 6 0 1 0 32 20 A 6 6 0 1 0 32 8 M 14 32 H 18 M 46 32 H 50",
  },

  // Baal Hammon (Saturn aspect): the same throne under the agricultural crescent.
  saturn: {
    label: "Baal Hammon (Ancient)",
    viewBox: VB,
    d: "M 18 32 H 46 V 56 H 18 Z M 22 32 V 24 H 42 V 32 M 38 14 A 8 8 0 1 0 26 14 A 5 5 0 1 1 38 14 M 14 32 H 18 M 46 32 H 50",
  },
};
