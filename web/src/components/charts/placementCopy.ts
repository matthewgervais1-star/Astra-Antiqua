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
  greece: "Nothing the oracle has already seen gets softened on the way out.",
  canaan: "Once the council seats a thing, it stays seated.",
  carthage: "A posted entry stands. There is no column in the book for second thoughts.",
  rome: "The augur reads the sign once and does not ask the sky again.",
};

/**
 * The sentence that locates the placement in its house, one opening move per
 * culture. A single fixed opener printed the same clause on all 120 placement
 * pages in all five voices, which is the seam the cadence spec names.
 */
const HOUSE_OPENER: Readonly<Record<Culture, string>> = {
  egypt: "The scribes have entered it in",
  greece: "It keeps",
  canaan: "It holds a seat in",
  carthage: "It is posted to",
  rome: "It stands watch over",
};

/**
 * One concrete, repeatable instruction per body, closing WHAT TO KEEP IN
 * VIEW. Tied to the planet's governed area rather than the sign or the
 * culture, so it holds true across every placement page it closes.
 */
const PLACEMENT_INSTRUCTIONS: Readonly<Record<Planet, string>> = {
  sun: "Show the unfinished thing to someone who will not flatter it.",
  moon: "Name the mood before you act on it.",
  mercury: "Send the plain version before you polish it.",
  venus: "Choose what you want without dressing it up as need.",
  mars: "Pick the fight that is actually yours to pick.",
  jupiter: "Say the smaller, truer number out loud.",
  saturn: "Set the deadline before the dread sets it for you.",
  uranus: "Warn one person before you break the pattern.",
  neptune: "Write down where the feeling started, and when.",
  pluto: "Tell the truth to whoever it concerns.",
};

/**
 * The clause that hands the placement's cost to the reader, one per body.
 * A single bridge ("Left unwatched, this tips toward ...") printed the same
 * six words on every placement page in the corpus; the failure mode is the
 * planet's, so the sentence is the planet's too. LEAD is completed by the
 * cost clause lifted out of PLANET_IN_SIGN. ALONE stands in for the 37 of 120
 * placements that name no usable cost, and never says "placement". Saturn
 * names no cost in any of its twelve signs, so UNWATCHED_ALONE.saturn carries
 * every Saturn page and UNWATCHED_LEAD.saturn is currently unreachable; it is
 * kept so a later PLANET_IN_SIGN edit does not leave a hole.
 */
const UNWATCHED_LEAD: Readonly<Record<Planet, string>> = {
  sun: "With nobody to check it, this tips toward",
  moon: "Untended, this slides toward",
  mercury: "Unchecked, this runs toward",
  venus: "Flattered rather than watched, this drifts toward",
  mars: "Pointed at nothing in particular, this turns toward",
  jupiter: "Allowed to keep growing, this swells toward",
  saturn: "Left unnamed, this hardens toward",
  uranus: "Left to break where it pleases, this bolts toward",
  neptune: "Left unlit, this blurs toward",
  pluto: "Left unsaid, this presses toward",
};

const UNWATCHED_ALONE: Readonly<Record<Planet, string>> = {
  sun: "This sets itself at the head of the table and never asks how it got there.",
  moon: "This runs on old weather and calls it today's.",
  mercury: "This keeps talking whether or not it is being followed.",
  venus: "This keeps choosing for you while you look elsewhere.",
  mars: "This spends itself on whatever is nearest.",
  jupiter: "This keeps adding until someone counts.",
  saturn: "This keeps its own schedule and tells you at the end of it.",
  uranus: "This lets go all at once. There is no run-up to catch.",
  neptune: "This blurs the edge quietly, and you find out late.",
  pluto: "This works underneath and sends up no notice.",
};

function firstDirectAddressSentence(paragraph: string): string {
  const sentences = paragraph.split(/(?<=[.!?])\s+/).filter(Boolean);
  const found = sentences.find((s) => /\byou\b|\byour\b/i.test(s));
  return (found ?? sentences[0] ?? paragraph).trim();
}

function extractCostClause(paragraph: string): string | null {
  const match = paragraph.match(/the (?:cost|risk|shadow) is ([^,.;]+)/i);
  const clause = match?.[1]?.trim();
  if (!clause) return null;
  // A cost written as a subordinate clause ("the risk is that no one sees you
  // leave") cannot follow UNWATCHED_LEAD's preposition, and composing it
  // anyway printed "this bolts toward that no one sees you leave". Those
  // placements take UNWATCHED_ALONE instead.
  if (/^(?:that|when|if|because|so)\b/i.test(clause)) return null;
  return clause;
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
  // The opener names the house by its epithet, not by its arena: houseReading()
  // closes on the arena word for word, and printing it twice in one paragraph
  // was the loudest seam on the placement page.
  const opener = `${HOUSE_OPENER[culture]} your ${meaning.ordinal.toLowerCase()} house, ${meaning.title.toLowerCase()}.`;
  const derived = houseReading(culture, body, house);
  return `${opener} ${derived} ${REGISTER_LINE[culture]}`;
}

/** WHAT TO KEEP IN VIEW: the planet's general caution, recast toward the
 *  sign's specific cost, closed by one instruction the reader can actually
 *  carry out. */
export function buildKeepInView(body: Planet, sign: ZodiacSign): string {
  const opener = firstDirectAddressSentence(PLANET_AREAS[body].blurb);
  const cost = extractCostClause(PLANET_IN_SIGN[body][sign]);
  const bridge = cost ? `${UNWATCHED_LEAD[body]} ${cost}.` : UNWATCHED_ALONE[body];
  return `${opener} ${bridge} ${PLACEMENT_INSTRUCTIONS[body]}`;
}
