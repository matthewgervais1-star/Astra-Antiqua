import type { Glyph } from "@/components/glyphs/types";
import type { Planet } from "@/data/cultures";

const VB: readonly [number, number] = [64, 64];

/**
 * Punic / Carthaginian glyphs from the votive stelae and Punic inscriptions:
 *   Semes        the winged solar disc (Egyptianized Punic form)
 *   Tanit        the Sign of Tanit (triangle, bar, disc) -- the central Punic symbol
 *   Sakun        the Punic caduceus (staff, disc, paired volutes)
 *   Astarte      the eight-pointed star with crescent (the astral pair)
 *   Melqart      the club of Melqart / Heracles
 *   Baal Hammon  the enthroned god crowned with ram's horns
 *   Baal Hammon  (Ancient) the betyl, his aniconic standing stone
 */
export const CARTHAGE_GLYPHS: Readonly<Partial<Record<Planet, Glyph>>> = {
  sun: {
    label: "Semes",
    viewBox: VB,
    d: "M 32 24 A 7 7 0 1 0 32 38 A 7 7 0 1 0 32 24 M 25 31 L 6 28 L 8 33 L 6 36 M 39 31 L 58 28 L 56 33 L 58 36",
  },
  moon: {
    label: "Tanit",
    viewBox: VB,
    d: "M 22 54 L 32 32 L 42 54 Z M 14 30 H 50 M 14 30 L 11 26 M 50 30 L 53 26 M 32 14 A 6 6 0 1 0 32 26 A 6 6 0 1 0 32 14",
  },
  mercury: {
    label: "Sakun",
    viewBox: VB,
    d: "M 32 14 V 52 M 28 14 A 4 4 0 1 0 36 14 A 4 4 0 1 0 28 14 M 32 24 C 25 24 25 31 32 31 C 39 31 39 24 32 24 M 32 34 C 26 34 26 40 32 40 C 38 40 38 34 32 34",
  },
  venus: {
    label: "Astarte",
    viewBox: VB,
    d: "M 32 12 V 48 M 14 30 H 50 M 19 17 L 45 43 M 45 17 L 19 43 M 26 56 A 6 6 0 0 0 38 56",
  },
  mars: {
    label: "Melqart",
    viewBox: VB,
    d: "M 16 50 L 42 20 M 42 20 Q 52 8 50 22 Q 47 26 42 20 M 16 50 L 20 48 M 18 46 L 22 44",
  },
  jupiter: {
    label: "Baal Hammon",
    viewBox: VB,
    d: "M 20 34 H 44 V 54 H 20 Z M 24 34 V 26 H 40 V 34 M 28 26 Q 21 23 25 17 Q 27 20 29 24 M 36 26 Q 43 23 39 17 Q 37 20 35 24",
  },
  saturn: {
    label: "Baal Hammon (Ancient)",
    viewBox: VB,
    d: "M 24 54 L 25 26 Q 32 16 39 26 L 40 54 M 19 54 H 45 M 25 40 H 39",
  },
};
