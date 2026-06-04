import type { Culture, Planet } from "@/data/cultures";
import { DEITY_MATRIX } from "@/data/deities";
import {
  computeAspects,
  longitudeToSign,
  type Aspect,
  type AspectKind,
  type Longitude,
  type ZodiacSign,
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

/**
 * The mood the day takes from the sign the Moon is travelling through. The
 * Moon is the fastest body and sets the emotional weather, so every daily
 * reading opens with it (the way a good horoscope leads with "the Capricorn
 * Moon"). One short, plain, actionable clause per sign.
 */
const MOON_SIGN_MOOD: Readonly<Record<ZodiacSign, string>> = {
  Aries: "The day runs hot and quick, impatient for a first move.",
  Taurus: "The day slows to the body's pace and wants the ground underfoot.",
  Gemini: "The day scatters into talk and errand, many small things at once.",
  Cancer: "The day turns inward, toward home and the people you protect.",
  Leo: "The day wants to be seen, warm and a little proud.",
  Virgo: "The day narrows to the useful and the fixable.",
  Libra: "The day leans toward the other person, toward fairness and the pair.",
  Scorpio: "The day runs deep and private and will not stay on the surface.",
  Sagittarius: "The day opens outward, restless for somewhere further on.",
  Capricorn: "The day asks for structure, patience, and the long view.",
  Aquarius: "The day pulls toward the new and the contrary.",
  Pisces: "The day softens and blurs, porous to everything around you.",
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
 * ("in your body", "in the room you are sitting in"), then closes with a
 * concrete, do-this clause rather than an abstraction.
 */
export function lifeDomainMeaning(
  kind: AspectKind,
  principleA: string,
  principleB: string,
  domainPhrase: string,
): string {
  switch (kind) {
    case "conjunction":
      return `${cap(principleA)} and ${principleB} are one force ${domainPhrase} today. Stop holding them apart and act on the single pull.`;
    case "sextile":
      return `${cap(principleA)} opens a quiet door for ${principleB} ${domainPhrase}. It is offered once, so take the small concrete step instead of engineering a bigger one.`;
    case "square":
      return `${cap(principleA)} grinds against ${principleB} ${domainPhrase}. A bargain is due; you spend less choosing it early than letting the day choose for you.`;
    case "trine":
      return `${cap(principleA)} is aligned with ${principleB} ${domainPhrase} today. The thing you have worked at alone is not alone, so lean your weight on it.`;
    case "opposition":
      return `${cap(principleA)} stands across from ${principleB} ${domainPhrase}. You cannot have both, so reach for the one that matters and let the reach show you which you chose.`;
  }
}

/**
 * Sentence-2 template for a personal (transit-to-natal) reading. Names the
 * transit principle, the aspect relation, and the natal target, and closes on
 * something to actually do. Deliberately avoids re-using the principle's own
 * words in the verb so the line never reads "the friction is at friction with".
 */
function personalMeaning(
  kind: AspectKind,
  transitPrinciple: string,
  natalTarget: string,
): string {
  switch (kind) {
    case "conjunction":
      return `${cap(transitPrinciple)} sits directly on ${natalTarget} today; they move as one signal, so act on the combined pull instead of trying to tell them apart.`;
    case "sextile":
      return `${cap(transitPrinciple)} holds an open door for ${natalTarget}; the opening is quiet, so take the small concrete step when it comes rather than waiting for a louder sign.`;
    case "square":
      return `${cap(transitPrinciple)} pulls hard against ${natalTarget}; something has to give, so choose the bargain on purpose and early instead of letting the day force it late.`;
    case "trine":
      return `${cap(transitPrinciple)} runs with ${natalTarget} today; push the thing you have been carrying alone, and it will move further than the effort you spend.`;
    case "opposition":
      return `${cap(transitPrinciple)} stands opposite ${natalTarget}; you cannot satisfy both at once, so name which one matters now and let the other wait without guilt.`;
  }
}

/**
 * Sentence-2 template for a sky-only (no-natal) reading. Names the two
 * transiting principles and the aspect between them as something happening in
 * the room, closing on a plain instruction.
 */
export function skyMeaning(
  kind: AspectKind,
  principleA: string,
  principleB: string,
): string {
  switch (kind) {
    case "conjunction":
      return `${cap(principleA)} and ${principleB} fuse into one force in the room; stop treating them as two and act on the single pull.`;
    case "sextile":
      return `${cap(principleA)} opens a small door for ${principleB}; it comes once and without ceremony, so take it when it does.`;
    case "square":
      return `${cap(principleA)} and ${principleB} pull against each other; the room is being asked to choose, and the choice is cheaper made early than late.`;
    case "trine":
      return `${cap(principleA)} moves with ${principleB} in one current; whatever you have been forcing alone will go easier today.`;
    case "opposition":
      return `${cap(principleA)} stands opposite ${principleB}; you cannot hold both, and which way you lean will show you what you already prefer.`;
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
  /** The lead sentence: opens with the Moon's sign, then names the deity
   *  action that gives the day its shape. */
  headline: string;
  /** A short paragraph: the day's mood from the Moon's sign, then a felt,
   *  actionable claim drawn from the tightest aspect. */
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
  const moonSign = longitudeToSign(transitChart.moon).sign;
  const mood = MOON_SIGN_MOOD[moonSign];

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

  const headlineSentence = `Under the ${moonSign} Moon, ${tDeity.name} ${verb} your ${nDeity.name}.`;
  const meaning = `${mood} ${personalMeaning(
    headline.kind,
    TRANSIT_PRINCIPLE[headline.transit],
    NATAL_TARGET[headline.natal],
  )}`;

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
  const moonSign = longitudeToSign(transitChart.moon).sign;
  const mood = MOON_SIGN_MOOD[moonSign];

  const aspects = computeAspects(transitChart);
  const ranked = [...aspects].sort((a, b) => skyScore(a) - skyScore(b));
  const headline = ranked[0];
  if (!headline) {
    const moonDeity = DEITY_MATRIX[culture].moon;
    return {
      headline: `Under the ${moonSign} Moon, ${moonDeity.name} walks alone; no other line in the sky is tight enough to name.`,
      meaning: `${mood} With no aspect pulling at it, the body's own signal is the only steady reading today; whatever you do, you will mostly be hearing yourself.`,
      source: { kind: "quiet" },
      toneSummary: "No tight aspects in the transit chart",
    };
  }

  const deityA = DEITY_MATRIX[culture][headline.a];
  const deityB = DEITY_MATRIX[culture][headline.b];
  const verb = ASPECT_VERBS[culture][headline.kind];

  const headlineSentence = `Under the ${moonSign} Moon, ${deityA.name} ${verb} ${deityB.name}.`;
  const meaning = `${mood} ${skyMeaning(
    headline.kind,
    TRANSIT_PRINCIPLE[headline.a],
    TRANSIT_PRINCIPLE[headline.b],
  )}`;

  const toneSummary = `${headline.a} ${headline.kind} ${headline.b} in transit (orb ${headline.orb.toFixed(1)}°)`;

  return {
    headline: headlineSentence,
    meaning,
    source: { kind: "sky", aspect: headline },
    toneSummary,
  };
}
