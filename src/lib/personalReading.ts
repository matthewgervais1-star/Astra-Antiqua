import type { Culture, Planet } from "@/data/cultures";
import { DEITY_MATRIX } from "@/data/deities";
import {
  computeAspects,
  longitudeToSign,
  type Aspect,
  type AspectKind,
  type Longitude,
} from "@/data/sampleChart";
import { computeTransits, topTransits, type TransitAspect } from "@/lib/transits";

/**
 * What the transiting planet is "doing in the room" today. Used as the subject
 * of the second sentence of a personal reading. Universal across pantheons.
 */
export const TRANSIT_PRINCIPLE: Readonly<Record<Planet, string>> = {
  sun: "the day's call for visibility",
  moon: "today's tide of feeling",
  mercury: "the message moving through the room",
  venus: "the pull of what is on offer",
  mars: "the friction the day is applying",
  jupiter: "the offer of expansion",
  saturn: "the weight being placed",
};

/**
 * What the natal planet IS, in second-person. The thing being touched by the
 * transit. Reads as "your X."
 */
const NATAL_TARGET: Readonly<Record<Planet, string>> = {
  sun: "your identity",
  moon: "your inner weather",
  mercury: "the way you speak and think",
  venus: "what draws you",
  mars: "what you push against",
  jupiter: "what you trust to grow",
  saturn: "what you have learned to carry",
};

/** Cultural verb for each aspect (same vocabulary used elsewhere). */
const ASPECT_VERBS: Readonly<Record<Culture, Readonly<Record<AspectKind, string>>>> = {
  egypt: {
    conjunction: "joins the barque of",
    sextile: "extends a steady hand to",
    square: "weighs against the heart of",
    trine: "lifts the gaze of",
    opposition: "faces across the river from",
  },
  greece: {
    conjunction: "stands shoulder to shoulder with",
    sextile: "offers fair counsel to",
    square: "challenges",
    trine: "harmonizes with",
    opposition: "stands across the agora from",
  },
  canaan: {
    conjunction: "shares the throne of the council with",
    sextile: "exchanges tribute with",
    square: "draws the bow against",
    trine: "speaks favor over",
    opposition: "convenes the council against",
  },
  carthage: {
    conjunction: "raises the standard alongside",
    sextile: "trades safe passage with",
    square: "raises the hand against",
    trine: "lights the fire alongside",
    opposition: "demands a price of",
  },
  rome: {
    conjunction: "marches under the same eagle as",
    sextile: "treats for alliance with",
    square: "raises the spear against",
    trine: "clasps the right hand of",
    opposition: "stands across the forum from",
  },
};

export function cap(s: string): string {
  return s.length === 0 ? s : s[0]!.toUpperCase() + s.slice(1);
}

/**
 * Domain-context template for a life-domain reading. Names which two
 * principles are in aspect and pins the meaning to the named life domain
 * ("in your body", "in the room you are sitting in"). This is what makes
 * the LifeDomainHoroscope directives computed-per-aspect rather than
 * pre-packaged per (domain, kind).
 */
export function lifeDomainMeaning(
  kind: AspectKind,
  principleA: string,
  principleB: string,
  domainPhrase: string,
): string {
  switch (kind) {
    case "conjunction":
      return `${cap(principleA)} and ${principleB} are the same force ${domainPhrase} today. You can stop separating them.`;
    case "sextile":
      return `${cap(principleA)} is opening a quiet door for ${principleB} ${domainPhrase}. The day will offer it once; you do not have to engineer it.`;
    case "square":
      return `${cap(principleA)} is at exact friction with ${principleB} ${domainPhrase}. You already know where the bargain is going to land.`;
    case "trine":
      return `${cap(principleA)} is aligned with ${principleB} ${domainPhrase} today. The thing you have been working at alone is not alone.`;
    case "opposition":
      return `${cap(principleA)} stands across from ${principleB} ${domainPhrase}. You cannot have both; which side you reach for will show you which side you already chose.`;
  }
}

/**
 * Sentence-2 template for a personal (transit-to-natal) reading. Names the
 * transit principle, the aspect relation, and the natal target. The closing
 * clause is also aspect-kind specific.
 */
function personalMeaning(
  kind: AspectKind,
  transitPrinciple: string,
  natalTarget: string,
): string {
  switch (kind) {
    case "conjunction":
      return `${cap(transitPrinciple)} is pressed directly onto ${natalTarget}. You will feel them as one signal today, not two.`;
    case "sextile":
      return `${cap(transitPrinciple)} is opening a quiet door for ${natalTarget}. You will recognize the opening when it comes; you do not have to make it.`;
    case "square":
      return `${cap(transitPrinciple)} is at exact friction with ${natalTarget}. You already know which piece of the day this is going to land on.`;
    case "trine":
      return `${cap(transitPrinciple)} is aligned with ${natalTarget} in the current today. The thing you have been pushing alone will move if you let one hand off.`;
    case "opposition":
      return `${cap(transitPrinciple)} stands across from ${natalTarget} on the wheel today. You will see where you actually are by which side you reach for.`;
  }
}

/**
 * Sentence-2 template for a sky-only (no-natal) reading. Names the two
 * transiting principles and the aspect between them as something happening
 * in the room the reader is in.
 */
export function skyMeaning(
  kind: AspectKind,
  principleA: string,
  principleB: string,
): string {
  switch (kind) {
    case "conjunction":
      return `${cap(principleA)} and ${principleB} are the same force in the room today; you can stop separating them.`;
    case "sextile":
      return `${cap(principleA)} is opening a small door for ${principleB}. The day will offer it once, without ceremony.`;
    case "square":
      return `${cap(principleA)} and ${principleB} are at exact friction. The room is being asked to choose, and you can feel the choice coming.`;
    case "trine":
      return `${cap(principleA)} is moving with ${principleB} in the same current. What you have been pushing alone today is not alone.`;
    case "opposition":
      return `${cap(principleA)} stands across from ${principleB} today. The room cannot have both; you will see which side you weight.`;
  }
}

/**
 * Score for ranking which transit-to-natal hit is the "headline." Tight orbs
 * score higher, and aspects involving personal points (Sun, Moon) on either
 * end score higher than outer-to-outer pairings.
 */
function personalScore(t: TransitAspect): number {
  const personalA = t.transit === "sun" || t.transit === "moon";
  const personalB = t.natal === "sun" || t.natal === "moon";
  const personalBonus = (personalA ? 1 : 0) + (personalB ? 1 : 0);
  // Lower orb = better. Add personal bonus subtractively.
  return t.orb - personalBonus * 1.5;
}

/** Score for ranking today's in-sky aspects when there is no natal chart. */
function skyScore(a: Aspect): number {
  const fastA = a.a === "moon" || a.a === "sun";
  const fastB = a.b === "moon" || a.b === "sun";
  const fastBonus = (fastA ? 1 : 0) + (fastB ? 1 : 0);
  return a.orb - fastBonus * 1.0;
}

export interface ComputedReading {
  /** The lead sentence: names the deity action that gives the day its shape. */
  headline: string;
  /** A second sentence translating the technical aspect into a felt claim. */
  meaning: string;
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

  const headlineSentence = `${tDeity.name} ${verb} your ${nDeity.name} today.`;
  const meaning = personalMeaning(
    headline.kind,
    TRANSIT_PRINCIPLE[headline.transit],
    NATAL_TARGET[headline.natal],
  );

  const toneSummary = `Transit ${headline.transit} ${headline.kind} natal ${headline.natal} (orb ${headline.orb.toFixed(1)}°)`;

  return {
    headline: headlineSentence,
    meaning,
    source: { kind: "personal", transit: headline },
    toneSummary,
  };
}

export function buildSkyDailyReading(
  culture: Culture,
  transitChart: Readonly<Record<Planet, Longitude>>,
): ComputedReading {
  const aspects = computeAspects(transitChart);
  const ranked = [...aspects].sort((a, b) => skyScore(a) - skyScore(b));
  const headline = ranked[0];
  if (!headline) {
    const sign = longitudeToSign(transitChart.moon).sign;
    const moonDeity = DEITY_MATRIX[culture].moon;
    return {
      headline: `${moonDeity.name} alone holds ${sign} today; no other line in the sky is tight enough to name.`,
      meaning:
        "The room is quiet. The body's signal is the only steady reading right now; whatever you do today you will mostly hear yourself.",
      source: { kind: "quiet" },
      toneSummary: "No tight aspects in the transit chart",
    };
  }

  const deityA = DEITY_MATRIX[culture][headline.a];
  const deityB = DEITY_MATRIX[culture][headline.b];
  const verb = ASPECT_VERBS[culture][headline.kind];

  const headlineSentence = `${deityA.name} ${verb} ${deityB.name} in the sky right now.`;
  const meaning = skyMeaning(
    headline.kind,
    TRANSIT_PRINCIPLE[headline.a],
    TRANSIT_PRINCIPLE[headline.b],
  );

  const toneSummary = `${headline.a} ${headline.kind} ${headline.b} in transit (orb ${headline.orb.toFixed(1)}°)`;

  return {
    headline: headlineSentence,
    meaning,
    source: { kind: "sky", aspect: headline },
    toneSummary,
  };
}
