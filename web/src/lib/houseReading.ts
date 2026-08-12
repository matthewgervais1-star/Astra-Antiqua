import type { Culture, Planet } from "@/data/cultures";
import { DEITY_MATRIX } from "@/data/deities";
import { getHouseMeaning } from "@/data/houses";

/**
 * What each planet is doing, phrased as the matter it brings into whatever
 * house it lands in. Combined with the house's arena (data/houses.ts) this
 * yields a reading that is genuinely derived from the placement rather than
 * pulled from a bank, while staying in each pantheon's voice via the deity
 * name.
 */
const PLANET_CONCERN: Readonly<Record<Planet, string>> = {
  sun: "the work of being seen, and of ruling what is yours to rule",
  moon: "the tides of mood, memory, and what the body needs",
  mercury: "the work of the mind, the message, and the bargain",
  venus: "the reach toward beauty, pleasure, and union",
  mars: "the push to act, to cut, and to contend",
  jupiter: "the urge to widen, to bless, and to trust the world to grow",
  saturn: "the meeting with limit, weight, and the long discipline",
  uranus: "the sudden break, the shock that frees what was stuck",
  neptune: "the dissolve, the longing, the boundary that goes soft",
  pluto: "the pressure that strips a thing down to what is real",
};

/**
 * A one-sentence reading for a planet sitting in a whole-sign house, in the
 * chosen pantheon's voice. Phrased so it reads cleanly beneath a header that
 * already names the house ("Seventh House, The Other Shore").
 */
export function houseReading(
  culture: Culture,
  planet: Planet,
  house: number,
): string {
  const deity = DEITY_MATRIX[culture][planet];
  const h = getHouseMeaning(house);
  return `${deity.name} turns ${PLANET_CONCERN[planet]} toward ${h.arena}.`;
}
