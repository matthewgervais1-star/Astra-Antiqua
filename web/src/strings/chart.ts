import type { Catalog, ComposedRows } from "@/strings/types";

/** The chart (board Glass-Chart, P69 to P86). */
export const CHART = {
  // P69.
  "chart.kicker": "FIXED AT THE HOUR OF YOUR BIRTH",
  // P70. Ruled: the board's title (web has none).
  "chart.title": "The placements",
  // P71. name: the record's name, upper; sign: sign.full; angle: angle.degMin.
  "chart.subline": "{name} · RISING {sign} {angle}",
  // P72. city, upper; date: date.dayMonthYear and time: time.hm, both in the birth zone.
  "chart.birthLine": "{city} · {date} · {time}",
  // P75.
  "chart.section.bodies": "TEN BODIES",
  // P83.
  "chart.section.received": "THE RECEIVED THREE · SEATS SET BY MODERN HANDS",
  // P76 to P86. The deity prints over this line. planet: planet.name; sign: sign.full; angle: angle.degMin.
  "chart.row.position": "{planet} · {sign} {angle}",
  // F11: R when retrograde.
  "chart.row.positionRetrograde": "{planet} · {sign} {angle} · R",
  // roman: house.roman (F12).
  "chart.row.house": "{roman}",
  // No board slot; web's legend, hidden on the ports.
  "chart.legend.conflict": "CONFLICT",
  "chart.legend.harmony": "HARMONY",
  "chart.legend.wheel": "THE NATAL WHEEL",
  "chart.legend.received": "ACCENT GLYPHS: THE THREE RECEIVED",
  "chart.legend.method": "ASTRONOMY-ENGINE · ORBS DOCUMENTED →",
  // No board slot; web's empty state.
  "chart.empty.title": "NO CHART IS YET\nENTERED IN THE RECORD",
  "chart.empty.cta": "CAST THE FIRST CHART",
  "chart.empty.note": "KEPT ON THIS DEVICE · AN ACCOUNT ADDS SYNC",
} as const satisfies Catalog;

export const CHART_COMPOSED = {
  "chart.summary": "lib/reading.ts SUMMARY_INTRO and SUMMARY_TONES (P74)",
} as const satisfies ComposedRows;
