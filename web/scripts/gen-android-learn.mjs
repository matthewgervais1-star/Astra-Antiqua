/**
 * Generates the Learn section's content for Android.
 *
 *   cd web && node scripts/gen-android-learn.mjs
 *
 * The seven Learn pages are explainer prose, authored once in
 * web/src/app/learn. Retyping them into Kotlin would put the same paragraphs
 * in two places and guarantee they drift, so this reads the pages and emits
 * the blocks as data.
 *
 * The extractor is deliberately strict. It understands exactly four shapes,
 * the ones every page is built from:
 *
 *   <NaveHead kicker="...">HEADLINE</NaveHead>
 *   <SectionDivider label="..." />
 *   <h2 ...>heading</h2>
 *   <p ...>paragraph</p>
 *
 * Anything else on a page (a wheel, a data-driven table, a link row) is left
 * out and REPORTED, so a page that grows a new kind of block shows up in the
 * generator's output rather than silently losing content. The tables that are
 * driven by data modules are generated separately, from those modules.
 */
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.join(SCRIPT_DIR, "..", "..");
const SRC = path.join(REPO, "web", "src");
const OUT = path.join(
  REPO, "android", "app", "src", "main", "java", "com", "astra", "antiqua", "domain",
);

function fail(message) {
  throw new Error(`gen-android-learn: ${message}`);
}

const kotlinString = (s) =>
  `"${s.replace(/\\/g, "\\\\").replace(/"/g, '\\"').replace(/\$/g, "\\$")}"`;

/**
 * JSX text to plain text: entities decoded, whitespace collapsed.
 *
 * Inline markup is flattened to the words inside it. A sentence that links to
 * another section reads as a sentence here, since this surface has no inline
 * link to offer and the section it points at is one tap away in the table of
 * contents either way.
 */
const INLINE_TAGS = ["Link", "span", "strong", "em", "b", "i", "code"];

function plain(raw) {
  let flattened = raw;
  for (const tag of INLINE_TAGS) {
    const open = new RegExp(`<${tag}\\b[^>]*>`, "g");
    const close = new RegExp(`</${tag}>`, "g");
    flattened = flattened.replace(open, "").replace(close, "");
  }
  const text = flattened
    .replace(/\{"([^"]*)"\}/g, "$1")
    .replace(/&ldquo;|&rdquo;/g, '"')
    .replace(/&lsquo;|&rsquo;/g, "'")
    .replace(/&mdash;/g, ", ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&apos;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, " ")
    .trim();
  if (text.includes("{") || text.includes("<")) {
    fail(`a text block still holds markup or an expression: ${text.slice(0, 70)}`);
  }
  return text;
}

/** The ordered blocks of one page, plus what was skipped. */
function extract(source, file) {
  const blocks = [];
  const skipped = new Set();

  // Every construct, in source order, so the prose keeps its sequence.
  const pattern =
    /<NaveHead\s+kicker=(?:"([^"]*)"|\{`([^`]*)`\})\s*>([\s\S]*?)<\/NaveHead>|<SectionDivider\s+label="([^"]*)"\s*\/>|<h2\b[^>]*>([\s\S]*?)<\/h2>|<p\b[^>]*>([\s\S]*?)<\/p>|<(WheelSvg|LearnTOC|AspectGlossary|Link|table)\b/g;

  let match;
  while ((match = pattern.exec(source)) !== null) {
    const [, kickerLiteral, kickerTemplate, headline, divider, heading, para, component] = match;
    if (component) {
      skipped.add(component);
      continue;
    }
    if (headline !== undefined) {
      // The aspects glossary names the culture in its kicker. That is the one
      // substitution a head is allowed, and it travels as %s for the screen to
      // fill with the culture in force.
      const kicker = (kickerLiteral ?? kickerTemplate ?? "").replace("${label}", "%s");
      blocks.push({ kind: "head", kicker: plain(kicker), text: plain(headline) });
      continue;
    }
    if (divider !== undefined) {
      blocks.push({ kind: "divider", text: plain(divider) });
      continue;
    }
    if (heading !== undefined) {
      // Same rule as a paragraph: a heading that is one expression belongs to
      // a data-driven row, not to the page's prose.
      if (/\{/.test(heading.replace(/\{"[^"]*"\}/g, ""))) {
        skipped.add("expression");
        continue;
      }
      blocks.push({ kind: "heading", text: plain(heading) });
      continue;
    }
    if (para !== undefined) {
      // A <p> whose whole body is one expression is a data-driven row, not
      // prose: the signs table prints its blurb that way. Those tables travel
      // as data instead, so the paragraph is recorded as skipped rather than
      // treated as a page that lost its text.
      if (/^\s*\{[^{}]*\}\s*$/.test(para)) {
        skipped.add("expression");
        continue;
      }
      const text = plain(para);
      if (text.length > 0) blocks.push({ kind: "para", text });
    }
  }

  if (blocks.length === 0) fail(`${file} yielded no blocks`);
  return { blocks, skipped: [...skipped] };
}

/** The seven sections, read from the module the web TOC already uses. */
const sectionsSource = await readFile(path.join(SRC, "data", "learnSections.ts"), "utf8");
const sections = [];
const sectionPattern =
  /\{\s*n:\s*(\d+),\s*title:\s*"([^"]*)",\s*href:\s*"([^"]*)",\s*blurb:\s*"([^"]*)",\s*\}/g;
let sectionMatch;
while ((sectionMatch = sectionPattern.exec(sectionsSource)) !== null) {
  const [, n, title, href, blurb] = sectionMatch;
  sections.push({ n: Number(n), title, href, blurb });
}
if (sections.length !== 7) fail(`expected 7 learn sections, found ${sections.length}`);

/** Which file backs each href, and which need a generated table beside them. */
const PAGE_FOR_HREF = {
  "/learn": "app/learn/page.tsx",
  "/learn/signs": "app/learn/signs/page.tsx",
  "/learn/rising": "app/learn/rising/page.tsx",
  "/learn/houses": "app/learn/houses/page.tsx",
  "/learn/house-systems": "app/learn/house-systems/page.tsx",
  "/learn/aspects": "app/learn/aspects/AspectGlossary.tsx",
  "/learn/transits": "app/learn/transits/page.tsx",
};

/** A table this surface renders from data rather than from the page's prose. */
const TABLE_FOR_HREF = {
  "/learn": "PLANET_VERBS",
  "/learn/signs": "ZODIAC_SIGNS",
  "/learn/houses": "HOUSES",
  "/learn/house-systems": "HOUSE_SYSTEMS",
  "/learn/aspects": "ASPECTS",
};

const pages = [];
const report = [];
for (const section of sections) {
  const file = PAGE_FOR_HREF[section.href] ?? fail(`no page mapped for ${section.href}`);
  const source = await readFile(path.join(SRC, file), "utf8");
  const { blocks, skipped } = extract(source, file);
  pages.push({ ...section, blocks, table: TABLE_FOR_HREF[section.href] ?? null });
  report.push(`${section.href}: ${blocks.length} blocks, skipped ${skipped.join(", ") || "nothing"}`);
}

// --- the twelve signs, from the reference module --------------------------
const signsSource = await readFile(path.join(SRC, "data", "zodiacSigns.ts"), "utf8");
const signs = [];
const signPattern =
  /\{\s*sign:\s*"([^"]*)",\s*symbol:\s*"([^"]*)",\s*dates:\s*"([^"]*)",\s*element:\s*"([^"]*)",\s*modality:\s*"([^"]*)",\s*traits:\s*"([^"]*)",\s*blurb:\s*"([^"]*)"/g;
let signMatch;
while ((signMatch = signPattern.exec(signsSource)) !== null) {
  const [, sign, symbol, dates, element, modality, traits, blurb] = signMatch;
  signs.push({ sign, symbol, dates, element, modality, traits, blurb });
}
if (signs.length !== 12) fail(`expected 12 zodiac signs, found ${signs.length}`);

// --- the planets as verbs, from the Learn hub itself -----------------------
const hubSource = await readFile(path.join(SRC, "app", "learn", "page.tsx"), "utf8");
const verbs = [];
const verbPattern = /\{\s*symbol:\s*"([^"]*)",\s*name:\s*"([^"]*)",\s*verb:\s*"([^"]*)"\s*\}/g;
let verbMatch;
while ((verbMatch = verbPattern.exec(hubSource)) !== null) {
  const [, symbol, name, verb] = verbMatch;
  verbs.push({ symbol, name, verb });
}
if (verbs.length !== 11) fail(`expected 11 planet verbs, found ${verbs.length}`);

// --- the three house systems, from the page that compares them ------------
const systemsSource = await readFile(
  path.join(SRC, "app", "learn", "house-systems", "page.tsx"),
  "utf8",
);
const systems = [];
const systemPattern =
  /\{\s*name:\s*"([^"]*)",\s*age:\s*"([^"]*)",\s*body:\s*"([^"]*)",\s*ours:\s*(true|false),\s*\}/g;
let systemMatch;
while ((systemMatch = systemPattern.exec(systemsSource)) !== null) {
  const [, name, age, body, ours] = systemMatch;
  systems.push({ name, age, body, ours: ours === "true" });
}
if (systems.length !== 3) fail(`expected 3 house systems, found ${systems.length}`);

// --- the twenty-five institutional rulings --------------------------------
const rulingsSource = await readFile(path.join(SRC, "data", "aspectRulings.ts"), "utf8");
const CULTURES = ["egypt", "greece", "canaan", "carthage", "rome"];
const rulings = {};
for (const culture of CULTURES) {
  const open = rulingsSource.indexOf(`  ${culture}: {`);
  if (open === -1) fail(`aspectRulings.ts has no block for ${culture}`);
  const block = rulingsSource.slice(open, rulingsSource.indexOf("\n  },", open));
  rulings[culture] = {};
  for (const kind of ["conjunction", "sextile", "square", "trine", "opposition"]) {
    const m = block.match(new RegExp(`\\n\\s*${kind}:\\s*"([^"]*)",`));
    if (!m) fail(`aspectRulings.ts has no ${culture}.${kind}`);
    rulings[culture][kind] = m[1];
  }
}

// --- the aspect geometry, from the glossary -------------------------------
const glossarySource = await readFile(
  path.join(SRC, "app", "learn", "aspects", "AspectGlossary.tsx"),
  "utf8",
);
const geometryBlock = glossarySource.slice(glossarySource.indexOf("const GEOMETRY"));
const KINDS = ["conjunction", "sextile", "square", "trine", "opposition"];
const geometry = {};
for (const kind of KINDS) {
  const m = geometryBlock.match(new RegExp(`\\n\\s*${kind}:\\s*"([^"]*)",`));
  if (!m) fail(`the aspect glossary has no geometry line for ${kind}`);
  geometry[kind] = m[1];
}

const blockLines = (page) =>
  page.blocks
    .map((b) => {
      if (b.kind === "head") {
        return `            LearnBlock.Head(${kotlinString(b.kicker)}, ${kotlinString(b.text)}),`;
      }
      if (b.kind === "divider") return `            LearnBlock.Divider(${kotlinString(b.text)}),`;
      if (b.kind === "heading") return `            LearnBlock.Heading(${kotlinString(b.text)}),`;
      return `            LearnBlock.Para(${kotlinString(b.text)}),`;
    })
    .join("\n");

const file = `package com.astra.antiqua.domain

import com.astra.antiqua.model.AncientCulture

/**
 * GENERATED by web/scripts/gen-android-learn.mjs from web/src/app/learn and
 * web/src/data. Do not edit; run
 * \`cd web && node scripts/gen-android-learn.mjs\`.
 *
 * The seven Learn sections, as blocks. The prose is the web surface's, read
 * out of the pages rather than retyped, so an explainer edited once is
 * edited on both surfaces.
 *
 * Where a page's body is a table driven by a data module, the table travels
 * as data too and the screen renders it after the prose. The one thing that
 * does not cross is the sample chart wheel on the hub, which the day screen
 * already draws from a real chart.
 */
sealed interface LearnBlock {
    /** The page head: a mono kicker over a display headline. */
    data class Head(val kicker: String, val headline: String) : LearnBlock

    /** A rule with a caption set into it. */
    data class Divider(val label: String) : LearnBlock

    /** A section heading inside the page. */
    data class Heading(val text: String) : LearnBlock

    /** One paragraph of prose. */
    data class Para(val text: String) : LearnBlock
}

/** A table a section renders from reference data after its prose. */
enum class LearnTable { PLANET_VERBS, ZODIAC_SIGNS, HOUSES, HOUSE_SYSTEMS, ASPECTS }

data class LearnSection(
    val n: Int,
    val title: String,
    val href: String,
    val blurb: String,
    val blocks: List<LearnBlock>,
    val table: LearnTable?,
)

/** One of the twelve, as the signs page prints it. */
data class ZodiacSignInfo(
    val sign: String,
    val symbol: String,
    val dates: String,
    val element: String,
    val modality: String,
    val traits: String,
    val blurb: String,
)

/** A body and the verb the hub gives it: the grammar under a placement. */
data class PlanetVerb(val symbol: String, val name: String, val verb: String)

/** One way of cutting the sky into twelve, and whether this app uses it. */
data class HouseSystem(
    val name: String,
    val age: String,
    val body: String,
    val ours: Boolean,
)

/** The pure geometry of an aspect, culture-neutral. */
fun aspectGeometry(aspect: AspectType): String = when (aspect) {
${KINDS.map((k) => `    AspectType.${k.toUpperCase()} -> ${kotlinString(geometry[k])}`).join("\n")}
}

/**
 * One institutional ruling per aspect per culture: Rome's augury, Egypt's
 * weighing, Greece's oracle, Canaan's council, Carthage's ledger. These
 * describe the KIND, which is what a glossary is for; the figure-tethered
 * rulings the readings use are in ReadingBanks.
 */
fun aspectRuling(culture: AncientCulture, aspect: AspectType): String = when (culture) {
${CULTURES.map((culture) => {
  const inner = KINDS.map(
    (kind) => `        AspectType.${kind.toUpperCase()} -> ${kotlinString(rulings[culture][kind])}`,
  ).join("\n");
  return `    AncientCulture.${culture.toUpperCase()} -> when (aspect) {\n${inner}\n    }`;
}).join("\n\n")}
}

object Learn {
    val SIGNS: List<ZodiacSignInfo> = listOf(
${signs
  .map(
    (s) =>
      `        ZodiacSignInfo(${kotlinString(s.sign)}, ${kotlinString(s.symbol)}, ${kotlinString(s.dates)}, ${kotlinString(s.element)}, ${kotlinString(s.modality)}, ${kotlinString(s.traits)}, ${kotlinString(s.blurb)}),`,
  )
  .join("\n")}
    )

    val HOUSE_SYSTEMS: List<HouseSystem> = listOf(
${systems
  .map(
    (h) =>
      `        HouseSystem(${kotlinString(h.name)}, ${kotlinString(h.age)}, ${kotlinString(h.body)}, ${h.ours}),`,
  )
  .join("\n")}
    )

    val PLANET_VERBS: List<PlanetVerb> = listOf(
${verbs
  .map((v) => `        PlanetVerb(${kotlinString(v.symbol)}, ${kotlinString(v.name)}, ${kotlinString(v.verb)}),`)
  .join("\n")}
    )

    val SECTIONS: List<LearnSection> = listOf(
${pages
  .map(
    (p) => `        LearnSection(
            n = ${p.n},
            title = ${kotlinString(p.title)},
            href = ${kotlinString(p.href)},
            blurb = ${kotlinString(p.blurb)},
            table = ${p.table ? `LearnTable.${p.table}` : "null"},
            blocks = listOf(
${blockLines(p)}
            ),
        ),`,
  )
  .join("\n")}
    )

    fun byHref(href: String): LearnSection? = SECTIONS.firstOrNull { it.href == href }
}
`;

await mkdir(OUT, { recursive: true });
await writeFile(path.join(OUT, "LearnContent.kt"), file);
console.log("gen-android-learn: wrote LearnContent.kt");
for (const line of report) console.log(`  ${line}`);
console.log(`  ${signs.length} signs, ${verbs.length} planet verbs, ${KINDS.length} geometry lines`);
