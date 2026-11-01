import type { Culture } from "@/data/cultures";
import { COMMON } from "@/strings/common";
import { WEEK } from "@/strings/week";

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
    institution: COMMON["common.institution"].egypt,
    weekTitle: WEEK["week.title"].egypt,
    weekThesis: WEEK["week.thesis"].egypt,
    weekNote: "DAYS TALLIED AGAINST THE FEATHER",
    yearTitle: "THE YEAR OF THE RIVER",
    yearStructure: "seasons3",
    synastryTitle: "TWO HEARTS, ONE SCALE",
    forecastTitle: "THE NILOMETER",
    forecastNote: "SPANS DRAWN AS FLOOD MARKS",
    permissionPair: ["OFFER", "WITHHOLD"],
    houseGroups: [
      { name: "THE GRANARY", sub: "GRAIN & RATIONS" },
      { name: "THE HOUSE OF THE KA", sub: "HOME & FOREBEARS" },
      { name: "THE FERRY", sub: "LETTERS & CROSSINGS" },
      { name: "THE SEALED SHRINE", sub: "THE DARK CHAMBER" },
    ],
    dayFlags: false,
    receptionLine: "The roll carries three names that no scribe of Memphis ever wrote. A late name weighs no less than an old one.",
  },
  greece: {
    institution: COMMON["common.institution"].greece,
    weekTitle: WEEK["week.title"].greece,
    weekThesis: WEEK["week.thesis"].greece,
    weekNote: "EACH DAY NAMES ITS QUESTION",
    yearTitle: "THE FESTIVAL CIRCUIT",
    yearStructure: "festivals",
    synastryTitle: "THE SYMBOLON",
    forecastTitle: "COUNSEL FOR THE TWELVEMONTH",
    forecastNote: "HEARINGS, RETURNS, AND RELEASES",
    permissionPair: ["ASK", "DO NOT ASK"],
    houseGroups: [
      { name: "THE AGORA", sub: "SILVER & GOODS" },
      { name: "THE OIKOS", sub: "HEARTH & KIN" },
      { name: "THE HERM", sub: "MESSAGES & CROSSROADS" },
      { name: "THE ADYTON", sub: "THE PYTHIA ALONE" },
    ],
    dayFlags: false,
    receptionLine: "Three questions were put that Delphi had never been asked. The god answered them at the usual fee.",
  },
  canaan: {
    institution: COMMON["common.institution"].canaan,
    weekTitle: WEEK["week.title"].canaan,
    weekThesis: WEEK["week.thesis"].canaan,
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
    receptionLine: "Three took seats that were empty when the council first sat. Their word stands as witness with the rest.",
  },
  carthage: {
    institution: COMMON["common.institution"].carthage,
    weekTitle: WEEK["week.title"].carthage,
    weekThesis: WEEK["week.thesis"].carthage,
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
    receptionLine: "Three hulls put in from a sea no master out of Carthage has sailed. The harbor weighs their cargo and does not discount it.",
  },
  rome: {
    institution: COMMON["common.institution"].rome,
    weekTitle: WEEK["week.title"].rome,
    weekThesis: WEEK["week.thesis"].rome,
    weekNote: "DAYS FLAGGED F · N · C IN THE LIST",
    yearTitle: "THE GREAT CIRCUIT",
    yearStructure: "quarters4",
    synastryTitle: "THE FOEDUS",
    forecastTitle: "THE FASTI AHEAD",
    forecastNote: "F / N / C MARKS ALONG THE SPANS",
    permissionPair: ["PROCEED", "REFRAIN"],
    houseGroups: [
      { name: "FORUM", sub: "BUSINESS & STANDING" },
      { name: "DOMUS", sub: "LARES & LINE" },
      { name: "VIA", sub: "DISPATCHES & ERRANDS" },
      { name: "TEMPLUM", sub: "THE INNER SANCTUM" },
    ],
    dayFlags: true,
    receptionLine: "The censor enrolled three new names. The law that covers the oldest names covers these.",
  },
};
