import type { Glyph } from "@/components/glyphs/types";
import type { Planet } from "@/data/cultures";

const VB: readonly [number, number] = [64, 64];

export const EGYPT_GLYPHS: Readonly<Record<Planet, Glyph>> = {
  // Ra: sun disc with rising uraeus above and the hieroglyphic baseline below.
  sun: {
    label: "Ra",
    viewBox: VB,
    d: "M 32 22 A 10 10 0 1 0 32 42 A 10 10 0 1 0 32 22 M 32 22 C 28 16 36 12 32 6 M 14 56 H 50",
  },

  // Khonsu: lunar crescent with the side-lock of youth and a baseline register.
  moon: {
    label: "Khonsu",
    viewBox: VB,
    d: "M 22 18 A 14 14 0 1 0 22 46 A 10 10 0 1 1 22 18 M 42 18 C 50 28 50 38 42 46 M 14 56 H 50",
  },

  // Sebegu (Set aspect): the was-scepter, forked head, forked base, central staff.
  mercury: {
    label: "Sebegu",
    viewBox: VB,
    d: "M 32 12 V 52 M 32 12 L 26 6 M 32 12 L 38 6 M 32 52 L 26 58 M 32 52 L 38 58 M 14 56 H 50",
  },

  // Isis: the throne hieroglyph that spells her name, surmounted by the solar disc.
  venus: {
    label: "Isis",
    viewBox: VB,
    d: "M 22 24 H 42 V 52 H 22 Z M 22 38 H 42 M 32 10 A 6 6 0 1 0 32 22 A 6 6 0 1 0 32 10",
  },

  // Horus the Red: hawk profile, beak, eye, suggestion of folded wing.
  mars: {
    label: "Horus the Red",
    viewBox: VB,
    d: "M 18 38 C 24 28 34 22 48 26 L 54 30 L 48 32 C 40 30 30 32 22 40 C 20 44 22 50 28 52 M 40 28 A 1.5 1.5 0 0 1 40 30",
  },

  // Amun: twin-plumed crown above the hieroglyphic baseline.
  jupiter: {
    label: "Amun",
    viewBox: VB,
    d: "M 32 50 V 22 M 26 22 V 10 C 24 12 22 14 22 22 M 38 22 V 10 C 40 12 42 14 42 22 M 24 22 H 40 M 14 56 H 50",
  },

  // Geb: horizontal earth-line with the goose head that is his hieroglyph.
  saturn: {
    label: "Geb",
    viewBox: VB,
    d: "M 8 46 H 56 M 38 46 V 38 C 38 30 46 28 50 30 C 52 30 52 32 52 32 L 50 28 M 14 56 H 50",
  },
};
