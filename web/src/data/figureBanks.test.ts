import { test } from "node:test";
import assert from "node:assert/strict";
import { FIGURE_BANKS } from "@/data/figureBanks";
import { DECREE_BANKS } from "@/data/decreeBanks";
import { DEITY_MATRIX } from "@/data/deities";
import { CULTURES, PLANETS, type Culture } from "@/data/cultures";

/** Walk a nested table of strings, yielding [path, line]. */
function* walk(prefix: string, node: unknown): Generator<[string, string]> {
  if (typeof node === "string") {
    yield [prefix, node];
    return;
  }
  for (const [key, value] of Object.entries(node as Record<string, unknown>)) yield* walk(`${prefix}.${key}`, value);
}

/** Every authored line the figure page can print: not a card's kind key, not the frame only Rome fills. */
function bankLines(culture: Culture): Array<[string, string]> {
  return [...walk("", FIGURE_BANKS[culture])].filter(([where, line]) => line !== "" && !where.endsWith(".kind"));
}

/** Built from its code point so this file passes the em-dash gate itself. */
const EM_DASH = String.fromCharCode(0x2014);
const HEDGES = /\b(may|might|maybe|perhaps|possibly|tends|tend to be|a bit|somewhat|kind of|sort of)\b/i;
const ABSTRACTIONS = /\b(energy|energies|growth|situation|transformation|vibes?|journey|space|manifest(ing|ation)?|universe)\b/i;
const THERAPY = /\b(healing|self-care|boundaries|trauma|validate|journey|inner child|process your)\b/i;

const KINDS = ["conjunction", "sextile", "square", "trine", "opposition"] as const;
const SLOW = ["jupiter", "saturn", "uranus", "neptune", "pluto"] as const;

test("the banks hold the counts the spec names", () => {
  let cards = 0;
  for (const culture of CULTURES) {
    const bank = FIGURE_BANKS[culture];
    assert.equal(KINDS.flatMap((k) => SLOW.map((b) => bank.slowHeadlines[k][b])).length, 25);
    assert.equal(bank.manifestations.flatMap((g) => [...g.harmony, ...g.tension]).length, 32);
    assert.equal(Object.keys(bank.lessons).length, 5);
    for (const planet of PLANETS) {
      const deck = bank.tryThis[planet];
      assert.ok(deck.length >= 2 && deck.length <= 3, `${culture}.${planet} has ${deck.length} cards`);
      cards += deck.length;
    }
  }
  // 150 asked; the few bodies with nothing attested to keep or consider carry two.
  assert.equal(cards, 145);
});

test("no figure bank line hedges, abstracts, counsels, or carries an em dash", () => {
  for (const culture of CULTURES) {
    for (const [where, line] of bankLines(culture)) {
      assert.equal(line.match(HEDGES), null, `${culture}${where} hedges: "${line}"`);
      assert.equal(line.match(ABSTRACTIONS), null, `${culture}${where} abstracts: "${line}"`);
      assert.equal(line.match(THERAPY), null, `${culture}${where} counsels: "${line}"`);
      assert.ok(!line.includes(EM_DASH), `${culture}${where} carries an em dash`);
      assert.doesNotMatch(line, /;/, `${culture}${where} chains with a semicolon`);
    }
  }
});

test("no figure bank line is shared between two cultures, used twice in one, or lifted from the day page", () => {
  const seen = new Map<string, string>();
  for (const culture of CULTURES) {
    for (const [where, line] of walk("decree", DECREE_BANKS[culture])) seen.set(line, `${culture}.${where}`);
  }
  for (const culture of CULTURES) {
    for (const [where, line] of bankLines(culture)) {
      const prior = seen.get(line);
      // A culture may cite one text twice (two columns of the Baal Cycle); no other culture may cite it.
      const sameCultureSource = where.endsWith(".source") && prior?.startsWith(`${culture}.`);
      if (!sameCultureSource) assert.equal(prior, undefined, `"${line}" is used by both ${prior} and ${culture}${where}`);
      seen.set(line, `${culture}${where}`);
    }
  }
});

test("every slow headline is one sentence to the reader, and few lean on 'so' or 'because'", () => {
  for (const culture of CULTURES) {
    const lines = [...walk("", FIGURE_BANKS[culture].slowHeadlines)].map(([, l]) => l);
    for (const line of lines) assert.match(line, /^[A-Z][^.!?]*[.!?]$/, `${culture}: "${line}"`);
    const leaning = lines.filter((line) => /, (so|because) /.test(line));
    assert.ok(leaning.length <= 3, `${culture} has ${leaning.length} "X, so Y" slow headlines: ${leaning.join(" / ")}`);
  }
});

/** Words that may repeat across cultures' headlines in any run of three. */
const STOP_WORDS = new Set(["the", "a", "your", "you", "and", "of", "to", "in", "on", "for", "with", "before", "today", "it", "is", "this"]);

test("no two cultures' headlines, fast or slow, share a run of three words", () => {
  const owner = new Map<string, Culture>();
  for (const culture of CULTURES) {
    const lines = [...walk("", DECREE_BANKS[culture].headlines), ...walk("", FIGURE_BANKS[culture].slowHeadlines)];
    for (const [where, headline] of lines) {
      const words = headline.toLowerCase().replace(/[^a-z' ]/g, "").split(/\s+/).filter(Boolean);
      for (let i = 0; i + 3 <= words.length; i += 1) {
        const run = words.slice(i, i + 3);
        if (run.every((w) => STOP_WORDS.has(w))) continue;
        const key = run.join(" ");
        const prior = owner.get(key);
        assert.ok(prior === undefined || prior === culture, `"${key}" is in ${prior} and ${culture}${where}`);
        owner.set(key, culture);
      }
    }
  }
});

/**
 * Every capitalised word of every name in the deity matrix, and the gods
 * outside it that a lesson might be tempted to name beside the headline god.
 */
const GOD_WORDS = new Set<string>([
  ...CULTURES.flatMap((c) => PLANETS.flatMap((p) => DEITY_MATRIX[c][p].name.split(" ").filter((w) => /^[A-Z]/.test(w)))),
  "Thoth", "Anubis", "Hathor", "Seth", "Athena", "Hera", "Hephaestus", "Asherah", "Eshmun", "Juno", "Vesta", "Minerva", "Ma'at",
]);
const SKY_CLAIMS = /\b(full|new|crescent|evening star|morning star|rises|sets|eclipse|waxes|wanes|uncle|father|brother|sister|son|daughter)\b/i;

test("a slow body's act names its god and no other, and claims nothing about the sky", () => {
  for (const culture of CULTURES) {
    for (const [where, line] of walk("slowActs", FIGURE_BANKS[culture].slowActs)) {
      assert.match(line, /^\{god\} /, `${culture}.${where} does not open on its god`);
      const named = (line.replaceAll("{god}", "").match(/[A-Z][a-z']+/g) ?? []).filter((w) => GOD_WORDS.has(w));
      assert.deepEqual(named, [], `${culture}.${where} names another god: "${line}"`);
      assert.equal(line.match(SKY_CLAIMS), null, `${culture}.${where} claims the sky: "${line}"`);
    }
  }
});

test("a lesson is two sentences, names the headline god at most, and claims nothing about the sky", () => {
  for (const culture of CULTURES) {
    for (const [where, line] of walk("lessons", FIGURE_BANKS[culture].lessons)) {
      const sentences = line.split(/(?<=[.!?])\s+/);
      assert.equal(sentences.length, 2, `${culture}.${where} is not two sentences: "${line}"`);
      const named = (line.replaceAll("{god}", "").match(/[A-Z][a-z']+/g) ?? []).filter((w) => GOD_WORDS.has(w));
      assert.deepEqual(named, [], `${culture}.${where} names another god: "${line}"`);
      assert.equal(line.match(SKY_CLAIMS), null, `${culture}.${where} claims the sky: "${line}"`);
    }
  }
});

test("every card names what to consider, read or keep, in that order, with a one-line source", () => {
  const order = ["consider", "read", "keep"];
  for (const culture of CULTURES) {
    for (const planet of PLANETS) {
      const deck = FIGURE_BANKS[culture].tryThis[planet];
      const kinds = deck.map((c) => c.kind);
      assert.deepEqual(kinds, order.filter((k) => kinds.includes(k as never)), `${culture}.${planet} cards out of order`);
      for (const card of deck) {
        assert.match(card.title, /^[A-Z].*\.$/, `${culture}.${planet}.${card.kind} title`);
        assert.match(card.source, /^\S.*\.$/, `${culture}.${planet}.${card.kind} source`);
        assert.ok(!card.source.includes("\n") && card.source.length <= 140, `${culture}.${planet}.${card.kind} source runs long`);
      }
    }
  }
});

test("manifestations are lowercase noun phrases, four to a group and tone, none repeated", () => {
  for (const culture of CULTURES) {
    const all = FIGURE_BANKS[culture].manifestations.flatMap((g) => [...g.harmony, ...g.tension]);
    for (const item of all) assert.match(item, /^[a-z][^.!?]*[a-z]$/, `${culture}: "${item}"`);
    assert.equal(new Set(all).size, all.length, `${culture} repeats a manifestation`);
  }
});

test("frames carry their slots, relations open on a modal, and angle domains can open a clause", () => {
  for (const culture of CULTURES) {
    const bank = FIGURE_BANKS[culture];
    assert.match(bank.natalFrame, /\{deity\}.*\{sign\}.*\{clause\}\.$/, culture);
    if (bank.natalFrameYou) assert.match(bank.natalFrameYou, /^As \{deity\} in the \{sign\}, \{clause\}\.$/, culture);
    assert.match(bank.skyMoveOne, /\{god\}.*\{sign\}.*\{domain\}/, culture);
    assert.match(bank.recurrenceFrame, /\{interval\}\.$/, culture);
    assert.match(bank.playsOutTitle, /^HOW THIS PLAYS OUT (IN|ON|AT) THE [A-Z]+$/, culture);
    for (const angle of ["asc", "mc"] as const) {
      assert.match(bank.angleMoveOne[angle], /\{sign\}/, `${culture}.${angle}`);
      assert.match(bank.angleDomains[angle], /^[a-z][a-z' ]+$/, `${culture}.${angle} "${bank.angleDomains[angle]}"`);
      assert.doesNotMatch(bank.angleDomains[angle], /\band\b/, `${culture}.${angle}`);
    }
    for (const kind of KINDS) {
      assert.match(bank.shortRelations[kind], /^(can|cannot|must|will) /, `${culture}.${kind} "${bank.shortRelations[kind]}"`);
    }
  }
});
