import { isReceived, type Culture, type Planet } from "@/data/cultures";
import { DEITY_MATRIX } from "@/data/deities";
import {
  computeAspects,
  longitudeToSign,
  type Aspect,
  type Longitude,
} from "@/data/sampleChart";
import { computeTransits, topTransits, type TransitAspect } from "@/lib/transits";
import { getAspectReading } from "@/data/aspectReadings";
import { ASPECT_VERBS } from "@/data/aspectVerbs";

/** Capitalize a planet key for a plain-language provenance line. */
function capWord(s: string): string {
  return s.length === 0 ? s : s[0]!.toUpperCase() + s.slice(1);
}

/**
 * What the transiting planet is "doing in the room". Kept for the life-domain
 * and annual-report copy, which consume it directly. The daily reading no
 * longer uses it; it draws hand-written directives from aspectReadings instead.
 */
export const TRANSIT_PRINCIPLE: Readonly<Record<Planet, string>> = {
  sun: "the push to be seen and to lead",
  moon: "the tide of feeling and need",
  mercury: "the traffic of words and ideas",
  venus: "the pull toward closeness and pleasure",
  mars: "the drive to act and to fight",
  jupiter: "the urge to expand and to trust",
  saturn: "the demand for discipline and limit",
  uranus: "the shock of sudden change and the break for freedom",
  neptune: "the pull to dissolve, to dream, to blur the edges",
  pluto: "the demand that what is buried be brought up and counted",
};

/**
 * Score for ranking which transit-to-natal hit is the "headline." Tight orbs
 * score higher, and aspects involving personal points (Sun, Moon) on either
 * end score higher than outer-to-outer pairings.
 */
function personalScore(t: TransitAspect): number {
  const personalA = t.transit === "sun" || t.transit === "moon";
  const personalB = t.natal === "sun" || t.natal === "moon";
  const personalBonus = (personalA ? 1 : 0) + (personalB ? 1 : 0);
  // Outer-planet transits are rare enough that an exact one is genuinely
  // significant; a 1.25x boost on tightness lets a slow-mover at close orb
  // still outrank a wider sun/moon hit, without touching the sun/moon bonus.
  const outerMultiplier = isReceived(t.transit) || isReceived(t.natal) ? 1.25 : 1;
  return t.orb / outerMultiplier - personalBonus * 1.5;
}

/** Score for ranking today's in-sky aspects when there is no natal chart. */
function skyScore(a: Aspect): number {
  const fastA = a.a === "moon" || a.a === "sun";
  const fastB = a.b === "moon" || a.b === "sun";
  const fastBonus = (fastA ? 1 : 0) + (fastB ? 1 : 0);
  return a.orb - fastBonus * 1.0;
}

export interface ComputedReading {
  /** A blunt directive headline, hand-written for the day's tightest aspect. */
  headline: string;
  /** The directive body: a sharp read and concrete instruction. */
  meaning: string;
  /** A small line naming the deity action and the Moon's sign that produced
   *  the directive. The ancient sourcing under the plain advice. */
  context: string;
  /** Metadata about which transit/aspect produced this reading. */
  source:
    | { kind: "personal"; transit: TransitAspect }
    | { kind: "sky"; aspect: Aspect }
    | { kind: "quiet" };
  /** A simple description of the day's tone for use elsewhere in the UI. */
  toneSummary: string;
}

export function buildPersonalDailyReading(
  culture: Culture,
  natalChart: Readonly<Record<Planet, Longitude>>,
  transitChart: Readonly<Record<Planet, Longitude>>,
): ComputedReading {
  const moonSign = longitudeToSign(transitChart.moon).sign;

  const transits = computeTransits(transitChart, natalChart);
  const ranked = topTransits(transits, transits.length, true);
  const ranked2 = [...ranked].sort((a, b) => personalScore(a) - personalScore(b));
  const headline = ranked2[0];
  if (!headline) {
    return buildSkyDailyReading(culture, transitChart);
  }

  const tDeity = DEITY_MATRIX[culture][headline.transit];
  const nDeity = DEITY_MATRIX[culture][headline.natal];
  const verb = ASPECT_VERBS[culture][headline.kind];
  const directive = getAspectReading(headline.transit, headline.natal, headline.kind);

  return {
    headline: directive.headline,
    meaning: directive.body,
    context: `${tDeity.name} ${verb} your ${nDeity.name}, under the ${moonSign} Moon.`,
    source: { kind: "personal", transit: headline },
    toneSummary: `Today's ${capWord(headline.transit)} ${headline.kind} your natal ${capWord(headline.natal)}, ${headline.orb.toFixed(1)}° from exact`,
  };
}

export function buildSkyDailyReading(
  culture: Culture,
  transitChart: Readonly<Record<Planet, Longitude>>,
): ComputedReading {
  const moonSign = longitudeToSign(transitChart.moon).sign;

  const aspects = computeAspects(transitChart);
  const ranked = [...aspects].sort((a, b) => skyScore(a) - skyScore(b));
  const headline = ranked[0];
  if (!headline) {
    const moonDeity = DEITY_MATRIX[culture].moon;
    return {
      headline: "A quiet sky. Hear yourself.",
      meaning:
        "Nothing in the sky is pulling hard enough to name today. That is not nothing; it is a clear channel. With no transit telling you how to feel, what you do today is mostly you, so use the quiet to hear what you actually want before the noise comes back.",
      context: `${moonDeity.name} walks alone through ${moonSign} today.`,
      source: { kind: "quiet" },
      toneSummary: "No close aspects overhead today",
    };
  }

  const deityA = DEITY_MATRIX[culture][headline.a];
  const deityB = DEITY_MATRIX[culture][headline.b];
  const verb = ASPECT_VERBS[culture][headline.kind];
  const directive = getAspectReading(headline.a, headline.b, headline.kind);

  return {
    headline: directive.headline,
    meaning: directive.body,
    context: `${deityA.name} ${verb} ${deityB.name} in the sky, under the ${moonSign} Moon.`,
    source: { kind: "sky", aspect: headline },
    toneSummary: `${capWord(headline.a)} ${headline.kind} ${capWord(headline.b)} overhead, ${headline.orb.toFixed(1)}° from exact`,
  };
}
