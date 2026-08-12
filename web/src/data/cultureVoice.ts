import type { Culture } from "@/data/cultures";

/**
 * The finite per-culture surface configuration: the titles, structures, and
 * banks that let the week/year/synastry/forecast/permissions/day-pressure
 * surfaces speak in each pantheon's institutional voice without a single
 * shared sentence. Every string here is authored per culture; nothing is a
 * template with the culture name swapped in.
 */
export interface CultureVoice {
  institution: string;
  weekTitle: string;
  weekThesis: string;
  weekNote: string;
  yearTitle: string;
  yearStructure: "seasons3" | "festivals" | "halvesRains" | "halvesSea" | "quarters4";
  synastryTitle: string;
  forecastTitle: string;
  forecastNote: string;
  permissionPair: readonly [string, string];
  /** Four whole-sign house groups, fixed order: work-and-substance,
   *  home-and-kin, words-and-errands, inner-court. */
  houseGroups: readonly { name: string; sub: string }[];
  /** Rome marks days F / N / C (fastus / nefastus / comitialis); the others
   *  do not carry a day-flag convention. */
  dayFlags: boolean;
  /** One line framing how this culture receives the three modern bodies. */
  receptionLine: string;
}

export const CULTURE_VOICES: Readonly<Record<Culture, CultureVoice>> = {
  egypt: {
    institution: "THE HALL OF MA’AT",
    weekTitle: "SEVEN DAYS WEIGHED",
    weekThesis: "Each day is set on the scale at evening; the week is the running total.",
    weekNote: "DAYS TALLIED AGAINST THE FEATHER",
    yearTitle: "THE YEAR OF THE RIVER",
    yearStructure: "seasons3",
    synastryTitle: "TWO HEARTS, ONE SCALE",
    forecastTitle: "THE NILOMETER",
    forecastNote: "SPANS DRAWN AS FLOOD MARKS",
    permissionPair: ["OFFER", "WITHHOLD"],
    houseGroups: [
      { name: "THE GRANARY", sub: "WORK & SUBSTANCE" },
      { name: "THE HEARTH", sub: "HOME & KIN" },
      { name: "THE ROAD", sub: "WORDS & ERRANDS" },
      { name: "THE TEMPLE", sub: "THE INNER COURT" },
    ],
    dayFlags: false,
    receptionLine: "The scribe enters three late names in the roll; the feather weighs them like the rest.",
  },
  greece: {
    institution: "THE DAY'S ORACLE",
    weekTitle: "SEVEN QUESTIONS",
    weekThesis: "The oracle answers one question per day; the week is the art of asking them in order.",
    weekNote: "EACH DAY NAMES ITS QUESTION",
    yearTitle: "THE FESTIVAL CIRCUIT",
    yearStructure: "festivals",
    synastryTitle: "THE SYMBOLON",
    forecastTitle: "COUNSEL FOR THE TWELVEMONTH",
    forecastNote: "HEARINGS, RETURNS, AND RELEASES",
    permissionPair: ["ASK", "DO NOT ASK"],
    houseGroups: [
      { name: "THE AGORA", sub: "TRADE & STANDING" },
      { name: "THE OIKOS", sub: "HEARTH & KIN" },
      { name: "THE HERM", sub: "MESSAGES & CROSSROADS" },
      { name: "THE ADYTON", sub: "THE INNER SHRINE" },
    ],
    dayFlags: false,
    receptionLine: "Three petitions reached the shrine late; the oracle answers them at the same price.",
  },
  canaan: {
    institution: "THE COUNCIL OF EL",
    weekTitle: "SEVEN SITTINGS",
    weekThesis: "The council convenes each day on one matter; El presides at the seventh and closes the session.",
    weekNote: "THE SEVENTH DAY SEALS THE SIX",
    yearTitle: "THE YEAR OF THE RAINS",
    yearStructure: "halvesRains",
    synastryTitle: "THE COVENANT",
    forecastTitle: "THE RAINS TO COME",
    forecastNote: "WET / DRY BANDS OVER THE SPANS",
    permissionPair: ["BRING", "HOLD BACK"],
    houseGroups: [
      { name: "THE THRESHING FLOOR", sub: "LABOR & YIELD" },
      { name: "THE FATHER'S HOUSE", sub: "KIN & BIRTHRIGHT" },
      { name: "THE GATE", sub: "WORDS & WITNESSES" },
      { name: "THE TENT OF EL", sub: "THE INNERMOST ROOM" },
    ],
    dayFlags: false,
    receptionLine: "Three came late to the council; El seats them, and their word stands as witness.",
  },
  carthage: {
    institution: "THE DECREE OF THE TOPHET",
    weekTitle: "THE WEEK'S LEDGER",
    weekThesis: "Seven entries, debits and credits of the sky; the ledger is balanced before the next crossing.",
    weekNote: "ENTRIES CARRY FORWARD, VOWS DO NOT",
    yearTitle: "THE OPEN AND CLOSED SEA",
    yearStructure: "halvesSea",
    synastryTitle: "THE CONTRACT BETWEEN TWO",
    forecastTitle: "WHEN TO SAIL",
    forecastNote: "SPANS AS SHIPPING LANES",
    permissionPair: ["PAY", "DEFER"],
    houseGroups: [
      { name: "THE COUNTING HOUSE", sub: "WEIGHTS & WAGES" },
      { name: "THE COURTYARD", sub: "HOUSEHOLD & HEIRS" },
      { name: "THE HARBOR", sub: "MESSAGES & SAILINGS" },
      { name: "THE PRECINCT", sub: "VOWS & SILENCE" },
    ],
    dayFlags: false,
    receptionLine: "Three ships came into the harbor late; the ledger records them at full weight.",
  },
  rome: {
    institution: "THE AUSPICES OF THE DAY",
    weekTitle: "FASTUS AND NEFASTUS",
    weekThesis: "Each day is marked lawful or unlawful for business before it begins; act on the F days.",
    weekNote: "DAYS FLAGGED F · N · C IN THE LIST",
    yearTitle: "THE GREAT CIRCUIT",
    yearStructure: "quarters4",
    synastryTitle: "THE FOEDUS",
    forecastTitle: "THE FASTI AHEAD",
    forecastNote: "F / N / C MARKS ALONG THE SPANS",
    permissionPair: ["PROCEED", "REFRAIN"],
    houseGroups: [
      { name: "FORUM", sub: "BUSINESS & STANDING" },
      { name: "DOMUS", sub: "HOUSEHOLD & LINE" },
      { name: "VIA", sub: "DISPATCHES & ERRANDS" },
      { name: "TEMPLUM", sub: "THE INNER SANCTUM" },
    ],
    dayFlags: true,
    receptionLine: "The censor enrolled three new names; the auspices are taken for them under the same law.",
  },
};
