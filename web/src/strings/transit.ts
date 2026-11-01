import type { Catalog, ComposedRows } from "@/strings/types";

/** One long transit (board Glass-Transit-detail, P99 to P127). */
export const TRANSIT = {
  // P99. F10: ’.
  "transit.kicker": "{institution} · A READING SCOPED TO THE TRANSIT’S WHOLE SPAN",
  // P102. Web's words: deity, verb, natal label, upper.
  "transit.meta.title": "{deity} {verb} {natal}",
  // P102. angle: angle.degMin (F5); signs: sign.full. natal: the natal side's label.
  "transit.meta.degrees": "{deity} {angleA} {signA} {aspectGlyph} {natal} {angleB} {signB}",
  // P102. season: WINTER to AUTUMN; year: date.year.
  "transit.meta.release": "THROUGH THE {season} OF {year}",
  // P106, P108, P110, P112.
  "transit.section.changing": "WHAT IS CHANGING",
  "transit.section.begins": "WHERE IT BEGINS",
  "transit.section.touches": "WHAT IT TOUCHES",
  "transit.section.leaves": "WHAT IT LEAVES BEHIND",
  // P114, P119, P123, P125.
  "transit.figure.space": "WHAT IT LOOKS LIKE IN SPACE",
  "transit.figure.whatIsThis": "WHAT IS THIS? →",
  "transit.figure.tryThis": "TRY THIS",
  "transit.figure.lesson": "THE LESSON",
  "transit.figure.consider": "CONSIDER",
  "transit.figure.read": "READ",
  "transit.figure.keep": "KEEP",
  "transit.figure.you": "YOU",
  // P118. Digits; date: date.monthYear. F7 plurals.
  "transit.statusLine.done": "FIRST EXACT PASS DONE · {remaining} RETURNS REMAIN · RELEASES {date}",
  "transit.statusLine.doneOne": "FIRST EXACT PASS DONE · 1 RETURN REMAINS · RELEASES {date}",
  // from: date.dayMonth of the first pass.
  "transit.statusLine.ahead": "FIRST PASS {from} · {remaining} RETURNS REMAIN · RELEASES {date}",
  "transit.statusLine.aheadOne": "FIRST PASS {from} · 1 RETURN REMAINS · RELEASES {date}",
  // P118. part: EARLY, MID or LATE; month: MONTH_ABBR; the year (date.year) prints under it.
  "transit.timeline.cap": "{part} {month}",
  "transit.feedback.noun": "READING",
} as const satisfies Catalog;

export const TRANSIT_COMPOSED = {
  "transit.headline": "lib/figureReading.ts composeSpanFigure headline (P101)",
  "transit.playsOut": "data/figureBanks.ts playsOutTitle, per culture (P120)",
  "transit.section.body": "data/transitSpine.ts and components/transits/TransitDetail.tsx paragraphs",
} as const satisfies ComposedRows;
