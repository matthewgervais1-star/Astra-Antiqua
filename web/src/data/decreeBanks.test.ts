import { test } from "node:test";
import assert from "node:assert/strict";
import { DECREE_BANKS, QUIET_LINE } from "@/data/decreeBanks";
import { DEITY_DOMAINS } from "@/data/deityDomains";
import { PERMISSIONS_REGISTER } from "@/data/permissionsRegister";
import { QUIET_HEADLINE } from "@/lib/decree";
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

test("every sentence after the evidence line takes the figure", () => {
  for (const culture of CULTURES) {
    const bank = DECREE_BANKS[culture];
    // The consequence is keyed by the partner body; the image and the
    // instruction are keyed by the headline body and name both gods.
    for (const [where, line] of walk("images", bank.images)) {
      assert.match(line, /\{god\}/, `${culture}.${where} names no headline god`);
      assert.match(line, /\{partner\}/, `${culture}.${where} names no partner`);
    }
    for (const [where, line] of walk("instructions", bank.instructions)) {
      assert.match(line, /\{god\}/, `${culture}.${where} names no headline god`);
      assert.match(line, /\{partner\}/, `${culture}.${where} names no partner`);
    }
    for (const [where, line] of walk("consequences", bank.consequences)) {
      assert.doesNotMatch(line, /\{/, `${culture}.${where} carries a slot the composer does not fill`);
    }
  }
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
