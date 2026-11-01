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
const { ASPECT_VERBS, PLAIN_ASPECT_VERBS, PLACEMENT_VERBS } = await import(
  "../src/data/aspectVerbs.ts"
);
const { INGRESS_FRAMES } = await import("../src/data/ingressFrames.ts");
const { DEITY_CHARGES } = await import("../src/data/deityCharges.ts");
const { DEITY_INSCRIPTIONS } = await import("../src/data/deityInscriptions.ts");
const { PLANET_DOMAINS, ASPECT_REFLECTIONS, SIGN_REGISTERS, getPairTheme } = await import(
  "../src/data/interpretations.ts"
);
const { SIGN_PHRASES } = await import("../src/components/horizons/signPhrase.ts");
const { SUMMARY_INTRO, SUMMARY_TONES, SUMMARY_FUSED } = await import("../src/lib/reading.ts");
const { QUIET_LINE, INGRESS_VERB, ASPECT_GLYPH, SIGN_ABBR } = await import(
  "../src/lib/weekReading.ts"
);
const { CITIES } = await import("../src/data/cities.ts");
const { PLANET_CONCERN } = await import("../src/lib/houseReading.ts");
const { houseGroupName } = await import("../src/components/horizons/houseGroups.ts");
const { composeWhatItTouchesNatal } = await import("../src/components/horizons/seasonContent.ts");
const { NEUTRAL_GROUND, NEUTRAL_ACCENT, CULTURE_GROUNDS, CULTURE_ACCENTS } = await import(
  "../src/data/palettes.ts"
);
const { default: tzLookup } = await import("tz-lookup");
const { flatten, parseDocument, parseElements } = await import("./svg-shapes.mjs");

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

// ---- Reading banks. --------------------------------------------------------
// The composed readings (natal, week, decree) are built from authored
// fragments, several of them functions. A function is exported as a template:
// it is called with sentinel arguments and the sentinels are swapped for
// named slots. "{a}" is the argument as given; "{A}" is the argument with its
// first letter capitalised (web's cap()). A consumer fills the slots and gets
// web's sentence byte for byte. Any sentinel left over, or any slot web
// transformed some other way, fails the export rather than shipping a guess.

const KINDS = ASPECT_RULES.map((r) => r.kind);

function template(fn, slots) {
  const args = slots.map((s) => `xq${s}`);
  let out = fn(...args);
  for (const s of slots) {
    out = out.replaceAll(`Xq${s}`, `{${s.toUpperCase()}}`).replaceAll(`xq${s}`, `{${s}}`);
  }
  assert(!/xq|Xq/i.test(out), `template left a sentinel behind: ${out}`);
  return out;
}

function perCulture(fn) {
  return Object.fromEntries(CULTURES.map((c) => [c, fn(c)]));
}

const pairThemes = {};
for (let i = 0; i < PLANETS.length; i += 1) {
  for (let j = i + 1; j < PLANETS.length; j += 1) {
    const key = [PLANETS[i], PLANETS[j]].sort().join("|");
    pairThemes[key] = getPairTheme(PLANETS[i], PLANETS[j]);
  }
}

const readingBanks = {
  aspectVerbs: ASPECT_VERBS,
  plainAspectVerbs: PLAIN_ASPECT_VERBS,
  placementVerbs: PLACEMENT_VERBS,
  deityCharges: DEITY_CHARGES,
  deityInscriptions: DEITY_INSCRIPTIONS,
  ingressFrames: perCulture((c) => template(INGRESS_FRAMES[c], ["c"])),
  ingressVerbs: INGRESS_VERB,
  quietLines: QUIET_LINE,
  summaryIntros: SUMMARY_INTRO,
  summaryTones: SUMMARY_TONES,
  summaryFused: { one: SUMMARY_FUSED.one, many: template(SUMMARY_FUSED.many, ["n"]) },
  planetDomains: PLANET_DOMAINS,
  aspectReflections: ASPECT_REFLECTIONS,
  pairThemes,
  pairThemeFallback: getPairTheme("sun", "sun"),
  signRegisters: SIGN_REGISTERS,
  // houseReading(): "{deity} turns {concern} toward {arena}."
  planetConcerns: PLANET_CONCERN,
  houseGroupNames: perCulture((c) =>
    Object.fromEntries(HOUSE_MEANINGS.map((h) => [h.house, houseGroupName(c, h.house)])),
  ),
  seasonHouseLines: perCulture((c) =>
    Object.fromEntries(HOUSE_MEANINGS.map((h) => [h.house, composeWhatItTouchesNatal(c, h)])),
  ),
  signPhrases: SIGN_PHRASES,
  signAbbreviations: SIGN_ABBR,
  aspectGlyphs: ASPECT_GLYPH,
};

for (const culture of CULTURES) {
  for (const planet of PLANETS) {
    assert(DEITY_CHARGES[culture]?.[planet], `deity charge missing for ${culture}/${planet}`);
    assert(DEITY_INSCRIPTIONS[culture]?.[planet], `inscription missing for ${culture}/${planet}`);
  }
  for (const kind of KINDS) {
    assert(ASPECT_VERBS[culture]?.[kind], `aspect verb missing for ${culture}/${kind}`);
    assert(ASPECT_REFLECTIONS[culture]?.[kind], `reflection missing for ${culture}/${kind}`);
  }
  assert(INGRESS_VERB[culture] && QUIET_LINE[culture] && SUMMARY_INTRO[culture], `${culture} bank gap`);
}
assert(Object.keys(pairThemes).length === 45, `expected 45 pair themes`);
for (const sign of ZODIAC_SIGNS)
  assert(SIGN_PHRASES[sign] && SIGN_ABBR[sign] && SIGN_REGISTERS[sign], `sign bank gap for ${sign}`);

// ---- Cities, with the zone each one keeps its clocks by. -------------------
// Web resolves a birthplace's zone with tz-lookup at runtime. A phone that has
// picked a city from the offline list should not need a network to do the
// same, so the zone is resolved here, once, by the same library.
const cities = CITIES.map((c) => ({
  name: c.name,
  country: c.country,
  latitude: c.latitude,
  longitude: c.longitude,
  popular: c.popular === true,
  timeZone: tzLookup(c.latitude, c.longitude),
}));
for (const c of cities) assert(c.timeZone, `no zone for ${c.name}`);

const palettes = {
  neutral: { ground: NEUTRAL_GROUND, accent: NEUTRAL_ACCENT },
  cultures: perCulture((c) => ({ ground: CULTURE_GROUNDS[c], accent: CULTURE_ACCENTS[c] })),
};

// ---- Deity glyphs. ---------------------------------------------------------
// The fifty drawn glyphs from docs/design/system/assets/glyphs, the same
// canonical set web copies and Android generates vectors from, flattened by
// the same SVG reader Android's generator uses. Each keeps its honesty status;
// no surface may present a composed or invented mark as attested.
const GLYPH_DIR = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../../docs/design/system/assets/glyphs",
);
const GLYPH_STATUSES = ["attested", "composed", "invented"];
const glyphTally = { attested: 0, composed: 0, invented: 0 };

// SVG path data allows shorthand that not every renderer reads: coordinate
// pairs after M that mean "line to", repeated segments under one command
// letter, numbers run together ("1.5.5" is 1.5 and .5) and arc flags with
// no separator ("0 011 1"). Microsoft.Maui.Graphics' PathBuilder drew
// Carthage's Mercury as nothing because of the first. Every glyph path is
// therefore rewritten into explicit form, one command letter per segment and
// every number separated, which draws the same shape in any SVG renderer.
const PATH_ARITY = { m: 2, l: 2, h: 1, v: 1, c: 6, s: 4, q: 4, t: 2, a: 7, z: 0 };
const NUMBER = /^[+-]?(?:\d+\.?\d*|\.\d+)(?:[eE][+-]?\d+)?/;
let glyphPathsRewritten = 0;

function explicitPath(d, where) {
  let i = 0;
  const skip = () => {
    while (i < d.length && /[\s,]/.test(d[i])) i += 1;
  };
  const number = () => {
    skip();
    const m = NUMBER.exec(d.slice(i));
    assert(m, `${where}: expected a number at ${i} in "${d}"`);
    i += m[0].length;
    return Number(m[0]);
  };
  const flag = () => {
    skip();
    assert(d[i] === "0" || d[i] === "1", `${where}: expected an arc flag at ${i} in "${d}"`);
    i += 1;
    return Number(d[i - 1]);
  };
  const out = [];
  let command = null;
  for (;;) {
    skip();
    if (i >= d.length) break;
    if (/[MmLlHhVvCcSsQqTtAaZz]/.test(d[i])) {
      command = d[i];
      i += 1;
      if (command === "z" || command === "Z") {
        out.push(command);
        continue;
      }
    } else {
      assert(command && !/[Zz]/.test(command), `${where}: coordinates without a command in "${d}"`);
      // A repeated segment: after a move it means "line to", otherwise the
      // same command again.
      if (command === "M") command = "L";
      else if (command === "m") command = "l";
    }
    const arity = PATH_ARITY[command.toLowerCase()];
    const args = command.toLowerCase() === "a"
      ? [number(), number(), number(), flag(), flag(), number(), number()]
      : Array.from({ length: arity }, number);
    out.push(`${command}${args.join(" ")}`);
  }
  const explicit = out.join(" ");
  if (explicit.replace(/\s+/g, "") !== d.replace(/[\s,]+/g, "")) glyphPathsRewritten += 1;
  return explicit;
}
const glyphs = [];
for (const culture of CULTURES) {
  for (const planet of PLANETS) {
    const file = path.join(GLYPH_DIR, culture, `${planet}.svg`);
    const doc = parseDocument(fs.readFileSync(file, "utf8"));
    assert(
      doc.minX === 0 && doc.minY === 0 && doc.width === 24 && doc.height === 24,
      `${culture}/${planet}.svg is not on the 24 grid`,
    );
    const parts = (doc.title ?? "").split("·").map((p) => p.trim());
    const status = parts[parts.length - 1];
    assert(GLYPH_STATUSES.includes(status), `${culture}/${planet}.svg has the status "${status}"`);
    glyphTally[status] += 1;
    const paths = flatten(parseElements(doc.inner)).map((p) => {
      const a = p.attrs;
      const fill = (a.fill ?? "none") === "currentColor";
      const stroke = (a.stroke ?? "none") === "currentColor";
      assert(fill || stroke, `${culture}/${planet}: a shape with neither fill nor stroke`);
      return {
        d: explicitPath(p.d, `${culture}/${planet}`),
        fill,
        stroke,
        strokeWidth: stroke ? Number(a["stroke-width"] ?? 1) : 0,
        lineCap: a["stroke-linecap"] ?? "butt",
        lineJoin: a["stroke-linejoin"] ?? "miter",
      };
    });
    assert(paths.length > 0, `${culture}/${planet}.svg has no drawn elements`);
    glyphs.push({ culture, planet, deity: parts[0], status, paths });
  }
}
assert(
  glyphTally.attested === 28 && glyphTally.composed === 21 && glyphTally.invented === 1,
  `glyph statuses are ${JSON.stringify(glyphTally)}, expected 28 / 21 / 1`,
);
console.log(`export-content: ${glyphPathsRewritten} glyph paths rewritten into explicit commands`);

// ---- Write atomically. ----------------------------------------------------

const files = {
  "cultures.json": cultures,
  "deities.json": DEITIES,
  "planet-in-sign.json": PLANET_IN_SIGN,
  "houses.json": HOUSE_MEANINGS,
  "zodiac-signs.json": ZODIAC_SIGN_INFO,
  "aspect-rules.json": ASPECT_RULES,
  "reading-banks.json": readingBanks,
  "cities.json": cities,
  "palettes.json": palettes,
  "glyphs.json": glyphs,
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
      pairThemes: Object.keys(pairThemes).length,
      cities: cities.length,
      glyphs: glyphs.length,
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
