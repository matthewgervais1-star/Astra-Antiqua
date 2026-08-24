/**
 * Exports the canonical chart-reading content from web/src/data to
 * shared/content/*.json — the interchange form every non-web surface reads.
 *
 *   cd web && npm run export:content
 *
 * The web TS modules stay the source of truth; the JSON is generated and
 * must never be hand-edited. The script fails loudly on any count mismatch
 * and writes atomically (temp file, then rename), so a failed run never
 * leaves partial output.
 */
import { register } from "node:module";
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

register("./resolve-at-alias.mjs", import.meta.url);

const {
  CULTURES,
  PLANETS,
  RECEIVED_BODIES,
  CULTURE_LABELS,
  CULTURE_TAGLINES,
  CULTURE_SUBTITLES,
  PLANET_LABELS,
  PLANET_SYMBOLS,
} = await import("../src/data/cultures.ts");
const { DEITIES } = await import("../src/data/deities.ts");
const { PLANET_IN_SIGN } = await import("../src/data/planetInSign.ts");
const { HOUSE_MEANINGS } = await import("../src/data/houses.ts");
const { ZODIAC_SIGN_INFO } = await import("../src/data/zodiacSigns.ts");
const { ZODIAC_SIGNS, ASPECT_RULES } = await import("../src/data/sampleChart.ts");

const OUT_DIR = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../../shared/content",
);

function assert(cond, message) {
  if (!cond) throw new Error(`export-content: ${message}`);
}

// ---- Build documents, asserting the canonical shape as we go. -------------

assert(CULTURES.length === 5, `expected 5 cultures, got ${CULTURES.length}`);
assert(PLANETS.length === 10, `expected 10 planets, got ${PLANETS.length}`);
assert(RECEIVED_BODIES.length === 3, `expected 3 received bodies`);

const cultures = {
  cultures: CULTURES.map((id) => ({
    id,
    label: CULTURE_LABELS[id],
    tagline: CULTURE_TAGLINES[id],
    subtitle: CULTURE_SUBTITLES[id],
  })),
  planets: PLANETS.map((id) => ({
    id,
    label: PLANET_LABELS[id],
    symbol: PLANET_SYMBOLS[id],
    received: RECEIVED_BODIES.includes(id),
  })),
};
for (const c of cultures.cultures)
  assert(c.label && c.tagline && c.subtitle, `culture ${c.id} has a blank field`);
for (const p of cultures.planets)
  assert(p.label && p.symbol, `planet ${p.id} has a blank field`);

assert(DEITIES.length === 50, `expected 50 deities, got ${DEITIES.length}`);
for (const culture of CULTURES)
  for (const planet of PLANETS)
    assert(
      DEITIES.some((d) => d.culture === culture && d.planet === planet),
      `missing deity for ${culture} x ${planet}`,
    );
for (const d of DEITIES)
  assert(d.name && d.epithet && d.note, `deity ${d.culture}/${d.planet} has a blank field`);

let paragraphCount = 0;
for (const planet of PLANETS) {
  const bySign = PLANET_IN_SIGN[planet];
  assert(bySign, `PLANET_IN_SIGN missing planet ${planet}`);
  for (const sign of ZODIAC_SIGNS) {
    assert(
      typeof bySign[sign] === "string" && bySign[sign].length > 0,
      `PLANET_IN_SIGN missing ${planet} in ${sign}`,
    );
    paragraphCount += 1;
  }
}
assert(paragraphCount === 120, `expected 120 paragraphs, got ${paragraphCount}`);

assert(HOUSE_MEANINGS.length === 12, `expected 12 houses, got ${HOUSE_MEANINGS.length}`);
for (const h of HOUSE_MEANINGS)
  assert(
    h.house >= 1 && h.house <= 12 && h.ordinal && h.title && h.domain && h.arena,
    `house ${h.house} has a blank field`,
  );

assert(ZODIAC_SIGN_INFO.length === 12, `expected 12 sign records`);
for (const s of ZODIAC_SIGN_INFO)
  assert(
    s.sign && s.symbol && s.dates && s.element && s.modality && s.traits && s.blurb &&
      Array.isArray(s.points) && s.points.length > 0,
    `sign ${s.sign} has a blank field`,
  );

assert(ASPECT_RULES.length === 5, `expected 5 aspect rules`);
const expectedOrbs = { conjunction: 8, sextile: 5, square: 7, trine: 7, opposition: 8 };
for (const rule of ASPECT_RULES)
  assert(
    expectedOrbs[rule.kind] === rule.orb,
    `orb for ${rule.kind} is ${rule.orb}, expected ${expectedOrbs[rule.kind]}`,
  );

// ---- Write atomically. ----------------------------------------------------

const files = {
  "cultures.json": cultures,
  "deities.json": DEITIES,
  "planet-in-sign.json": PLANET_IN_SIGN,
  "houses.json": HOUSE_MEANINGS,
  "zodiac-signs.json": ZODIAC_SIGN_INFO,
  "aspect-rules.json": ASPECT_RULES,
  "manifest.json": {
    sourceCommit: execFileSync("git", ["rev-parse", "HEAD"], { encoding: "utf8" }).trim(),
    counts: {
      cultures: CULTURES.length,
      planets: PLANETS.length,
      deities: DEITIES.length,
      planetInSignParagraphs: paragraphCount,
      houses: HOUSE_MEANINGS.length,
      zodiacSigns: ZODIAC_SIGN_INFO.length,
      aspectRules: ASPECT_RULES.length,
    },
  },
};

fs.mkdirSync(OUT_DIR, { recursive: true });
for (const [name, doc] of Object.entries(files)) {
  const target = path.join(OUT_DIR, name);
  const tmp = `${target}.tmp`;
  fs.writeFileSync(tmp, `${JSON.stringify(doc, null, 2)}\n`, "utf8");
  fs.renameSync(tmp, target);
}

console.log(
  `export-content: wrote ${Object.keys(files).length} files to shared/content ` +
    `(${JSON.stringify(files["manifest.json"].counts)})`,
);
