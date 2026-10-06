import { test } from "node:test";
import assert from "node:assert/strict";
import { composeDayPage, composeDecree, headlineBody, REPEAT_WINDOW_DAYS } from "@/lib/decree";
import { composeDailyMessage } from "@/lib/dailyMessage";
import { dayPermissions } from "@/lib/permissions";
import { buildWeekDays } from "@/lib/weekReading";
import { DEITY_CHARGES } from "@/data/deityCharges";
import { DEITY_DOMAINS } from "@/data/deityDomains";
import { DECREE_BANKS } from "@/data/decreeBanks";
import { PERMISSIONS_REGISTER } from "@/data/permissionsRegister";
import { DEITY_MATRIX } from "@/data/deities";
import { CULTURES, PLANETS, type Culture, type Planet } from "@/data/cultures";
import { computeAspects, type Longitude } from "@/data/sampleChart";
import { GOLDEN_2026_09_29 } from "@/lib/decree.golden";

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
const bodyOf = (d: { paragraphs: readonly string[] }) => d.paragraphs.join(" ");

test("the fixture makes the named pair the tightest fast-body aspect by a degree", () => {
  const fast = computeAspects(chartWith("sun", "mars", 60))
    .filter((x) => FAST.has(x.a) || FAST.has(x.b))
    .sort((x, y) => x.orb - y.orb);
  assert.deepEqual([fast[0]?.a, fast[0]?.b, fast[0]?.kind], ["sun", "mars", "sextile"]);
  assert.ok(fast[1] === undefined || fast[1].orb > 1, `runner-up too close: ${JSON.stringify(fast[1])}`);
});

test("the day page is a headline, an evidence line and one paragraph of five sentences", () => {
  for (const culture of CULTURES) {
    const d = composeDecree(culture, chartWith("sun", "mars", 60.3));
    assert.equal(d.paragraphs.length, 1);
    assert.deepEqual(sentences(bodyOf(d)), d.sentences);
    assert.equal(d.sentences.length, 5, bodyOf(d));
    assert.match(d.headline, /^[A-Z].*[.!?]$/, "the headline is a sentence");
    assert.notEqual(d.headline, d.headline.toUpperCase(), "the headline is sentence case, not a banner");
    assert.notEqual(d.evidence, "");
  }
});

test("the evidence line names both gods, the glyph and the orb", () => {
  const wide = composeDecree("egypt", chartWith("sun", "mars", 61.2));
  assert.equal(wide.evidence, "RA ⚹ HORUS THE RED · 1°12′");
  const exact = composeDecree("rome", chartWith("mars", "pluto", 180));
  assert.equal(exact.evidence, "MARS ☍ DIS PATER · EXACT");
});

test("the instruction is always last and names both gods of the figure", () => {
  for (const culture of CULTURES) {
    const d = composeDecree(culture, chartWith("moon", "venus", 120.8));
    const last = d.sentences.at(-1) ?? "";
    // Both bodies are fast; the Moon is faster, so the Moon speaks.
    assert.ok(last.includes(DEITY_MATRIX[culture].moon.name), `${culture}: ${last}`);
    assert.ok(last.includes(DEITY_MATRIX[culture].venus.name), `${culture}: ${last}`);
    assert.equal(d.headline, DECREE_BANKS[culture].headlines.trine.moon);
  }
});

test("the headline body is the fast body, the faster when both are", () => {
  assert.deepEqual(headlineBody("sun", "moon"), { body: "moon", partner: "sun" });
  assert.deepEqual(headlineBody("venus", "mercury"), { body: "mercury", partner: "venus" });
  assert.deepEqual(headlineBody("mars", "pluto"), { body: "mars", partner: "pluto" });
  assert.deepEqual(headlineBody("jupiter", "venus"), { body: "venus", partner: "jupiter" });
});

test("one headline body with two partners differs in every sentence after the evidence line", () => {
  for (const culture of CULTURES) {
    const withMars = composeDecree(culture, chartWith("venus", "mars", 90.2));
    const withPluto = composeDecree(culture, chartWith("venus", "pluto", 90.2));
    assert.equal(withMars.headline, withPluto.headline, "the headline is keyed by the headline body");
    // Sentence 3 is the second figure, which comes from the rest of the sky;
    // the four that belong to the headline figure must each differ.
    for (const i of [0, 1, 2, 4]) {
      assert.notEqual(withMars.sentences[i], withPluto.sentences[i], `${culture} sentence ${i} ignores the partner`);
    }
  }
});

test("two sextiles between different gods share no sentence in the same culture", () => {
  for (const culture of CULTURES) {
    const sunMars = composeDecree(culture, chartWith("sun", "mars", 60));
    const moonVenus = composeDecree(culture, chartWith("moon", "venus", 60));
    const first = new Set(sunMars.sentences);
    assert.deepEqual(moonVenus.sentences.filter((s) => first.has(s)), [], culture);
  }
});

test("the exact tail appears only under half a degree of orb", () => {
  for (const culture of CULTURES) {
    const tails = DECREE_BANKS[culture].exactTails;
    const meaning = (sep: number) => composeDecree(culture, chartWith("mars", "saturn", sep)).sentences[0] ?? "";
    const hasTail = (s: string) => tails.some((t) => s.includes(t));
    assert.ok(hasTail(meaning(90)), `${culture} exact: ${meaning(90)}`);
    assert.ok(hasTail(meaning(90.45)), `${culture} at 0.45: ${meaning(90.45)}`);
    assert.ok(!hasTail(meaning(90.55)), `${culture} at 0.55: ${meaning(90.55)}`);
    assert.ok(!hasTail(meaning(93)), `${culture} wide: ${meaning(93)}`);
  }
});

test("the day's two variants alternate the exact tail and the second-figure opener", () => {
  const chart = chartWith("mars", "saturn", 90);
  for (const culture of CULTURES) {
    const even = composeDecree(culture, chart, { day: 0 }).sentences;
    const odd = composeDecree(culture, chart, { day: 1 }).sentences;
    assert.ok(even[0]!.includes(DECREE_BANKS[culture].exactTails[0]), culture);
    assert.ok(odd[0]!.includes(DECREE_BANKS[culture].exactTails[1]), culture);
    assert.notEqual(even[3], odd[3], culture);
  }
});

test("five cultures read one figure with no sentence in common", () => {
  const figures: ReadonlyArray<readonly [Planet, Planet, number]> = [
    ["sun", "mars", 60],
    ["moon", "saturn", 90.2],
    ["venus", "pluto", 180],
  ];
  for (const [a, b, sep] of figures) {
    const chart = chartWith(a, b, sep);
    const seen = new Map<string, Culture>();
    for (const culture of CULTURES) {
      const d = composeDecree(culture, chart);
      for (const s of [d.headline, ...d.sentences]) {
        const prior = seen.get(s);
        assert.equal(prior, undefined, `"${s}" appears in both ${prior} and ${culture}`);
        seen.set(s, culture);
      }
    }
  }
});

test("no sentence of the day page repeats within seven days, over thirty days", () => {
  for (const culture of CULTURES) {
    const printed: string[][] = [];
    for (let i = 0; i < 30; i += 1) {
      const page = composeDayPage(culture, new Date(Date.UTC(2026, 8, 29) + i * 86_400_000));
      const lines = [page.headline, ...page.sentences];
      const window = new Set(printed.slice(-(REPEAT_WINDOW_DAYS - 1)).flat());
      assert.deepEqual(lines.filter((s) => window.has(s)), [], `${culture} day ${i} repeats a sentence`);
      printed.push(lines);
    }
  }
});

test("the daily message is a strict subset of the decree, in the decree's order", () => {
  for (const culture of CULTURES) {
    const chart = chartWith("sun", "mars", 60.3);
    const decree = composeDecree(culture, chart);
    const message = composeDailyMessage(culture, chart);
    assert.equal(message.headline, decree.headline);
    const some = sentences(message.body);
    assert.ok(some.length < decree.sentences.length, "a message is shorter than the page");
    assert.deepEqual(some, decree.sentences.filter((s) => some.includes(s)), `${culture}: ${message.body}`);
  }
});

test("the Do and Don't lists come from the bodies of the day's figures", () => {
  for (const culture of CULTURES) {
    const reg = PERMISSIONS_REGISTER[culture];
    // A day of favor: the headline figure's bodies lead the proceed column,
    // the second figure's lead the refrain column.
    const favor = composeDecree(culture, chartWith("sun", "mars", 60));
    const lists = dayPermissions(culture, favor.figures);
    assert.equal(lists.proceed.length, 4);
    assert.equal(lists.refrain.length, 4);
    assert.deepEqual(lists.proceed.slice(0, 2), [reg.sun.proceed[0], reg.mars.proceed[0]]);
    const second = favor.figures[1]!;
    assert.deepEqual(lists.refrain.slice(0, 2), [reg[second.a].refrain[0], reg[second.b].refrain[0]]);
    // A day of trial swaps them.
    const trial = composeDecree(culture, chartWith("sun", "mars", 90));
    const swapped = dayPermissions(culture, trial.figures);
    assert.deepEqual(swapped.refrain.slice(0, 2), [reg.sun.refrain[0], reg.mars.refrain[0]]);
  }
});

test("each culture's day page for 2026-09-29 matches its golden", () => {
  for (const culture of CULTURES) {
    const d = composeDayPage(culture, new Date("2026-09-29T00:00:00Z"));
    const golden = GOLDEN_2026_09_29[culture];
    assert.equal(d.headline, golden.headline, culture);
    assert.equal(d.evidence, golden.evidence, culture);
    assert.equal(bodyOf(d), golden.paragraph, culture);
  }
});

test("the week never shows one headline twice, and each aspect line names both domains", () => {
  for (let week = 0; week < 8; week += 1) {
    const monday = new Date(2026, 8, 7 + week * 7);
    for (const culture of CULTURES) {
      const days = buildWeekDays(culture, monday, null);
      const headlines = days.map((d) => d.headline).filter((h): h is string => h !== null);
      assert.equal(new Set(headlines).size, headlines.length, `${culture}: ${headlines.join(" / ")}`);
      for (const day of days) {
        if (day.shorthand.kind !== "aspect") continue;
        const { a, aspect, b } = day.shorthand;
        if (day.headline !== null) {
          assert.equal(day.headline, DECREE_BANKS[culture].headlines[aspect][headlineBody(a, b).body]);
        }
        const line = day.line.toLowerCase();
        for (const body of [a, b]) {
          assert.ok(line.includes(DEITY_DOMAINS[culture][body].toLowerCase()), `${culture}: "${day.line}" lacks ${body}`);
        }
        assert.equal(sentences(day.line).length, 2, `${culture}: a week line is the meaning and the consequence`);
      }
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
