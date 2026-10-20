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
 *   FigureBanks.kt    the figure page's banks (data/figureBanks.ts), the
 *                     120 placement clauses included
 *   DayDecreeGoldens.kt (test sources) the web composer's day page for five
 *                     fixed instants, one per culture, which the JVM parity
 *                     test recomputes with Android's own engine
 *   FigureGoldens.kt  (test sources) the web figure page for one figure per
 *                     culture, read without a chart and against a fixed one
 *   DiveDeeperGoldens.kt (test sources) the web day page's dive deeper and
 *                     Do and Don't lists for one day per culture, without a
 *                     chart and against a fixed one
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
const { FIGURE_BANKS, PLACEMENT_CLAUSES } = await import("../src/data/figureBanks.ts");
const { composeFigurePage, figureId } = await import("../src/lib/figureReading.ts");
const { signPhraseProse } = await import("../src/components/transits/spanDisplay.ts");
const { DIVE_DEEPER_BANKS } = await import("../src/data/diveDeeperBanks.ts");
const { CULTURE_VOICES } = await import("../src/data/cultureVoice.ts");
const { composeDiveDeeper } = await import("../src/lib/diveDeeper.ts");
const { dayPermissions, natalDayPermissions } = await import("../src/lib/permissions.ts");
const { composeDecree, composeEvidence, dayFigures } = await import("../src/lib/decree.ts");
const { composeBridge } = await import("../src/lib/figureReading.ts");
const { computeTransits } = await import("../src/lib/transits.ts");
const { ASPECT_RULES } = await import("../src/data/sampleChart.ts");
const { resolveSavedChart } = await import("../src/lib/savedNatal.ts");

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

/** The relations, three per kind, as `listOf(...)` arms the day indexes into. */
function relationWhen() {
  return CULTURES.map((c) => {
    const arms = KINDS.map(
      (k) => `            AspectType.${upper(k)} -> listOf(${DECREE_BANKS[c].relations[k].map(kt).join(", ")})`,
    ).join("\n");
    return `        AncientCulture.${upper(c)} -> when (aspect) {\n${arms}\n        }`;
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
 * diveDeeperBanks.ts, cultureVoice.ts (the permission pair), deityCharges.ts,
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
 * fills them. The three-variant banks take the day's variant: 0, 1 or 2.
 */
object DecreeBanks {
    /** One sentence to the reader per (kind, headline body). */
    fun headline(culture: AncientCulture, aspect: AspectType, body: Planet): String = when (culture) {
${byBody("headlines", FAST)}
    }

    /** Plural predicate: "{domain A} and {domain B} {relation}"; the day picks one of three. */
    fun relation(culture: AncientCulture, aspect: AspectType, variant: Int): String = when (culture) {
${relationWhen()}
    }[variant]

    /** Appended to the meaning sentence when the figure is tight (under half a degree); the day picks one of three. */
    fun tightTail(culture: AncientCulture, variant: Int): String = when (culture) {
${byCulture("        ", (c) => `listOf(${DECREE_BANKS[c].tightTails.map(kt).join(", ")})`)}
    }[variant]

    /** The consequence for the reader, per (kind, partner body). */
    fun consequence(culture: AncientCulture, aspect: AspectType, partner: Planet): String = when (culture) {
${byBody("consequences", PARTNERS)}
    }

    /** The institution's picture, per (kind, headline body). Slot: {god}, the only god it names. */
    fun image(culture: AncientCulture, aspect: AspectType, body: Planet): String = when (culture) {
${byBody("images", FAST)}
    }

    /** The one order, always last, per (kind, headline body); two kinds close on a rite to {god}. */
    fun instruction(culture: AncientCulture, aspect: AspectType, body: Planet): String = when (culture) {
${byBody("instructions", FAST)}
    }

    /** Opens the second-figure sentence; the day picks one of three. Slots: {god}, {partner}. */
    fun secondFigure(culture: AncientCulture, variant: Int): String = when (culture) {
${byCulture("        ", (c) => `listOf(${DECREE_BANKS[c].secondFigure.map(kt).join(", ")})`)}
    }[variant]

    /** The opener when the second figure shares a god with the headline figure. */
    fun secondFigurePlain(culture: AncientCulture, variant: Int): String = when (culture) {
${byCulture("        ", (c) => `listOf(${DECREE_BANKS[c].secondFigurePlain.map(kt).join(", ")})`)}
    }[variant]

    /** Stands in a week row's headline when the row's figure is the day before's. */
    fun holds(culture: AncientCulture): String = when (culture) {
${byCulture("        ", (c) => kt(DECREE_BANKS[c].holds))}
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
 * web/src/data/permissionsRegister.ts. DayPermissionsComposer reads them.
 */
object PermissionsRegister {
    fun proceed(culture: AncientCulture, body: Planet): List<String> = when (culture) {
${registerSide("proceed")}
    }

    fun refrain(culture: AncientCulture, body: Planet): List<String> = when (culture) {
${registerSide("refrain")}
    }
}

/** The culture's own pair of column heads for the Do and Don't lists. */
fun permissionPair(culture: AncientCulture): Pair<String, String> = when (culture) {
${byCulture("    ", (c) => `${kt(CULTURE_VOICES[c].permissionPair[0])} to ${kt(CULTURE_VOICES[c].permissionPair[1])}`)}
}

/**
 * The day page's dive deeper, from web/src/data/diveDeeperBanks.ts: per
 * culture, four group titles and four quiet lines in the group order (work
 * and substance, home and kin, words and errands, the inner court), and the
 * concrete line's frame. DiveDeeperComposer reads them.
 */
object DiveDeeperBanks {
    /** The group's name and its concern in plain words. */
    fun title(culture: AncientCulture, group: Int): String = when (culture) {
${byCulture("        ", (c) => `listOf(${DIVE_DEEPER_BANKS[c].titles.map(kt).join(", ")})`)}
    }[group]

    /** What a group says when no figure touches it. */
    fun quiet(culture: AncientCulture, group: Int): String = when (culture) {
${byCulture("        ", (c) => `listOf(${DIVE_DEEPER_BANKS[c].quiet.map(kt).join(", ")})`)}
    }[group]

    /** What a group says when every figure touching it is read above. Slot: {group}, that group's name. */
    fun shared(culture: AncientCulture): String = when (culture) {
${byCulture("        ", (c) => kt(DIVE_DEEPER_BANKS[c].shared))}
    }

    /** The paragraph's last line. Slot: {thing}, a manifestation. */
    fun concrete(culture: AncientCulture): String = when (culture) {
${byCulture("        ", (c) => kt(DIVE_DEEPER_BANKS[c].concrete))}
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
// ranking of the headline and second figures, the tight threshold at 0.5 degrees,
// the one-minute EXACT threshold, and the half-minute the evidence line rounds at.
const FAST_SET = new Set(FAST);
function robust(chart) {
  const all = computeAspects(chart)
    .filter((a) => FAST_SET.has(a.a) || FAST_SET.has(a.b))
    .sort((a, b) => a.orb - b.orb);
  const top = all[0];
  if (!top) return false;
  const margin = 0.03;
  if (all[1] && all[1].orb - top.orb < margin) return false;
  for (const edge of [0.5, 1 / 60]) if (Math.abs(top.orb - edge) < margin) return false;
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
 * The web day page for one instant per culture (composeDayPage), each instant
 * chosen clear of every threshold where two engines a hair apart could print
 * different text.
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

// --- the figure page --------------------------------------------------------
const SLOW = ["jupiter", "saturn", "uranus", "neptune", "pluto"];
const SIGNS = ["Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo", "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"];

/** `when (culture) { when (aspect) { when (body) } }` over a FIGURE_BANKS table keyed kind then body. */
function figureByKindBody(field, bodies) {
  return CULTURES.map((c) => {
    const kinds = KINDS.map((k) => {
      const arms = bodies.map((b) => `                Planet.${upper(b)} -> ${kt(FIGURE_BANKS[c][field][k][b])}`).join("\n");
      return `            AspectType.${upper(k)} -> when (body) {\n${arms}\n                else -> error("\$body has no ${field} line")\n            }`;
    }).join("\n");
    return `        AncientCulture.${upper(c)} -> when (aspect) {\n${kinds}\n        }`;
  }).join("\n\n");
}

const byKind = (field) =>
  CULTURES.map((c) => {
    const arms = KINDS.map((k) => `            AspectType.${upper(k)} -> ${kt(FIGURE_BANKS[c][field][k])}`).join("\n");
    return `        AncientCulture.${upper(c)} -> when (aspect) {\n${arms}\n        }`;
  }).join("\n\n");

const byAngle = (field) =>
  CULTURES.map((c) => {
    const t = FIGURE_BANKS[c][field];
    return `        AncientCulture.${upper(c)} -> if (angle == "asc") ${kt(t.asc)} else ${kt(t.mc)}`;
  }).join("\n");

const slowActs = CULTURES.map((c) => {
  const arms = SLOW.map((b) => `            Planet.${upper(b)} -> ${kt(FIGURE_BANKS[c].slowActs[b])}`).join("\n");
  return `        AncientCulture.${upper(c)} -> when (body) {\n${arms}\n            else -> error("\$body has no slow act")\n        }`;
}).join("\n\n");

const manifestations = CULTURES.map((c) => {
  const groups = FIGURE_BANKS[c].manifestations
    .map((g, i) => `            ${i} -> if (harmony) listOf(${g.harmony.map(kt).join(", ")}) else listOf(${g.tension.map(kt).join(", ")})`)
    .join("\n");
  return `        AncientCulture.${upper(c)} -> when (group) {\n${groups}\n            else -> error("no house group \$group")\n        }`;
}).join("\n\n");

const tryThis = CULTURES.map((c) => {
  const arms = PLANETS.map((p) => {
    const cards = FIGURE_BANKS[c].tryThis[p].map((card) => `TryThisCard(${kt(card.kind)}, ${kt(card.title)}, ${kt(card.source)})`).join(", ");
    return `            Planet.${upper(p)} -> listOf(${cards})`;
  }).join("\n");
  return `        AncientCulture.${upper(c)} -> when (body) {\n${arms}\n        }`;
}).join("\n\n");

const clauses = PLANETS.map((p) => {
  const arms = SIGNS.map((s) => `            ZodiacSign.${upper(s)} -> ${kt(PLACEMENT_CLAUSES[p][s])}`).join("\n");
  return `        Planet.${upper(p)} -> when (sign) {\n${arms}\n        }`;
}).join("\n");

const RUN = "`cd web && node scripts/gen-android-reading-banks.mjs`";

const figureFile = `package com.astra.antiqua.domain

import com.astra.antiqua.model.AncientCulture
import com.astra.antiqua.model.Planet

/**
 * GENERATED by web/scripts/gen-android-reading-banks.mjs from
 * web/src/data/figureBanks.ts. Do not edit; run ${RUN}.
 *
 * The lines the figure page speaks with. FigureReadingComposer fills the
 * slots ({god}, {deity}, {sign}, {clause}, {domain}, {interval}).
 */

/** One "try this" card: consider, read or keep, with where it is attested. */
data class TryThisCard(val kind: String, val title: String, val source: String)

object FigureBanks {
    /** A long transit's headline, per (kind, slow body). */
    fun slowHeadline(culture: AncientCulture, aspect: AspectType, body: Planet): String = when (culture) {
${figureByKindBody("slowHeadlines", SLOW)}
    }

    /** The middle of the decomposed sentence; opens on a modal so it never inflects. */
    fun shortRelation(culture: AncientCulture, aspect: AspectType): String = when (culture) {
${byKind("shortRelations")}
    }

    /** The closing reflection per kind. Slot: {god}. */
    fun lesson(culture: AncientCulture, aspect: AspectType): String = when (culture) {
${byKind("lessons")}
    }

    /** Move one for a natal planet. Slots: {deity}, {sign}, {clause}. */
    fun natalFrame(culture: AncientCulture): String = when (culture) {
${byCulture("        ", (c) => kt(FIGURE_BANKS[c].natalFrame))}
    }

    /** Move one with no chart. Slots: {god}, {sign}, {domain}. */
    fun skyMoveOne(culture: AncientCulture): String = when (culture) {
${byCulture("        ", (c) => kt(FIGURE_BANKS[c].skyMoveOne))}
    }

    /** Move one for a long transit to the rising ("asc") or the midheaven ("mc"). Slot: {sign}. */
    fun angleMoveOne(culture: AncientCulture, angle: String): String = when (culture) {
${byAngle("angleMoveOne")}
    }

    /** What the rising ("asc") and the midheaven ("mc") govern. */
    fun angleDomain(culture: AncientCulture, angle: String): String = when (culture) {
${byAngle("angleDomains")}
    }

    /** Slot: {interval}. */
    fun recurrenceFrame(culture: AncientCulture): String = when (culture) {
${byCulture("        ", (c) => kt(FIGURE_BANKS[c].recurrenceFrame))}
    }

    /** The line for Mercury with Venus, which keep no steady interval. */
    fun recurrenceIrregular(culture: AncientCulture): String = when (culture) {
${byCulture("        ", (c) => kt(FIGURE_BANKS[c].recurrenceIrregular))}
    }

    fun playsOutTitle(culture: AncientCulture): String = when (culture) {
${byCulture("        ", (c) => kt(FIGURE_BANKS[c].playsOutTitle))}
    }

    /** A long transit's act line, per slow body. Slot: {god}. */
    fun slowAct(culture: AncientCulture, body: Planet): String = when (culture) {
${slowActs}
    }

    /** Four manifestations per (house group 0 to 3, tone). */
    fun manifestations(culture: AncientCulture, group: Int, harmony: Boolean): List<String> = when (culture) {
${manifestations}
    }

    /** Up to three cards per transiting body. */
    fun tryThis(culture: AncientCulture, body: Planet): List<TryThisCard> = when (culture) {
${tryThis}
    }

    /** Move one's authored clause, one per body and sign, opening on "you". */
    fun placementClause(planet: Planet, sign: ZodiacSign): String = when (planet) {
${clauses}
    }

    /** "Maiden": the sign's image in prose. */
    fun signPhrase(sign: ZodiacSign): String = when (sign) {
${SIGNS.map((s) => `        ZodiacSign.${upper(s)} -> ${kt(signPhraseProse(s))}`).join("\n")}
    }
}
`;

// --- the figure goldens ----------------------------------------------------
// One figure per culture: the day golden's instant and its headline figure,
// read without a chart and against a fixed chart whose Saturn sits 0.4
// degrees off a square to the headline body, every other natal planet at
// least two degrees further from any contact. The natal longitudes travel as
// literals, so only the sky is recomputed on Android.
const SIGN_MARGIN = 0.05;
function nearSignEdge(lon) {
  const d = ((lon % 30) + 30) % 30;
  return d < SIGN_MARGIN || d > 30 - SIGN_MARGIN;
}
const figureGoldens = [];
for (const g of goldens) {
  const date = g.instant.slice(0, 10);
  const sky = computeChart(new Date(g.instant));
  const top = g.decree.figures[0];
  const id = figureId(top);
  // The headline body: the figure's fast body, the faster when both are.
  const headline = ["moon", "sun", "mercury", "venus", "mars"].find((b) => b === top.a || b === top.b);
  if (nearSignEdge(sky[headline])) fail(`${g.culture} ${date}: ${headline} sits on a sign edge`);
  const chart = {};
  PLANETS.forEach((p, i) => (chart[p] = (sky[headline] + 37 + i * 2.5) % 360));
  chart.saturn = (sky[headline] + 90.4) % 360;
  const natal = { chart, ascendant: (sky[headline] + 200) % 360 };
  const pages = [composeFigurePage(g.culture, date, id, null), composeFigurePage(g.culture, date, id, natal)];
  if (pages.some((p) => !p)) fail(`${g.culture} ${date} ${id} does not compose`);
  if (!pages[1].natal) fail(`${g.culture} ${date}: the fixed chart is not touched`);
  figureGoldens.push({ culture: g.culture, date, id, natal, pages });
}

const flat = (p) => ({
  headline: p.headline,
  evidence: p.evidence,
  bridge: p.bridge ?? "",
  moveOne: p.moveOne,
  moveTwo: p.moveTwo,
  parts: p.parts.map((x) => `${x.phrase}|${x.tag}`).join(" / "),
  recurrence: p.recurrence,
  actLine: p.actLine,
  manifestations: p.manifestations.join(" · "),
  cards: p.cards.map((c) => c.title).join(" · "),
  lesson: p.lesson,
});
const pageKt = (p) =>
  `FigureGoldenPage(\n${Object.entries(flat(p))
    .map(([k, v]) => `            ${k} = ${kt(v)},`)
    .join("\n")}\n        )`;

const figureGoldensFile = `package com.astra.antiqua.domain

import com.astra.antiqua.model.AncientCulture
import com.astra.antiqua.model.Planet

/**
 * GENERATED by web/scripts/gen-android-reading-banks.mjs from the web
 * composer (web/src/lib/figureReading.ts). Do not edit; run
 * ${RUN}.
 *
 * One figure per culture, on the day golden's date: the page without a
 * chart, and the page against a fixed chart. FigureParityTest recomputes both
 * with Android's engine and composer.
 */
internal data class FigureGoldenPage(
    val headline: String,
    val evidence: String,
    /** The contact line under the evidence, or "" for the sky reading. */
    val bridge: String,
    val moveOne: String,
    val moveTwo: String,
    val parts: String,
    val recurrence: String,
    val actLine: String,
    val manifestations: String,
    val cards: String,
    val lesson: String,
)

internal data class FigureGolden(
    val culture: AncientCulture,
    val date: String,
    val id: String,
    val natal: Map<Planet, Double>,
    val ascendant: Double,
    val sky: FigureGoldenPage,
    val natalPage: FigureGoldenPage,
)

internal val FIGURE_GOLDENS: List<FigureGolden> = listOf(
${figureGoldens
  .map(
    (g) => `    FigureGolden(
        culture = AncientCulture.${upper(g.culture)},
        date = ${kt(g.date)},
        id = ${kt(g.id)},
        natal = mapOf(${PLANETS.map((p) => `Planet.${upper(p)} to ${g.natal.chart[p]}`).join(", ")}),
        ascendant = ${g.natal.ascendant},
        sky = ${pageKt(g.pages[0])},
        natalPage = ${pageKt(g.pages[1])},
    ),`,
  )
  .join("\n")}
)
`;

// --- the dive deeper and the lists ----------------------------------------
// One day per culture, read without a chart and against the screenshots'
// seeded chart (Rome, 1990-06-15 14:30), whose longitudes travel as literals.
// A day is taken only when every boundary the text depends on is at least
// MARGIN degrees away, so two engines a hair apart print the same text: no
// pair (sky to sky, or sky to natal) sits within MARGIN of an orb's edge, no
// two candidates (the sky's figures, the transits to the chart) are within
// MARGIN of each other in orb, and no printed orb is within MARGIN of the
// half-minute it rounds at, of one minute (EXACT) or of half a degree
// (tight). The output must also hold under nudges of every sky body.
const seedNatal = resolveSavedChart({
  id: "seed-verify", name: "Verification", date: "1990-06-15", time: "14:30", cityLabel: "Rome, Italy",
  latitude: 41.9028, longitude: 12.4964, createdAt: "2026-09-09T00:00:00.000Z",
});
if (!seedNatal) fail("the seeded chart does not resolve");
const diveNatal = { chart: seedNatal.chart, ascendant: seedNatal.angles.ascendant };

function diveOutput(culture, sky, day) {
  const decree = composeDecree(culture, sky, { day });
  return {
    sky: composeDiveDeeper(culture, decree, sky, day, null),
    natal: composeDiveDeeper(culture, decree, sky, day, diveNatal),
    skyLists: dayPermissions(culture, decree.figures, day),
    natalLists: natalDayPermissions(culture, sky, diveNatal.chart, day),
  };
}

const MARGIN = 0.003;

function separationOf(x, y) {
  const raw = Math.abs(x - y) % 360;
  return raw > 180 ? 360 - raw : raw;
}

/** Every pair clear of every orb edge. */
function clearOfOrbEdges(pairs) {
  for (const [x, y] of pairs) {
    const sep = separationOf(x, y);
    for (const rule of ASPECT_RULES) if (Math.abs(Math.abs(sep - rule.angle) - rule.orb) < MARGIN) return false;
  }
  return true;
}

/** Orbs sorted, each at least MARGIN from the next. */
function ranksApart(orbs) {
  const sorted = [...orbs].sort((a, b) => a - b);
  return sorted.every((o, i) => i === 0 || o - sorted[i - 1] >= MARGIN);
}

/** A printed orb clear of its rounding half-minute, of EXACT and of the tight threshold. */
function printedClear(orb) {
  const minutes = orb * 60;
  const frac = minutes - Math.floor(minutes);
  return Math.abs(frac - 0.5) / 60 >= MARGIN && Math.abs(orb - 1 / 60) >= MARGIN && Math.abs(orb - 0.5) >= MARGIN;
}

function marginsHold(culture, sky, day) {
  const skyPairs = [];
  for (let i = 0; i < PLANETS.length; i += 1)
    for (let j = i + 1; j < PLANETS.length; j += 1) skyPairs.push([sky[PLANETS[i]], sky[PLANETS[j]]]);
  const natalPairs = [];
  for (const t of PLANETS) for (const n of PLANETS) natalPairs.push([sky[t], diveNatal.chart[n]]);
  if (!clearOfOrbEdges(skyPairs) || !clearOfOrbEdges(natalPairs)) return false;
  const figures = dayFigures(sky);
  const hits = computeTransits(sky, diveNatal.chart);
  if (!ranksApart(figures.map((f) => f.orb)) || !ranksApart(hits.map((h) => h.orb))) return false;
  const out = diveOutput(culture, sky, day);
  const decree = composeDecree(culture, sky, { day });
  const printed = new Set([decree.evidence, ...out.sky.groups.map((g) => g.evidence), ...out.natal.groups.map((g) => g.evidence)]);
  for (const f of computeAspects(sky)) if (printed.has(composeEvidence(culture, f)) && !printedClear(f.orb)) return false;
  for (const h of hits) if (printed.has(composeBridge(culture, h.transit, h.natal, h.kind, h.orb)) && !printedClear(h.orb)) return false;
  return true;
}

function diveStable(culture, sky, day) {
  if (!marginsHold(culture, sky, day)) return false;
  const base = JSON.stringify(diveOutput(culture, sky, day));
  let seed = day;
  const rand = () => (seed = (Math.imul(seed, 1103515245) + 12345) >>> 0) / 4294967296;
  for (let trial = 0; trial < 12; trial += 1) {
    const nudged = {};
    for (const p of PLANETS) nudged[p] = sky[p] + (rand() < 0.5 ? -0.001 : 0.001);
    if (JSON.stringify(diveOutput(culture, nudged, day)) !== base) return false;
  }
  return true;
}

const diveGoldens = [];
let diveDay = Date.UTC(2026, 8, 29);
while (diveGoldens.length < CULTURES.length) {
  const culture = CULTURES[diveGoldens.length];
  const instant = new Date(diveDay);
  const day = diveDay / 86_400_000;
  const sky = computeChart(instant);
  if (diveStable(culture, sky, day)) diveGoldens.push({ instant: instant.toISOString(), culture, ...diveOutput(culture, sky, day) });
  diveDay += 86_400_000;
  if (diveDay > Date.UTC(2027, 8, 29)) fail("no stable dive deeper days found in a year");
}

const groupsKt = (dd) =>
  `listOf(\n${dd.groups.map((g) => `            ${kt(`${g.title}|${g.evidence}|${g.sentences.join(" ")}`)},`).join("\n")}\n        )`;
const listKt = (items) => `listOf(${items.map(kt).join(", ")})`;

const diveGoldensFile = `package com.astra.antiqua.domain

import com.astra.antiqua.model.AncientCulture
import com.astra.antiqua.model.Planet

/**
 * GENERATED by web/scripts/gen-android-reading-banks.mjs from the web
 * composers (web/src/lib/diveDeeper.ts, permissions.ts). Do not edit; run
 * \`cd web && node scripts/gen-android-reading-banks.mjs\`.
 *
 * One day per culture, each chosen so every orb edge, rank gap and printed
 * orb boundary the text depends on is at least 0.003 degrees away: the dive deeper's four
 * groups as "title|evidence|paragraph", and the Do and Don't lists, without
 * a chart and against the screenshots' seeded chart (literals, so only the
 * sky is recomputed on Android). DiveDeeperParityTest recomputes each.
 */
internal data class DiveDeeperGolden(
    val instantUtc: String,
    val culture: AncientCulture,
    val skyGroups: List<String>,
    val natalGroups: List<String>,
    val skyProceed: List<String>,
    val skyRefrain: List<String>,
    val natalProceed: List<String>,
    val natalRefrain: List<String>,
)

internal val DIVE_NATAL: Map<Planet, Double> = mapOf(${PLANETS.map((p) => `Planet.${upper(p)} to ${diveNatal.chart[p]}`).join(", ")})
internal const val DIVE_NATAL_ASCENDANT: Double = ${diveNatal.ascendant}

internal val DIVE_DEEPER_GOLDENS: List<DiveDeeperGolden> = listOf(
${diveGoldens
  .map(
    (g) => `    DiveDeeperGolden(
        instantUtc = ${kt(g.instant)},
        culture = AncientCulture.${upper(g.culture)},
        skyGroups = ${groupsKt(g.sky)},
        natalGroups = ${groupsKt(g.natal)},
        skyProceed = ${listKt(g.skyLists.proceed)},
        skyRefrain = ${listKt(g.skyLists.refrain)},
        natalProceed = ${listKt(g.natalLists.proceed)},
        natalRefrain = ${listKt(g.natalLists.refrain)},
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
await writeFile(path.join(OUT, "FigureBanks.kt"), figureFile);
await writeFile(path.join(TEST_OUT, "FigureGoldens.kt"), figureGoldensFile);
await writeFile(path.join(TEST_OUT, "DiveDeeperGoldens.kt"), diveGoldensFile);
console.log(
  `gen-android-reading-banks: wrote ReadingBanks.kt (${file.length} bytes), AspectVerbs.kt, ` +
    `DayDecreeGoldens.kt (${goldens.map((g) => `${g.culture} ${g.instant.slice(0, 10)}`).join(", ")}), ` +
    `FigureBanks.kt (${figureFile.length} bytes), FigureGoldens.kt (${figureGoldens.map((g) => `${g.culture} ${g.id}`).join(", ")}), ` +
    `DiveDeeperGoldens.kt (${diveGoldens.map((g) => `${g.culture} ${g.instant.slice(0, 10)}`).join(", ")})`,
);
