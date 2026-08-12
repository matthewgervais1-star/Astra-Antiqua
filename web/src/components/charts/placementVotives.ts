import type { Culture } from "@/data/cultures";

/**
 * One two-line imperative votive per culture, parameterized only by the
 * deity's name. The same five templates cover every one of the ten
 * placements on every chart, so the votive stays register-true (Egypt
 * weighs, Greece questions, Canaan convenes, Carthage audits, Rome rules)
 * without being authored per body or per sign.
 */
export const PLACEMENT_VOTIVES: Readonly<Record<Culture, (deityName: string) => string>> = {
  egypt: (deity) => `WEIGH WHAT ${deity.toUpperCase()} SHOWS YOU,\nBEFORE THE SCALE CLOSES`,
  greece: (deity) => `ASK ${deity.toUpperCase()} THE PLAIN QUESTION,\nAND PAY WHAT THE ANSWER COSTS`,
  canaan: (deity) => `BRING ${deity.toUpperCase()} BEFORE THE COUNCIL,\nAND LET THE WORD STAND AS VOW`,
  carthage: (deity) => `ENTER WHAT ${deity.toUpperCase()} SHOWS IN THE LEDGER,\nAND CLOSE THE ACCOUNT HONEST`,
  rome: (deity) => `TAKE THE AUSPICE OF ${deity.toUpperCase()},\nAND RULE YOURSELF BY IT`,
};
