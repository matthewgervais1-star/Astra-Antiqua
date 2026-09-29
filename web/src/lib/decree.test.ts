import { test } from "node:test";
import assert from "node:assert/strict";
import { composeDecree, headlineBody } from "@/lib/decree";
import { composeDailyMessage } from "@/lib/dailyMessage";
import { buildWeekDays } from "@/lib/weekReading";
import { computeChart } from "@/lib/ephemeris";
import { DEITY_CHARGES } from "@/data/deityCharges";
import { DEITY_DOMAINS } from "@/data/deityDomains";
import { DECREE_BANKS } from "@/data/decreeBanks";
import { DEITY_MATRIX } from "@/data/deities";
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
    assert.equal(sentences(bodyOf(d)).length, 5, bodyOf(d));
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

test("the instruction is always last and names the headline god and its domain", () => {
  for (const culture of CULTURES) {
    const d = composeDecree(culture, chartWith("moon", "venus", 120.8));
    const last = sentences(bodyOf(d)).at(-1) ?? "";
    // Both bodies are fast; the Moon is faster, so the Moon speaks.
    assert.ok(last.includes(DEITY_MATRIX[culture].moon.name), `${culture}: ${last}`);
    assert.ok(last.includes(DEITY_DOMAINS[culture].moon), `${culture}: ${last}`);
    assert.equal(d.headline, DECREE_BANKS[culture].headlines.trine.moon);
  }
});

test("the headline body is the fast body, the faster when both are", () => {
  assert.deepEqual(headlineBody("sun", "moon"), { body: "moon", partner: "sun" });
  assert.deepEqual(headlineBody("venus", "mercury"), { body: "mercury", partner: "venus" });
  assert.deepEqual(headlineBody("mars", "pluto"), { body: "mars", partner: "pluto" });
  assert.deepEqual(headlineBody("jupiter", "venus"), { body: "venus", partner: "jupiter" });
});

test("two sextiles between different gods share no sentence in the same culture", () => {
  for (const culture of CULTURES) {
    const sunMars = composeDecree(culture, chartWith("sun", "mars", 60));
    const moonVenus = composeDecree(culture, chartWith("moon", "venus", 60));
    const first = new Set(sentences(bodyOf(sunMars)));
    const shared = sentences(bodyOf(moonVenus)).filter((s) => first.has(s));
    assert.deepEqual(shared, [], `${culture}: kind-keyed boilerplate leaked across figures`);
  }
});

test("the exact tail appears only under half a degree of orb", () => {
  for (const culture of CULTURES) {
    const tail = DECREE_BANKS[culture].exactTail;
    const meaning = (sep: number) =>
      sentences(bodyOf(composeDecree(culture, chartWith("mars", "saturn", sep))))[0] ?? "";
    assert.ok(meaning(90).includes(tail), `${culture} exact: ${meaning(90)}`);
    assert.ok(meaning(90.45).includes(tail), `${culture} at 0.45: ${meaning(90.45)}`);
    assert.ok(!meaning(90.55).includes(tail), `${culture} at 0.55: ${meaning(90.55)}`);
    assert.ok(!meaning(93).includes(tail), `${culture} wide: ${meaning(93)}`);
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
      for (const s of [d.headline, ...sentences(bodyOf(d))]) {
        const prior = seen.get(s);
        assert.equal(prior, undefined, `"${s}" appears in both ${prior} and ${culture}`);
        seen.set(s, culture);
      }
    }
  }
});

test("the daily message is a strict subset of the decree, in the decree's order", () => {
  for (const culture of CULTURES) {
    const chart = chartWith("sun", "mars", 60.3);
    const decree = composeDecree(culture, chart);
    const message = composeDailyMessage(culture, chart);
    assert.equal(message.headline, decree.headline);
    const all = sentences(bodyOf(decree));
    const some = sentences(message.body);
    assert.ok(some.length < all.length, "a message is shorter than the page");
    assert.deepEqual(some, all.filter((s) => some.includes(s)), `${culture}: ${message.body}`);
  }
});

/**
 * The golden: one date, the chart the home page computes at 00:00 UTC, read
 * five ways. Rewritten deliberately when a bank line changes.
 */
const GOLDEN_2026_09_29: Readonly<Record<Culture, { headline: string; evidence: string; paragraph: string }>> = {
  egypt: {
    headline: "Start the heavy thing while the light holds.",
    evidence: "RA △ NUT · 0°19′",
    paragraph:
      "Your day's work and your sudden turns float on the same current, true as the plumb line. What you start today reaches the far bank, and Nut does not call it back. Ra sits level on the scale, and Anubis leaves the beam alone. Lower on the river, Khonsu tips the scales against Osiris: your moods and what you have buried haul on opposite ropes. Trust your day's work to the current today, and call on Ra as the barge casts off.",
  },
  greece: {
    headline: "Stand up and be counted today.",
    evidence: "HELIOS △ OURANOS · 0°19′",
    paragraph:
      "Your name in the city and your sudden notions keep step with each other, to the very degree. You get a straight answer today, and Ouranos gives it without a riddle. The Pythia takes Helios ahead of the crowd and answers from the tripod. At a lesser shrine, Selene challenges Plouton: your household and your hidden wealth argue at the same gate. Spend your morning on your name in the city, and pour a little wine for Helios at noon.",
  },
  canaan: {
    headline: "The council says yes to you today, so ask.",
    evidence: "SHAPASH △ SHAMEM · 0°19′",
    paragraph:
      "Your daily labor and your broken routine sit at the same table, and the whole council hears it. What you ask for passes, and Shamem raises no hand against it. The assembly waves Shapash through, and no god asks for a vow. Further down the bench, Yarikh draws the bow against Motu: your kin at home and your losses quarrel at the gate. Take your daily labor to the threshing floor today, and leave a share for Shapash.",
  },
  carthage: {
    headline: "Your credit is good today, so use it.",
    evidence: "SEMES △ BAAL SHAMEM · 0°19′",
    paragraph:
      "Your credit in the harbor and your abrupt departures add up on the first pass, posted to the hour. Your figures come out right today, and Baal Shamem initials the total. The clerk adds Semes's column once, and the sum closes the sheet. Further down the page, Tanit turns the prow against Mot: your household accounts and the debts you inherited fight over the same silver. Draw on your credit in the harbor today, and set aside Semes's share.",
  },
  rome: {
    headline: "Walk into the forum as if you own it.",
    evidence: "SOL △ CAELUS · 0°19′",
    paragraph:
      "Your public standing and your sudden orders sit on the same side of the Senate, exact to the augur's line. Your motion passes, and Caelus votes for it. The Vestals feed the hearth in Sol's name, and the flame burns clear. Elsewhere in the sky, Luna raises the spear against Dis Pater: your household affairs and your inheritance block each other's road. Push your public standing forward today, and hang a garland for Sol on the way.",
  },
};

test("each culture's day page for 2026-09-29 matches its golden", () => {
  const chart = computeChart(new Date("2026-09-29T00:00:00Z"));
  for (const culture of CULTURES) {
    const d = composeDecree(culture, chart);
    const golden = GOLDEN_2026_09_29[culture];
    assert.equal(d.headline, golden.headline, culture);
    assert.equal(d.evidence, golden.evidence, culture);
    assert.equal(bodyOf(d), golden.paragraph, culture);
  }
});

test("every aspect day in the week carries its headline and both domains", () => {
  const monday = new Date(2026, 8, 7);
  for (const culture of CULTURES) {
    for (const day of buildWeekDays(culture, monday, null)) {
      if (day.shorthand.kind !== "aspect") continue;
      const { a, aspect, b } = day.shorthand;
      assert.equal(day.headline, DECREE_BANKS[culture].headlines[aspect][headlineBody(a, b).body]);
      const line = day.line.toLowerCase();
      for (const body of [a, b]) {
        assert.ok(
          line.includes(DEITY_DOMAINS[culture][body].toLowerCase()),
          `${culture}: "${day.line}" lacks ${body}'s domain`,
        );
      }
      assert.equal(sentences(day.line).length, 2, `${culture}: a week line is the meaning and the consequence`);
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
