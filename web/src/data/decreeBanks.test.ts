import { test } from "node:test";
import assert from "node:assert/strict";
import { DECREE_BANKS, QUIET_LINE } from "@/data/decreeBanks";
import { DEITY_DOMAINS } from "@/data/deityDomains";
import { PERMISSIONS_REGISTER } from "@/data/permissionsRegister";
import { QUIET_HEADLINE } from "@/lib/decree";
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

/** Every authored line the day page can print, labelled by where it lives. */
function bankLines(culture: Culture): Array<[string, string]> {
  return [
    ...walk("bank", DECREE_BANKS[culture]),
    ["QUIET_HEADLINE", QUIET_HEADLINE[culture]],
    ["QUIET_LINE", QUIET_LINE[culture]],
    ...walk("domains", DEITY_DOMAINS[culture]),
    ...walk("permissions", PERMISSIONS_REGISTER[culture]),
  ];
}

/** Built from its code point so this file passes the em-dash gate itself. */
const EM_DASH = String.fromCharCode(0x2014);

const HEDGES = /\b(may|might|maybe|perhaps|possibly|tends|tend to be|a bit|somewhat|kind of|sort of)\b/i;
const ABSTRACTIONS = /\b(energy|energies|growth|situation|transformation|vibes?|journey|space|manifest(ing|ation)?|universe)\b/i;
const THERAPY = /\b(healing|self-care|boundaries|trauma|validate|journey|inner child|process your)\b/i;

test("no bank line hedges, abstracts, counsels, or carries an em dash", () => {
  for (const culture of CULTURES) {
    for (const [where, line] of bankLines(culture)) {
      assert.equal(line.match(HEDGES), null, `${culture}.${where} hedges: "${line}"`);
      assert.equal(line.match(ABSTRACTIONS), null, `${culture}.${where} abstracts: "${line}"`);
      assert.equal(line.match(THERAPY), null, `${culture}.${where} counsels: "${line}"`);
      assert.ok(!line.includes(EM_DASH), `${culture}.${where} carries an em dash`);
      assert.doesNotMatch(line, /;/, `${culture}.${where} chains with a semicolon`);
    }
  }
});

test("no bank line is shared between two cultures, or used twice in one", () => {
  const seen = new Map<string, string>();
  for (const culture of CULTURES) {
    for (const [where, line] of bankLines(culture)) {
      const prior = seen.get(line);
      assert.equal(prior, undefined, `"${line}" is used by both ${prior} and ${culture}${where}`);
      seen.set(line, `${culture}${where}`);
    }
  }
});

test("every headline is one complete sentence, and few lean on 'so' or 'because'", () => {
  for (const culture of CULTURES) {
    const headlines = [...walk("", DECREE_BANKS[culture].headlines)].map(([, line]) => line);
    for (const line of headlines) assert.match(line, /^[A-Z][^.!?]*[.!?]$/, `${culture}: "${line}"`);
    const leaning = headlines.filter((line) => /, (so|because) /.test(line));
    assert.ok(leaning.length <= 3, `${culture} has ${leaning.length} "X, so Y" headlines: ${leaning.join(" / ")}`);
  }
});

test("each bank carries the slots its keys call for, and only those", () => {
  for (const culture of CULTURES) {
    const bank = DECREE_BANKS[culture];
    // The image names the headline god; the consequence is keyed by the
    // partner body and names no god.
    for (const [where, line] of walk("images", bank.images)) {
      assert.match(line, /\{god\}/, `${culture}.${where} names no headline god`);
      assert.doesNotMatch(line, /\{partner\}/, `${culture}.${where} names the partner`);
    }
    for (const [where, line] of walk("consequences", bank.consequences)) {
      assert.doesNotMatch(line, /\{/, `${culture}.${where} carries a slot`);
    }
    // At most two kinds close the instruction on a rite to the god; the rest
    // end on the act itself. No instruction names the partner.
    const riteKinds = Object.entries(bank.instructions).filter(([, byBody]) =>
      Object.values(byBody).some((line) => line.includes("{god}")),
    );
    assert.ok(riteKinds.length <= 2, `${culture} closes ${riteKinds.length} kinds on a rite`);
    for (const [where, line] of walk("instructions", bank.instructions)) {
      assert.doesNotMatch(line, /\{partner\}/, `${culture}.${where} names the partner`);
    }
    for (const opener of bank.secondFigure) assert.match(opener, /\{god\}.*\{partner\}/, culture);
    for (const opener of bank.secondFigurePlain) assert.doesNotMatch(opener, /\{/, culture);
  }
});

/**
 * Every capitalised word of every name in the deity matrix, so "Baal" catches
 * "Baal Hadad" and "Horus" catches "Horus the Red"; then the gods outside the
 * matrix the images once named beside the headline god.
 */
const GOD_WORDS = new Set<string>([
  ...CULTURES.flatMap((c) => PLANETS.flatMap((p) => DEITY_MATRIX[c][p].name.split(" ").filter((w) => /^[A-Z]/.test(w)))),
  "Thoth", "Anubis", "Hathor", "Seth", "Athena", "Hera", "Hephaestus", "Asherah", "Eshmun", "Juno", "Vesta", "Minerva",
]);
/** Claims about the sky an image may not make: phase, visibility, rising and setting, kinship. */
const SKY_CLAIMS = /\b(full|new|crescent|evening star|morning star|rises|sets|eclipse|waxes|wanes|uncle|father|brother|sister|son|daughter)\b/i;

test("an image names the headline god only and claims nothing about the sky", () => {
  for (const culture of CULTURES) {
    for (const [where, line] of walk("images", DECREE_BANKS[culture].images)) {
      assert.match(line, /\{god\}/, `${culture}.${where} names no headline god`);
      const named = (line.replaceAll("{god}", "").match(/[A-Z][a-z']+/g) ?? []).filter((w) => GOD_WORDS.has(w));
      assert.deepEqual(named, [], `${culture}.${where} names a second god: "${line}"`);
      assert.equal(line.match(SKY_CLAIMS), null, `${culture}.${where} claims the sky: "${line}"`);
    }
  }
});

/** Words that may repeat across cultures' headlines in any run of three. */
const STOP_WORDS = new Set(["the", "a", "your", "you", "and", "of", "to", "in", "on", "for", "with", "before", "today"]);

test("no two cultures' headlines share a run of three words", () => {
  const owner = new Map<string, Culture>();
  for (const culture of CULTURES) {
    for (const [where, headline] of walk("headlines", DECREE_BANKS[culture].headlines)) {
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

test("headlines keep their tics in check", () => {
  const all = CULTURES.flatMap((culture) => [...walk("", DECREE_BANKS[culture].headlines)].map(([, line]) => line));
  assert.ok(all.filter((h) => /\btonight\b/i.test(h)).length <= 3, "too many headlines say tonight");
  assert.ok(all.filter((h) => /, and you can /.test(h)).length <= 1, 'too many headlines lean on ", and you can"');
});

test("every domain is a lowercase noun phrase that can open a clause", () => {
  for (const culture of CULTURES) {
    for (const planet of PLANETS) {
      const domain = DEITY_DOMAINS[culture][planet];
      assert.match(domain, /^[a-z][a-z' ]+$/, `${culture}.${planet} "${domain}"`);
      assert.doesNotMatch(domain, /\band\b/, `${culture}.${planet} "${domain}" would split the meaning sentence`);
    }
  }
});

test("every Do and Don't item is a capitalised noun phrase of two to four words", () => {
  for (const culture of CULTURES) {
    for (const [where, item] of walk("", PERMISSIONS_REGISTER[culture])) {
      const words = item.split(" ").length;
      assert.ok(words >= 2 && words <= 4, `${culture}${where} "${item}" has ${words} words`);
      assert.match(item, /^[A-Z][^.!?]*$/, `${culture}${where} "${item}" is not a bare noun phrase`);
    }
  }
});
