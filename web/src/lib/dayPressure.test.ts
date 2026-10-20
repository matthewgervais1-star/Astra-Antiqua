import { test } from "node:test";
import assert from "node:assert/strict";
import { dayPressure } from "@/lib/dayPressure";
import type { Planet } from "@/data/cultures";
import type { SavedNatal } from "@/lib/savedNatal";

/**
 * A chart rising in Aries with the Sun alone in the inner court's houses
 * (the first house, 15° Aries); every other natal point sits in another
 * group's houses.
 */
const NATAL_CHART: Record<Planet, number> = {
  sun: 15, moon: 40, mercury: 70, venus: 100, mars: 160,
  jupiter: 190, saturn: 220, uranus: 280, neptune: 310, pluto: 50,
};
const SAVED = { chart: NATAL_CHART, angles: { ascendant: 0 } } as unknown as SavedNatal;

/**
 * Two contacts reach the natal Sun: Saturn squares it at 0°30′ and Mars at
 * 3°00′. Every other body stands clear of it.
 */
const SKY: Record<Planet, number> = {
  sun: 45, moon: 50, mercury: 345, venus: 340, mars: 108,
  jupiter: 165, saturn: 105.5, uranus: 225, neptune: 235, pluto: 160,
};

test("the inner court reads the fast body's contact, though the slow body is tighter", () => {
  const court = dayPressure(SAVED, SKY, "rome")[3]!;
  // By orb alone Saturn would lead, and 0°30′ reads LOUD. Mars leads, at 3°00′:
  // under four degrees with tension in the majority, the group is STRAINED.
  assert.equal(court.orb, 3);
  assert.equal(court.level, "strained");
  assert.match(court.sentence, /^Mars /);
});
