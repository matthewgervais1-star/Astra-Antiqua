/**
 * Generates the favicon, the apple-touch-icon and the PWA launcher set from
 * the design-system marks under docs/design/system/assets. The script draws
 * no mark of its own: every glyph is the SVG the design project shipped,
 * read from disk, recoloured and set on a culture ground from
 * docs/design/system/tokens/colors.css.
 *
 * Emits:
 *   src/app/icon.svg                     the monogram, colours fixed, on the neutral ground
 *   src/app/favicon.ico                  32x32 PNG-in-ICO of the monogram on the neutral ground
 *   public/icons/apple-touch-icon.png    180, monogram on the neutral ground
 *   public/icons/icon-192.png, icon-512.png, icon-maskable-512.png
 *                                        the neutral launcher (mk-neutral-a)
 *   public/icons/launcher-<culture>-512.png and -192.png
 *                                        one launcher per culture whose mark is an SVG
 *
 * Every launcher mark is rendered, its ink measured against the circle a
 * launcher mask cuts, and shrunk if it crosses. The favicon is drawn at 32 px
 * rather than downsampled, so the architrave stays one gold row.
 *
 * Run once after changing the design:  node scripts/generate-icons.mjs
 */
import sharp from "sharp";
import { existsSync } from "node:fs";
import { mkdir, readdir, readFile, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url));
const WEB_DIR = path.join(SCRIPT_DIR, "..");
const OUT_DIR = path.join(WEB_DIR, "public", "icons");
const APP_DIR = path.join(WEB_DIR, "src", "app");
const ASSETS = path.join(WEB_DIR, "..", "docs", "design", "system", "assets");
const MARKS = path.join(ASSETS, "marks");
const MONOGRAM = path.join(ASSETS, "wordmark", "monogram.svg");
const TOKENS = path.join(WEB_DIR, "..", "docs", "design", "system", "tokens", "colors.css");

const CANVAS = 512;
/**
 * The fit each launcher mark starts at (docs/design/canvas-1a/DECISIONS.md,
 * "Mask fitting is solved"). It is a starting point, not a guarantee: 0.66 is
 * a square, and a mark that fills its corners reaches further than the circle
 * a launcher mask cuts. Every mark is rendered, measured and shrunk if it
 * crosses SAFE_RADIUS, so the number that ships is the measured one.
 */
const MARK_FIT = 0.66;
/**
 * Android masks an adaptive icon to the middle 72dp of its 108dp canvas, so on
 * this 512 canvas the visible circle has radius 512 * 72 / 108 / 2. One pixel
 * of margin keeps an antialiased edge off the cut.
 */
const SAFE_RADIUS = (CANVAS * 72) / 108 / 2;
const SAFE_MARGIN = 1;
/** Render at 4x the SVG's own size and let sharp downsample; 512 is never upscaled. */
const DENSITY = 72 * 4;

/** The tab icon, rendered at its own size so the architrave lands on one row. */
const FAVICON_SIZE = 32;

const BONE = "#E6DECC";
/** The monogram's architrave is authored gold and stays gold outside the app. */
const ARCHITRAVE = "#B59A55";

/** Reads --name: #hex pairs out of tokens/colors.css. */
async function readTokens() {
  const css = await readFile(TOKENS, "utf8");
  const tokens = new Map();
  for (const [, name, hex] of css.matchAll(/--([a-z-]+):\s*(#[0-9A-Fa-f]{6})\b/g)) {
    tokens.set(name, hex.toUpperCase());
  }
  return tokens;
}

function token(tokens, name) {
  const value = tokens.get(name);
  if (!value) throw new Error(`tokens/colors.css has no --${name}`);
  return value;
}

/** The mark's viewBox and inner markup, comments and <title> removed. */
function parseMark(svgText) {
  const text = svgText.replace(/<!--[\s\S]*?-->/g, "");
  const open = text.match(/<svg\b([^>]*)>/);
  const close = text.lastIndexOf("</svg>");
  if (!open || close < 0) throw new Error("not an SVG document");
  const viewBox = open[1].match(/viewBox="([^"]+)"/);
  if (!viewBox) throw new Error("mark has no viewBox");
  const [minX, minY, width, height] = viewBox[1].trim().split(/[\s,]+/).map(Number);
  const inner = text
    .slice(open.index + open[0].length, close)
    .replace(/<title>[\s\S]*?<\/title>/g, "")
    .trim();
  return { minX, minY, width, height, inner };
}

const num = (v) => Number(v.toFixed(3)).toString();

/**
 * The transform that fits a mark's viewBox into a centred square of
 * `fit` x the canvas. For a 512-grid mark at 0.66 this is exactly
 * translate(87 87) scale(0.66).
 */
function fitTransform(mark, fit) {
  const box = CANVAS * fit;
  const scale = box / Math.max(mark.width, mark.height);
  const inset = Math.round((CANVAS - box) / 2);
  const tx = inset + (box - mark.width * scale) / 2 - mark.minX * scale;
  const ty = inset + (box - mark.height * scale) / 2 - mark.minY * scale;
  return `translate(${num(tx)} ${num(ty)}) scale(${num(scale)})`;
}

/**
 * A square canvas: ground rect, then the mark's own markup with currentColor
 * substituted. `transform` overrides the fit for a caller that places the mark
 * itself; `size` is both the SVG's declared size and its viewBox.
 */
function wrap(mark, { color, ground, fit = MARK_FIT, size = CANVAS, transform }) {
  const inner = mark.inner.replaceAll("currentColor", color);
  return Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <rect width="${size}" height="${size}" fill="${ground}"/>
  <g transform="${transform ?? fitTransform(mark, fit)}">
${inner}
  </g>
</svg>`,
  );
}

async function png(svg, size) {
  return sharp(svg, { density: DENSITY }).resize(size, size).png().toBuffer();
}

const rgb = (hex) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));

/**
 * The furthest any ink sits from the canvas centre, in canvas px. Ink is any
 * pixel that differs from the ground by more than an antialiasing step.
 */
async function inkRadius(svg, ground) {
  const { data, info } = await sharp(svg, { density: DENSITY })
    .resize(CANVAS, CANVAS)
    .raw()
    .toBuffer({ resolveWithObject: true });
  const [gr, gg, gb] = rgb(ground);
  const centre = (CANVAS - 1) / 2;
  let max = 0;
  for (let y = 0; y < info.height; y += 1) {
    for (let x = 0; x < info.width; x += 1) {
      const i = (y * info.width + x) * info.channels;
      const diff = Math.max(
        Math.abs(data[i] - gr),
        Math.abs(data[i + 1] - gg),
        Math.abs(data[i + 2] - gb),
      );
      if (diff <= 8) continue;
      const r = Math.hypot(x - centre, y - centre);
      if (r > max) max = r;
    }
  }
  return max;
}

/**
 * The mark on its ground, shrunk until its ink clears the launcher mask. A
 * mark whose ink sits off-centre in its own viewBox shrinks about the canvas
 * centre, so the measurement is repeated until it holds.
 */
async function fitInsideSafeCircle(name, mark, { color, ground }) {
  const limit = SAFE_RADIUS - SAFE_MARGIN;
  let fit = MARK_FIT;
  let svg = wrap(mark, { color, ground, fit });
  let radius = await inkRadius(svg, ground);
  const measured = radius;
  for (let pass = 0; pass < 4 && radius > limit; pass += 1) {
    fit *= limit / radius;
    svg = wrap(mark, { color, ground, fit });
    radius = await inkRadius(svg, ground);
  }
  if (radius > limit) throw new Error(`${name}: ink still reaches ${radius.toFixed(1)} px after four passes`);
  const note = fit === MARK_FIT ? "fit 0.66 as drawn" : `fit ${fit.toFixed(4)}, shrunk from 0.66`;
  console.log(
    `${name}: ink radius ${measured.toFixed(1)} px at 0.66, ${radius.toFixed(1)} px shipped ` +
      `(limit ${limit.toFixed(1)}), ${note}`,
  );
  return svg;
}

/** ICONDIR (6 bytes), one ICONDIRENTRY (16 bytes), then the PNG bytes. */
function icoFromPng(pngBytes, size) {
  const header = Buffer.alloc(6 + 16);
  header.writeUInt16LE(0, 0); // reserved
  header.writeUInt16LE(1, 2); // type: icon
  header.writeUInt16LE(1, 4); // image count
  header.writeUInt8(size, 6); // width
  header.writeUInt8(size, 7); // height
  header.writeUInt8(0, 8); // palette size: none
  header.writeUInt8(0, 9); // reserved
  header.writeUInt16LE(1, 10); // colour planes
  header.writeUInt16LE(32, 12); // bits per pixel
  header.writeUInt32LE(pngBytes.length, 14); // image bytes
  header.writeUInt32LE(header.length, 18); // image offset
  return Buffer.concat([header, pngBytes]);
}

const tokens = await readTokens();
const NEUTRAL_GROUND = token(tokens, "ground-neutral");
const NEUTRAL_ACCENT = token(tokens, "accent-neutral");

/** Cultures whose launcher mark is an SVG today. */
const LAUNCHERS = [
  { culture: "rome", file: "dr-lituus.svg" },
  { culture: "carthage", file: "em-tanit.svg" },
];
/**
 * Egypt, Greece and Canaan are typeset signs. Phase 3 outlines them into
 * these files; until a file exists its launcher is skipped with a note.
 */
const TYPESET_LAUNCHERS = [
  { culture: "egypt", file: "ts-ankh.svg" },
  { culture: "greece", file: "ts-omega.svg" },
  { culture: "canaan", file: "ts-il.svg" },
];

await mkdir(OUT_DIR, { recursive: true });
const produced = new Set();

async function writeIcon(file, bytes) {
  await writeFile(path.join(OUT_DIR, file), bytes);
  produced.add(file);
  console.log(`wrote public/icons/${file}`);
}

// The monogram: bone ink, gold architrave.
const monogramText = await readFile(MONOGRAM, "utf8");
const monogram = parseMark(monogramText);

// icon.svg: the file copied through, comment removed, currentColor fixed to
// bone (a favicon has no page to inherit from), architrave left gold.
const iconSvg = monogramText
  .replace(/<!--[\s\S]*?-->\n?/g, "")
  .replaceAll("currentColor", BONE)
  // A neutral-ground rect behind the mark, so the tab icon reads on a light
  // tab strip the same way favicon.ico does.
  .replace("</title>", `</title>\n<rect x="-12" y="-10" width="224" height="152" fill="${NEUTRAL_GROUND}"/>`);
if (!iconSvg.includes(ARCHITRAVE)) throw new Error("monogram.svg lost its architrave colour");
await writeFile(path.join(APP_DIR, "icon.svg"), iconSvg);
console.log("wrote src/app/icon.svg");

// favicon.ico. The architrave is one stroke on a 32 px tab icon, so it is
// drawn rather than downsampled: the mark is scaled until that stroke is
// exactly one device pixel and shifted until the stroke's top edge lands on a
// pixel boundary. Rendering at 512 and resampling to 32 blends the gold into
// the ground either side of it and no pixel comes out gold at all.
const architrave = monogramText.match(
  /<path\b[^>]*\bd="M\d+(?:\.\d+)? (\d+(?:\.\d+)?) H[^"]*"[^>]*stroke="#B59A55"[^>]*stroke-width="(\d+(?:\.\d+)?)"/,
);
if (!architrave) throw new Error("monogram.svg: cannot find the architrave stroke");
const [, ARCHITRAVE_Y, ARCHITRAVE_STROKE] = architrave.map(Number);

const faviconScale = 1 / ARCHITRAVE_STROKE;
const faviconTx = (FAVICON_SIZE - monogram.width * faviconScale) / 2 - monogram.minX * faviconScale;
const centredTy = (FAVICON_SIZE - monogram.height * faviconScale) / 2 - monogram.minY * faviconScale;
const barTop = (ARCHITRAVE_Y - ARCHITRAVE_STROKE / 2) * faviconScale;
const faviconTy = centredTy + (Math.round(centredTy + barTop) - (centredTy + barTop));
const faviconSvg = wrap(monogram, {
  color: BONE,
  ground: NEUTRAL_GROUND,
  size: FAVICON_SIZE,
  transform: `translate(${num(faviconTx)} ${num(faviconTy)}) scale(${num(faviconScale)})`,
});
// Density 72 renders the SVG user unit as one device pixel, so the canvas is
// FAVICON_SIZE across and the snapped architrave stays on its own row. A
// higher density would scale the whole thing and undo the snap.
const faviconPng = await sharp(faviconSvg, { density: 72 }).png().toBuffer();

// The snap is only worth its complication if the gold survives it.
const favRaw = await sharp(faviconPng).raw().toBuffer({ resolveWithObject: true });
const [ar, ag, ab] = rgb(ARCHITRAVE);
let goldPixels = 0;
for (let i = 0; i < favRaw.data.length; i += favRaw.info.channels) {
  if (favRaw.data[i] === ar && favRaw.data[i + 1] === ag && favRaw.data[i + 2] === ab) goldPixels += 1;
}
if (goldPixels === 0) throw new Error("favicon.ico: the architrave did not land on a pixel row");
await writeFile(path.join(APP_DIR, "favicon.ico"), icoFromPng(faviconPng, FAVICON_SIZE));
console.log(
  `wrote src/app/favicon.ico (${FAVICON_SIZE}x${FAVICON_SIZE}, PNG-in-ICO, ` +
    `${goldPixels} px of architrave at ${ARCHITRAVE})`,
);

await writeIcon("apple-touch-icon.png", await png(wrap(monogram, { color: BONE, ground: NEUTRAL_GROUND }), 180));

// The neutral launcher, also the manifest's plain and maskable icons.
const neutral = await fitInsideSafeCircle(
  "mk-neutral-a",
  parseMark(await readFile(path.join(MARKS, "mk-neutral-a.svg"), "utf8")),
  { color: NEUTRAL_ACCENT, ground: NEUTRAL_GROUND },
);
const neutral512 = await png(neutral, 512);
const neutral192 = await png(neutral, 192);
await writeIcon("icon-512.png", neutral512);
await writeIcon("icon-192.png", neutral192);
await writeIcon("icon-maskable-512.png", neutral512);
await writeIcon("launcher-neutral-512.png", neutral512);
await writeIcon("launcher-neutral-192.png", neutral192);

// The native iOS app's icon: the same neutral launcher, one 1024 square in the
// app's asset catalog (iOS cuts its own corners and derives every other size).
// Flattened with no alpha channel, which App Store Connect requires.
const IOS_ASSETS = path.join(WEB_DIR, "..", "ios", "AstraAntiqua", "Assets.xcassets");
const IOS_ICONSET = path.join(IOS_ASSETS, "AppIcon.appiconset");
await mkdir(IOS_ICONSET, { recursive: true });
await writeFile(
  path.join(IOS_ICONSET, "AppIcon-1024.png"),
  await sharp(Buffer.from(neutral), { density: DENSITY * 2 }).resize(1024, 1024).flatten({ background: NEUTRAL_GROUND }).removeAlpha().png().toBuffer(),
);
await writeFile(
  path.join(IOS_ICONSET, "Contents.json"),
  `${JSON.stringify({ images: [{ filename: "AppIcon-1024.png", idiom: "universal", platform: "ios", size: "1024x1024" }], info: { author: "xcode", version: 1 } }, null, 2)}\n`,
);
await writeFile(path.join(IOS_ASSETS, "Contents.json"), `${JSON.stringify({ info: { author: "xcode", version: 1 } }, null, 2)}\n`);
console.log("wrote ios/AstraAntiqua/Assets.xcassets/AppIcon.appiconset/AppIcon-1024.png (1024, no alpha)");

for (const { culture, file } of [...LAUNCHERS, ...TYPESET_LAUNCHERS]) {
  const source = path.join(MARKS, file);
  if (!existsSync(source)) {
    console.log(`skip launcher-${culture}: marks/${file} is absent (typeset sign, outlined in Phase 3)`);
    continue;
  }
  const svg = await fitInsideSafeCircle(file, parseMark(await readFile(source, "utf8")), {
    color: token(tokens, `accent-${culture}`),
    ground: token(tokens, `ground-${culture}`),
  });
  await writeIcon(`launcher-${culture}-512.png`, await png(svg, 512));
  await writeIcon(`launcher-${culture}-192.png`, await png(svg, 192));
}

// Anything left in public/icons that this script no longer produces goes.
for (const file of await readdir(OUT_DIR)) {
  if (!produced.has(file)) {
    await unlink(path.join(OUT_DIR, file));
    console.log(`removed public/icons/${file}`);
  }
}
