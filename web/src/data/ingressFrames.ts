import type { Culture } from "@/data/cultures";

/** Capitalise a charge that opens a sentence. */
const cap = (s: string): string => s.charAt(0).toUpperCase() + s.slice(1);

/**
 * An ingress, tethered: the deity's charge (data/deityCharges.ts) crosses
 * into a new sign, said in the institution's terms. One slot, the charge.
 * Declarative, since a change of sign reports where things now stand and
 * orders nothing. The week prints it on a day with no figure in orb.
 */
export type IngressFrame = (charge: string) => string;

export const INGRESS_FRAMES: Readonly<Record<Culture, IngressFrame>> = {
  egypt: (c) => `The priest of the hours on the temple roof watches the sign's decans rise and reads ${c} in them.`,
  greece: (c) => `The priests there begin the sacrifice for ${c}.`,
  canaan: (c) => `${cap(c)} moves to the house of another god, where no envoy has announced it.`,
  carthage: (c) => `The clerk carries ${c} onto a fresh sheet of the ledger and rules off the last one.`,
  rome: (c) => `The auspices taken for ${c} lapse at that boundary, and the college takes new ones beyond it.`,
};
