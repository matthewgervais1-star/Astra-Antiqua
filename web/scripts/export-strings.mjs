/**
 * Exports the shared strings catalog and the format rules from web/src/strings
 * to shared/strings/*.json and shared/goldens/formats.json, the interchange
 * form Android (through gen-android-strings.mjs), Swift and C# read.
 *
 *   cd web && pnpm export:strings
 *
 * Writes:
 *   shared/strings/en.json        every <screen>.<slot> key: a string, or one per culture
 *   shared/strings/formats.json   the format rules F1 to F14, word lists and separators
 *   shared/strings/manifest.json  source commit, counts, and the composed rows
 *   shared/goldens/formats.json   input and output pairs for every format
 *
 * The web TS modules stay the source of truth; the JSON is generated and must
 * never be hand-edited. The script fails on a per-culture value missing a
 * culture, on text that is not NFC, and on a golden pair formats.ts no longer
 * prints, and writes atomically (temp file, then rename).
 * ASTRA_SHARED_OUT points it at another shared/ root (check-shared.mjs).
 */
import { register } from "node:module";
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

register("./resolve-at-alias.mjs", import.meta.url);

const { CATALOG, SCREENS, COMPOSED } = await import("../src/strings/index.ts");
const { CULTURES } = await import("../src/data/cultures.ts");
const F = await import("../src/strings/formats.ts");
const { FORMAT_CASES, caseInput } = await import("../src/strings/formatCases.ts");

const SHARED = process.env.ASTRA_SHARED_OUT ?? path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../shared");

function fail(message) {
  throw new Error(`export-strings: ${message}`);
}

// ---- en.json --------------------------------------------------------------

const en = {};
let perCulture = 0;
for (const table of Object.values(SCREENS)) {
  for (const [key, value] of Object.entries(table)) {
    if (key in en) fail(`duplicate key ${key}`);
    if (typeof value === "string") {
      if (value !== value.normalize("NFC")) fail(`${key} is not NFC`);
      en[key] = value;
      continue;
    }
    const keys = Object.keys(value).sort();
    const want = [...CULTURES].sort();
    if (JSON.stringify(keys) !== JSON.stringify(want)) fail(`${key} carries ${keys.join(", ")}, not the five cultures`);
    const ordered = {};
    for (const c of CULTURES) {
      const t = value[c];
      if (typeof t !== "string" || t.length === 0) fail(`${key}.${c} is empty`);
      if (t !== t.normalize("NFC")) fail(`${key}.${c} is not NFC`);
      ordered[c] = t;
    }
    en[key] = ordered;
    perCulture += 1;
  }
}
if (Object.keys(en).length !== Object.keys(CATALOG).length) fail("SCREENS and CATALOG disagree on the key count");

// ---- formats.json ---------------------------------------------------------

const formats = {
  rules: F.FORMAT_RULES,
  characterRules: F.CHARACTER_RULES,
  zoneRule:
    "A date format reads the calendar day in the zone the slot names: UTC for the Day screen, the reader's zone for Week and Season.",
  separators: { dot: F.SEP, arrow: F.ARROW },
  words: {
    monthAbbr: F.MONTH_ABBR,
    monthFull: F.MONTH_FULL,
    weekdayAbbr: F.WEEKDAY_ABBR,
    countWords: F.COUNT_WORDS,
    ordinalWords: F.ORDINAL_WORDS,
    signFull: F.SIGN_FULL,
    signAbbr: F.SIGN_ABBR3,
    signPhrases: F.SIGN_PHRASES,
    planetNames: F.PLANET_NAMES,
    toneWords: F.TONE_WORDS,
    spanToneWords: F.SPAN_TONE_WORDS,
    retrogradeMark: F.RETROGRADE_MARK,
  },
};

// ---- goldens/formats.json -------------------------------------------------

const cases = FORMAT_CASES.map((c) => {
  const out = F.fmt(c.name, caseInput(c), c.zone);
  if (out !== c.out) fail(`${c.name} ${JSON.stringify(c.input)} in ${c.zone} prints ${out}, golden says ${c.out}`);
  return { name: c.name, input: c.input, zone: c.zone, out: c.out, ...(c.note ? { note: c.note } : {}) };
});

// ---- manifest.json --------------------------------------------------------

const manifest = {
  sourceCommit: execFileSync("git", ["rev-parse", "HEAD"], { encoding: "utf8" }).trim(),
  counts: {
    keys: Object.keys(en).length,
    perCultureKeys: perCulture,
    cultures: CULTURES.length,
    composedRows: Object.keys(COMPOSED).length,
    formats: Object.keys(F.FORMAT_RULES).length,
    formatGoldens: cases.length,
  },
  composed: COMPOSED,
};

// ---- write ----------------------------------------------------------------

const files = {
  "strings/en.json": en,
  "strings/formats.json": formats,
  "strings/manifest.json": manifest,
  "goldens/formats.json": { cases },
};

for (const [rel, doc] of Object.entries(files)) {
  const target = path.join(SHARED, rel);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  const tmp = `${target}.tmp`;
  fs.writeFileSync(tmp, `${JSON.stringify(doc, null, 2)}\n`, "utf8");
  fs.renameSync(tmp, target);
}

console.log(`export-strings: wrote ${Object.keys(files).length} files (${JSON.stringify(manifest.counts)})`);
