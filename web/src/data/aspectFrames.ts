import type { Culture } from "@/data/cultures";
import type { AspectKind } from "@/data/sampleChart";

/**
 * The decree's ruling, tethered to the figure. Each frame takes the two
 * deity charges (data/deityCharges.ts) and returns one sentence in the
 * institution's register, so the sentence changes whenever the bodies do.
 * The generic per-kind rulings in data/aspectRulings.ts stay for the glossary
 * and the voices pages, where describing the kind is the point.
 */
export type Frame = (a: string, b: string) => string;

/** Capitalise a charge that opens a sentence. */
const cap = (s: string): string => s.charAt(0).toUpperCase() + s.slice(1);

export const ASPECT_FRAMES: Readonly<Record<Culture, Readonly<Record<AspectKind, Frame>>>> = {
  egypt: {
    conjunction: (a, b) => `Two loads ride one barque today, ${a} and ${b}, and the river carries both or neither.`,
    sextile: (a, b) => `${cap(a)} lends its wind to ${b}; the sail that is raised is the one that moves.`,
    square: (a, b) => `${cap(a)} pulls the beam out of true against ${b}, and only labor brings the pans level.`,
    trine: (a, b) => `${cap(a)} and ${b} sit level on the scale, and no hand needs to touch it.`,
    opposition: (a, b) => `${cap(a)} hangs in one pan and ${b} in the other, and the scribe writes no verdict until one descends.`,
  },
  greece: {
    conjunction: (a, b) => `The tripod gives one answer for ${a} and ${b}, and neither may claim it alone.`,
    sextile: (a, b) => `${cap(a)} stands ready to counsel ${b}; the shrine answers the question that is put.`,
    square: (a, b) => `${cap(a)} contests ${b} at the shrine, and the god will not split the difference.`,
    trine: (a, b) => `${cap(a)} moves in step with ${b}, and the answer comes down the road unasked.`,
    opposition: (a, b) => `${cap(a)} faces ${b} across the agora, and the oracle hears both voices at once.`,
  },
  canaan: {
    conjunction: (a, b) => `${cap(a)} and ${b} come before El as one petition, and the council rules on both together.`,
    sextile: (a, b) => `${cap(a)} speaks in favor of ${b}, and the floor is open for the vow.`,
    square: (a, b) => `${cap(a)} raises an objection to ${b}, and the matter goes twice round the floor.`,
    trine: (a, b) => `${cap(a)} and ${b} are entered in the record together, unopposed.`,
    opposition: (a, b) => `${cap(a)} and ${b} stand on their feet against each other, and the docket does not clear.`,
  },
  carthage: {
    conjunction: (a, b) => `${cap(a)} and ${b} are posted to one line of the register, and one seal covers both.`,
    sextile: (a, b) => `${cap(a)} holds a berth for ${b}; the entry stands until the tide, unclaimed.`,
    square: (a, b) => `${cap(a)} disputes the figure ${b} brings, and the column is read again line by line.`,
    trine: (a, b) => `${cap(a)} and ${b} balance on the same page, and the day's sheet closes without a correction.`,
    opposition: (a, b) => `${cap(a)} and ${b} are entered against each other, and an entry disputed is not an entry.`,
  },
  rome: {
    conjunction: (a, b) => `The auspice taken for ${a} binds ${b} as well; neither acts on it alone.`,
    sextile: (a, b) => `${cap(a)} shows favorable to ${b}, and the sign waits for someone to claim it.`,
    square: (a, b) => `${cap(a)} enters an objection against ${b}, and every step goes forward under challenge.`,
    trine: (a, b) => `${cap(a)} and ${b} stand under the same fastus day, and what is done under it holds.`,
    opposition: (a, b) => `${cap(a)} and ${b} hold one office between them, and each vetoes the other.`,
  },
};

/**
 * An ingress, tethered: the deity's charge crosses into a new sign, said in
 * the institution's terms. One slot, the charge. Declarative, since a change
 * of sign reports where things now stand and orders nothing.
 */
export type IngressFrame = (charge: string) => string;

export const INGRESS_FRAMES: Readonly<Record<Culture, IngressFrame>> = {
  egypt: (c) => `${cap(c)} crosses to a new bank of the river, and the old mark no longer measures it.`,
  greece: (c) => `${cap(c)} comes onto new ground, and the shrine there has not yet been asked.`,
  canaan: (c) => `${cap(c)} is brought before a new seat, and the council there has not yet ruled.`,
  carthage: (c) => `${cap(c)} is entered under a new heading, and the old bearing no longer holds.`,
  rome: (c) => `${cap(c)} stands on new ground, and the auspices there have not been taken.`,
};

/**
 * The one instruction a decree may carry, and only when the headline figure
 * is exact. A wide sextile has no standing to order anyone's morning; a
 * degree-exact one does. One slot, the headline deity's name, so the order
 * points back at the god in the headline rather than echoing the charge the
 * ruling just used.
 */
export type Instruction = (deity: string) => string;

export const EXACT_INSTRUCTIONS: Readonly<Record<Culture, Readonly<Record<AspectKind, Instruction>>>> = {
  egypt: {
    conjunction: (d) => `Enter what ${d} brings in one line, and let the scribe seal it.`,
    sextile: (d) => `Raise the sail while ${d} sends the wind.`,
    square: (d) => `Weigh what ${d} brings twice before you speak of it.`,
    trine: (d) => `Row while ${d} runs with the current.`,
    opposition: (d) => `Stand at the balance until ${d} answers, and not a moment less.`,
  },
  greece: {
    conjunction: (d) => `Bring ${d} one question up the road, not three.`,
    sextile: (d) => `Put your question to ${d} in as few words as you can.`,
    square: (d) => `Reckon what ${d} asks of you, then accept it or go home.`,
    trine: (d) => `Act on what ${d} gives before you are back down the road.`,
    opposition: (d) => `Ask ${d} a different question.`,
  },
  canaan: {
    conjunction: (d) => `Swear it once before ${d}, and before witnesses.`,
    sextile: (d) => `Stand while ${d} sits and put the matter into words.`,
    square: (d) => `Let the objection ${d} raises go into the record before you answer it.`,
    trine: (d) => `Put the plough in before ${d} calls the feast day.`,
    opposition: (d) => `Adjourn until ${d} has sat down.`,
  },
  carthage: {
    conjunction: (d) => `Keep one book for what ${d} posts, in your own hand.`,
    sextile: (d) => `Get what ${d} offers into the register before the day closes.`,
    square: (d) => `Go back down the column ${d} disputes before you sign.`,
    trine: (d) => `Weigh out what ${d} brings, sign the manifest, and sail.`,
    opposition: (d) => `Strike one name from the entry ${d} contests before the tide turns.`,
  },
  rome: {
    conjunction: (d) => `Send one man to speak for ${d}.`,
    sextile: (d) => `Put forward what ${d} shows, in your own name, while the Forum is full.`,
    square: (d) => `Have your witnesses in the room before ${d} is heard.`,
    trine: (d) => `Get what ${d} grants in front of the magistrate this morning.`,
    opposition: (d) => `Settle the precedence with ${d} before anything else is brought forward.`,
  },
};
