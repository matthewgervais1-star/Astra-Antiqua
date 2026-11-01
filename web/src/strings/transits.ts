import type { Catalog } from "@/strings/types";

/** The long transits index (board Glass-Transits, P57 to P68). */
export const TRANSITS = {
  // P57.
  "transits.kicker": "READ AGAINST YOUR OWN SKY",
  // P58. Ruled: web's headline.
  "transits.title": "WHAT DOES NOT PASS IN A DAY",
  // P59. count: count.word; range: range.months.
  "transits.countLine": "{count} SPANS · {range}",
  // P60. yyyy: date.year.
  "transits.axis": "{yyyy}",
  // P62.
  "transits.group.open": "OPEN NOW",
  // P64.
  "transits.group.ahead": "AHEAD",
  // P63, P65 to P68. Web's words: deity, verb, natal label, upper.
  "transits.row.title": "{deity} {verb} {natal}",
  // P63, P65 to P68. range: range.months; digits; tone: EASE or TENSION. The board drops "· 0 AHEAD".
  "transits.row.data": "{range} · {exact} EXACT · {ahead} AHEAD · {tone}",
  "transits.row.dataNoAhead": "{range} · {exact} EXACT · {tone}",
  // Hidden where the row itself taps.
  "transits.row.link": "READ →",
  "transits.empty.open": "NOTHING HOLDS WITHIN ORB TODAY",
  "transits.empty.ahead": "NO FURTHER PASSAGES IN THIS WINDOW",
  "transits.loading": "COMPUTING THE SKY…",
} as const satisfies Catalog;
