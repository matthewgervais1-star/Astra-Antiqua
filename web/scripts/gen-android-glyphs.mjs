/**
 * Generates the fifty deity glyphs as Compose ImageVectors.
 *
 *   cd web && node scripts/gen-android-glyphs.mjs
 *
 * Reads docs/design/system/assets/glyphs/<culture>/<body>.svg and writes
 * android/app/src/main/java/com/astra/antiqua/ui/glyphs/DeityGlyphs.kt: one
 * builder per culture and body on the 24 x 24 viewport the glyphs are drawn
 * on, with every path's d string, stroke width, cap and join carried through
 * as the designer set them. Nothing here rescales, restyles or redraws a
 * mark, and the honesty status in each SVG's title travels with it.
 *
 * Fill and stroke are SolidColor(Color.Black) so the colour is the caller's:
 * a tint on the Icon replaces it, which is what lets a received body take the
 * culture accent and the rest the bone ink from one set of vectors.
 *
 * The glyphs are drawn with eight elements only (g, path, circle, ellipse,
 * line, polyline, polygon, rect) by design, so svg-shapes.mjs converts the
 * seven that are not <path> into path data and throws on anything else rather
 * than skipping it. The generated file is never hand-edited.
 */
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { fail, flatten, parseDocument, parseElements } from "./svg-shapes.mjs";

const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.join(SCRIPT_DIR, "..", "..");
const GLYPHS = path.join(REPO, "docs", "design", "system", "assets", "glyphs");
const OUT = path.join(
  REPO, "android", "app", "src", "main", "java", "com", "astra", "antiqua", "ui", "glyphs",
);

const CULTURES = ["egypt", "greece", "canaan", "carthage", "rome"];
const BODIES = [
  "sun", "moon", "mercury", "venus", "mars",
  "jupiter", "saturn", "uranus", "neptune", "pluto",
];
const STATUSES = ["attested", "composed", "invented"];
/** The tally the research settled, checked here so a redraw cannot quietly change it. */
const EXPECTED_TALLY = { attested: 28, composed: 21, invented: 1 };

const CAPS = { butt: "Butt", round: "Round", square: "Square" };
const JOINS = { miter: "Miter", round: "Round", bevel: "Bevel" };

const upper = (s) => s.toUpperCase();
const pascal = (s) => s[0].toUpperCase() + s.slice(1);
const kotlinString = (s) => `"${s.replace(/\\/g, "\\\\").replace(/"/g, '\\"').replace(/\$/g, "\\$")}"`;

const tally = { attested: 0, composed: 0, invented: 0 };
const entries = [];

for (const culture of CULTURES) {
  for (const body of BODIES) {
    const file = path.join(GLYPHS, culture, `${body}.svg`);
    const doc = parseDocument(await readFile(file, "utf8"));
    if (doc.minX !== 0 || doc.minY !== 0 || doc.width !== 24 || doc.height !== 24) {
      fail(`${culture}/${body}.svg is not on the 24 grid`);
    }
    if (!doc.title) fail(`${culture}/${body}.svg has no title, so its honesty status is lost`);
    // "Ares · mars · attested": the deity, the body, and the status the
    // research settled. The status is the last segment.
    const parts = doc.title.split("·").map((p) => p.trim());
    const status = parts[parts.length - 1];
    const deity = parts[0];
    if (!STATUSES.includes(status)) fail(`${culture}/${body}.svg has the status "${status}"`);
    tally[status] += 1;

    const paths = flatten(parseElements(doc.inner));
    if (paths.length === 0) fail(`${culture}/${body}.svg has no drawn elements`);

    const calls = paths.map((p) => {
      const a = p.attrs;
      const fillAttr = a.fill ?? "none";
      const strokeAttr = a.stroke ?? "none";
      if (fillAttr !== "none" && fillAttr !== "currentColor") fail(`${culture}/${body}: fill ${fillAttr}`);
      if (strokeAttr !== "none" && strokeAttr !== "currentColor") fail(`${culture}/${body}: stroke ${strokeAttr}`);
      if (fillAttr === "none" && strokeAttr === "none") fail(`${culture}/${body}: a shape with neither fill nor stroke`);
      const args = [`pathData = addPathNodes(${kotlinString(p.d)})`];
      if (fillAttr === "currentColor") args.push("fill = INK");
      if (strokeAttr === "currentColor") {
        args.push("stroke = INK");
        args.push(`strokeLineWidth = ${Number(a["stroke-width"] ?? 1)}f`);
        const cap = a["stroke-linecap"];
        const join = a["stroke-linejoin"];
        if (cap) args.push(`strokeLineCap = StrokeCap.${CAPS[cap] ?? fail(`linecap ${cap}`)}`);
        if (join) args.push(`strokeLineJoin = StrokeJoin.${JOINS[join] ?? fail(`linejoin ${join}`)}`);
      }
      return `            addPath(\n                ${args.join(",\n                ")},\n            )`;
    });

    entries.push({ culture, body, deity, status, calls });
  }
}

for (const [status, count] of Object.entries(EXPECTED_TALLY)) {
  if (tally[status] !== count) {
    fail(`the set is ${tally.attested}/${tally.composed}/${tally.invented} attested/composed/invented, expected ${EXPECTED_TALLY.attested}/${EXPECTED_TALLY.composed}/${EXPECTED_TALLY.invented}`);
  }
}

const builders = entries
  .map((e) => `private fun ${e.culture}${pascal(e.body)}(): ImageVector =
    glyph(${kotlinString(`${e.culture}.${e.body}`)}) {
${e.calls.join("\n")}
    }`)
  .join("\n\n");

const lookup = CULTURES.map((culture) => {
  const arms = BODIES.map(
    (body) => `            ClassicalPlanet.${upper(body)} -> ${culture}${pascal(body)}()`,
  ).join("\n");
  return `        AncientCulture.${upper(culture)} -> when (body) {\n${arms}\n        }`;
}).join("\n");

const statusArms = entries
  .map((e) => `        AncientCulture.${upper(e.culture)} to ClassicalPlanet.${upper(e.body)} -> GlyphStatus.${upper(e.status)}`)
  .join("\n");

const deityArms = entries
  .map((e) => `        AncientCulture.${upper(e.culture)} to ClassicalPlanet.${upper(e.body)} -> ${kotlinString(e.deity)}`)
  .join("\n");

const file = `package com.astra.antiqua.ui.glyphs

import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.SolidColor
import androidx.compose.ui.graphics.StrokeCap
import androidx.compose.ui.graphics.StrokeJoin
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.graphics.vector.addPathNodes
import androidx.compose.ui.unit.dp
import com.astra.antiqua.model.AncientCulture
import com.astra.antiqua.model.ClassicalPlanet

/**
 * GENERATED by web/scripts/gen-android-glyphs.mjs from
 * docs/design/system/assets/glyphs. Do not edit; run
 * \`cd web && node scripts/gen-android-glyphs.mjs\`.
 *
 * The fifty deity glyphs, one per culture per body, on the 24 x 24 grid they
 * were drawn on. Every path is the designer's, with its own stroke width, cap
 * and join; the generator rescales nothing.
 *
 * Fill and stroke are black so the caller's tint decides the colour, which is
 * how a received body takes the culture accent and the rest the bone ink
 * without a second set of vectors.
 *
 * Each glyph carries the honesty status the research settled: ${EXPECTED_TALLY.attested} attested,
 * ${EXPECTED_TALLY.composed} composed, ${EXPECTED_TALLY.invented} invented. [statusOf] reads it, and nothing in the app may
 * present a composed mark as attested.
 */
enum class GlyphStatus { ATTESTED, COMPOSED, INVENTED }

private val INK = SolidColor(Color.Black)

private fun glyph(name: String, paths: ImageVector.Builder.() -> Unit): ImageVector =
    ImageVector.Builder(
        name = name,
        defaultWidth = 24.dp,
        defaultHeight = 24.dp,
        viewportWidth = 24f,
        viewportHeight = 24f,
    ).apply(paths).build()

/** Built once each: a vector is immutable and the same instance redraws freely. */
private val cache = HashMap<Pair<AncientCulture, ClassicalPlanet>, ImageVector>()

/** The glyph [culture] draws for [body]. */
fun deityGlyph(culture: AncientCulture, body: ClassicalPlanet): ImageVector =
    cache.getOrPut(culture to body) { buildGlyph(culture, body) }

private fun buildGlyph(culture: AncientCulture, body: ClassicalPlanet): ImageVector =
    when (culture) {
${lookup}
    }

/** The honesty status of [culture]'s glyph for [body]. */
fun statusOf(culture: AncientCulture, body: ClassicalPlanet): GlyphStatus =
    when (culture to body) {
${statusArms}
        else -> error("no glyph for $culture $body")
    }

/** The deity the glyph names, as its title records it. */
fun glyphDeityName(culture: AncientCulture, body: ClassicalPlanet): String =
    when (culture to body) {
${deityArms}
        else -> error("no glyph for $culture $body")
    }

${builders}
`;

await mkdir(OUT, { recursive: true });
await writeFile(path.join(OUT, "DeityGlyphs.kt"), file);
console.log(
  `gen-android-glyphs: wrote DeityGlyphs.kt, ${entries.length} glyphs ` +
    `(attested ${tally.attested}, composed ${tally.composed}, invented ${tally.invented}), ` +
    `${entries.reduce((sum, e) => sum + e.calls.length, 0)} paths, ${file.length} bytes`,
);
