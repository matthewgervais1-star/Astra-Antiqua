import type { Culture, Planet } from "@/data/cultures";
import type { Longitude } from "@/data/sampleChart";
import { composeDayMessageParts } from "@/lib/decree";

/**
 * The day's message in one breath: the decree's headline, then its meaning,
 * consequence and instruction sentences. This is what a push notification or
 * a widget carries. It changes with the figure, and on a quiet sky it says the
 * culture's quiet line. Every sentence is one the decree prints, so a message
 * can never say something the day page does not.
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
  const parts = composeDayMessageParts(culture, chart);
  return { headline: parts.headline, body: parts.sentences.join(" "), tone: parts.tone };
}
