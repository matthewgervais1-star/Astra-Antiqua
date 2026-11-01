import type { Catalog } from "@/strings/types";

/**
 * The More screen (board Glass-More, P128 to P144; culture sheet P146 to
 * P153). Web has no More page yet; the board's forms enter the catalog so
 * the ports print one set.
 */
export const MORE = {
  // P128. name, place: the record's, upper.
  "more.kicker": "{name} · {place}",
  // P129, P148.
  "more.culture.label": "YOUR CULTURE",
  // P135.
  "more.readings.label": "READINGS",
  // P136. Destination name per N4.
  "more.row.forecast": "The year ahead",
  "more.row.forecast.sub": "YOUR SOLAR RETURN, LONG TRANSITS AND STATIONS",
  // P137.
  "more.row.synastry": "Synastry",
  "more.row.synastry.sub": "TWO CHARTS READ AGAINST EACH OTHER",
  // P138.
  "more.reference.label": "REFERENCE",
  // P139 to P142. Names per N2.
  "more.row.learn": "Learn",
  "more.row.learn.sub": "HOW THE SKY BECOMES A CHART, IN SEVEN SECTIONS",
  "more.row.voices": "The five voices",
  "more.row.voices.sub": "ONE SKY, FIVE THEOLOGIES",
  "more.row.matrix": "The matrix",
  "more.row.matrix.sub": "TEN BODIES ACROSS FIVE PANTHEONS",
  "more.row.method": "The method",
  "more.row.method.sub": "THE NUMBERS THE APP RUNS, AND ITS SOURCES",
  // P143.
  "more.record.label": "YOUR RECORD",
  // P144. name as typed; date: date.dayMonthYear and time: time.hm in the birth zone; place upper.
  "more.record.name": "{name}",
  "more.record.birth": "{date} · {time} · {place}",
  // zone: the IANA zone, upper; sign: sign.full.
  "more.record.zone": "ZONE {zone} · RISING {sign}",
  "more.record.edit": "EDIT THE BIRTH",
  "more.record.delete": "DELETE THE RECORD",
  // INFERENCE (table): printed when there is no birth.
  "more.record.cast": "CAST YOUR CHART",
  "more.record.note": "KEPT ON THIS DEVICE ONLY · LEFT OUT OF BACKUPS",
  // Swift's words (no other source).
  "more.delete.confirm": "Yes, delete it from this device",
  "more.delete.keep": "Keep it",
} as const satisfies Catalog;
