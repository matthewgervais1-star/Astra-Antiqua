import type { Culture } from "@/data/cultures";
import type { AspectKind } from "@/data/sampleChart";

/**
 * One-sentence institutional ruling for each aspect kind, in each culture's
 * own register: Rome's augury, Egypt's weighing, Greece's oracle, Canaan's
 * council, Carthage's ledger. 5 cultures x 5 aspect kinds = 25 rulings.
 */
export const ASPECT_RULINGS: Readonly<Record<Culture, Readonly<Record<AspectKind, string>>>> = {
  rome: {
    conjunction: "Two powers seated in one temple. They act as one, for good or ill.",
    sextile: "A favorable omen that requires a petition. It helps only if asked.",
    square: "An objection with standing. The action may proceed, but it will be contested.",
    trine: "Auspicious, taken on the right. Proceed without a second reading.",
    opposition: "Two magistrates, one office. Nothing resolves until one yields the chair.",
  },
  egypt: {
    conjunction: "Two gods ride in one barque. Where the river carries it, it carries them both.",
    sextile: "A fair wind stands on the river. It moves only the boat that raises a sail.",
    square: "Isfet enters the weighing hall. It will be balanced, but the balancing is work.",
    trine: "The scale holds without a hand to steady it. Heart and feather agree; proceed.",
    opposition: "The two pans hang level, and neither falls. The scribe writes no verdict until one side descends.",
  },
  greece: {
    conjunction: "Two gods answer through one mouth. You receive a single voice, and cannot choose whose.",
    sextile: "The door of the shrine stands open. The god inside answers only what is asked.",
    square: "The answer is given, but it costs. The god names the price first, and it is not small.",
    trine: "The oracle speaks before the question is finished. Take the answer; nothing is owed for it.",
    opposition: "Two shrines return opposite answers. Neither is wrong; the question must change before anything settles.",
  },
  canaan: {
    conjunction: "Two gods take one seat in the council of El. When that seat speaks, it speaks for both.",
    sextile: "A vow made today will be answered. No vow, no answer.",
    square: "A witness rises and is heard. The matter goes forward, but it goes forward argued.",
    trine: "The rains come without a vow made. Baal is returned; work the field while it holds.",
    opposition: "Baal holds above and Mot holds below. Nothing moves until one season yields to the other.",
  },
  carthage: {
    conjunction: "Two accounts are entered under one name. Profit or loss, the ledger no longer tells them apart.",
    sextile: "The harbor is open and the wind is fair. No cargo moves that is not loaded.",
    square: "The audit turns up a discrepancy. Trade continues, but the books stay open until it is explained.",
    trine: "The sailing season opens and the ledger is clean. Set out; nothing is called in first.",
    opposition: "Two merchants claim one cargo at the quay. Nothing ships until one claim is withdrawn.",
  },
};
