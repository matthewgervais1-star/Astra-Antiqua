/**
 * Generates the tier-2 culture emblems and the three typeset signs as Compose
 * ImageVectors.
 *
 *   cd web && node scripts/gen-android-emblems.mjs
 *
 * The emblems read the same five files web/scripts/export-marks.mjs reads, so
 * both surfaces carry one mark per culture from one source: the wedjat,
 * Athena's owl, the Ugaritic name of El, the sign of Tanit, and the aquila.
 * docs/design/culture-marks.md puts these at tier 2, the in-app emblem, where
 * a label always stands beside them.
 *
 * The signs are the ankh, the Ugaritic name of El and omega, cut from their
 * faces to outlines by scripts/outline-signs.mjs. Android gets outlines, not
 * fonts (docs/design/prompts/implement-design-system.md), so what web sets as
 * type in an epigraphic face travels here as a vector.
 *
 * Fill and stroke are black so the colour is the caller's tint, exactly as
 * the deity glyphs work. That is what lets one mark take the culture accent
 * on a doorway and the bone ink in a list without a second set of vectors.
 *
 * These assets are drawn with the same eight elements the rest of the system
 * uses, so svg-shapes.mjs converts the seven that are not <path> and throws on
 * anything else rather than skipping it. The generated file is never
 * hand-edited.
 */
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { fail, flatten, parseDocument, parseElements } from "./svg-shapes.mjs";

const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.join(SCRIPT_DIR, "..", "..");
const MARKS = path.join(REPO, "docs", "design", "system", "assets", "marks");
const OUT = path.join(
  REPO, "android", "app", "src", "main", "java", "com", "astra", "antiqua", "ui", "brand",
);

/**
 * The tier-2 emblem per culture, the same table export-marks.mjs carries.
 * Canaan has no popular emblem, which the research states plainly rather than
 * papering over, so its cuneiform carries both tiers. Carthage takes the
 * header cut with the solid disc and upturned arms, never the launcher
 * outline.
 */
const EMBLEMS = [
  { culture: "EGYPT", file: "em-wedjat.svg", name: "The wedjat" },
  { culture: "GREECE", file: "em-owl.svg", name: "Athena's owl" },
  { culture: "CANAAN", file: "ts-il.svg", name: "The name of El in Ugaritic" },
  { culture: "CARTHAGE", file: "em-tanit-hdr.svg", name: "The sign of Tanit" },
  { culture: "ROME", file: "em-aquila.svg", name: "The aquila" },
];

/** The signs that exist as encoded characters, outlined for this surface. */
const TYPESET = [
  { key: "ANKH", file: "ts-ankh.svg", name: "The ankh", codepoints: "U+2625" },
  { key: "IL", file: "ts-il.svg", name: "The name of El in Ugaritic", codepoints: "U+1039B U+1038D" },
  { key: "OMEGA", file: "ts-omega.svg", name: "Omega", codepoints: "U+03A9" },
];

const CAPS = { butt: "Butt", round: "Round", square: "Square" };
const JOINS = { miter: "Miter", round: "Round", bevel: "Bevel" };

const pascal = (s) => s[0] + s.slice(1).toLowerCase();
const kotlinString = (s) => `"${s.replace(/\\/g, "\\\\").replace(/"/g, '\\"').replace(/\$/g, "\\$")}"`;
const NEWLINE = "\n";

/** Reads one 512-grid mark and emits the addPath calls that redraw it. */
async function readMark(file) {
  const source = path.join(MARKS, file);
  const doc = parseDocument(await readFile(source, "utf8"));
  if (doc.minX !== 0 || doc.minY !== 0 || doc.width !== 512 || doc.height !== 512) {
    fail(`${file} is not on the 512 grid, it is ${doc.minX} ${doc.minY} ${doc.width} ${doc.height}`);
  }
  if (!doc.title) fail(`${file} has no title, so what the mark is would be lost`);

  const shapes = flatten(parseElements(doc.inner));
  if (shapes.length === 0) fail(`${file} carries no shapes`);

  const lines = [];
  for (const node of shapes) {
    const attrs = node.attrs;
    const fillAttr = attrs.fill ?? "none";
    const strokeAttr = attrs.stroke ?? "none";
    if (fillAttr === "none" && strokeAttr === "none") {
      fail(`${file} has a shape with neither fill nor stroke`);
    }
    for (const colour of [fillAttr, strokeAttr]) {
      if (colour !== "none" && colour !== "currentColor") {
        fail(`${file} paints in ${colour}, so it cannot take a culture accent`);
      }
    }
    const args = [`pathData = addPathNodes(${kotlinString(node.d)})`];
    if (fillAttr !== "none") args.push("fill = INK");
    if (strokeAttr !== "none") {
      args.push("stroke = INK");
      args.push(`strokeLineWidth = ${Number(attrs["stroke-width"] ?? 1)}f`);
      const cap = attrs["stroke-linecap"];
      const join = attrs["stroke-linejoin"];
      if (cap) args.push(`strokeLineCap = StrokeCap.${CAPS[cap] ?? fail(`linecap ${cap}`)}`);
      if (join) args.push(`strokeLineJoin = StrokeJoin.${JOINS[join] ?? fail(`linejoin ${join}`)}`);
    }
    lines.push("    addPath(");
    for (const arg of args) lines.push(`        ${arg},`);
    lines.push("    )");
  }
  return { title: doc.title, body: lines.join(NEWLINE), shapes: shapes.length };
}

const builders = [];
for (const { culture, file, name } of EMBLEMS) {
  const mark = await readMark(file);
  builders.push({
    culture,
    name,
    title: mark.title,
    fn: `${pascal(culture)}Emblem`,
    body: mark.body,
    shapes: mark.shapes,
  });
}

const signs = [];
for (const { key, file, name, codepoints } of TYPESET) {
  const mark = await readMark(file);
  signs.push({
    key,
    name,
    codepoints,
    title: mark.title,
    fn: `${pascal(key)}Sign`,
    body: mark.body,
    shapes: mark.shapes,
  });
}

const emblemFile = `package com.astra.antiqua.ui.brand

import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.SolidColor
import androidx.compose.ui.graphics.StrokeCap
import androidx.compose.ui.graphics.StrokeJoin
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.graphics.vector.addPathNodes
import androidx.compose.ui.unit.dp
import com.astra.antiqua.model.AncientCulture

/**
 * GENERATED by web/scripts/gen-android-emblems.mjs from
 * docs/design/system/assets/marks. Do not edit; run
 * \`cd web && node scripts/gen-android-emblems.mjs\`.
 *
 * The five tier-2 culture emblems, the mark each culture is known by
 * (docs/design/culture-marks.md), on the 512 grid they were drawn on. Every
 * path is the designer's; the generator rescales nothing.
 *
 * Fill and stroke are black so the caller's tint decides the colour, which is
 * what lets one emblem take the culture accent on a doorway and the bone ink
 * in a list. The same five files feed the web surface through
 * web/scripts/export-marks.mjs, so neither surface has a mark the other lacks.
 */

/** Every mark paints black so the caller's tint is what decides its colour. */
internal val INK = SolidColor(Color.Black)

internal fun mark512(name: String, paths: ImageVector.Builder.() -> Unit): ImageVector =
    ImageVector.Builder(
        name = name,
        defaultWidth = 512.dp,
        defaultHeight = 512.dp,
        viewportWidth = 512f,
        viewportHeight = 512f,
    ).apply(paths).build()

/** Built once each: a vector is immutable and the same instance redraws freely. */
private val cache = HashMap<AncientCulture, ImageVector>()

/** The emblem [culture] is known by. */
fun cultureEmblem(culture: AncientCulture): ImageVector =
    cache.getOrPut(culture) {
        when (culture) {
${builders.map((b) => `            AncientCulture.${b.culture} -> ${b.fn}()`).join(NEWLINE)}
        }
    }

/** What the mark is, for the accessible name. */
fun emblemName(culture: AncientCulture): String =
    when (culture) {
${builders.map((b) => `        AncientCulture.${b.culture} -> ${kotlinString(b.name)}`).join(NEWLINE)}
    }

${builders
  .map(
    (b) => `/** ${b.title} */
private fun ${b.fn}(): ImageVector = mark512(${kotlinString(b.fn)}) {
${b.body}
}`,
  )
  .join(NEWLINE + NEWLINE)}
`;

const signFile = `package com.astra.antiqua.ui.brand

import androidx.compose.ui.graphics.StrokeCap
import androidx.compose.ui.graphics.StrokeJoin
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.graphics.vector.addPathNodes

/**
 * GENERATED by web/scripts/gen-android-emblems.mjs from
 * docs/design/system/assets/marks. Do not edit; run
 * \`cd web && node scripts/gen-android-emblems.mjs\`.
 *
 * The signs that exist as encoded characters, cut from their faces to
 * outlines. Where palaeographers have already drawn a sign from the material
 * record, the web surface sets it as type in the face that carries it; this
 * surface takes the outline instead, because the design prompt says Android
 * gets outlines and not fonts. The shape is the same shape either way.
 *
 * Each paints black and takes the caller's tint, like every other mark here.
 */
enum class TypesetSign(val markName: String, val codepoints: String) {
${signs.map((s) => `    ${s.key}(${kotlinString(s.name)}, ${kotlinString(s.codepoints)}),`).join(NEWLINE)}
}

private val signCache = HashMap<TypesetSign, ImageVector>()

/** The outline of [sign], on the 512 grid. */
fun typesetSign(sign: TypesetSign): ImageVector =
    signCache.getOrPut(sign) {
        when (sign) {
${signs.map((s) => `            TypesetSign.${s.key} -> ${s.fn}()`).join(NEWLINE)}
        }
    }

${signs
  .map(
    (s) => `/** ${s.title} */
private fun ${s.fn}(): ImageVector = mark512(${kotlinString(s.fn)}) {
${s.body}
}`,
  )
  .join(NEWLINE + NEWLINE)}
`;

await mkdir(OUT, { recursive: true });
await writeFile(path.join(OUT, "CultureEmblems.kt"), emblemFile);
await writeFile(path.join(OUT, "TypesetSigns.kt"), signFile);
console.log(
  `gen-android-emblems: wrote CultureEmblems.kt (` +
    builders.map((b) => `${b.culture.toLowerCase()} ${b.shapes}`).join(", ") +
    `) and TypesetSigns.kt (` +
    signs.map((s) => `${s.key.toLowerCase()} ${s.shapes}`).join(", ") +
    ` shapes)`,
);
