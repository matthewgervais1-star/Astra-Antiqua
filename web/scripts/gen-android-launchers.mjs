/**
 * Generates the Android adaptive launcher icons from the design-system marks.
 *
 *   cd web && node scripts/gen-android-launchers.mjs
 *
 * One icon per culture plus neutral. Each is a VectorDrawable pair on the
 * 108dp adaptive canvas: a foreground carrying the culture's mark in the
 * culture's accent, and a background that is a flat fill of the culture's
 * ground. A mipmap in mipmap-anydpi-v26 pairs them, and AndroidManifest.xml
 * points one activity-alias per culture at its mipmap.
 *
 * The script draws nothing. It reads each mark from
 * docs/design/system/assets/marks, converts its circles, rects, lines,
 * polylines and polygons to path data (a VectorDrawable has only <path>) and
 * carries every path's own d string and stroke attributes through unchanged.
 * Colours come from docs/design/system/tokens/colors.css and are written to
 * res/values/colors.xml, so a drawable names @color/accent_rome rather than a
 * hex literal; ui/theme/Color.kt carries the same values for Compose, which
 * cannot read an XML resource as a Compose Color without a context.
 *
 * Fit. A launcher masks the icon to the middle 72dp of the 108dp canvas, so
 * every mark is rasterised, its ink measured against that circle, and scaled
 * until it clears with a dp to spare. Only the fit changes; the geometry does
 * not. This lives in web/scripts beside the other Node tooling because sharp
 * is installed there, the way fetch-fonts.mjs already writes Android font
 * resources from here.
 *
 * The shape conversion it shares with the glyph generator lives in
 * svg-shapes.mjs, written out rather than taken from an SVG library because
 * this surface's node_modules is a pnpm tree that npm's resolver will not add to.
 */
import sharp from "sharp";
import { fail, flatten, parseDocument, parseElements } from "./svg-shapes.mjs";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.join(SCRIPT_DIR, "..", "..");
const MARKS = path.join(REPO, "docs", "design", "system", "assets", "marks");
const TOKENS = path.join(REPO, "docs", "design", "system", "tokens", "colors.css");
const RES = path.join(REPO, "android", "app", "src", "main", "res");

/** The adaptive canvas, and the circle a launcher mask leaves visible. */
const CANVAS = 108;
const SAFE_RADIUS = 36;
const SAFE_MARGIN = 1;
/** Rasterise at this size to measure ink; big enough that a hairline shows. */
const PROBE = 512;

const CULTURES = [
  { culture: "neutral", mark: "mk-neutral-a.svg" },
  { culture: "egypt", mark: "ts-ankh.svg" },
  { culture: "greece", mark: "ts-omega.svg" },
  { culture: "canaan", mark: "ts-il.svg" },
  { culture: "carthage", mark: "em-tanit.svg" },
  { culture: "rome", mark: "dr-lituus.svg" },
];

const CAPS = { butt: "butt", round: "round", square: "square" };
const JOINS = { miter: "miter", round: "round", bevel: "bevel" };

/** Trims a computed transform value; the mark's own numbers are never touched. */
const n = (v) => Number(Number(v).toFixed(3));

/** Reads --name: #hex pairs out of tokens/colors.css. */
async function readTokens() {
  const css = await readFile(TOKENS, "utf8");
  const tokens = new Map();
  for (const [, name, hex] of css.matchAll(/--([a-z-]+):\s*(#[0-9A-Fa-f]{6})\b/g)) tokens.set(name, hex.toUpperCase());
  return tokens;
}

function vectorPath(pathSpec, colorRef) {
  const a = pathSpec.attrs;
  const lines = [`        android:pathData="${pathSpec.d}"`];
  const fill = a.fill ?? "none";
  const stroke = a.stroke ?? "none";
  if (fill !== "none") {
    if (fill !== "currentColor") fail(`a fill of ${fill}; the marks paint in currentColor only`);
    lines.push(`        android:fillColor="${colorRef}"`);
  }
  if (stroke !== "none") {
    if (stroke !== "currentColor") fail(`a stroke of ${stroke}; the marks paint in currentColor only`);
    lines.push(`        android:strokeColor="${colorRef}"`);
    lines.push(`        android:strokeWidth="${a["stroke-width"] ?? 1}"`);
    const cap = a["stroke-linecap"];
    const join = a["stroke-linejoin"];
    if (cap) lines.push(`        android:strokeLineCap="${CAPS[cap] ?? fail(`unknown linecap ${cap}`)}"`);
    if (join) lines.push(`        android:strokeLineJoin="${JOINS[join] ?? fail(`unknown linejoin ${join}`)}"`);
  }
  return `    <path\n${lines.join("\n")} />`;
}

/** The mark's ink, as a radius from the canvas centre, at a given fit. */
async function inkRadiusAt(mark, fit) {
  const scale = (PROBE * fit) / mark.size;
  const offset = (PROBE - mark.size * scale) / 2;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${PROBE}" height="${PROBE}" viewBox="0 0 ${PROBE} ${PROBE}">
<rect width="${PROBE}" height="${PROBE}" fill="#000000"/>
<g transform="translate(${offset} ${offset}) scale(${scale}) translate(${-mark.minX} ${-mark.minY})">${mark.inner.replaceAll("currentColor", "#FFFFFF")}</g>
</svg>`;
  // sharp renders an SVG at its declared size times density/72, so the raster
  // is wider than PROBE and the measurement is taken against its own width.
  const { data, info } = await sharp(Buffer.from(svg), { density: 288 }).raw().toBuffer({ resolveWithObject: true });
  const centre = (info.width - 1) / 2;
  let max = 0;
  for (let y = 0; y < info.height; y += 1) {
    for (let x = 0; x < info.width; x += 1) {
      if (data[(y * info.width + x) * info.channels] <= 8) continue;
      const r = Math.hypot(x - centre, y - centre);
      if (r > max) max = r;
    }
  }
  return (max / info.width) * CANVAS; // in canvas units
}

const tokens = await readTokens();
const colorNames = [];
for (const { culture } of CULTURES) {
  colorNames.push([`accent_${culture}`, tokens.get(`accent-${culture}`) ?? fail(`no --accent-${culture}`)]);
  colorNames.push([`ground_${culture}`, tokens.get(`ground-${culture}`) ?? fail(`no --ground-${culture}`)]);
}
await mkdir(path.join(RES, "values"), { recursive: true });
await writeFile(
  path.join(RES, "values", "colors.xml"),
  `<?xml version="1.0" encoding="utf-8"?>
<!--
  The culture grounds and accents, generated from
  docs/design/system/tokens/colors.css by web/scripts/gen-android-launchers.mjs.
  The launcher drawables name these rather than a hex literal.
  ui/theme/Color.kt carries the same values for Compose.
-->
<resources>
${colorNames.map(([name, hex]) => `    <color name="${name}">${hex}</color>`).join("\n")}
</resources>
`,
);
console.log(`wrote res/values/colors.xml (${colorNames.length} colours)`);

await mkdir(path.join(RES, "drawable"), { recursive: true });
await mkdir(path.join(RES, "mipmap-anydpi-v26"), { recursive: true });

for (const { culture, mark: markFile } of CULTURES) {
  const { minX, minY, width, height, inner } = parseDocument(await readFile(path.join(MARKS, markFile), "utf8"));
  if (width !== height) fail(`${markFile} is not square`);
  const mark = { inner, minX, minY, size: width };

  let fit = 0.66;
  let radius = await inkRadiusAt(mark, fit);
  const measured = radius;
  for (let pass = 0; pass < 4 && radius > SAFE_RADIUS - SAFE_MARGIN; pass += 1) {
    fit *= (SAFE_RADIUS - SAFE_MARGIN) / radius;
    radius = await inkRadiusAt(mark, fit);
  }
  if (radius > SAFE_RADIUS - SAFE_MARGIN) fail(`${markFile}: ink still reaches ${radius.toFixed(1)}dp`);

  const scale = (CANVAS * fit) / width;
  const translate = (CANVAS - width * scale) / 2;
  const paths = flatten(parseElements(inner)).map((p) => vectorPath(p, `@color/accent_${culture}`));
  const base = culture === "neutral" ? "ic_launcher" : `ic_launcher_${culture}`;

  const foreground = `<?xml version="1.0" encoding="utf-8"?>
<!--
  ${culture}: ${markFile} from docs/design/system/assets/marks, generated by
  web/scripts/gen-android-launchers.mjs. The mark's geometry is the design
  system's; only the group transform is this file's, and it fits the mark
  inside the ${SAFE_RADIUS}dp circle a launcher mask leaves visible
  (measured ink radius ${radius.toFixed(1)}dp at fit ${fit.toFixed(4)}).
-->
<vector xmlns:android="http://schemas.android.com/apk/res/android"
    android:width="${CANVAS}dp"
    android:height="${CANVAS}dp"
    android:viewportWidth="${CANVAS}"
    android:viewportHeight="${CANVAS}">
  <group
      android:scaleX="${n(scale)}"
      android:scaleY="${n(scale)}"
      android:translateX="${n(translate - minX * scale)}"
      android:translateY="${n(translate - minY * scale)}">
${paths.join("\n")}
  </group>
</vector>
`;
  const background = `<?xml version="1.0" encoding="utf-8"?>
<!--
  ${culture}'s ground, flat, generated by web/scripts/gen-android-launchers.mjs.
  No gradient: the identity's only ornament is an incised line.
-->
<vector xmlns:android="http://schemas.android.com/apk/res/android"
    android:width="${CANVAS}dp"
    android:height="${CANVAS}dp"
    android:viewportWidth="${CANVAS}"
    android:viewportHeight="${CANVAS}">
    <path
        android:fillColor="@color/ground_${culture}"
        android:pathData="M0,0h${CANVAS}v${CANVAS}h-${CANVAS}z" />
</vector>
`;
  const mipmap = `<?xml version="1.0" encoding="utf-8"?>
<adaptive-icon xmlns:android="http://schemas.android.com/apk/res/android">
    <background android:drawable="@drawable/${base}_background" />
    <foreground android:drawable="@drawable/${base}_foreground" />
</adaptive-icon>
`;
  await writeFile(path.join(RES, "drawable", `${base}_foreground.xml`), foreground);
  await writeFile(path.join(RES, "drawable", `${base}_background.xml`), background);
  await writeFile(path.join(RES, "mipmap-anydpi-v26", `${base}.xml`), mipmap);
  await writeFile(path.join(RES, "mipmap-anydpi-v26", `${base}_round.xml`), mipmap);
  console.log(
    `${culture}: ${markFile}, ${paths.length} path(s), ink ${measured.toFixed(1)}dp at 0.66 ` +
      `-> ${radius.toFixed(1)}dp at fit ${fit.toFixed(4)} (limit ${SAFE_RADIUS - SAFE_MARGIN}dp)`,
  );
}
