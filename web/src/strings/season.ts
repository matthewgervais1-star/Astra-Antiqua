import type { Catalog, ComposedRows } from "@/strings/types";

/** The Season screen (board Glass-Season, P32 to P42, P54). */
export const SEASON = {
  // P32. range: range.days (F2, local days).
  "season.kicker": "{range} · {institution}",
  // P34. Ruled: web's headline. signPhrase: sign.phrase.
  "season.title": "THE SEASON OF THE {signPhrase}",
  // P35. Board count line; digits.
  "season.dayLine": "DAY {n} OF {total} · {remaining} TO GO",
  // P37. Ruled (Q2): printed with a chart.
  "season.chart.label": "THROUGH YOUR CHART",
  // P38. ordinal: ordinal.word (lower); title: houses.ts title.
  "season.chart.houseHeading": "The {ordinal} house · {title}",
  // P39. Web's sentence (agree). ordinal: ordinal.word; group: the culture's house group, lower.
  "season.chart.prose": "The season sits in your {ordinal} house, which this culture keeps under {group}. It works on {arena}.",
  // No board slot. Ruled (Q2): these three follow the house block.
  "season.section.changing": "WHAT IS CHANGING",
  "season.section.begins": "WHERE IT BEGINS",
  "season.section.leaves": "WHAT IT LEAVES BEHIND",
  // Without a chart the house block gives way to web's sky section.
  "season.section.touches": "WHAT IT TOUCHES",
  // P40. F10: ’.
  "season.sky.label": "THE SEASON’S SKY",
  // P41, P42. date: date.dayMonthYear (local); event: one of season.sky.event.*. The board's event set:
  // quarters, ingresses, stations, eclipses. An ingress row stacks web's ingress sentence under it.
  "season.sky.row": "{date} · {event}",
  // Planet names (planet.name), full signs (sign.full); F11 words in place of ℞.
  "season.sky.event.ingress": "{planet} INTO {sign}",
  "season.sky.event.retrograde": "{planet} TURNS RETROGRADE",
  "season.sky.event.direct": "{planet} TURNS DIRECT",
  // P41: `FULL MOON · ARIES`. phase: common.moon.* (quarters only).
  "season.sky.event.phase": "{phase} · {sign}",
  // No board row drawn; the board's set names eclipses (table, season.sky.row).
  "season.sky.event.eclipseLunar": "LUNAR ECLIPSE · {sign}",
  "season.sky.event.eclipseSolar": "SOLAR ECLIPSE · {sign}",
  // No board slot; web's words.
  "season.noChart.line": "CAST A CHART TO SEE WHAT THE SEASON TOUCHES IN YOUR OWN HOUSES →",
  "season.noChart.link": "READING",
  // No board slot; web's votive, keyed by the tone of the season's lead beat. F10: ’.
  "season.votive.tension": {
    egypt: "BRING WHAT IS HEAVY\nTO THE SCALE NOW",
    greece: "ASK THE SEASON’S HARD QUESTION\nBEFORE IT ASKS YOU FIRST",
    canaan: "BRING THE CONTESTED MATTER\nBEFORE THE COUNCIL NOW",
    carthage: "SETTLE THE ACCOUNT\nBEFORE THE MONTH CLOSES IT FOR YOU",
    rome: "TAKE THE AUSPICES AGAIN\nBEFORE YOU ACT ON THIS MONTH",
  },
  "season.votive.harmony": {
    egypt: "LET THE RIVER CARRY IT;\nDO NOT ROW AGAINST THE MONTH",
    greece: "TAKE WHAT THE MONTH\nOFFERS FREELY",
    canaan: "WORK THE FIELD WHILE\nTHE RAINS STILL FAVOR YOU",
    carthage: "SAIL WHILE THE SEASON\nKEEPS THE LANE OPEN",
    rome: "PROCEED; THE MONTH HOLDS\nTHE RIGHT HAND OUT",
  },
  "season.votive.quiet": {
    egypt: "THE ORDINARY MONTH\nSTILL FEEDS THE GRANARY",
    greece: "A QUIET MONTH\nIS STILL AN ANSWER",
    canaan: "THE TENT STANDS\nTHROUGH ORDINARY MONTHS TOO",
    carthage: "A STEADY MONTH IS\nSTILL A PROFITABLE ONE",
    rome: "AN ORDINARY MONTH\nIS STILL GOVERNED BY LAW",
  },
  "season.feedback.noun": "SEASON",
} as const satisfies Catalog;

export const SEASON_COMPOSED = {
  "season.signProse": "shared/content/zodiac-signs.json sign blurb (P36)",
  "season.section.changing.body": "components/horizons/seasonContent.ts composeWhatIsChanging",
  "season.section.begins.body": "components/horizons/seasonContent.ts composeWhereItBegins",
  "season.section.touches.body": "components/horizons/seasonContent.ts composeWhatItTouchesSky",
  "season.section.leaves.body": "components/horizons/seasonContent.ts composeWhatItLeavesBehind",
} as const satisfies ComposedRows;
