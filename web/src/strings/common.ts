import type { Catalog } from "@/strings/types";

/**
 * Strings more than one screen prints, and the declared run-time slots.
 * Ruled table: docs/design/shared-strings-table-2026-11.md. A comment above
 * each key names its board ID and the format that fills each slot.
 */
export const COMMON = {
  // P4, P21, P32, P43, P99. The culture's institution (cultureVoice.ts reads it from here). F10: ’.
  "common.institution": {
    egypt: "THE HALL OF MA’AT",
    greece: "THE DAY’S ORACLE",
    canaan: "THE COUNCIL OF EL",
    carthage: "THE DECREE OF THE TOPHET",
    rome: "THE AUSPICES OF THE DAY",
  },
  // P3, P130 to P134 (chrome.cultureChip, more.culture.row). Stored upper.
  "common.culture.name": {
    egypt: "EGYPT",
    greece: "GREECE",
    canaan: "CANAAN",
    carthage: "CARTHAGE",
    rome: "ROME",
  },
  // P130 to P134, P149 to P153 (more.culture.row tagline). F10: ’.
  "common.culture.tagline": {
    egypt: "The Hall of Ma’at",
    greece: "The Oracle of Delphi",
    canaan: "The Divine Council",
    carthage: "The Decree of the Council",
    rome: "The Sibylline Books",
  },
  // P11, P53. Moon phase names, as the board prints them.
  "common.moon.newMoon": "NEW MOON",
  "common.moon.waxingCrescent": "WAXING CRESCENT",
  "common.moon.firstQuarter": "FIRST QUARTER",
  "common.moon.waxingGibbous": "WAXING GIBBOUS",
  "common.moon.fullMoon": "FULL MOON",
  "common.moon.waningGibbous": "WANING GIBBOUS",
  "common.moon.lastQuarter": "LAST QUARTER",
  "common.moon.waningCrescent": "WANING CRESCENT",
} as const satisfies Catalog;

/**
 * Every `{slot}` a catalog value may name, with what fills it. strings.test.ts
 * fails on a slot not listed here.
 */
export const SLOTS = {
  institution: "common.institution for the culture",
  date: "a date, in the format the key's comment names",
  from: "a date, start of a pair",
  to: "a date, end of a pair",
  range: "range.days or range.months",
  deity: "a deity name, upper (DEITY_MATRIX)",
  deityA: "a deity name, upper",
  deityB: "a deity name, upper",
  aspectGlyph: "☌ ⚹ □ △ ☍",
  angle: "angle.degMin",
  angleA: "angle.degMin",
  angleB: "angle.degMin",
  orb: "angle.orbDecimal",
  phase: "a common.moon.* value",
  quarter: "a common.moon.* value",
  percent: "percent",
  sign: "sign.full",
  signA: "sign.full",
  signB: "sign.full",
  signPhrase: "sign.phrase",
  planet: "planet.name",
  natalPlanet: "planet.name",
  planetB: "planet.name",
  a: "a planet symbol (PLANET_SYMBOLS)",
  b: "a planet symbol (PLANET_SYMBOLS)",
  symbol: "a planet symbol (PLANET_SYMBOLS)",
  n: "count.digits",
  total: "count.digits",
  remaining: "count.digits",
  exact: "count.digits",
  ahead: "count.digits",
  count: "count.word",
  days: "count.word",
  weighed: "count.word",
  quiet: "count.word",
  tone: "tone.word",
  status: "a status word from the same screen's catalog",
  weekday: "date.weekday",
  d: "date.dayOfMonth",
  yyyy: "date.year",
  roman: "house.roman or year.roman",
  ordinal: "ordinal.word (lower) or ordinal.wordUpper, as the key's comment says",
  title: "a house title (houses.ts)",
  group: "a house group name, lower (cultureVoice houseGroups)",
  arena: "a house arena, lower first letter (houses.ts)",
  verb: "an aspect verb (aspectVerbs.ts), upper",
  natal: "a natal point label, upper",
  season: "WINTER, SPRING, SUMMER or AUTUMN",
  year: "date.year",
  name: "the record's name, as the reader typed it, upper",
  place: "the record's place, upper",
  city: "the record's city, upper",
  time: "time.hm in the birth zone",
  zone: "an IANA zone name, upper",
  epithet: "a deity epithet, upper (deities.json)",
  glyphStatus: "the glyph status, upper: ATTESTED, COMPOSED or INVENTED (glyphs.json)",
  noun: "a feedback noun from chrome.feedback.noun.*",
  destination: "a nav.* destination name",
  part: "EARLY, MID or LATE",
  month: "a MONTH_ABBR value",
  passWord: "PASS or PASSES",
  event: "a season.sky.event.* value",
} as const;

export type SlotName = keyof typeof SLOTS;
