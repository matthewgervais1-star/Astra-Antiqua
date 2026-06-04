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
 * What the transiting planet is "doing in the room" today. Kept for the
 * life-domain and annual-report copy, which consume it directly.
 */
export const TRANSIT_PRINCIPLE: Readonly<Record<Planet, string>> = {
  sun: "the push to be seen and to lead",
  moon: "the tide of feeling and need",
  mercury: "the traffic of words and ideas",
  venus: "the pull toward closeness and pleasure",
  mars: "the drive to act and to fight",
  jupiter: "the urge to expand and to trust",
  saturn: "the demand for discipline and limit",
};

/**
 * The mood the day takes from the sign the Moon is travelling through. The
 * Moon is the fastest body and sets the emotional weather, so every daily
 * reading opens with it. One short, plain clause per sign.
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

/**
 * The plain part of a person that a transiting planet touches. Concrete and
 * second-person, so the reading talks about confidence and feelings rather
 * than "your inner weather". Reads as "your {area}".
 */
const NATAL_AREA: Readonly<Record<Planet, string>> = {
  sun: "confidence",
  moon: "inner feelings",
  mercury: "thinking",
  venus: "relationships",
  mars: "drive",
  jupiter: "optimism",
  saturn: "sense of duty",
};

/**
 * The plain force a transiting planet brings to the day. Each is a single
 * concept (no internal "and") so the compound-subject templates stay readable.
 */
const TRANSIT_SOURCE: Readonly<Record<Planet, string>> = {
  sun: "being seen",
  moon: "a shift in mood",
  mercury: "new information",
  venus: "warmth",
  mars: "pressure",
  jupiter: "a window of opportunity",
  saturn: "added responsibility",
};

/** A planet's bare theme, used when there is no natal chart and both bodies
 *  are transiting (the sky-only reading). */
const PLANET_THEME: Readonly<Record<Planet, string>> = {
  sun: "self-expression",
  moon: "instinct",
  mercury: "communication",
  venus: "connection",
  mars: "drive",
  jupiter: "growth",
  saturn: "structure",
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
 * principles are in aspect and pins the meaning to the named life domain,
 * closing with a concrete, do-this clause.
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
 * The plain interpretation of a transit-to-natal hit. A compound subject
 * ("{source} and your {area}") keeps the verb agreement correct whatever the
 * nouns are, and the close is a concrete instruction.
 */
function personalAdvice(
  kind: AspectKind,
  transitPlanet: Planet,
  natalPlanet: Planet,
): string {
  const source = TRANSIT_SOURCE[transitPlanet];
  const area = NATAL_AREA[natalPlanet];
  switch (kind) {
    case "conjunction":
      return `${cap(source)} and your ${area} are landing on the same point, sharp and hard to ignore. Spend the charge on purpose rather than letting it spill.`;
    case "sextile":
      return `${cap(source)} and your ${area} are quietly in step, an easy opening if you want it. It will not announce itself, so take the small step when you notice it.`;
    case "square":
      return `${cap(source)} and your ${area} are grinding against each other. Something has to give, so make the adjustment early and on your own terms rather than letting the day force it.`;
    case "trine":
      return `${cap(source)} and your ${area} are moving together without effort. Lean on it: what usually takes work will give back more than you put in.`;
    case "opposition":
      return `${cap(source)} and your ${area} are pulling in opposite directions, and you cannot fully serve both. Choose which one gets your weight, and let the other wait without guilt.`;
  }
}

/** The plain interpretation of a sky-only aspect (no natal chart). */
function skyAdvice(kind: AspectKind, planetA: Planet, planetB: Planet): string {
  const a = PLANET_THEME[planetA];
  const b = PLANET_THEME[planetB];
  switch (kind) {
    case "conjunction":
      return `${cap(a)} and ${b} are merging in the sky; treat them as one thing today rather than two.`;
    case "sextile":
      return `${cap(a)} and ${b} are finding an easy connection; the opening is quiet, so use it before it passes.`;
    case "square":
      return `${cap(a)} and ${b} are grating against each other; something gives, and it goes better if you choose what.`;
    case "trine":
      return `${cap(a)} and ${b} are moving together easily; whatever sits between them comes more freely than usual.`;
    case "opposition":
      return `${cap(a)} and ${b} are pulling in opposite directions; the sky cannot hold both at full strength, so the day leans one way.`;
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
  /** A short paragraph: the day's mood from the Moon's sign, then a plain,
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
  const meaning = `${mood} ${personalAdvice(headline.kind, headline.transit, headline.natal)}`;

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
      meaning: `${mood} With nothing else pulling at it, the Moon's own mood is the only steady reading today; whatever you do, you will mostly be hearing yourself.`,
      source: { kind: "quiet" },
      toneSummary: "No tight aspects in the transit chart",
    };
  }

  const deityA = DEITY_MATRIX[culture][headline.a];
  const deityB = DEITY_MATRIX[culture][headline.b];
  const verb = ASPECT_VERBS[culture][headline.kind];

  const headlineSentence = `Under the ${moonSign} Moon, ${deityA.name} ${verb} ${deityB.name}.`;
  const meaning = `${mood} ${skyAdvice(headline.kind, headline.a, headline.b)}`;

  const toneSummary = `${headline.a} ${headline.kind} ${headline.b} in transit (orb ${headline.orb.toFixed(1)}°)`;

  return {
    headline: headlineSentence,
    meaning,
    source: { kind: "sky", aspect: headline },
    toneSummary,
  };
}
