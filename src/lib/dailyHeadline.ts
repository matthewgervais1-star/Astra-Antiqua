import type { Culture, Planet } from "@/data/cultures";
import { DEITY_MATRIX } from "@/data/deities";
import {
  computeAspects,
  longitudeToSign,
  type Longitude,
} from "@/data/sampleChart";

export type DayTone = "challenging" | "easing" | "doubling" | "balanced";

export interface DailyHeadline {
  /** A single declarative directive sentence for the day. */
  headline: string;
  /** A short paragraph that names the Moon, the top aspect, and a directive. */
  paragraph: string;
  /** Used by other UI: today's dominant tone. */
  tone: DayTone;
}

const DIRECTIVE_BY_TONE: Readonly<Record<Culture, Readonly<Record<DayTone, string>>>> = {
  egypt: {
    challenging:
      "The feather of Ma'at trembles, and you can feel exactly which thing on your side of the scale is overweight.",
    easing:
      "The current is moving with you today. The thing you have been pushing alone will move if you let go of one hand.",
    doubling:
      "Two things you have been treating as separate are the same decision. You know which two.",
    balanced:
      "Nothing on the scale today asks to be moved. You have permission to sit with the weighing.",
  },
  greece: {
    challenging:
      "The Pythia knows the question you have been avoiding. So do you.",
    easing:
      "Your ear is closer to the tonic than your worry suggests; the easy answer is the right one today.",
    doubling:
      "The voice in your head and the move in your hand are speaking one sentence today.",
    balanced:
      "Both arguments are still yours to hold. The verdict is not yours yet.",
  },
  canaan: {
    challenging:
      "The council is paying attention to your name today, and you already know which piece of conduct they are weighing.",
    easing:
      "Whatever you sow today will be remembered correctly. The ground is honest with you.",
    doubling:
      "The argument you have been carrying inside is already settled. Today it can be said aloud.",
    balanced:
      "El's silence is room, not refusal. You have today to decide what to say first.",
  },
  carthage: {
    challenging:
      "The Tophet has chosen the comfort it wants from you. You already know which one.",
    easing:
      "The lookouts have not called for hours. You can leave the port today without watching the horizon.",
    doubling:
      "You are not flying two flags today. You only thought you were.",
    balanced:
      "The decree is not coming today. What you brought to the Tophet, you can carry home.",
  },
};

function determineTone(
  chart: Readonly<Record<Planet, Longitude>>,
): { tone: DayTone; harmonyCount: number; tensionCount: number; conjunctionCount: number } {
  const aspects = computeAspects(chart);
  const harmonyCount = aspects.filter((a) => a.kind === "trine" || a.kind === "sextile").length;
  const tensionCount = aspects.filter((a) => a.kind === "square" || a.kind === "opposition").length;
  const conjunctionCount = aspects.filter((a) => a.kind === "conjunction").length;
  let tone: DayTone;
  if (conjunctionCount >= 2 || (conjunctionCount >= 1 && harmonyCount === tensionCount)) {
    tone = "doubling";
  } else if (tensionCount > harmonyCount + 1) {
    tone = "challenging";
  } else if (harmonyCount > tensionCount + 1) {
    tone = "easing";
  } else {
    tone = "balanced";
  }
  return { tone, harmonyCount, tensionCount, conjunctionCount };
}

export function buildDailyHeadline(
  culture: Culture,
  chart: Readonly<Record<Planet, Longitude>>,
): DailyHeadline {
  const { tone, harmonyCount, tensionCount, conjunctionCount } = determineTone(chart);
  const directive = DIRECTIVE_BY_TONE[culture][tone];

  const moonDeity = DEITY_MATRIX[culture].moon;
  const moonSign = longitudeToSign(chart.moon).sign;
  const moonLine = `${moonDeity.name} holds ${moonSign} today`;

  let toneLine: string;
  if (tone === "challenging") {
    toneLine = `${tensionCount} tense aspect${tensionCount === 1 ? "" : "s"} pull at the wheel`;
  } else if (tone === "easing") {
    toneLine = `${harmonyCount} easing aspect${harmonyCount === 1 ? "" : "s"} carry the day`;
  } else if (tone === "doubling") {
    toneLine = `${conjunctionCount} conjunction${conjunctionCount === 1 ? "" : "s"} double the force`;
  } else {
    toneLine = `the easing and the challenging lines stand in balance`;
  }

  const paragraph = `${moneyOrPunctuation(moonLine)}; ${toneLine}. ${directive}`;
  return { headline: directive, paragraph, tone };
}

function moneyOrPunctuation(s: string): string {
  // Tiny helper that just returns the sentence as-is; named to keep the line
  // explicit at the call site (a future hook for capitalization fixups).
  return s;
}
