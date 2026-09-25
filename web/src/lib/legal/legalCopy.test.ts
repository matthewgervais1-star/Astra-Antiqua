import assert from "node:assert/strict";
import test from "node:test";
import { PRIVACY_EN, PRIVACY_FR, storageSection } from "@/lib/legal/privacyCopy";
import { TERMS_EN, TERMS_FR } from "@/lib/legal/termsCopy";
import type { LegalCopy } from "@/lib/legal/legalTypes";
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

const everyString = (copy: LegalCopy): string[] => [
  copy.dateLine,
  copy.intro,
  copy.crossSentence,
  copy.closing,
  ...copy.sections.flatMap((s) => [
    ...(s.lead ? [s.lead] : []),
    ...(s.items ?? []).map((i) => i.text),
    ...s.paras,
  ]),
];

/** Every document that gets published, each as its English/French pair. */
const DOCUMENTS: readonly { name: string; en: LegalCopy; fr: LegalCopy }[] = [
  { name: "privacy policy", en: PRIVACY_EN, fr: PRIVACY_FR },
  { name: "terms of service", en: TERMS_EN, fr: TERMS_FR },
];

const tokensIn = (text: string): string[] => text.match(/\{[a-zA-Z]+\}/g) ?? [];

test("both versions have the same sections in the same order", () => {
  for (const { name, en: EN, fr: FR } of DOCUMENTS) {
    assert.equal(
      FR.sections.length,
      EN.sections.length,
      `${name}: a section exists in one language and not the other`,
    );
    EN.sections.forEach((en, i) => {
    const fr = FR.sections[i];
    assert.ok(fr, `${name} section ${i} ("${en.label}") is missing from the French version`);
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
      `${name} section ${i} ("${en.label}") has a lead paragraph in only one language`,
    );
    });
  }
});

test("both versions substitute exactly the same facts", () => {
  const count = (copy: LegalCopy) => {
    const tally = new Map<string, number>();
    for (const token of everyString(copy).flatMap(tokensIn)) {
      tally.set(token, (tally.get(token) ?? 0) + 1);
    }
    return tally;
  };
  for (const { name, en: EN, fr: FR } of DOCUMENTS) {
    const en = count(EN);
    const fr = count(FR);
    // A dropped token is a French document that never gives the reader the
    // address to write to, which is the thing s. 3.1 exists to guarantee.
    assert.deepEqual(
      [...fr.keys()].sort(),
      [...en.keys()].sort(),
      `${name}: the two versions interpolate a different set of facts`,
    );
    for (const [token, n] of en) {
      assert.equal(fr.get(token), n, `${name}: ${token} differs in count in French`);
    }
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
    "{legalName}",
  ]);
  for (const copy of DOCUMENTS.flatMap((d) => [d.en, d.fr])) {
    for (const token of everyString(copy).flatMap(tokensIn)) {
      assert.ok(known.has(token), `${token} is in the copy but the renderer does not fill it`);
    }
  }
});

test("every document has a cross-link slot in both languages", () => {
  // Split on {link} yields the before and after halves. Without the slot the
  // document renders with no route to its sibling at all.
  for (const copy of DOCUMENTS.flatMap((d) => [d.en, d.fr])) {
    assert.ok(copy.crossSentence.includes("{link}"), `${copy.metaTitle} lost its link slot`);
  }
});

test("the four legal routes point at each other correctly", () => {
  assert.equal(PRIVACY_EN.otherLanguageHref, "/confidentialite");
  assert.equal(PRIVACY_FR.otherLanguageHref, "/privacy");
  assert.equal(TERMS_EN.otherLanguageHref, "/conditions");
  assert.equal(TERMS_FR.otherLanguageHref, "/terms");
  // The policy links to the terms and back, in the matching language. A
  // cross-link that jumps language is how a French reader lands on English
  // terms, which is the outcome Charter s. 55 penalizes.
  assert.equal(PRIVACY_EN.crossLinkHref, "/terms");
  assert.equal(PRIVACY_FR.crossLinkHref, "/conditions");
  assert.equal(TERMS_EN.crossLinkHref, "/privacy");
  assert.equal(TERMS_FR.crossLinkHref, "/confidentialite");
});

test("the storage section follows the region actually configured", () => {
  const inQc = storageSection(PRIVACY_EN, false, false);
  assert.equal(inQc.paras.length, 1, "in Quebec there is no transfer to describe");

  const outNoAssessment = storageSection(PRIVACY_EN, true, false);
  assert.equal(
    outNoAssessment.paras.length,
    1,
    "without the s. 17 assessment the page must not claim one",
  );

  const outAssessed = storageSection(PRIVACY_EN, true, true);
  assert.equal(outAssessed.paras.length, 2, "once assessed, the page says so");
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
