import type { Catalog, ComposedRows } from "@/strings/types";

/** The Year screen (board Glass-Year, P43 to P52). */
export const YEAR = {
  // P43. date: date.dayMonthYear (local), the day the year is read from.
  "year.kicker": "FROM {date} · {institution}",
  // P44. Ruled: web's headline per culture. roman: year.roman.
  "year.title": {
    egypt: "{roman} · THE YEAR OF THE RIVER",
    greece: "{roman} · THE FESTIVAL CIRCUIT",
    canaan: "{roman} · THE YEAR OF THE RAINS",
    carthage: "{roman} · THE OPEN AND CLOSED SEA",
    rome: "{roman} · THE GREAT CIRCUIT",
  },
  // P45. n: count.digits (F7).
  "year.countLine": "{n} TURNINGS · STATIONS, INGRESSES, LUNATIONS",
  // With a chart: web's spine label. F10: ’.
  "year.spine.label": "THE YEAR’S LONG TRANSITS · ITS SPINE",
  // P46. date: date.monthYear.
  "year.monthLabel": "{date}",
  // P47, P48, P50 to P52. date: date.dayMonth; planet: planet.name; sign: sign.full. F11: words, no ℞.
  "year.row.retrograde": "{date} · {planet} TURNS RETROGRADE",
  "year.row.direct": "{date} · {planet} TURNS DIRECT",
  "year.row.ingress": "{date} · {planet} INTO {sign}",
  // P49. date: date.dayMonth.
  "year.today": "TODAY · {date}",
  // No board slot; web's words.
  "year.noChart.title": "CAST A CHART TO READ THE YEAR AGAINST YOUR OWN SKY",
  "year.noChart.link": "CAST A CHART →",
  // No board slot; web's votive. F10: ’.
  "year.votive.tension": {
    egypt: "WEIGH THIS YEAR BEFORE\nTHE FLOOD WEIGHS IT FOR YOU",
    greece: "ASK THIS YEAR’S HARD QUESTION\nBEFORE THE ORACLE CLOSES",
    canaan: "BRING THIS YEAR’S MATTER\nBEFORE THE COUNCIL WHILE IT SITS",
    carthage: "CLOSE THIS YEAR’S ACCOUNT\nBEFORE THE AUDIT CLOSES IT",
    rome: "BUILD THIS YEAR WHAT THE\nCENSOR CANNOT STRIKE",
  },
  "year.votive.harmony": {
    egypt: "BUILD WHILE THE RIVER\nRISES IN YOUR FAVOR",
    greece: "TAKE THE YEAR’S ANSWER\nAND BUILD ON IT",
    canaan: "BUILD WHILE BAAL\nHOLDS THE RAINS FOR YOU",
    carthage: "SAIL WHILE THIS YEAR\nKEEPS THE SEA OPEN",
    rome: "TAKE THE HONORS OFFERED;\nTHE REVIEW WILL BEAR THEM OUT",
  },
  "year.votive.quiet": {
    egypt: "AN ORDINARY YEAR\nSTILL FILLS THE GRANARY",
    greece: "A QUIET YEAR IS\nSTILL COUNSEL GIVEN",
    canaan: "AN ORDINARY YEAR STILL\nSTANDS UNDER EL’S TENT",
    carthage: "A STEADY YEAR IN THE\nLEDGER IS STILL PROFIT",
    rome: "GOVERN THE ORDINARY YEAR\nAS IF IT WERE WATCHED",
  },
  "year.feedback.noun": "YEAR",
} as const satisfies Catalog;

export const YEAR_COMPOSED = {
  "year.row.prose": "lib/weekReading.ts ingress verbs; the station sentence has no web source (CANNOT CONFIRM)",
  "year.opening": "lib/annualReport.ts yearTheme.body, or yearContent.ts SKY_ONLY_OPENING",
} as const satisfies ComposedRows;
