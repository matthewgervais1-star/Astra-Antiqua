import { test } from "node:test";
import assert from "node:assert/strict";
import { CULTURES, CULTURE_LABELS, PLANETS } from "@/data/cultures";
import { CULTURE_VOICES } from "@/data/cultureVoice";
import { DEITY_MATRIX } from "@/data/deities";
import {
  REVEAL_BAND_MARGIN,
  latinFor,
  pickLanguage,
  scriptFormFor,
  scriptLayerFor,
} from "@/lib/scriptName";

test("pickLanguage gives French for fr and its regional tags only", () => {
  for (const tag of ["fr", "fr-CA", "FR-ca", " fr-FR ", "fr-Latn-CA"]) {
    assert.equal(pickLanguage(tag), "fr", tag);
  }
  for (const tag of ["en", "en-CA", "fro", "frr", "", null, undefined]) {
    assert.equal(pickLanguage(tag), "en", String(tag));
  }
});

test("pickLanguage gives French when the browser's first language is French", () => {
  assert.equal(pickLanguage("en", "fr-CA"), "fr");
  assert.equal(pickLanguage(null, "fr"), "fr");
  assert.equal(pickLanguage(undefined, "FR-fr"), "fr");
  assert.equal(pickLanguage("fr-CA", "en-US"), "fr");
  assert.equal(pickLanguage("en", "en-CA"), "en");
  assert.equal(pickLanguage("en", "fro"), "en");
  assert.equal(pickLanguage("en", null), "en");
  assert.equal(pickLanguage("en", undefined), "en");
});

test("scriptFormFor finds the deity seat and both headings", () => {
  assert.equal(scriptFormFor("egypt", { planet: "sun" }).script, "𓂋𓂝𓇳");
  assert.equal(scriptFormFor("rome", { planet: "jupiter" }).script, "IVPPITER");
  assert.equal(scriptFormFor("greece", { heading: "culture" }).script, "Ἑλλάς");
  assert.equal(scriptFormFor("rome", { heading: "institution" }).script, "AVSPICIA");
});

test("the Latin form matches the name each surface prints", () => {
  for (const culture of CULTURES) {
    for (const planet of PLANETS) {
      assert.equal(latinFor(scriptFormFor(culture, { planet }), "en"), DEITY_MATRIX[culture][planet].name);
    }
    assert.equal(latinFor(scriptFormFor(culture, { heading: "culture" }), "en"), CULTURE_LABELS[culture]);
    assert.equal(latinFor(scriptFormFor(culture, { heading: "institution" }), "en"), CULTURE_VOICES[culture].institution);
  }
});

test("latinFor picks French and capitalises in the reader's language", () => {
  const ra = scriptFormFor("egypt", { planet: "sun" });
  assert.equal(latinFor(ra, "fr"), "Rê");
  assert.equal(latinFor(ra, "fr", true), "RÊ");
  assert.equal(latinFor(ra, "en", true), "RA");
  assert.equal(latinFor(scriptFormFor("egypt", { heading: "culture" }), "fr", true), "ÉGYPTE");
});

test("a name with no attested script falls back to Latin alone", () => {
  for (const [culture, key] of [
    ["egypt", { planet: "mercury" }],
    ["egypt", { planet: "mars" }],
    ["canaan", { heading: "culture" }],
    ["carthage", { heading: "institution" }],
  ] as const) {
    const form = scriptFormFor(culture, key);
    assert.equal(scriptLayerFor(form), null, `${culture} ${JSON.stringify(key)}`);
    assert.ok(latinFor(form, "en").length > 0);
  }
  assert.equal(scriptLayerFor({ script: "", en: "x", fr: "x", source: "s" }), null);
  assert.equal(scriptLayerFor(scriptFormFor("carthage", { planet: "sun" })), "𐤔𐤌𐤔");
});

test("the band is the middle 40% of the viewport", () => {
  assert.equal(REVEAL_BAND_MARGIN, "-30% 0px -30% 0px");
});
