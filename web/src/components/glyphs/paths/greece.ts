import type { Glyph } from "@/components/glyphs/types";
import type { Planet } from "@/data/cultures";

const VB: readonly [number, number] = [64, 64];

/**
 * Greek glyphs, each the deity's classical attribute:
 *   Apollo     the lyre
 *   Artemis    the hunting bow with nocked arrow
 *   Hermes     the caduceus (winged staff, twin serpents)
 *   Aphrodite  the scallop shell (born of sea-foam)
 *   Ares       the Corinthian helmet
 *   Zeus       the keraunos (thunderbolt)
 *   Cronus     the harpe (sickle-sword)
 */
export const GREECE_GLYPHS: Readonly<Partial<Record<Planet, Glyph>>> = {
  sun: {
    label: "Apollo",
    viewBox: VB,
    d: "M 24 44 Q 20 28 26 14 M 40 44 Q 44 28 38 14 M 24 15 H 40 M 28 17 V 42 M 32 17 V 44 M 36 17 V 42 M 24 44 Q 32 50 40 44",
  },
  moon: {
    label: "Artemis",
    viewBox: VB,
    d: "M 22 12 Q 42 32 22 52 M 22 12 V 52 M 22 32 H 48 M 48 32 L 42 28 M 48 32 L 42 36",
  },
  mercury: {
    label: "Hermes",
    viewBox: VB,
    d: "M 32 14 V 54 M 32 18 Q 23 12 18 17 M 32 18 Q 41 12 46 17 M 32 22 C 25 25 39 31 32 34 C 25 37 39 43 32 46",
  },
  venus: {
    label: "Aphrodite",
    viewBox: VB,
    d: "M 32 50 L 13 30 Q 32 8 51 30 Z M 32 50 L 19 31 M 32 50 L 25 27 M 32 50 L 32 25 M 32 50 L 39 27 M 32 50 L 45 31",
  },
  mars: {
    label: "Ares",
    viewBox: VB,
    d: "M 16 36 Q 16 14 36 14 Q 50 14 50 30 L 50 36 M 16 36 V 46 L 21 46 L 21 38 M 30 14 Q 30 6 46 6 Q 42 12 36 14 M 26 26 H 38",
  },
  jupiter: {
    label: "Zeus",
    viewBox: VB,
    d: "M 32 22 V 42 M 32 22 L 25 10 M 32 22 L 32 7 M 32 22 L 39 10 M 32 42 L 25 54 M 32 42 L 32 57 M 32 42 L 39 54 M 22 32 L 32 27 M 42 32 L 32 37",
  },
  saturn: {
    label: "Cronus",
    viewBox: VB,
    d: "M 12 16 Q 34 12 50 30 Q 54 36 50 42 M 12 16 L 7 23 M 50 42 Q 47 40 47 36",
  },
};
