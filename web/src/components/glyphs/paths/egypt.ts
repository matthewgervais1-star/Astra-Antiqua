import type { Glyph } from "@/components/glyphs/types";
import type { Planet } from "@/data/cultures";

const VB: readonly [number, number] = [64, 64];

/**
 * Egyptian glyphs, each based on the deity's canonical iconography:
 *   Ra        solar disc with the rising uraeus (cobra)
 *   Khonsu    the full lunar disc cradled in a crescent (his headdress)
 *   Sebegu    the was-scepter with the angular Set-animal head
 *   Isis      the throne hieroglyph that spells her name
 *   Horus     the Eye of Horus (wedjat)
 *   Amun      the twin-plume crown
 *   Geb       the goose, his name-hieroglyph
 */
export const EGYPT_GLYPHS: Readonly<Partial<Record<Planet, Glyph>>> = {
  sun: {
    label: "Ra",
    viewBox: VB,
    d: "M 32 20 A 12 12 0 1 0 32 44 A 12 12 0 1 0 32 20 M 30.5 32 A 1.5 1.5 0 1 0 33.5 32 A 1.5 1.5 0 1 0 30.5 32 M 32 20 C 31 13 37 11 34 6 C 32.5 8 34 11 35 13",
  },
  moon: {
    label: "Khonsu",
    viewBox: VB,
    d: "M 18 34 A 15 15 0 0 0 46 34 M 32 16 A 10 10 0 1 0 32 36 A 10 10 0 1 0 32 16",
  },
  mercury: {
    label: "Sebegu",
    viewBox: VB,
    d: "M 32 16 V 50 M 32 50 L 27 57 M 32 50 L 37 57 M 32 16 L 30 9 L 33 12 M 32 16 L 37 8",
  },
  venus: {
    label: "Isis",
    viewBox: VB,
    d: "M 22 50 V 14 H 30 V 38 H 42 V 50 Z",
  },
  mars: {
    label: "Horus the Red",
    viewBox: VB,
    d: "M 12 24 Q 28 16 46 23 M 14 30 Q 30 22 48 28 M 16 31 Q 30 41 47 30 M 29 28 A 3 3 0 1 0 35 28 A 3 3 0 1 0 29 28 M 30 39 L 27 49 M 38 33 Q 40 46 31 49",
  },
  jupiter: {
    label: "Amun",
    viewBox: VB,
    d: "M 28 50 V 12 M 36 50 V 12 M 28 12 C 23 18 24 36 28 50 M 36 12 C 41 18 40 36 36 50 M 24 52 H 40",
  },
  saturn: {
    label: "Geb",
    viewBox: VB,
    d: "M 14 42 Q 22 34 38 37 Q 47 39 47 43 Q 38 47 22 45 Q 14 46 14 42 Z M 45 39 Q 51 31 49 24 Q 48 22 46 23 L 50 25 M 18 45 L 16 52 M 40 45 L 42 52",
  },
};
