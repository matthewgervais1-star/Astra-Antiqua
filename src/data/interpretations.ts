import type { Culture, Planet } from "@/data/cultures";
import type { AspectKind, ZodiacSign } from "@/data/sampleChart";

/**
 * What each of the seven planets represents, in plain language. Universal across
 * pantheons; the deity name is the cultural mask, the domain is the underlying
 * principle.
 */
export const PLANET_DOMAINS: Readonly<Record<Planet, string>> = {
  sun: "Identity, sovereignty, the face you turn to the world.",
  moon: "Feeling, memory, the inner weather.",
  mercury: "Speech, exchange, the crossing of edges.",
  venus: "Drawing-toward, the binding of pairs, what you find beautiful.",
  mars: "Effort, friction, what you have to push against.",
  jupiter: "Expansion, blessing, what you trust to grow.",
  saturn: "Limit, weight, what asks for endurance.",
};

/**
 * One-line interpretation for the pair of planetary principles, regardless of
 * which aspect they make. Keyed by an order-independent string. Use
 * getPairTheme to look up.
 */
const PAIR_THEMES: Readonly<Record<string, string>> = {
  "sun|moon": "The will and the feeling, the outer face and the inner weather.",
  "mercury|sun": "The voice that speaks and the identity it speaks for.",
  "sun|venus": "What you want and the way you make yourself attractive enough to get it.",
  "mars|sun": "Will and force, sovereignty and the work of pushing through.",
  "jupiter|sun": "The throne and the blessing, identity expanded into role.",
  "saturn|sun": "The throne and the weight, sovereignty and the cost of bearing it.",
  "mercury|moon": "Feeling and speech, what you sense and what you put into words.",
  "moon|venus": "The body and the binding, instinct and the pull toward what you love.",
  "mars|moon": "Feeling and force, instinct and the will to act on it.",
  "jupiter|moon": "The body and the blessing, gut sense and the things that grow on faith.",
  "moon|saturn": "The body and the limit, instinct and what asks for endurance.",
  "mercury|venus": "Speech and beauty, the words you choose to draw what you love.",
  "mars|mercury": "Speech and force, the sentence as a weapon or a wall.",
  "jupiter|mercury": "Speech and expansion, the meaning that wants to reach further.",
  "mercury|saturn": "Speech and weight, what you say and what you must defend.",
  "mars|venus": "Attraction and pursuit, the pull and the push of every desire.",
  "jupiter|venus": "What you love and what you trust, the binding made into a creed.",
  "saturn|venus": "What you love and what you keep, beauty placed under contract.",
  "jupiter|mars": "Effort and expansion, the push toward the bigger story.",
  "mars|saturn": "Effort and limit, the push against the wall that wants you stopped.",
  "jupiter|saturn": "Expansion and limit, the law that grows and the law that holds.",
};

function pairKey(a: Planet, b: Planet): string {
  return [a, b].sort().join("|");
}

export function getPairTheme(a: Planet, b: Planet): string {
  const key = pairKey(a, b);
  return PAIR_THEMES[key] ?? "Two principles meet on the wheel.";
}

/**
 * One-line cultural reflection for each aspect kind in each pantheon's voice.
 * Identical structure across cultures so that the reading reads consistently;
 * the register and imagery shift to the chosen tradition.
 */
export const ASPECT_REFLECTIONS: Readonly<
  Record<Culture, Readonly<Record<AspectKind, string>>>
> = {
  egypt: {
    conjunction: "Ra's barque carries both forces together; their movement is one movement.",
    sextile: "An open road between them, with the offering laid out at the threshold.",
    square: "The feather of Ma'at trembles. Acting in haste tips the scale; acting in measure holds it.",
    trine: "The waters of the Nile flow between them, without effort, without resistance.",
    opposition: "The two cross the river in opposite directions. Neither shore is the wrong one; only the timing of the crossing decides.",
  },
  greece: {
    conjunction: "On Olympus they share a single throne. Whichever speaks first speaks for both.",
    sextile: "A treaty across the agora, with the terms still open for revision.",
    square: "The Pythia warns of a forced choice. Both gods are watching; neither is patient.",
    trine: "A song that returns to its tonic. The notes find each other without strain.",
    opposition: "The two stand at the antipodes of the wheel. The Greek question is whether you can hold both extremes in mind at once.",
  },
  canaan: {
    conjunction: "The two seats of the divine council are pulled together. One voice carries both arguments.",
    sextile: "A tribute is exchanged at the council mountain. The favor lasts as long as the gift remembers itself.",
    square: "Resheph's arrow is drawn between them. Cover what you cannot defend, or accept the wound that proves the danger.",
    trine: "Baal's rain falls on both at once. The council does not need to convene; the answer is already in the soil.",
    opposition: "The two convene the council against each other. El's silence is the test; whoever speaks first to the assembly carries the day.",
  },
  carthage: {
    conjunction: "Two standards are raised on the same mast. The wind takes them as one banner.",
    sextile: "Safe passage between two ports. The convoy moves while the winds hold.",
    square: "Melqart raises his hand. A price is being demanded; the question is which comfort you can afford to lay on the fire.",
    trine: "The harbor lights both burn. The fleet enters without the lookout calling once.",
    opposition: "Two flags face each other across the strait. The decree of the Council is that one will be carried home and one will not.",
  },
  rome: {
    conjunction: "The two march under one eagle. The senate does not debate what the legions already carry together.",
    sextile: "A treaty is offered between two powers. It holds as long as both sides keep the terms in the open.",
    square: "Mars raises the spear. The augurs read a forced campaign; take the omens before you commit the line.",
    trine: "The right hands are clasped in accord. What is agreed today will stand without a contract to enforce it.",
    opposition: "The two stand across the forum from each other. Rome settles it by who holds the ground when the session ends.",
  },
};

/**
 * The element / register each zodiac sign carries. Universal across pantheons
 * (signs predate the five cultures' divergent star lore). Used to render
 * placement lines like "Ra walks in the fields of fire at 15 degrees Aries."
 */
/**
 * Bare sign images, written in a more lapidary register. The therapy-speak
 * second clauses that used to live here have moved into the per-planet-and-sign
 * interpretation text below; here we keep only the inscriptional image.
 */
export const SIGN_REGISTERS: Readonly<Record<ZodiacSign, string>> = {
  Aries: "the field of the first strike",
  Taurus: "the bull's pasture",
  Gemini: "the crossing wind",
  Cancer: "the sea cave of the crab",
  Leo: "the lion's noon",
  Virgo: "the gleaning floor",
  Libra: "the balanced scales",
  Scorpio: "the desert at the scorpion's hour",
  Sagittarius: "the archer's high road",
  Capricorn: "the goat's ascent",
  Aquarius: "the poured waters",
  Pisces: "the deep tide",
};
