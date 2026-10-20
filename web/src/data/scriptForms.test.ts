import { test } from "node:test";
import assert from "node:assert/strict";
import { CULTURES, CULTURE_LABELS, PLANETS, type Culture } from "@/data/cultures";
import { CULTURE_VOICES } from "@/data/cultureVoice";
import { DEITY_MATRIX } from "@/data/deities";
import { CULTURE_NAME_FORMS, DEITY_SCRIPT_FORMS, INSTITUTION_FORMS, type ScriptForm } from "@/data/scriptForms";

const inRange = (cp: number, lo: number, hi: number) => cp >= lo && cp <= hi;

/** The code points each culture's script form may use (spec, Verification). */
const ALLOWED: Readonly<Record<Culture, (cp: number) => boolean>> = {
  egypt: (cp) => inRange(cp, 0x13000, 0x1342f),
  greece: (cp) => cp === 0x20 || inRange(cp, 0x0370, 0x03ff) || inRange(cp, 0x1f00, 0x1fff),
  canaan: (cp) => inRange(cp, 0x10380, 0x1039f),
  carthage: (cp) => inRange(cp, 0x10900, 0x1091f),
  // Inscriptional capitals: A to Z and space, with V for U and I for J.
  rome: (cp) => cp === 0x20 || (inRange(cp, 0x41, 0x5a) && cp !== 0x55 && cp !== 0x4a && cp !== 0x57),
};

function allForms(): { label: string; culture: Culture; form: ScriptForm }[] {
  const rows: { label: string; culture: Culture; form: ScriptForm }[] = [];
  for (const culture of CULTURES) {
    for (const planet of PLANETS) {
      rows.push({ label: `${culture}.${planet}`, culture, form: DEITY_SCRIPT_FORMS[culture][planet] });
    }
    rows.push({ label: `${culture} culture name`, culture, form: CULTURE_NAME_FORMS[culture] });
    rows.push({ label: `${culture} institution`, culture, form: INSTITUTION_FORMS[culture] });
  }
  return rows;
}

test("every script code point sits in its culture's block", () => {
  for (const { label, culture, form } of allForms()) {
    if (form.script === null) continue;
    assert.ok(form.script.length > 0, `${label} has an empty script string; use null and a note`);
    assert.equal(form.script, form.script.normalize("NFC"), `${label} is not NFC`);
    for (const ch of form.script) {
      const cp = ch.codePointAt(0)!;
      assert.ok(
        ALLOWED[culture](cp),
        `${label} "${form.script}" has U+${cp.toString(16).toUpperCase().padStart(4, "0")}, outside the ${culture} block`,
      );
    }
  }
});

test("every entry has en, fr and a source", () => {
  for (const { label, form } of allForms()) {
    assert.ok(form.en.trim().length > 0, `${label} has no en`);
    assert.ok(form.fr.trim().length > 0, `${label} has no fr`);
    assert.ok(form.source.trim().length > 0, `${label} has no source`);
  }
});

test("a null script carries a note saying why", () => {
  for (const { label, form } of allForms()) {
    if (form.script !== null) continue;
    assert.ok(form.note && form.note.trim().length > 0, `${label} has script null and no note`);
  }
});

test("every DEITY_MATRIX seat has a form whose en is the deity's name", () => {
  for (const culture of CULTURES) {
    for (const planet of PLANETS) {
      const form = DEITY_SCRIPT_FORMS[culture][planet];
      assert.ok(form, `${culture}.${planet} has no script form`);
      assert.equal(form.en, DEITY_MATRIX[culture][planet].name, `${culture}.${planet} en drifts from DEITY_MATRIX`);
    }
  }
});

test("heading forms resolve to the strings the site prints", () => {
  for (const culture of CULTURES) {
    assert.equal(CULTURE_NAME_FORMS[culture].en, CULTURE_LABELS[culture], `${culture} culture name drifts from CULTURE_LABELS`);
    assert.equal(INSTITUTION_FORMS[culture].en, CULTURE_VOICES[culture].institution, `${culture} institution drifts from CULTURE_VOICES`);
  }
});

test("no entry carries an em dash", () => {
  for (const { label, form } of allForms()) {
    for (const text of [form.en, form.fr, form.source, form.note ?? ""]) {
      assert.doesNotMatch(text, /—/, `${label} carries an em dash`);
    }
  }
});
