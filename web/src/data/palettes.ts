import type { Culture } from "@/data/cultures";

/*
 * "The Instrument in the Temple" scheme: one flat ground and one flat muted
 * accent per culture. Kept in sync with the @theme tokens and the
 * body[data-pantheon] blocks in globals.css.
 */
export const NEUTRAL_GROUND = "#171310";
export const NEUTRAL_ACCENT = "#b59a55";

export const CULTURE_GROUNDS: Readonly<Record<Culture, string>> = {
  egypt: "#1a1712",
  greece: "#171a1c",
  canaan: "#1a1813",
  carthage: "#191218",
  rome: "#1b1410",
};

export const CULTURE_ACCENTS: Readonly<Record<Culture, string>> = {
  egypt: "#b59a55",
  greece: "#7c93a6",
  canaan: "#8a9268",
  carthage: "#94648c",
  rome: "#a5544a",
};

export function accentFor(culture: Culture | null): string {
  return culture ? CULTURE_ACCENTS[culture] : NEUTRAL_ACCENT;
}

export function groundFor(culture: Culture | null): string {
  return culture ? CULTURE_GROUNDS[culture] : NEUTRAL_GROUND;
}
