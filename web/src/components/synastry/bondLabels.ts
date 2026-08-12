import type { Culture } from "@/data/cultures";
import type { AspectKind } from "@/data/sampleChart";

/**
 * The Unicode glyph for each aspect kind, used in the center column's
 * "{NAME A}'S {DEITY} {glyph} {NAME B}'S {DEITY}" headline row. Matches the
 * documented orb table's symbols (docs/design/handoff, /method).
 */
export const ASPECT_GLYPHS: Readonly<Record<AspectKind, string>> = {
  conjunction: "☌",
  sextile: "⚹",
  square: "□",
  trine: "△",
  opposition: "☍",
};

/**
 * Short (2-4 word) per-culture institutional gloss for a bond of this aspect
 * kind: Egypt weighs, Greece questions, Canaan convenes, Carthage audits,
 * Rome rules. One label per kind: a bond that happens to involve a received
 * body (Uranus/Neptune/Pluto) still reads under the same label; the mock's
 * alternate "DEBT FORGIVEN" trine text is a hand variant, not a second entry.
 */
export const BOND_LABELS: Readonly<Record<Culture, Readonly<Record<AspectKind, string>>>> = {
  egypt: {
    conjunction: "ONE BARQUE",
    sextile: "STEADY OARS",
    square: "A DEBT ON THE SCALE",
    trine: "FAIR MEASURE",
    opposition: "TWO PANS LEVEL",
  },
  greece: {
    conjunction: "ONE ORACLE",
    sextile: "OPEN SHRINE",
    square: "A PRICE NAMED",
    trine: "FREE ANSWER",
    opposition: "TWO SHRINES SPEAK",
  },
  canaan: {
    conjunction: "ONE SEAT",
    sextile: "TRIBUTE KEPT",
    square: "A VOW CALLED",
    trine: "RAIN WITHOUT ASKING",
    opposition: "COUNCIL DIVIDED",
  },
  carthage: {
    conjunction: "ONE ALTAR",
    sextile: "SAFE PASSAGE",
    square: "A VOW CALLED IN",
    trine: "FAIR WEIGHING",
    opposition: "TWO CLAIMS, ONE CARGO",
  },
  rome: {
    conjunction: "ONE STANDARD",
    sextile: "A TREATY OFFERED",
    square: "AN OBJECTION STANDS",
    trine: "TAKEN ON THE RIGHT",
    opposition: "TWO MAGISTRATES",
  },
};

/**
 * OrbBar/label color tone for a bond of this kind. Conjunctions read as
 * harmony-gold here (the "shared altar" reading, per the Carthage mock's
 * ONE ALTAR row), not as the neutral "union" tone used elsewhere in the app;
 * only square/opposition read as conflict.
 */
export function orbToneFor(kind: AspectKind): "harmony" | "conflict" {
  return kind === "square" || kind === "opposition" ? "conflict" : "harmony";
}
