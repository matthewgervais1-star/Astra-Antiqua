/**
 * Generates the reading banks the day page and the horizon screens speak with.
 *
 *   cd web && node scripts/gen-android-reading-banks.mjs
 *
 * Imports the web banks directly (Node's type stripping plus the "@/" alias
 * hook, the way the export scripts run) and writes their Kotlin equivalents:
 *
 *   ReadingBanks.kt   the day page's banks (data/decreeBanks.ts), the domains
 *                     (data/deityDomains.ts), the quiet headlines and lines,
 *                     the Do and Don't register (data/permissionsRegister.ts),
 *                     and the week's ingress charges, verbs and frames
 *   AspectVerbs.kt    data/aspectVerbs.ts
 *   DayDecreeGoldens.kt (test sources) the web composer's day page for five
 *                     fixed instants, one per culture, which the JVM parity
 *                     test recomputes with Android's own engine
 *
 * Every line exists once in the repository, so Android cannot drift from web
 * by a retyped word, and the goldens prove the two composers agree.
 */
import { register } from "node:module";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

register("./resolve-at-alias.mjs", import.meta.url);

const { DEITY_CHARGES } = await import("../src/data/deityCharges.ts");
const { INGRESS_FRAMES } = await import("../src/data/ingressFrames.ts");
const { DECREE_BANKS, QUIET_LINE } = await import("../src/data/decreeBanks.ts");
const { DEITY_DOMAINS } = await import("../src/data/deityDomains.ts");
const { ASPECT_VERBS } = await import("../src/data/aspectVerbs.ts");
const { QUIET_HEADLINE, composeDayPage } = await import("../src/lib/decree.ts");
const { composeDayMessage } = await import("../src/lib/dailyMessage.ts");
const { PERMISSIONS_REGISTER } = await import("../src/data/permissionsRegister.ts");
const { computeChart } = await import("../src/lib/ephemeris.ts");
const { computeAspects } = await import("../src/data/sampleChart.ts");

const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.join(SCRIPT_DIR, "..", "..");
const PKG = ["com", "astra", "antiqua", "domain"];
const OUT = path.join(REPO, "android", "app", "src", "main", "java", ...PKG);
const TEST_OUT = path.join(REPO, "android", "app", "src", "test", "java", ...PKG);

const CULTURES = ["egypt", "greece", "canaan", "carthage", "rome"];
const PLANETS = ["sun", "moon", "mercury", "venus", "mars", "jupiter", "saturn", "uranus", "neptune", "pluto"];
const FAST = ["sun", "moon", "mercury", "venus", "mars"];
const KINDS = ["conjunction", "sextile", "square", "trine", "opposition"];

function fail(message) {
  throw new Error(`gen-android-reading-banks: ${message}`);
}

const upper = (s) => s.toUpperCase();
const kt = (s) => {
  if (typeof s !== "string") fail(`expected a string, got ${JSON.stringify(s)}`);
  return `"${s.replace(/\\/g, "\\\\").replace(/"/g, '\\"').replace(/\$/g, "\\$").replace(/\n/g, "\\n")}"`;
};

/** A `when (culture)` whose arms are produced by `arm(culture)`. */
const byCulture = (indent, arm) =>
  CULTURES.map((c) => `${indent}AncientCulture.${upper(c)} -> ${arm(c)}`).join("\n");

/** A `when (culture) { when (inner) }` over a nested table. */
function nested(indent, subject, keys, enumName, pick) {
  return CULTURES.map((c) => {
    const inner = keys.map((k) => `${indent}    ${enumName}.${upper(k)} -> ${kt(pick(c, k))}`).join("\n");
    return `${indent}AncientCulture.${upper(c)} -> when (${subject}) {\n${inner}\n${indent}}`;
  }).join("\n\n");
}

// --- the week's ingress line: charge, verb, frame --------------------------
// The frames are functions of the charge; calling one on a marker recovers its
// template, and the marker's capitalised form shows where the frame caps it.
const MARK = "xchargex";
const ingressFrames = {};
for (const c of CULTURES) {
  const out = INGRESS_FRAMES[c](MARK);
  const template = out.replaceAll("Xchargex", "${cap(c)}").replaceAll(MARK, "${c}");
  if (!template.includes("${c}") && !template.includes("${cap(c)}")) fail(`${c} ingress frame drops its charge`);
  ingressFrames[c] = template;
}
const toKotlinIngress = (t) => `"${t.replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"`;

const weekSource = await readFile(path.join(SCRIPT_DIR, "..", "src", "lib", "weekReading.ts"), "utf8");
const verbBlock = weekSource.slice(weekSource.indexOf("const INGRESS_VERB"));
const ingressVerbs = {};
for (const c of CULTURES) {
  const m = verbBlock.match(new RegExp(`\\n\\s*${c}:\\s*"([^"]*)",`));
  if (!m) fail(`${c} has no INGRESS_VERB entry in weekReading.ts`);
  ingressVerbs[c] = m[1];
}

const PARTNERS = PLANETS.filter((p) => p !== "moon");

/** A `when (culture) { when (aspect) { when (body) } }` over one keyed bank. */
function byBody(bank, bodies) {
  const subject = bank === "consequences" ? "partner" : "body";
  return CULTURES.map((c) => {
    const kinds = KINDS.map((k) => {
      const arms = bodies.map((b) => `                Planet.${upper(b)} -> ${kt(DECREE_BANKS[c][bank][k][b])}`).join("\n");
      return `            AspectType.${upper(k)} -> when (${subject}) {\n${arms}\n                else -> error("\$${subject} has no ${bank} line")\n            }`;
    }).join("\n");
    return `        AncientCulture.${upper(c)} -> when (aspect) {\n${kinds}\n        }`;
  }).join("\n\n");
}

function registerSide(side) {
  return CULTURES.map((c) => {
    const arms = PLANETS.map(
      (p) => `            Planet.${upper(p)} -> listOf(${PERMISSIONS_REGISTER[c][p][side].map(kt).join(", ")})`,
    ).join("\n");
    return `        AncientCulture.${upper(c)} -> when (body) {\n${arms}\n        }`;
  }).join("\n\n");
}

const file = `package com.astra.antiqua.domain

import com.astra.antiqua.model.AncientCulture
import com.astra.antiqua.model.Planet

/**
 * GENERATED by web/scripts/gen-android-reading-banks.mjs from
 * web/src/data/decreeBanks.ts, deityDomains.ts, permissionsRegister.ts,
 * deityCharges.ts,
 * ingressFrames.ts and web/src/lib/decree.ts. Do not edit; run
 * \`cd web && node scripts/gen-android-reading-banks.mjs\`.
 *
 * The lines the day page and the week speak with. They live once in the
 * repository and are generated onto this surface, so the same figure prints
 * the same sentence on both and neither can drift by a retyped word.
 */

/** Capitalise a charge that opens a sentence. */
private fun cap(s: String): String =
    if (s.isEmpty()) s else s.replaceFirstChar { it.uppercase() }

/**
 * What each body governs in the reader's own life, second person, in the
 * culture's nouns. The meaning sentence joins two; the instruction takes the
 * headline body's.
 */
fun deityDomain(culture: AncientCulture, body: Planet): String = when (culture) {
${nested("    ", "body", PLANETS, "Planet", (c, p) => DEITY_DOMAINS[c][p])}
}

/** A quiet day's headline, a sentence to the reader like any other. */
fun quietDayHeadline(culture: AncientCulture): String = when (culture) {
${byCulture("    ", (c) => kt(QUIET_HEADLINE[c]))}
}

/** A quiet day's line: no aspect invented and no reassurance offered. */
fun quietDayLine(culture: AncientCulture): String = when (culture) {
${byCulture("    ", (c) => kt(QUIET_LINE[c]))}
}

/**
 * The day page's banks, per culture. Templates carry {god} (the headline
 * body's deity) and {partner} (the other body's deity); DayDecreeComposer
 * fills them. The two-variant banks take the day's variant, 0 or 1.
 */
object DecreeBanks {
    /** One sentence to the reader per (kind, headline body). */
    fun headline(culture: AncientCulture, aspect: AspectType, body: Planet): String = when (culture) {
${byBody("headlines", FAST)}
    }

    /** Plural predicate: "{domain A} and {domain B} {relation}". */
    fun relation(culture: AncientCulture, aspect: AspectType): String = when (culture) {
${nested("        ", "aspect", KINDS, "AspectType", (c, k) => DECREE_BANKS[c].relations[k])}
    }

    /** Appended to the meaning sentence under half a degree of orb. */
    fun exactTail(culture: AncientCulture, variant: Int): String = when (culture) {
${byCulture("        ", (c) => `if (variant == 0) ${kt(DECREE_BANKS[c].exactTails[0])} else ${kt(DECREE_BANKS[c].exactTails[1])}`)}
    }

    /** The consequence for the reader, per (kind, partner body). */
    fun consequence(culture: AncientCulture, aspect: AspectType, partner: Planet): String = when (culture) {
${byBody("consequences", PARTNERS)}
    }

    /** The institution's picture, per (kind, headline body). Slots: {god}, {partner}. */
    fun image(culture: AncientCulture, aspect: AspectType, body: Planet): String = when (culture) {
${byBody("images", FAST)}
    }

    /** The one order, always last, per (kind, headline body). Slots: {god}, {partner}. */
    fun instruction(culture: AncientCulture, aspect: AspectType, body: Planet): String = when (culture) {
${byBody("instructions", FAST)}
    }

    /** Opens the second-figure sentence. */
    fun secondFigure(culture: AncientCulture, variant: Int): String = when (culture) {
${byCulture("        ", (c) => `if (variant == 0) ${kt(DECREE_BANKS[c].secondFigure[0])} else ${kt(DECREE_BANKS[c].secondFigure[1])}`)}
    }

    /** Stands in for the second figure when the sky offers none. */
    fun noSecondFigure(culture: AncientCulture): String = when (culture) {
${byCulture("        ", (c) => kt(DECREE_BANKS[c].noSecondFigure))}
    }

    /** Closes the day page. */
    fun comeBack(culture: AncientCulture): String = when (culture) {
${byCulture("        ", (c) => kt(DECREE_BANKS[c].comeBack))}
    }
}

/**
 * The Do and Don't items per culture and body, three of each, from
 * web/src/data/permissionsRegister.ts. Android's composer for the lists is
 * Task 17; the data is here for it.
 */
object PermissionsRegister {
    fun proceed(culture: AncientCulture, body: Planet): List<String> = when (culture) {
${registerSide("proceed")}
    }

    fun refrain(culture: AncientCulture, body: Planet): List<String> = when (culture) {
${registerSide("refrain")}
    }
}

/**
 * What each god brings before its institution: a short noun phrase in the
 * culture's own nouns. The week's ingress line reads it into its frame.
 */
fun deityCharge(culture: AncientCulture, body: Planet): String = when (culture) {
${nested("    ", "body", PLANETS, "Planet", (c, p) => DEITY_CHARGES[c][p])}
}

/** The verb an ingress line uses: "{deity} {verb} the {sign image}." */
fun ingressVerb(culture: AncientCulture): String = when (culture) {
${byCulture("    ", (c) => kt(ingressVerbs[c]))}
}

/**
 * The ruling on an ingress, taking the moving body's charge. A body that has
 * crossed into a new sign has not been ruled on there yet, and each of these
 * says that in its own institution's terms.
 */
fun ingressFrame(culture: AncientCulture, c: String): String = when (culture) {
${byCulture("    ", (c) => toKotlinIngress(ingressFrames[c]))}
}
`;

// --- the aspect verbs ------------------------------------------------------
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
${nested("        ", "aspect", KINDS, "AspectType", (c, k) => ASPECT_VERBS[c][k])}
    }
}
`;

// --- the parity goldens ----------------------------------------------------
// One instant per culture. A day is taken only when nothing in it sits near a
// threshold where two engines a hair apart could print different text: the
// ranking of the headline and second figures, the exact tail at 0.5 degrees,
// EXACT at 0.1, and the half-minute the evidence line rounds at.
const FAST_SET = new Set(FAST);
function robust(chart) {
  const all = computeAspects(chart)
    .filter((a) => FAST_SET.has(a.a) || FAST_SET.has(a.b))
    .sort((a, b) => a.orb - b.orb);
  const top = all[0];
  if (!top) return false;
  const margin = 0.03;
  if (all[1] && all[1].orb - top.orb < margin) return false;
  for (const edge of [0.5, 0.1]) if (Math.abs(top.orb - edge) < margin) return false;
  const minutes = (top.orb - Math.floor(top.orb)) * 60;
  if (Math.abs((minutes % 1) - 0.5) < 0.1) return false;
  const rest = all.filter((a) => a !== top && a.kind !== top.kind);
  if (rest[1] && rest[1].orb - rest[0].orb < margin) return false;
  // A body within a few arcminutes of an orb limit could enter or leave the list.
  return true;
}

const goldens = [];
let day = Date.UTC(2026, 8, 29);
while (goldens.length < CULTURES.length) {
  const instant = new Date(day);
  const chart = computeChart(instant);
  if (robust(chart)) {
    const culture = CULTURES[goldens.length];
    const decree = composeDayPage(culture, instant);
    const message = composeDayMessage(culture, instant);
    goldens.push({ instant: instant.toISOString(), culture, decree, message });
  }
  day += 86_400_000;
  if (day > Date.UTC(2027, 8, 29)) fail("no robust instants found in a year");
}

const goldensFile = `package com.astra.antiqua.domain

import com.astra.antiqua.model.AncientCulture

/**
 * GENERATED by web/scripts/gen-android-reading-banks.mjs from the web
 * composer (web/src/lib/decree.ts, dailyMessage.ts). Do not edit; run
 * \`cd web && node scripts/gen-android-reading-banks.mjs\`.
 *
 * The web day page for one instant per culture, read through the year's walk
 * (composeDayPage), each instant chosen clear of every threshold where two
 * engines a hair apart could print different text on that day.
 * DayDecreeParityTest recomputes each with Android's own engine and composer.
 */
internal data class DayDecreeGolden(
    val instantUtc: String,
    val culture: AncientCulture,
    val headline: String,
    val evidence: String,
    val paragraph: String,
    val messageBody: String,
)

internal val DAY_DECREE_GOLDENS: List<DayDecreeGolden> = listOf(
${goldens
  .map(
    (g) => `    DayDecreeGolden(
        instantUtc = ${kt(g.instant)},
        culture = AncientCulture.${upper(g.culture)},
        headline = ${kt(g.decree.headline)},
        evidence = ${kt(g.decree.evidence)},
        paragraph = ${kt(g.decree.paragraphs.join(" "))},
        messageBody = ${kt(g.message.body)},
    ),`,
  )
  .join("\n")}
)
`;

await mkdir(OUT, { recursive: true });
await mkdir(TEST_OUT, { recursive: true });
await writeFile(path.join(OUT, "ReadingBanks.kt"), file);
await writeFile(path.join(OUT, "AspectVerbs.kt"), verbsFile);
await writeFile(path.join(TEST_OUT, "DayDecreeGoldens.kt"), goldensFile);
console.log(
  `gen-android-reading-banks: wrote ReadingBanks.kt (${file.length} bytes), AspectVerbs.kt, ` +
    `DayDecreeGoldens.kt (${goldens.map((g) => `${g.culture} ${g.instant.slice(0, 10)}`).join(", ")})`,
);
