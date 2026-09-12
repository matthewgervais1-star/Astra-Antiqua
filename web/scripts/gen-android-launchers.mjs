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
 * This surface's node_modules is a pnpm tree that npm will not add to, so the
 * converter is written out rather than taking an SVG library.
 */
import sharp from "sharp";
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

function fail(message) {
  throw new Error(`gen-android-launchers: ${message}`);
}

async function readTokens() {
  const css = await readFile(TOKENS, "utf8");
  const tokens = new Map();
  for (const [, name, hex] of css.matchAll(/--([a-z-]+):\s*(#[0-9A-Fa-f]{6})\b/g)) tokens.set(name, hex.toUpperCase());
  return tokens;
}

/** A minimal element tree for the mark SVGs, which the SVG gate keeps well formed. */
function parseElements(inner) {
  const nodes = [];
  const stack = [{ children: nodes }];
  const tag = /<(\/?)([a-zA-Z][\w-]*)((?:\s+[\w:-]+\s*=\s*"[^"]*")*)\s*(\/?)>/g;
  let m;
  while ((m = tag.exec(inner))) {
    const [, closing, name, attrText, selfClosing] = m;
    if (closing) {
      stack.pop();
      continue;
    }
    const attrs = {};
    for (const [, key, value] of attrText.matchAll(/([\w:-]+)\s*=\s*"([^"]*)"/g)) attrs[key] = value;
    const node = { name, attrs, children: [] };
    stack[stack.length - 1].children.push(node);
    if (!selfClosing) stack.push(node);
  }
  return nodes;
}

const n = (v) => Number(Number(v).toFixed(3));

/** Every shape the marks use, as path data. A VectorDrawable has only <path>. */
function shapeToPathData(node) {
  const a = node.attrs;
  const points = (raw) =>
    raw
      .trim()
      .split(/[\s,]+/)
      .map(Number);
  switch (node.name) {
    case "path":
      return a.d ?? fail("a <path> with no d");
    case "circle": {
      const cx = Number(a.cx);
      const cy = Number(a.cy);
      const r = Number(a.r);
      return `M${n(cx - r)},${n(cy)} a${n(r)},${n(r)} 0 1,0 ${n(2 * r)},0 a${n(r)},${n(r)} 0 1,0 ${n(-2 * r)},0 Z`;
    }
    case "ellipse": {
      const cx = Number(a.cx);
      const cy = Number(a.cy);
      const rx = Number(a.rx);
      const ry = Number(a.ry);
      return `M${n(cx - rx)},${n(cy)} a${n(rx)},${n(ry)} 0 1,0 ${n(2 * rx)},0 a${n(rx)},${n(ry)} 0 1,0 ${n(-2 * rx)},0 Z`;
    }
    case "rect": {
      const x = Number(a.x ?? 0);
      const y = Number(a.y ?? 0);
      const w = Number(a.width);
      const h = Number(a.height);
      if (a.rx || a.ry) fail("a rounded rect, which this identity does not use");
      return `M${n(x)},${n(y)} h${n(w)} v${n(h)} h${n(-w)} Z`;
    }
    case "line":
      return `M${n(a.x1)},${n(a.y1)} L${n(a.x2)},${n(a.y2)}`;
    case "polyline": {
      const p = points(a.points);
      let d = `M${n(p[0])},${n(p[1])}`;
      for (let i = 2; i < p.length; i += 2) d += ` L${n(p[i])},${n(p[i + 1])}`;
      return d;
    }
    case "polygon": {
      const p = points(a.points);
      let d = `M${n(p[0])},${n(p[1])}`;
      for (let i = 2; i < p.length; i += 2) d += ` L${n(p[i])},${n(p[i + 1])}`;
      return `${d} Z`;
    }
    default:
      return fail(`the mark uses <${node.name}>, which this converter does not handle`);
  }
}

const CAPS = { butt: "butt", round: "round", square: "square" };
const JOINS = { miter: "miter", round: "round", bevel: "bevel" };

/** Flattens the mark's tree into paths, resolving inherited paint attributes. */
function flatten(nodes, inherited = {}) {
  const out = [];
  for (const node of nodes) {
    const attrs = { ...inherited, ...node.attrs };
    if (node.name === "g") {
      out.push(...flatten(node.children, attrs));
      continue;
    }
    if (node.name === "title" || node.name === "desc") continue;
    out.push({ d: shapeToPathData(node), attrs });
  }
  return out;
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
  const text = await readFile(path.join(MARKS, markFile), "utf8");
  const open = text.match(/<svg\b([^>]*)>/);
  const viewBox = open[1].match(/viewBox="([^"]+)"/);
  const [minX, minY, width, height] = viewBox[1].trim().split(/[\s,]+/).map(Number);
  if (width !== height) fail(`${markFile} is not square`);
  const inner = text
    .slice(open.index + open[0].length, text.lastIndexOf("</svg>"))
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/<title>[\s\S]*?<\/title>/g, "")
    .trim();
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
