import { test } from "node:test";
import assert from "node:assert/strict";
import { composeDailyMessage } from "@/lib/dailyMessage";
import { QUIET_LINE } from "@/data/decreeBanks";
import { DEITY_DOMAINS } from "@/data/deityDomains";
import type { Planet } from "@/data/cultures";
import type { Longitude } from "@/data/sampleChart";

const sentences = (text: string) => text.split(/(?<=[.!?])\s+/).map((s) => s.trim()).filter(Boolean);

/** Sun exactly sextile Mars, everything else parked clear of both. */
const SUN_SEXTILE_MARS: Record<Planet, Longitude> = {
  sun: 0, mars: 60, moon: 200.3, mercury: 33.7, venus: 145.1,
  jupiter: 251.9, saturn: 320.4, uranus: 214.6, neptune: 106.2, pluto: 341.8,
};

/** No fast body at all, so nothing can headline. */
const SLOW_ONLY = {
  jupiter: 10, saturn: 130, uranus: 250, neptune: 40, pluto: 200,
} as unknown as Record<Planet, Longitude>;

test("a quiet sky yields the culture's quiet line and nothing invented", () => {
  const m = composeDailyMessage("egypt", SLOW_ONLY);
  assert.equal(m.body, QUIET_LINE.egypt);
  assert.equal(m.tone, "quiet");
});

test("a daily message names both domains of the headline figure", () => {
  const m = composeDailyMessage("rome", SUN_SEXTILE_MARS);
  assert.match(m.body, new RegExp(DEITY_DOMAINS.rome.sun, "i"));
  assert.match(m.body, new RegExp(DEITY_DOMAINS.rome.mars, "i"));
});

test("a daily message is three sentences and carries only the headline figure", () => {
  const m = composeDailyMessage("greece", SUN_SEXTILE_MARS);
  assert.equal(sentences(m.body).length, 3, m.body);
  assert.doesNotMatch(m.body, /No other shrine|At a lesser shrine|Down the hill from|In the agora below/, "the second figure belongs to the day page, not the message");
});
