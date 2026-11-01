import type { Catalog, ComposedRows } from "@/strings/types";

/** One placement (board Glass-Placement, P87 to P98). */
export const PLACEMENT = {
  // P88. planet: planet.name; sign: sign.full; angle: angle.degMin; roman: house.roman.
  "placement.kicker": "{planet} · {sign} {angle} · HOUSE {roman}",
  // P89. Ruled: web's headline, two lines. deity upper; signPhrase: sign.phrase.
  "placement.title1": "YOUR {deity}",
  "placement.title2": "IN THE {signPhrase}",
  // P90. epithet upper (deities.json); glyphStatus: ATTESTED, COMPOSED or INVENTED (glyphs.json).
  "placement.epithet": "{epithet} · GLYPH {glyphStatus}",
  // P93. Ruled (Q2).
  "placement.section.governs": "WHAT THE BODY GOVERNS",
  // P95. sign: sign.full.
  "placement.section.sign": "IN {sign}",
  // P97. ordinal: ordinal.wordUpper. The house title (P98) prints under it.
  "placement.section.house": "IN THE {ordinal} HOUSE",
  // No board slot; ruled (Q2) to follow the three.
  "placement.section.keep": "WHAT TO KEEP IN VIEW",
  "placement.feedback.noun": "PLACEMENT",
} as const satisfies Catalog;

export const PLACEMENT_COMPOSED = {
  "placement.prose": "components/charts/placementCopy.ts buildWhatItIs, buildHowItShows, buildKeepInView (P92, P94, P96)",
  "placement.received": "components/chrome/ReceptionNote.tsx and cultureVoice receptionLine",
  "placement.votive": "components/charts/placementVotives.ts",
} as const satisfies ComposedRows;
