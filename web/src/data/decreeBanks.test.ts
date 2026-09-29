import { test } from "node:test";
import assert from "node:assert/strict";
import { DECREE_BANKS, QUIET_LINE } from "@/data/decreeBanks";
import { DEITY_DOMAINS } from "@/data/deityDomains";
import { QUIET_HEADLINE } from "@/lib/decree";
import { CULTURES, PLANETS, type Culture } from "@/data/cultures";

/** Every authored line the day page can print, labelled by where it lives. */
function bankLines(culture: Culture): Array<[string, string]> {
  const bank = DECREE_BANKS[culture];
  const out: Array<[string, string]> = [];
  for (const [kind, byBody] of Object.entries(bank.headlines)) {
    for (const [body, line] of Object.entries(byBody)) out.push([`headlines.${kind}.${body}`, line]);
  }
  for (const key of ["relations", "consequences", "images", "instructions"] as const) {
    for (const [kind, line] of Object.entries(bank[key])) out.push([`${key}.${kind}`, line]);
  }
  out.push(["exactTail", bank.exactTail]);
  out.push(["secondFigure", bank.secondFigure]);
  out.push(["noSecondFigure", bank.noSecondFigure]);
  out.push(["comeBack", bank.comeBack]);
  out.push(["QUIET_HEADLINE", QUIET_HEADLINE[culture]]);
  out.push(["QUIET_LINE", QUIET_LINE[culture]]);
  for (const planet of PLANETS) out.push([`domains.${planet}`, DEITY_DOMAINS[culture][planet]]);
  return out;
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

test("no bank line is shared between two cultures", () => {
  const seen = new Map<string, string>();
  for (const culture of CULTURES) {
    for (const [where, line] of bankLines(culture)) {
      const prior = seen.get(line);
      assert.equal(prior, undefined, `"${line}" is used by both ${prior} and ${culture}.${where}`);
      seen.set(line, `${culture}.${where}`);
    }
  }
});

test("every headline is one complete sentence, and no two are the same", () => {
  const seen = new Set<string>();
  for (const culture of CULTURES) {
    for (const [where, line] of bankLines(culture)) {
      if (!where.startsWith("headlines.")) continue;
      assert.match(line, /^[A-Z][^.!?]*[.!?]$/, `${culture}.${where} is not one sentence: "${line}"`);
      assert.ok(!seen.has(line), `${culture}.${where} repeats "${line}"`);
      seen.add(line);
    }
  }
});

test("every sentence after the evidence line takes the figure", () => {
  for (const culture of CULTURES) {
    const bank = DECREE_BANKS[culture];
    for (const [kind, line] of Object.entries(bank.consequences)) {
      assert.match(line, /\{partner\}/, `${culture}.consequences.${kind} names no god`);
    }
    for (const [kind, line] of Object.entries(bank.images)) {
      assert.match(line, /\{god\}/, `${culture}.images.${kind} names no god`);
    }
    for (const [kind, line] of Object.entries(bank.instructions)) {
      assert.match(line, /\{god\}/, `${culture}.instructions.${kind} names no god`);
      assert.match(line, /\{domain\}/, `${culture}.instructions.${kind} names no domain`);
    }
  }
});

test("every domain is a lowercase noun phrase that can open or end a clause", () => {
  for (const culture of CULTURES) {
    for (const planet of PLANETS) {
      const domain = DEITY_DOMAINS[culture][planet];
      assert.match(domain, /^[a-z][a-z' ]+$/, `${culture}.${planet} "${domain}"`);
      assert.doesNotMatch(domain, /\band\b/, `${culture}.${planet} "${domain}" would split the meaning sentence`);
    }
  }
});
