import type { Culture, Planet } from "@/data/cultures";
import type { Longitude } from "@/data/sampleChart";
import { composeDecree } from "@/lib/decree";

/**
 * The day's message in one breath: the headline figure and its ruling, and
 * nothing the sky did not put there. This is what a push notification or a
 * widget carries. It is the decree's first paragraph, so it changes with the
 * figure and on a quiet sky says the culture's quiet line. The fixed bank of
 * per-culture aphorisms it replaces said the same thirty-two things whatever
 * the ephemeris showed, which is the invention the method page disowns.
 */
export interface DailyMessage {
  headline: string;
  body: string;
  tone: "harmony" | "tension" | "quiet";
}

export function composeDailyMessage(
  culture: Culture,
  chart: Readonly<Record<Planet, Longitude>>,
): DailyMessage {
  const decree = composeDecree(culture, chart);
  return { headline: decree.headline, body: decree.paragraphs[0] ?? "", tone: decree.tone };
}
