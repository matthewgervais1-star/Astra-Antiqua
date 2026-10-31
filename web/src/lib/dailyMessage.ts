import type { Culture, Planet } from "@/data/cultures";
import type { Longitude } from "@/data/sampleChart";
import { composeDayPage, composeDecree, type DayDecree, type DecreeOptions } from "@/lib/decree";

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

function messageOf(decree: DayDecree): DailyMessage {
  const [meaning, consequence, , , instruction] = decree.sentences;
  const body = decree.tone === "quiet" ? (decree.sentences[0] ?? "") : [meaning, consequence, instruction].join(" ");
  return { headline: decree.headline, body, tone: decree.tone };
}

/** The message for one chart, with the same options the decree takes. */
export function composeDailyMessage(
  culture: Culture,
  chart: Readonly<Record<Planet, Longitude>>,
  options: DecreeOptions = {},
): DailyMessage {
  return messageOf(composeDecree(culture, chart, options));
}

/** The message for the day page of the UTC day containing `date`. */
export function composeDayMessage(culture: Culture, date: Date): DailyMessage {
  return messageOf(composeDayPage(culture, date));
}
