import type { Culture } from "@/data/cultures";
import type { AspectKind } from "@/data/sampleChart";

/**
 * The 2-4 word Cinzel headline for the reading rail, keyed by the top
 * harmony/altar bond's aspect kind (conjunction, trine, or sextile · the
 * three kinds a "top bond" for the reading side is ever drawn from). Not
 * deity-specific: with ten planets across two charts the pairing space is
 * too large to hand-author per pair, so the headline reads the register of
 * the WINNING KIND in that culture's voice, the way the mock's "TWO HOUSES,
 * ONE HARBOR" reads Carthage's harbor register for a conjunction.
 */
export const SYNASTRY_HEADLINES: Readonly<
  Record<Culture, Readonly<Record<"conjunction" | "trine" | "sextile", string>>>
> = {
  egypt: {
    conjunction: "ONE BARQUE, TWO OARS",
    trine: "THE RIVER FAVORS BOTH",
    sextile: "A FAIR WIND HOLDS",
  },
  greece: {
    conjunction: "ONE ORACLE, TWO QUESTIONS",
    trine: "THE GOD ANSWERS FREELY",
    sextile: "THE SHRINE STANDS OPEN",
  },
  canaan: {
    conjunction: "ONE SEAT, TWO NAMES",
    trine: "THE RAINS NEED NO VOW",
    sextile: "TRIBUTE WITHOUT ASKING",
  },
  carthage: {
    conjunction: "TWO HOUSES, ONE HARBOR",
    trine: "FAIR WINDS, SAME HARBOR",
    sextile: "SAFE PASSAGE GRANTED",
  },
  rome: {
    conjunction: "ONE EAGLE, TWO STANDARDS",
    trine: "AUSPICIOUS ON BOTH SIDES",
    sextile: "A TREATY STANDS READY",
  },
};

/**
 * The Votive's two-line imperative, keyed by the top TENSION bond's kind
 * (square or opposition) in the common case; the other three kinds are
 * filled in too so an all-easy pairing still resolves a votive. Lines are
 * joined with a literal newline, matching Votive's whitespace-pre-line.
 */
export const SYNASTRY_VOTIVES: Readonly<Record<Culture, Readonly<Record<AspectKind, string>>>> = {
  egypt: {
    square: "WEIGH THE DEBT BEFORE THE FEATHER DOES;\nPAY WHAT THE SCALE ALREADY KNOWS",
    opposition: "STEADY BOTH PANS BEFORE YOU SPEAK;\nLET NEITHER SHORE CLAIM THE CROSSING",
    conjunction: "ROW IN THE SAME DIRECTION;\nNAME WHO HOLDS THE RUDDER",
    trine: "TAKE THE FAIR WIND WHILE IT HOLDS;\nOFFER SOMETHING BACK TO THE RIVER",
    sextile: "RAISE THE SAIL TOGETHER;\nNEITHER OAR RESTS ALONE",
  },
  greece: {
    square: "NAME THE PRICE BEFORE YOU ACCEPT;\nDO NOT BARGAIN WITH THE ORACLE",
    opposition: "ASK ONE QUESTION AT A TIME;\nLET THE OTHER SHRINE WAIT ITS TURN",
    conjunction: "SPEAK WITH ONE VOICE TODAY;\nDECIDE TOGETHER WHO IS HEARD",
    trine: "TAKE THE FREE ANSWER GLADLY;\nPOUR THE FIRST WINE OUT IN THANKS",
    sextile: "KNOCK WHILE THE DOOR STANDS OPEN;\nASK WHAT YOU ACTUALLY WANT TO KNOW",
  },
  canaan: {
    square: "BRING THE WITNESS BEFORE THE COUNCIL;\nARGUE THE MATTER OUT IN FULL",
    opposition: "WAIT FOR ONE SEASON TO YIELD;\nDO NOT FORCE BAAL AND MOT TOGETHER",
    conjunction: "SHARE THE SEAT WITHOUT CROWDING IT;\nSPEAK FOR BOTH OR SPEAK FOR NEITHER",
    trine: "WORK THE FIELD WHILE THE RAIN HOLDS;\nMAKE NO VOW YOU DO NOT NEED",
    sextile: "OFFER THE TRIBUTE ON TIME;\nEXPECT THE ANSWER, NOT THE FAVOR",
  },
  carthage: {
    square: "NAME THE OLD VOW ALOUD,\nAND THE HARBOR IS YOURS",
    opposition: "SETTLE ONE CLAIM BEFORE THE OTHER SAILS;\nTHE HARBOR HOLDS ONE CARGO AT A TIME",
    conjunction: "ENTER BOTH NAMES ON ONE LINE;\nLET THE LEDGER READ THEM AS ONE",
    trine: "SAIL WHILE THE LEDGER IS CLEAN;\nCALL NOTHING IN THAT IS NOT YET DUE",
    sextile: "LOAD THE CARGO WHILE THE WIND HOLDS;\nNOTHING SHIPS THAT IS NOT ENTERED FIRST",
  },
  rome: {
    square: "FILE THE OBJECTION BEFORE YOU ACT;\nLET THE CONTEST BE HEARD, NOT AVOIDED",
    opposition: "ONE OF YOU MUST YIELD THE CHAIR;\nDECIDE WHO STANDS DOWN BEFORE THE SENATE DOES",
    conjunction: "MARCH UNDER ONE EAGLE TODAY;\nNAME WHICH OF YOU CARRIES IT",
    trine: "TAKEN ON THE RIGHT, PROCEED;\nNO SECOND READING IS NEEDED",
    sextile: "OFFER THE TREATY IN WRITING;\nIT HOLDS ONLY IF BOTH SIGN",
  },
};

/** "A VOW CALLED IN" -> "A vow called in." */
export function labelToSentence(label: string): string {
  const lower = label.toLowerCase();
  const withStop = lower.endsWith(".") ? lower : `${lower}.`;
  return withStop.charAt(0).toUpperCase() + withStop.slice(1);
}
