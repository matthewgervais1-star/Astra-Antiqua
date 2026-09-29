/**
 * Generates the reading banks the horizon screens speak with.
 *
 *   cd web && node scripts/gen-android-reading-banks.mjs
 *
 * Reads web/src/data/deityCharges.ts and web/src/data/aspectFrames.ts and
 * writes the Kotlin equivalents (ReadingBanks.kt). It also reads
 * web/src/data/aspectVerbs.ts and writes AspectVerbs.kt. The fifty charges,
 * the twenty-five frames and the twenty-five verbs exist once in the
 * repository and Android cannot drift from web by a retyped word. Both surfaces then print the same sentence for the same
 * figure, which is the whole claim behind having one corpus.
 *
 * The frames are template literals with ${a}, ${b} and ${cap(a)} in them;
 * Kotlin's string templates take the same shapes, so the conversion is a
 * substitution rather than a parse. Anything else inside a frame is refused
 * rather than guessed at.
 */
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.join(SCRIPT_DIR, "..", "..");
const DATA = path.join(REPO, "web", "src", "data");
const OUT = path.join(
  REPO, "android", "app", "src", "main", "java", "com", "astra", "antiqua", "domain",
);

const CULTURES = ["egypt", "greece", "canaan", "carthage", "rome"];
const PLANETS = [
  "sun", "moon", "mercury", "venus", "mars",
  "jupiter", "saturn", "uranus", "neptune", "pluto",
];
const KINDS = ["conjunction", "sextile", "square", "trine", "opposition"];

function fail(message) {
  throw new Error(`gen-android-reading-banks: ${message}`);
}

const upper = (s) => s.toUpperCase();
const kotlinString = (s) =>
  `"${s.replace(/\\/g, "\\\\").replace(/"/g, '\\"').replace(/\$/g, "\\$")}"`;

/** The body of one culture's block, from `culture: {` to its closing brace. */
function cultureBlock(source, culture) {
  const open = source.indexOf(`  ${culture}: {`);
  if (open === -1) fail(`no block for ${culture}`);
  const close = source.indexOf("\n  },", open);
  if (close === -1) fail(`unterminated block for ${culture}`);
  return source.slice(open, close);
}

// --- the charges: plain single-quoted or double-quoted strings -------------
const chargesSource = await readFile(path.join(DATA, "deityCharges.ts"), "utf8");
const charges = {};
for (const culture of CULTURES) {
  const block = cultureBlock(chargesSource, culture);
  charges[culture] = {};
  for (const planet of PLANETS) {
    const m = block.match(new RegExp(`\\n\\s*${planet}:\\s*"([^"]*)",`));
    if (!m) fail(`${culture}.${planet} is missing from deityCharges.ts`);
    charges[culture][planet] = m[1];
  }
}

// --- the frames: (a, b) => `...` template literals -------------------------
const framesSource = await readFile(path.join(DATA, "aspectFrames.ts"), "utf8");
const frames = {};
for (const culture of CULTURES) {
  const block = cultureBlock(framesSource, culture);
  frames[culture] = {};
  for (const kind of KINDS) {
    const m = block.match(new RegExp(`\\n\\s*${kind}:\\s*\\(a, b\\) =>\\s*\`([^\`]*)\`,`));
    if (!m) fail(`${culture}.${kind} is missing from aspectFrames.ts, or is not a (a, b) template`);
    const template = m[1];
    // Only the three substitutions this generator understands may appear.
    const unknown = template.replace(/\$\{cap\(a\)\}|\$\{a\}|\$\{b\}/g, "").match(/\$\{[^}]*\}/);
    if (unknown) fail(`${culture}.${kind} uses ${unknown[0]}, which this generator does not read`);
    frames[culture][kind] = template;
  }
}

/** A JS template literal becomes a Kotlin one: the shapes already agree. */
function toKotlinTemplate(template) {
  const escaped = template.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
  return `"${escaped
    .replace(/\$\{cap\(a\)\}/g, "\${cap(a)}")
    .replace(/\$\{a\}/g, "\$a")
    .replace(/\$\{b\}/g, "\$b")}"`;
}

const chargeWhen = CULTURES.map((culture) => {
  const inner = PLANETS.map(
    (planet) => `        Planet.${upper(planet)} -> ${kotlinString(charges[culture][planet])}`,
  ).join("\n");
  return `    AncientCulture.${upper(culture)} -> when (body) {\n${inner}\n    }`;
}).join("\n\n");

const frameWhen = CULTURES.map((culture) => {
  const inner = KINDS.map(
    (kind) => `        AspectType.${upper(kind)} -> ${toKotlinTemplate(frames[culture][kind])}`,
  ).join("\n");
  return `    AncientCulture.${upper(culture)} -> when (aspect) {\n${inner}\n    }`;
}).join("\n\n");

/**
 * The ingress ruling is a one-slot frame, `(c) => ...`, and the ingress verb
 * is a plain string in the week builder. Both are read the same way the
 * two-slot frames are, and anything unfamiliar inside one is refused.
 */
function toKotlinIngress(template) {
  const escaped = template.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
  return `"${escaped
    .replace(/\$\{cap\(c\)\}/g, "\${cap(c)}")
    .replace(/\$\{c\}/g, "\$c")}"`;
}

const ingressFrames = {};
for (const culture of CULTURES) {
  const m = framesSource.match(
    new RegExp(`\\n\\s*${culture}: \\(c\\) =>\\s*\`([^\`]*)\`,`),
  );
  if (!m) fail(`${culture} has no INGRESS_FRAMES entry, or it is not a (c) template`);
  const template = m[1];
  const unknown = template.replace(/\$\{cap\(c\)\}|\$\{c\}/g, "").match(/\$\{[^}]*\}/);
  if (unknown) fail(`the ${culture} ingress frame uses ${unknown[0]}, which this generator does not read`);
  ingressFrames[culture] = template;
}

const weekSource = await readFile(path.join(DATA, "..", "lib", "weekReading.ts"), "utf8");
const verbBlock = weekSource.slice(weekSource.indexOf("const INGRESS_VERB"));
const ingressVerbs = {};
for (const culture of CULTURES) {
  const m = verbBlock.match(new RegExp(`\\n\\s*${culture}:\\s*"([^"]*)",`));
  if (!m) fail(`${culture} has no INGRESS_VERB entry in weekReading.ts`);
  ingressVerbs[culture] = m[1];
}

const ingressFrameWhen = CULTURES.map(
  (culture) => `    AncientCulture.${upper(culture)} -> ${toKotlinIngress(ingressFrames[culture])}`,
).join("\n");

const ingressVerbWhen = CULTURES.map(
  (culture) => `    AncientCulture.${upper(culture)} -> ${kotlinString(ingressVerbs[culture])}`,
).join("\n");

const file = `package com.astra.antiqua.domain

import com.astra.antiqua.model.AncientCulture
import com.astra.antiqua.model.Planet

/**
 * GENERATED by web/scripts/gen-android-reading-banks.mjs from
 * web/src/data/deityCharges.ts and web/src/data/aspectFrames.ts. Do not edit;
 * run \`cd web && node scripts/gen-android-reading-banks.mjs\`.
 *
 * The fifty charges and the twenty-five rulings the reading speaks with. They
 * live once in the repository and are generated onto this surface, so the
 * same figure prints the same sentence on both and neither can drift by a
 * retyped word.
 */

/** Capitalise a charge that opens a sentence. */
private fun cap(s: String): String =
    if (s.isEmpty()) s else s.replaceFirstChar { it.uppercase() }

/**
 * What each god brings before its institution: a short noun phrase in the
 * culture's own nouns, written to sit inside a sentence as a subject or an
 * object. This is what ties a reading's ruling to the two bodies actually in
 * the figure, so Sun sextile Mars and Moon sextile Venus can never print the
 * same sentence. Lowercase by design; the frame capitalises it where it opens.
 */
fun deityCharge(culture: AncientCulture, body: Planet): String = when (culture) {
${chargeWhen}
}

/**
 * The ruling, tethered to the figure: one sentence in the institution's
 * register, taking the two charges, so the sentence changes whenever the
 * bodies do.
 */
fun aspectFrame(
    culture: AncientCulture,
    aspect: AspectType,
    a: String,
    b: String,
): String = when (culture) {
${frameWhen}
}

/** The verb an ingress line uses: "{deity} {verb} the {sign image}." */
fun ingressVerb(culture: AncientCulture): String = when (culture) {
${ingressVerbWhen}
}

/**
 * The ruling on an ingress, taking the moving body's charge. A body that has
 * crossed into a new sign has not been ruled on there yet, and each of these
 * says that in its own institution's terms.
 */
fun ingressFrame(culture: AncientCulture, c: String): String = when (culture) {
${ingressFrameWhen}
}
`;

// --- the aspect verbs: ASPECT_VERBS, culture -> kind -> string --------------
const verbsSource = await readFile(path.join(DATA, "aspectVerbs.ts"), "utf8");
const verbsStart = verbsSource.indexOf("export const ASPECT_VERBS");
if (verbsStart === -1) fail("ASPECT_VERBS is missing from aspectVerbs.ts");
const verbsEnd = verbsSource.indexOf("\n};", verbsStart);
if (verbsEnd === -1) fail("ASPECT_VERBS is unterminated in aspectVerbs.ts");
// The table body, after the type annotation's `= {`.
const verbsTable = verbsSource.slice(verbsStart, verbsEnd);
const verbsBody = verbsTable.slice(verbsTable.indexOf("= {") + 3);

const verbs = {};
let currentCulture = null;
for (const line of verbsBody.split("\n")) {
  const trimmed = line.trim();
  if (trimmed === "") continue;
  const open = trimmed.match(/^(\w+): \{$/);
  if (open) {
    if (!CULTURES.includes(open[1])) fail(`aspectVerbs.ts holds an unknown culture ${open[1]}`);
    if (verbs[open[1]]) fail(`aspectVerbs.ts lists ${open[1]} twice`);
    currentCulture = open[1];
    verbs[currentCulture] = {};
    continue;
  }
  if (trimmed === "},") {
    currentCulture = null;
    continue;
  }
  const cell = trimmed.match(/^(\w+): "([^"]*)",$/);
  if (!cell || currentCulture === null) {
    fail(`aspectVerbs.ts has a line this generator does not read: ${trimmed}`);
  }
  if (!KINDS.includes(cell[1])) {
    fail(`aspectVerbs.ts holds an unknown aspect ${currentCulture}.${cell[1]}`);
  }
  if (cell[1] in verbs[currentCulture]) {
    fail(`aspectVerbs.ts lists ${currentCulture}.${cell[1]} twice`);
  }
  verbs[currentCulture][cell[1]] = cell[2];
}
for (const culture of CULTURES) {
  if (!verbs[culture]) fail(`${culture} is missing from aspectVerbs.ts`);
  for (const kind of KINDS) {
    if (!(kind in verbs[culture])) fail(`${culture}.${kind} is missing from aspectVerbs.ts`);
  }
}

const verbWhen = CULTURES.map((culture) => {
  const inner = KINDS.map(
    (kind) => `            AspectType.${upper(kind)} -> ${kotlinString(verbs[culture][kind])}`,
  ).join("\n");
  return `        AncientCulture.${upper(culture)} -> when (aspect) {\n${inner}\n        }`;
}).join("\n\n");

const verbsFile = `package com.astra.antiqua.domain

import com.astra.antiqua.model.AncientCulture

/**
 * GENERATED by web/scripts/gen-android-reading-banks.mjs from
 * web/src/data/aspectVerbs.ts. Do not edit; run
 * \`cd web && node scripts/gen-android-reading-banks.mjs\`.
 *
 * The phrase that joins two deity names into a sentence: "Iuppiter {verb}
 * Saturnus". It lives once in the repository and is generated onto this
 * surface, so the same transit reads the same on both.
 *
 * Each verb has to read as a sentence a person wrote, with any pair of names
 * either side of it. That is why these are authored per culture rather than
 * derived from the aspect's name.
 */
object AspectVerbs {
    fun of(culture: AncientCulture, aspect: AspectType): String = when (culture) {
${verbWhen}
    }
}
`;

await mkdir(OUT, { recursive: true });
await writeFile(path.join(OUT, "ReadingBanks.kt"), file);
await writeFile(path.join(OUT, "AspectVerbs.kt"), verbsFile);
console.log(
  `gen-android-reading-banks: wrote ReadingBanks.kt ` +
    `(${CULTURES.length * PLANETS.length} charges, ${CULTURES.length * KINDS.length} frames, ` +
    `${file.length} bytes), AspectVerbs.kt (${CULTURES.length * KINDS.length} verbs)`,
);
