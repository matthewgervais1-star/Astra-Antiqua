import { test } from "node:test";
import assert from "node:assert/strict";
import { SIGN_ABBR3 } from "@/components/charts/chartFormat";
import { SIGN3 } from "@/components/home/format";
import { SIGN_ABBR } from "@/lib/weekReading";

// The /charts placements table is the canonical set (cleanup C3). Android's
// ZodiacSign.abbr reads this table out of chartFormat.ts in a parity test.
const CANONICAL = {
  Aries: "ARI",
  Taurus: "TAU",
  Gemini: "GEM",
  Cancer: "CNC",
  Leo: "LEO",
  Virgo: "VIR",
  Libra: "LIB",
  Scorpio: "SCO",
  Sagittarius: "SAG",
  Capricorn: "CAP",
  Aquarius: "AQR",
  Pisces: "PSC",
};

test("the charts table holds the twelve canonical sign abbreviations", () => {
  assert.deepEqual({ ...SIGN_ABBR3 }, CANONICAL);
});

test("the week shorthand prints the charts table's abbreviations", () => {
  assert.equal(SIGN_ABBR, SIGN_ABBR3);
});

test("the home rail prints the charts table's abbreviations", () => {
  assert.equal(SIGN3, SIGN_ABBR3);
});
