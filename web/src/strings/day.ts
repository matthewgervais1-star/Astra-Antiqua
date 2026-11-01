import type { Catalog, ComposedRows } from "@/strings/types";

/** The Day screen (board Glass-Day, P4 to P16, P226, P227). */
export const DAY = {
  // P4. date: date.day (F1, the UTC day).
  "day.kicker": "{date} · {institution}",
  // P7. angle: angle.degMin.
  "day.evidence": "{deityA} {aspectGlyph} {deityB} · {angle}",
  // P10.
  "day.sky.label": "THE SKY, COMPUTED",
  // P11.
  "day.sky.moon.label": "MOON",
  // P11. phase: common.moon.*; percent: percent.
  "day.sky.moon.line": "{phase} · {percent} LIT",
  // P11. quarter: common.moon.*; the date under it: date.dayMonthYear (local).
  "day.sky.nextQuarter": "{quarter}",
  "day.sky.nextQuarter.date": "{date}",
  // P11.
  "day.sky.season.label": "SEASON",
  // P11. sign: sign.full.
  "day.sky.season.line": "SUN IN {sign} · DAY {n} OF {total}",
  // P11. The bar's two caps print date.dayMonth; the middle prints this.
  "day.sky.bar.toGo": "{remaining} TO GO",
  // P12.
  "day.chart.label": "ON YOUR CHART TODAY",
  // P13, P14, P226, P227. orb: angle.orbDecimal; tone: tone.word (F9).
  "day.chart.row.data": "{planet} {aspectGlyph} NATAL {natalPlanet} · {orb} FROM EXACT · {tone}",
  // P15.
  "day.longTransit.label": "THE LONG TRANSIT",
  // P16. status: day.longTransit.open or day.longTransit.next; range: range.months (F4).
  "day.longTransit.meta": "{status} · {range}",
  "day.longTransit.open": "OPEN NOW",
  "day.longTransit.next": "NEXT",
  // P16. Web's words (agree): two lines.
  "day.longTransit.title1": "{deity} IN THE {signPhrase}",
  "day.longTransit.title2": "{verb} YOUR NATAL {natal}",
  // P16. Digits (F7); tone: tone.word for the span (EASE or TENSION).
  "day.longTransit.footer": "{exact} EXACT · {ahead} AHEAD · {tone}",
  // P16.
  "day.longTransit.link": "READ →",
  // No board slot; web's feedback noun (chrome.feedback.*).
  "day.feedback.noun": "DECREE",
} as const satisfies Catalog;

/** Day rows whose words web's reading code composes. */
export const DAY_COMPOSED = {
  "day.headline": "lib/decree.ts composeDayDecree headline (P6)",
  "day.paragraph": "lib/decree.ts composeDayDecree paragraphs (P9)",
  "day.votive": "lib/decree.ts votive bank (hidden on the ports)",
  "day.chart.row.sentence": "lib/dayPressure.ts (P13, P14, P226, P227)",
} as const satisfies ComposedRows;
