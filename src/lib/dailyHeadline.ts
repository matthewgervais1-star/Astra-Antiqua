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
      "The feather of Ma'at trembles. Move with measured weight, or do not move at all.",
    easing:
      "The barque moves without effort. Take the river while the current is yours.",
    doubling:
      "Two stand in one barque. The decision is already half made; act before the wind shifts.",
    balanced:
      "The scales hold steady. Today is for honest accounting, not yet for the verdict.",
  },
  greece: {
    challenging:
      "The Pythia counsels caution. Speak only what you have already decided to defend.",
    easing:
      "A song that returns to its tonic. Move toward what comes easily and trust it.",
    doubling:
      "Two gods share a single throne. Speak once, act once, mean it twice.",
    balanced:
      "Olympus debates without verdict. Hold both arguments and let the day finish its case.",
  },
  canaan: {
    challenging:
      "The divine council is restless. Bring evidence of your conduct, or expect to be questioned.",
    easing:
      "Baal's rain falls evenly. The ground is ready; sow now without arguing the season.",
    doubling:
      "The council holds one voice. The judgment is not contested; carry it out.",
    balanced:
      "El's silence weighs the room. Whoever speaks first to the assembly carries the day.",
  },
  carthage: {
    challenging:
      "The Tophet asks a price. Choose the comfort you can afford to lay on the fire.",
    easing:
      "Both harbor lights burn. Sail without watching for storms; the wind will not turn yet.",
    doubling:
      "Two standards rise on the same mast. The wind takes them as one banner.",
    balanced:
      "The decree has not yet been read. Walk to the Tophet with what you carry, and wait.",
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
