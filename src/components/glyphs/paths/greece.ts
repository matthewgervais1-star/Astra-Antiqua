import type { Glyph } from "@/components/glyphs/types";
import type { Planet } from "@/data/cultures";

const VB: readonly [number, number] = [64, 64];

export const GREECE_GLYPHS: Readonly<Record<Planet, Glyph>> = {
  // Apollo: circle of light with eight geometric rays.
  sun: {
    label: "Apollo",
    viewBox: VB,
    d: "M 32 18 A 14 14 0 1 0 32 46 A 14 14 0 1 0 32 18 M 32 6 V 12 M 32 52 V 58 M 6 32 H 12 M 52 32 H 58 M 13 13 L 18 18 M 46 18 L 51 13 M 13 51 L 18 46 M 46 46 L 51 51",
  },

  // Artemis: hunter's bow drawn taut, arrow nocked.
  moon: {
    label: "Artemis",
    viewBox: VB,
    d: "M 16 14 A 26 26 0 0 0 16 50 M 16 14 L 16 50 M 32 32 H 52 M 52 32 L 46 28 M 52 32 L 46 36",
  },

  // Hermes: caduceus, staff with two intertwined coils and small wings.
  mercury: {
    label: "Hermes",
    viewBox: VB,
    d: "M 32 10 V 54 M 32 14 C 26 20 38 26 32 32 C 26 38 38 44 32 50 M 22 14 L 16 10 M 22 14 L 18 18 M 42 14 L 48 10 M 42 14 L 46 18",
  },

  // Aphrodite: hand mirror, circle of beauty above a handle.
  venus: {
    label: "Aphrodite",
    viewBox: VB,
    d: "M 32 14 A 10 10 0 1 0 32 34 A 10 10 0 1 0 32 14 M 32 34 V 54 M 24 50 H 40",
  },

  // Ares: round hoplite shield with spear-haft set behind.
  mars: {
    label: "Ares",
    viewBox: VB,
    d: "M 32 18 A 12 12 0 1 0 32 42 A 12 12 0 1 0 32 18 M 44 18 L 54 8 M 54 8 L 48 10 M 54 8 L 52 14",
  },

  // Zeus: thunderbolt, zigzag of fire descending.
  jupiter: {
    label: "Zeus",
    viewBox: VB,
    d: "M 24 8 L 36 24 L 28 28 L 44 52 L 30 38 L 36 34 L 22 10",
  },

  // Cronus: harvest-scythe, curved blade and long handle.
  saturn: {
    label: "Cronus",
    viewBox: VB,
    d: "M 10 18 C 26 14 44 22 54 38 M 10 18 L 6 24 M 54 38 L 26 56",
  },
};
