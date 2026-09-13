import { test } from "node:test";
import assert from "node:assert/strict";
import { composeDecree } from "@/lib/decree";
import { buildWeekDays } from "@/lib/weekReading";
import { DEITY_CHARGES } from "@/data/deityCharges";
import { CULTURES, PLANETS, type Culture, type Planet } from "@/data/cultures";
import { computeAspects, type Longitude } from "@/data/sampleChart";

const FAST: ReadonlySet<Planet> = new Set(["sun", "moon", "mercury", "venus", "mars"]);

function mulberry32(seed: number): () => number {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * A chart in which the named pair is the tightest aspect involving a fast
 * body, by at least a degree, so the decree must headline it. Ten bodies
 * cannot all be clear of one another under the documented orbs, so this is a
 * bounded seeded search rather than a construction: the pair is pinned at 0
 * and `separation`, the rest are drawn at random, and the first layout that
 * satisfies the margin wins. Deterministic per (a, b, separation).
 */
function chartWith(a: Planet, b: Planet, separation: number): Record<Planet, Longitude> {
  let seed = 7;
  for (const ch of `${a}|${b}|${separation}`) seed = (seed * 31 + ch.charCodeAt(0)) | 0;
  const rng = mulberry32(seed);
  for (let attempt = 0; attempt < 5000; attempt += 1) {
    const chart = {} as Record<Planet, Longitude>;
    for (const p of PLANETS) chart[p] = rng() * 360;
    chart[a] = 0;
    chart[b] = separation;
    const fast = computeAspects(chart)
      .filter((x) => FAST.has(x.a) || FAST.has(x.b))
      .sort((x, y) => x.orb - y.orb);
    const top = fast[0];
    const next = fast[1];
    const isPair = top !== undefined && ((top.a === a && top.b === b) || (top.a === b && top.b === a));
    if (isPair && (next === undefined || next.orb > top.orb + 1)) return chart;
  }
  throw new Error(`no layout isolates ${a}-${b} at ${separation} degrees`);
}

const sentences = (text: string) => text.split(/(?<=[.!?])\s+/).map((s) => s.trim()).filter(Boolean);

test("the fixture makes the named pair the tightest fast-body aspect by a degree", () => {
  const fast = computeAspects(chartWith("sun", "mars", 60))
    .filter((x) => FAST.has(x.a) || FAST.has(x.b))
    .sort((x, y) => x.orb - y.orb);
  assert.deepEqual([fast[0]?.a, fast[0]?.b, fast[0]?.kind], ["sun", "mars", "sextile"]);
  assert.ok(fast[1] === undefined || fast[1].orb > 1, `runner-up too close: ${JSON.stringify(fast[1])}`);
});

test("two exact sextiles between different gods share no sentence in the same culture", () => {
  const sunMars = composeDecree("egypt", chartWith("sun", "mars", 60));
  const moonVenus = composeDecree("egypt", chartWith("moon", "venus", 60));

  const first = new Set(sentences(sunMars.paragraphs[0] ?? ""));
  const shared = sentences(moonVenus.paragraphs[0] ?? "").filter((s) => first.has(s));

  assert.deepEqual(shared, [], `kind-keyed boilerplate leaked across figures: ${JSON.stringify(shared)}`);
});

test("a decree instructs only when the headline figure is exact", () => {
  const exact = composeDecree("rome", chartWith("mars", "saturn", 90));
  const wide = composeDecree("rome", chartWith("mars", "saturn", 93));

  assert.equal(sentences(exact.paragraphs[0] ?? "").length, 3, "exact: sky sentence, ruling, instruction");
  assert.equal(sentences(wide.paragraphs[0] ?? "").length, 2, "wide: sky sentence and ruling, no order");
});

test("five cultures read one figure with no sentence in common", () => {
  const chart = chartWith("sun", "mars", 60);
  const seen = new Map<string, Culture>();
  for (const culture of CULTURES) {
    for (const s of sentences(composeDecree(culture, chart).paragraphs.join(" "))) {
      const prior = seen.get(s);
      assert.equal(prior, undefined, `"${s}" appears in both ${prior} and ${culture}`);
      seen.set(s, culture);
    }
  }
});

test("every aspect day in the week names both gods' charges in its line", () => {
  const monday = new Date(2026, 8, 7);
  for (const culture of CULTURES) {
    const charges = Object.values(DEITY_CHARGES[culture]).map((c) => c.toLowerCase());
    for (const day of buildWeekDays(culture, monday, null)) {
      if (day.shorthand.kind !== "aspect") continue;
      const line = day.line.toLowerCase();
      const named = charges.filter((c) => line.includes(c));
      assert.ok(named.length >= 2, `${culture}: "${day.line}" names ${named.length} charge(s); a tethered line names both`);
    }
  }
});

test("every ingress day in the week names the crossing god's charge", () => {
  const monday = new Date(2026, 8, 7);
  for (const culture of CULTURES) {
    for (const day of buildWeekDays(culture, monday, null)) {
      if (day.shorthand.kind !== "ingress") continue;
      const charge = DEITY_CHARGES[culture][day.shorthand.planet].toLowerCase();
      assert.ok(day.line.toLowerCase().includes(charge), `${culture}: "${day.line}" lacks "${charge}"`);
    }
  }
});
