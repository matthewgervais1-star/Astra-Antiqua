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
    conjunction: (a, b) => `${cap(a)} and ${b} enter the pylon together, and the doorkeeper slides back the bolt.`,
    sextile: (a, b) => `${cap(a)} sends the north wind to ${b}, and a boat that raises no sail drifts with the current.`,
    square: (a, b) => `${cap(a)} and ${b} haul the sledge on opposite ropes, and the block creeps toward the stronger rope.`,
    trine: (a, b) => `${cap(a)} and ${b} sit level on the scale, and Anubis does not touch the beam.`,
    opposition: (a, b) => `${cap(a)} hangs in one pan and ${b} in the other, and Thoth waits with his reed above the papyrus.`,
  },
  greece: {
    conjunction: (a, b) => `The tripod gives one answer for ${a} and ${b}, and both go down the hill.`,
    sextile: (a, b) => `The shrine is open to ${a} and ${b}, and the Pythia answers whichever climbs to her first.`,
    square: (a, b) => `${cap(a)} contests ${b}, and the Pythia casts lots for first place before she gives either answer.`,
    trine: (a, b) => `The Pythia takes ${a} and ${b} ahead of the crowd and answers both from the tripod.`,
    opposition: (a, b) => `${cap(a)} and ${b} come to the tripod by separate roads, and one by one the Pythia gives each a different answer.`,
  },
  canaan: {
    conjunction: (a, b) => `${cap(a)} and ${b} go before the assembly in both their names, and the decree falls on the pair.`,
    sextile: (a, b) => `Before the assembled gods, ${a} stands beside ${b}, and a vow made now binds every god who sits.`,
    square: (a, b) => `${cap(a)} rises to accuse ${b}, and the assembly takes up nothing else at this sitting.`,
    trine: (a, b) => `The assembly passes ${a} and ${b} without a vote, and no god requires a vow of the pair.`,
    opposition: (a, b) => `The gods set down their cups as ${a} and ${b} each seek the floor of the assembly.`,
  },
  carthage: {
    conjunction: (a, b) => `The clerk lists ${a} and ${b} as a joint line of the register, and a seal covers both.`,
    sextile: (a, b) => `${cap(a)} stands surety for ${b} until the ships come home.`,
    square: (a, b) => `${cap(a)} refuses the terms written for ${b}, and the Hundred and Four read the roll again line by line.`,
    trine: (a, b) => `The clerk adds ${a} to ${b}, and the sum closes the day's sheet on the first pass.`,
    opposition: (a, b) => `The clerk sets ${a} and ${b} against each other, and the balance stays open.`,
  },
  rome: {
    conjunction: (a, b) => `${cap(a)} and ${b} wait on the sacred chickens, and the keeper announces the feeding.`,
    sextile: (a, b) => `The haruspex finds ${a} favorable to ${b}, and the sign lasts the day.`,
    square: (a, b) => `An adverse omen stands between ${a} and ${b}, and the consul defers the day's business.`,
    trine: (a, b) => `The Vestals feed the hearth for ${a} and ${b}, and the flame burns clear.`,
    opposition: (a, b) => `The tribunes split, one for ${a} and one for ${b}, and each vetoes the other.`,
  },
};

/**
 * An ingress, tethered: the deity's charge crosses into a new sign, said in
 * the institution's terms. One slot, the charge. Declarative, since a change
 * of sign reports where things now stand and orders nothing.
 */
export type IngressFrame = (charge: string) => string;

export const INGRESS_FRAMES: Readonly<Record<Culture, IngressFrame>> = {
  egypt: (c) => `The priest of the hours on the temple roof watches the sign's decans rise and reads ${c} in them.`,
  greece: (c) => `The priests there begin the sacrifice for ${c}.`,
  canaan: (c) => `${cap(c)} moves to the house of another god, where no envoy has announced it.`,
  carthage: (c) => `The clerk carries ${c} onto a fresh sheet of the ledger and rules off the last one.`,
  rome: (c) => `The auspices taken for ${c} lapse at that boundary, and the college takes new ones beyond it.`,
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
    conjunction: (d) => `Declare your errand to ${d}, and have the scribe take it down on one papyrus.`,
    sextile: (d) => `Lay out bread and beer at the start of the work, and speak ${d}'s name over them.`,
    square: (d) => `Weigh what ${d} brings twice before you speak of it.`,
    trine: (d) => `Send the heaviest load downriver, and call on ${d} when the barge casts off.`,
    opposition: (d) => `Keep to your own bank and hail ${d} from there.`,
  },
  greece: {
    conjunction: (d) => `Bring a question about ${d} up the road.`,
    sextile: (d) => `Put your question about ${d} to the Pythia in the fewest words.`,
    square: (d) => `Hear what the Pythia says of ${d}, then follow it or go home.`,
    trine: (d) => `Repeat the answer about ${d} word for word in the town below the hill.`,
    opposition: (d) => `Ask the Pythia about ${d} from the other side.`,
  },
  canaan: {
    conjunction: (d) => `Give your pledge in the temple court and let ${d} hear it.`,
    sextile: (d) => `State your request in ${d}'s hearing.`,
    square: (d) => `Press every word ${d} speaks into a clay tablet.`,
    trine: (d) => `Leave your hands empty and let ${d} see them.`,
    opposition: (d) => `Wait at the gate until ${d} has sat down.`,
  },
  carthage: {
    conjunction: (d) => `Set ${d} at the head of your contract and sign beneath it.`,
    sextile: (d) => `Lodge your written offer to ${d} before the next sailing.`,
    square: (d) => `Demand the temple clerk's receipt for what you gave ${d}.`,
    trine: (d) => `List ${d}'s share on the manifest.`,
    opposition: (d) => `Strike one line from your own account and leave ${d}'s untouched.`,
  },
  rome: {
    conjunction: (d) => `Appoint a procurator for your affairs and burn incense to ${d}.`,
    sextile: (d) => `Pour a libation to ${d} and ask a magistrate to refer your motion to the Senate.`,
    square: (d) => `Postpone your case and atone to ${d} with a lamb.`,
    trine: (d) => `Take your suit to the praetor and offer ${d} a garland on the way.`,
    opposition: (d) => `Withhold your petition and recite the pontifex's prayer to ${d}.`,
  },
};
