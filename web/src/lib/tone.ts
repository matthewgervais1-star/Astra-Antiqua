import type { AspectKind } from "@/data/sampleChart";

/**
 * The one triage vocabulary used at every reading horizon (day, week, season,
 * year): each aspect kind resolves to one of three tones, and the tone wears
 * the same branded label everywhere so a reader learns it once.
 *
 *   harmony -> trine / sextile (the two forces cooperate)
 *   tension -> square / opposition (they grind)
 *   union   -> conjunction (they fuse)
 */
export type Tone = "harmony" | "tension" | "union";

export const TONE_LABELS: Readonly<Record<Tone, string>> = {
  harmony: "Favor",
  tension: "Trial",
  union: "Union",
};

export function toneOf(kind: AspectKind): Tone {
  if (kind === "trine" || kind === "sextile") return "harmony";
  if (kind === "square" || kind === "opposition") return "tension";
  return "union";
}
