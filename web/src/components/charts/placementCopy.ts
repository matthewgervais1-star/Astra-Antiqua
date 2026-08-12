import type { Culture, Planet } from "@/data/cultures";
import { getDeityInscription } from "@/data/deityInscriptions";
import { PLANET_IN_SIGN } from "@/data/planetInSign";
import { PLANET_AREAS } from "@/data/planetAreas";
import { houseReading } from "@/lib/houseReading";
import { getHouseMeaning } from "@/data/houses";
import type { ZodiacSign } from "@/data/sampleChart";

/**
 * The composers behind a placement reading's three-part spine
 * (WHAT IT IS / HOW IT SHOWS / WHAT TO KEEP IN VIEW). Each stitches together
 * the universal, per-culture, and per-chart data that already exists rather
 * than hand-authoring one paragraph per body x sign x culture combination
 * (600 of them), which is out of reach for hand-authored prose.
 */

/**
 * One institutional closing line per culture, appended to every HOW IT SHOWS
 * section, the way a museum card carries one fixed line of provenance under
 * every object regardless of what the object is.
 */
const REGISTER_LINE: Readonly<Record<Culture, string>> = {
  egypt: "The scale reads what is placed on it, not what is claimed for it.",
  greece: "The oracle does not soften what it has already seen.",
  canaan: "The council does not unseat what it has once seated.",
  carthage: "The ledger does not forgive an entry once it is posted.",
  rome: "The augur reads the sign once and does not ask the sky again.",
};

/**
 * One concrete, repeatable instruction per body, closing WHAT TO KEEP IN
 * VIEW. Tied to the planet's governed area rather than the sign or the
 * culture, so it holds true across every placement page it closes.
 */
const PLACEMENT_INSTRUCTIONS: Readonly<Record<Planet, string>> = {
  sun: "Let one person see the unfinished draft, on purpose.",
  moon: "Name the mood out loud before you act on it.",
  mercury: "Send the plain version before you polish it.",
  venus: "Choose the plain thing once, and say why.",
  mars: "Pick the fight that is actually yours to pick.",
  jupiter: "Say the smaller, truer number out loud.",
  saturn: "Set the deadline before the dread sets it for you.",
  uranus: "Warn one person before you break the pattern.",
  neptune: "Write down where the feeling actually started.",
  pluto: "Say the true thing to the one person it concerns.",
};

function firstDirectAddressSentence(paragraph: string): string {
  const sentences = paragraph.split(/(?<=[.!?])\s+/).filter(Boolean);
  const found = sentences.find((s) => /\byou\b|\byour\b/i.test(s));
  return (found ?? sentences[0] ?? paragraph).trim();
}

function extractCostClause(paragraph: string): string | null {
  const match = paragraph.match(/the (?:cost|risk|shadow) is ([^,.;]+)/i);
  const clause = match?.[1];
  return clause ? clause.trim() : null;
}

/** WHAT IT IS: one deity-lens sentence, then the universal planet-in-sign
 *  paragraph. */
export function buildWhatItIs(culture: Culture, body: Planet, sign: ZodiacSign): string {
  const lens = `Your ${getDeityInscription(culture, body)}`;
  return `${lens} ${PLANET_IN_SIGN[body][sign]}`;
}

/** HOW IT SHOWS: the whole-sign house's arena, the deity's concern turned
 *  toward it, and the culture's fixed institutional line. */
export function buildHowItShows(culture: Culture, body: Planet, house: number): string {
  const meaning = getHouseMeaning(house);
  const opener = `It sits in your ${meaning.ordinal.toLowerCase()} house, ${meaning.arena}.`;
  const derived = houseReading(culture, body, house);
  return `${opener} ${derived} ${REGISTER_LINE[culture]}`;
}

/** WHAT TO KEEP IN VIEW: the planet's general caution, recast toward the
 *  sign's specific cost, closed by one instruction the reader can actually
 *  carry out. */
export function buildKeepInView(body: Planet, sign: ZodiacSign): string {
  const opener = firstDirectAddressSentence(PLANET_AREAS[body].blurb);
  const cost = extractCostClause(PLANET_IN_SIGN[body][sign]);
  const bridge = cost
    ? `Left unwatched, this tips toward ${cost}.`
    : "Left unwatched, this placement runs without you noticing.";
  return `${opener} ${bridge} ${PLACEMENT_INSTRUCTIONS[body]}`;
}
