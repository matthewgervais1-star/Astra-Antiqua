import type { Culture } from "@/data/cultures";

/**
 * Per-culture metal gradient stops, used by the SVG deity glyphs and the
 * canvas natal wheel so the gold strokes shift with the active pantheon.
 *
 * Kept in sync with the body[data-pantheon] blocks in globals.css. Each scheme:
 *   egypt    pharaoh gold (with lapis accents handled in CSS)
 *   greece   pale marble champagne (with Aegean cyan accents)
 *   canaan   bronze-age copper (with verdigris accents)
 *   carthage ember gold (with fire accents)
 */
export interface MetalGradient {
  /** deep, mid, bright stops (the mid and bright define the highlight) */
  readonly stops: readonly [string, string, string];
  readonly solid: string;
}

export const DEFAULT_METAL: MetalGradient = {
  stops: ["#a8842c", "#d4af37", "#f4d03f"],
  solid: "#d4af37",
};

export const CULTURE_METALS: Readonly<Record<Culture, MetalGradient>> = {
  egypt: { stops: ["#a8842c", "#e3c14e", "#f7e294"], solid: "#e3c14e" },
  greece: { stops: ["#9a9374", "#ddd3b0", "#f4eed8"], solid: "#ddd3b0" },
  canaan: { stops: ["#6f4f28", "#b07d42", "#dcab5e"], solid: "#b07d42" },
  carthage: { stops: ["#c44518", "#f4a02a", "#fbe57b"], solid: "#f4a02a" },
  rome: { stops: ["#8a6a2c", "#d9b94a", "#f3dd84"], solid: "#d9b94a" },
};

export function metalFor(culture: Culture | null): MetalGradient {
  return culture ? CULTURE_METALS[culture] : DEFAULT_METAL;
}

/*
 * "The Instrument in the Temple" scheme: one flat ground and one flat muted
 * accent per culture. Kept in sync with the @theme tokens and the
 * body[data-pantheon] blocks in globals.css. These replace the metal
 * gradients above, which are deleted with the relic system.
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
