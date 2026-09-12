/**
 * Generates the wordmark and the monogram as Compose ImageVectors.
 *
 *   cd web && node scripts/gen-android-brand.mjs
 *
 * Reads docs/design/system/assets/wordmark/wordmark-horizontal.svg and
 * monogram.svg and writes ui/brand/BrandMarks.kt. Both keep their own
 * viewports, so a caller sizes them by height and the aspect follows, and
 * every path's d string, stroke width and join are the designer's.
 *
 * Colour is a parameter rather than a tint. The wordmark is one ink, but the
 * monogram is two: bone letters and an architrave the design system says
 * should follow the active culture (docs/design/system/guidelines/monogram.html).
 * A tint would flatten those into one, so each builder takes the colours it
 * needs and paints the paths with them.
 *
 * Group transforms are carried through: the wordmark is twelve letters, each
 * in its own translated group, and the generator emits a Compose group per
 * translate rather than folding the offsets into the path data.
 */
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { fail, parseDocument, parseElements, shapeToPathData } from "./svg-shapes.mjs";

const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.join(SCRIPT_DIR, "..", "..");
const WORDMARK_DIR = path.join(REPO, "docs", "design", "system", "assets", "wordmark");
const OUT = path.join(
  REPO, "android", "app", "src", "main", "java", "com", "astra", "antiqua", "ui", "brand",
);

/** The monogram's architrave, authored gold and wired to the culture accent. */
const ARCHITRAVE = "#B59A55";

const JOINS = { miter: "Miter", round: "Round", bevel: "Bevel" };
const CAPS = { butt: "Butt", round: "Round", square: "Square" };

const kotlinString = (s) => `"${s.replace(/\\/g, "\\\\").replace(/"/g, '\\"').replace(/\$/g, "\\$")}"`;

/** translate(x y) or translate(x), the only transform these two marks use. */
function translationOf(node) {
  const transform = node.attrs.transform;
  if (!transform) return null;
  const m = transform.trim().match(/^translate\(\s*(-?[\d.]+)(?:[\s,]+(-?[\d.]+))?\s*\)$/);
  if (!m) fail(`the mark uses the transform "${transform}", which this generator does not read`);
  return { x: Number(m[1]), y: Number(m[2] ?? 0) };
}

/**
 * Emits addPath and group calls. `paint` maps an SVG colour to the Kotlin
 * expression that paints it, so the caller decides what bone and gold mean.
 */
function emit(nodes, paint, inherited = {}, indent = "        ") {
  const out = [];
  for (const node of nodes) {
    const attrs = { ...inherited, ...node.attrs };
    if (node.name === "title" || node.name === "desc") continue;
    if (node.name === "g") {
      const t = translationOf(node);
      if (!t) {
        out.push(...emit(node.children, paint, attrs, indent));
        continue;
      }
      out.push(`${indent}group(translationX = ${t.x}f, translationY = ${t.y}f) {`);
      out.push(...emit(node.children, paint, attrs, `${indent}    `));
      out.push(`${indent}}`);
      continue;
    }
    const d = shapeToPathData(node);
    const fillAttr = attrs.fill ?? "none";
    const strokeAttr = attrs.stroke ?? "none";
    if (fillAttr === "none" && strokeAttr === "none") fail("a shape with neither fill nor stroke");
    const args = [`pathData = addPathNodes(${kotlinString(d)})`];
    if (fillAttr !== "none") args.push(`fill = ${paint(fillAttr)}`);
    if (strokeAttr !== "none") {
      args.push(`stroke = ${paint(strokeAttr)}`);
      args.push(`strokeLineWidth = ${Number(attrs["stroke-width"] ?? 1)}f`);
      const cap = attrs["stroke-linecap"];
      const join = attrs["stroke-linejoin"];
      if (cap) args.push(`strokeLineCap = StrokeCap.${CAPS[cap] ?? fail(`linecap ${cap}`)}`);
      if (join) args.push(`strokeLineJoin = StrokeJoin.${JOINS[join] ?? fail(`linejoin ${join}`)}`);
    }
    out.push(`${indent}addPath(`);
    for (const arg of args) out.push(`${indent}    ${arg},`);
    out.push(`${indent})`);
  }
  return out;
}

async function read(name) {
  const doc = parseDocument(await readFile(path.join(WORDMARK_DIR, name), "utf8"));
  return { doc, nodes: parseElements(doc.inner) };
}

const wordmark = await read("wordmark-horizontal.svg");
const monogram = await read("monogram.svg");

const wordmarkPaths = emit(wordmark.nodes, (colour) => {
  if (colour !== "currentColor") fail(`the wordmark paints in ${colour}`);
  return "SolidColor(ink)";
});
const monogramPaths = emit(monogram.nodes, (colour) => {
  if (colour === "currentColor") return "SolidColor(ink)";
  if (colour.toUpperCase() === ARCHITRAVE) return "SolidColor(architrave)";
  return fail(`the monogram paints in ${colour}`);
});

const vector = (name, doc, paths, params) => `fun ${name}(${params}): ImageVector =
    ImageVector.Builder(
        name = ${kotlinString(name)},
        defaultWidth = ${doc.width}.dp,
        defaultHeight = ${doc.height}.dp,
        viewportWidth = ${doc.width}f,
        viewportHeight = ${doc.height}f,
    ).apply {
        // The viewBox starts at (${doc.minX}, ${doc.minY}), which an ImageVector viewport
        // cannot express, so the whole mark is shifted into a viewport that
        // starts at the origin. The geometry is otherwise the designer's.
        group(translationX = ${-doc.minX}f, translationY = ${-doc.minY}f) {
${paths.map((line) => `    ${line}`).join("\n")}
        }
    }.build()`;

const file = `package com.astra.antiqua.ui.brand

import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.SolidColor
import androidx.compose.ui.graphics.StrokeCap
import androidx.compose.ui.graphics.StrokeJoin
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.graphics.vector.addPathNodes
import androidx.compose.ui.graphics.vector.group
import androidx.compose.ui.unit.dp

/**
 * GENERATED by web/scripts/gen-android-brand.mjs from
 * docs/design/system/assets/wordmark. Do not edit; run
 * \`cd web && node scripts/gen-android-brand.mjs\`.
 *
 * The horizontal lockup and the monogram, geometry verbatim. Colour is a
 * parameter rather than a tint because the monogram is two inks: bone letters
 * and an architrave that follows the active culture's accent.
 *
 * ${wordmark.doc.title}
 * ${monogram.doc.title}
 */

${vector("wordmarkVector", wordmark.doc, wordmarkPaths, "ink: Color")}

${vector("monogramVector", monogram.doc, monogramPaths, "ink: Color, architrave: Color")}
`;

await mkdir(OUT, { recursive: true });
await writeFile(path.join(OUT, "BrandMarks.kt"), file);
console.log(
  `gen-android-brand: wrote BrandMarks.kt, wordmark ${wordmark.doc.width}x${wordmark.doc.height} ` +
    `(${wordmarkPaths.filter((l) => l.trim() === "addPath(").length} paths), ` +
    `monogram ${monogram.doc.width}x${monogram.doc.height} ` +
    `(${monogramPaths.filter((l) => l.trim() === "addPath(").length} paths), ${file.length} bytes`,
);
