import type { Catalog, ComposedRows } from "@/strings/types";

/** The Week screen (board Glass-Week, P21 to P31, P53, P171). */
export const WEEK = {
  // P21. range: range.days (F2, local days).
  "week.kicker": "{range} · {institution}",
  // P22. Ruled: web's headline per culture. F10: ’.
  "week.title": {
    egypt: "SEVEN DAYS WEIGHED",
    greece: "SEVEN QUESTIONS",
    canaan: "SEVEN SITTINGS",
    carthage: "THE WEEK’S LEDGER",
    rome: "FASTUS AND NEFASTUS",
  },
  // P23. count.word, zero NONE (F7).
  "week.countLine": "{days} DAYS · {weighed} WEIGHED · {quiet} QUIET",
  // No board slot; web's thesis.
  "week.thesis": {
    egypt: "The day is laid on the scale at evening and the pans settle overnight. Seven weighings make the week.",
    greece: "One question goes up to Delphi each day; the week is the art of asking them in order.",
    canaan: "The council convenes each day on one matter; El presides at the seventh and closes the session.",
    carthage: "Seven entries, debits and credits of the sky; the ledger is balanced before the next crossing.",
    rome: "Each day is marked lawful or unlawful for business before it begins; act on the F days.",
  },
  // P53. As Day P11, five lines: label, phase, lit, next quarter, its date (date.dayMonthYear, local).
  "week.moon.label": "MOON",
  "week.moon.phase": "{phase}",
  "week.moon.lit": "{percent} LIT",
  "week.moon.nextQuarter": "{quarter}",
  "week.moon.nextQuarter.date": "{date}",
  // P25 to P31. Two slots; web joins them with a space (layout). weekday: date.weekday; d: date.dayOfMonth.
  "week.row.weekday": "{weekday}",
  "week.row.date": "{d}",
  // P27.
  "week.row.today": "TODAY",
  // P25 to P31. a, b: planet symbols; tone: tone.word (F9). Ruled: TIGHT under 0.5° of orb.
  "week.row.shorthand.aspect": "{a} {aspectGlyph} {b} · {tone}",
  "week.row.shorthand.aspectTight": "{a} {aspectGlyph} {b} · TIGHT · {tone}",
  // A conjunction names its sign (sign.full).
  "week.row.shorthand.conjunction": "{a} ☌ {b} · {sign} · {tone}",
  "week.row.shorthand.conjunctionTight": "{a} ☌ {b} · TIGHT · {sign} · {tone}",
  // P25 to P31. sign: sign.full (F8).
  "week.row.shorthand.ingress": "{symbol} INTO {sign}",
  "week.row.shorthand.quiet": "QUIET",
  // No board slot; web's note. Rome carries the day flags.
  "week.note": {
    egypt: "DAYS TALLIED AGAINST THE FEATHER",
    greece: "EACH DAY NAMES ITS QUESTION",
    canaan: "THE SEVENTH DAY SEALS THE SIX",
    carthage: "ENTRIES CARRY FORWARD, VOWS DO NOT",
    rome: "DAYS FLAGGED F · N · C IN THE LIST · F LAWFUL · N UNLAWFUL · C MIXED",
  },
  // No board slot; web's votive, keyed by the tone of the week's hardest day.
  "week.votive.tension": {
    egypt: "WEIGH WHAT IS HEAVY BEFORE\nYOU CARRY IT INTO FRIDAY",
    greece: "ASK THE HARD QUESTION\nBEFORE THE WEEK ASKS IT FOR YOU",
    canaan: "LET THE WITNESS SPEAK\nBEFORE THE COUNCIL CLOSES",
    carthage: "LEAVE THE BOOKS OPEN\nUNTIL THE ACCOUNT IS TRUE",
    rome: "PROCEED, BUT KEEP\nTHE DEFENSE READY",
  },
  "week.votive.harmony": {
    egypt: "TAKE THE CURRENT WHILE\nIT RUNS WITH YOU",
    greece: "TAKE THE ANSWER GIVEN FREELY,\nWITHOUT A SECOND ASKING",
    canaan: "SEAL THE VOW WHILE\nTHE RAINS STILL FAVOR IT",
    carthage: "LOAD WHILE THE HARBOR\nIS STILL OPEN TO YOU",
    rome: "TAKE THE RIGHT HAND OFFERED\nWITHOUT A SECOND READING",
  },
  "week.votive.quiet": {
    egypt: "ORDINARY DAYS ARE NOT\nEMPTY DAYS",
    greece: "SILENCE FROM THE SHRINE\nIS ALSO AN ANSWER",
    canaan: "THE TENT STANDS EVEN ON\nA DAY WITH NO MATTER BEFORE IT",
    carthage: "A STEADY LEDGER IS\nSTILL A PROFITABLE ONE",
    rome: "AN ORDINARY DAY IS STILL\nTAKEN UNDER AUSPICES",
  },
  // No board slot; web's feedback noun.
  "week.feedback.noun": "WEEK",
} as const satisfies Catalog;

export const WEEK_COMPOSED = {
  "week.row.headline": "lib/weekReading.ts buildWeekDays headline",
  "week.row.line": "lib/weekReading.ts buildWeekDays line",
} as const satisfies ComposedRows;
