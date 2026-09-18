import assert from "node:assert/strict";
import test from "node:test";
import { PRIVACY_EN, PRIVACY_FR, type PolicyCopy } from "@/lib/legal/privacyCopy";
import {
  POLICY_FACTS,
  assertPolicyFactsComplete,
  missingPolicyFacts,
  policyFactsComplete,
  storedOutsideQuebec,
} from "@/lib/legal/policyFacts";

/**
 * The two language versions are one document, so these tests are about drift.
 *
 * The Consumer Protection Act resolves a discrepancy between a French and an
 * English version in the consumer's favour, which means a section that exists
 * in English and is missing in French is not an inconsistency to tidy up later
 * but the version that loses. Structure is checked mechanically here; the
 * quality of the French prose still needs a human who writes French.
 */

const everyString = (copy: PolicyCopy): string[] => [
  copy.dateLine,
  copy.intro,
  copy.termsSentence,
  copy.closing,
  copy.storage.outside,
  copy.storage.outsideAssessed,
  copy.storage.inQuebec,
  ...copy.sections.flatMap((s) => [
    ...(s.lead ? [s.lead] : []),
    ...(s.items ?? []).map((i) => i.text),
    ...s.paras,
  ]),
];

const tokensIn = (text: string): string[] => text.match(/\{[a-zA-Z]+\}/g) ?? [];

test("both versions have the same sections in the same order", () => {
  assert.equal(
    PRIVACY_FR.sections.length,
    PRIVACY_EN.sections.length,
    "a section exists in one language and not the other",
  );
  PRIVACY_EN.sections.forEach((en, i) => {
    const fr = PRIVACY_FR.sections[i];
    assert.ok(fr, `section ${i} ("${en.label}") is missing from the French version`);
    assert.equal(
      fr.paras.length,
      en.paras.length,
      `section ${i} ("${en.label}") has a different number of paragraphs`,
    );
    assert.equal(
      (fr.items ?? []).length,
      (en.items ?? []).length,
      `section ${i} ("${en.label}") has a different number of listed items`,
    );
    assert.equal(
      Boolean(fr.lead),
      Boolean(en.lead),
      `section ${i} ("${en.label}") has a lead paragraph in only one language`,
    );
  });
});

test("both versions substitute exactly the same facts", () => {
  const count = (copy: PolicyCopy) => {
    const tally = new Map<string, number>();
    for (const token of everyString(copy).flatMap(tokensIn)) {
      tally.set(token, (tally.get(token) ?? 0) + 1);
    }
    return tally;
  };
  const en = count(PRIVACY_EN);
  const fr = count(PRIVACY_FR);
  // A dropped token is a French policy that never gives the reader the
  // address to write to, which is the thing s. 3.1 exists to guarantee.
  assert.deepEqual(
    [...fr.keys()].sort(),
    [...en.keys()].sort(),
    "the two versions interpolate a different set of facts",
  );
  for (const [token, n] of en) {
    assert.equal(fr.get(token), n, `${token} appears a different number of times in French`);
  }
});

test("every token used in the copy is one the renderer can fill", () => {
  const known = new Set([
    "{email}",
    "{postal}",
    "{officer}",
    "{appHost}",
    "{dbHost}",
    "{dbRegion}",
    "{effective}",
    "{updated}",
    "{dormantMonths}",
    "{backupDays}",
    // Not a fact. The renderer splits the sentence on this to place an
    // anchor, so it is consumed structurally rather than substituted.
    "{link}",
  ]);
  for (const copy of [PRIVACY_EN, PRIVACY_FR]) {
    for (const token of everyString(copy).flatMap(tokensIn)) {
      assert.ok(known.has(token), `${token} is in the copy but the renderer does not fill it`);
    }
  }
});

test("the terms sentence has a link slot in both languages", () => {
  // Split on {link} yields the before and after halves. Without the slot the
  // policy would render with no route to the terms at all.
  assert.ok(PRIVACY_EN.termsSentence.includes("{link}"));
  assert.ok(PRIVACY_FR.termsSentence.includes("{link}"));
});

test("each version points at the other", () => {
  assert.equal(PRIVACY_EN.otherLanguageHref, "/confidentialite");
  assert.equal(PRIVACY_FR.otherLanguageHref, "/privacy");
});

test("the policy is withheld while it still carries placeholders", () => {
  // This is the state the repo is in today, and the assertion is the point:
  // until someone fills the facts in, the route must not serve a document
  // with holes where the address and the retention periods belong.
  assert.equal(policyFactsComplete(POLICY_FACTS), false);
  assert.throws(
    () => assertPolicyFactsComplete(POLICY_FACTS),
    /still carrying placeholders/,
  );
  // Every placeholder is named, so the message is a to-do list.
  const missing = missingPolicyFacts(POLICY_FACTS);
  for (const required of ["legalName", "privacyEmail", "postalAddress", "effectiveDate"]) {
    assert.ok(missing.includes(required), `${required} should be flagged as unset`);
  }
});

test("a filled-in set of facts is accepted", () => {
  const filled = {
    ...POLICY_FACTS,
    legalName: "Example Inc.",
    privacyEmail: "privacy@example.com",
    postalAddress: "1 Rue Example, Montreal QC",
    effectiveDate: "2026-10-01",
    lastUpdated: "2026-10-01",
    appHost: "Vercel",
    databaseHost: "Neon",
    databaseRegion: "Montreal, Quebec",
  };
  assert.equal(policyFactsComplete(filled), true);
  assert.doesNotThrow(() => assertPolicyFactsComplete(filled));
  // A Montreal region takes the storage leg out of s. 17 entirely, which is
  // the single cleanest fix available to this app.
  assert.equal(storedOutsideQuebec(filled), false);
  assert.equal(storedOutsideQuebec({ ...filled, databaseRegion: "Virginia, USA" }), true);
  assert.equal(storedOutsideQuebec({ ...filled, databaseRegion: "Toronto, Ontario" }), true);
});
