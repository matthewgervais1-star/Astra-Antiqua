/**
 * Generates the PWA icon set in public/icons/ from a programmatic SVG:
 * an eight-pointed gold star (four long cardinal points, four short
 * diagonals) on the site's void background, ringed like an ephemeris dial.
 *
 * Run once after changing the design:  node scripts/generate-icons.mjs
 */
import sharp from "sharp";
import { mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const OUT_DIR = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "public", "icons");

const VOID = "#050505";
const GOLD_LEAF = "#d4af37";
const GOLD_BRIGHT = "#f4d03f";
const GOLD_DEEP = "#a8842c";

/** Eight-pointed star outline as an SVG path, centered on (cx, cy). */
function starPath(cx, cy, longR, shortR, waistR) {
  const pts = [];
  for (let k = 0; k < 8; k++) {
    const outerAngle = (k * 45 * Math.PI) / 180;
    const waistAngle = ((k * 45 + 22.5) * Math.PI) / 180;
    const outer = k % 2 === 0 ? longR : shortR;
    pts.push([cx + outer * Math.sin(outerAngle), cy - outer * Math.cos(outerAngle)]);
    pts.push([cx + waistR * Math.sin(waistAngle), cy - waistR * Math.cos(waistAngle)]);
  }
  return (
    pts.map(([x, y], i) => `${i === 0 ? "M" : "L"} ${x.toFixed(2)} ${y.toFixed(2)}`).join(" ") + " Z"
  );
}

/** Full icon artwork at a given scale (1 = standard, <1 leaves maskable safe-zone padding). */
function iconSvg(scale) {
  const c = 256;
  const s = (v) => v * scale;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
  <defs>
    <radialGradient id="g" cx="50%" cy="42%" r="60%">
      <stop offset="0%" stop-color="${GOLD_BRIGHT}"/>
      <stop offset="55%" stop-color="${GOLD_LEAF}"/>
      <stop offset="100%" stop-color="${GOLD_DEEP}"/>
    </radialGradient>
  </defs>
  <rect width="512" height="512" fill="${VOID}"/>
  <circle cx="${c}" cy="${c}" r="${s(232)}" fill="none" stroke="${GOLD_DEEP}" stroke-width="${s(3)}" opacity="0.85"/>
  <circle cx="${c}" cy="${c}" r="${s(214)}" fill="none" stroke="${GOLD_DEEP}" stroke-width="${s(1.5)}" opacity="0.4"/>
  <path d="${starPath(c, c, s(196), s(118), s(52))}" fill="url(#g)"/>
  <circle cx="${c}" cy="${c}" r="${s(26)}" fill="${VOID}"/>
  <circle cx="${c}" cy="${c}" r="${s(17)}" fill="${GOLD_BRIGHT}"/>
</svg>`;
}

await mkdir(OUT_DIR, { recursive: true });

const standard = Buffer.from(iconSvg(1));
const maskable = Buffer.from(iconSvg(0.76));

const jobs = [
  ["icon-192.png", standard, 192],
  ["icon-512.png", standard, 512],
  ["icon-maskable-512.png", maskable, 512],
  ["apple-touch-icon.png", standard, 180],
];

for (const [file, svg, size] of jobs) {
  await sharp(svg, { density: 300 }).resize(size, size).png().toFile(path.join(OUT_DIR, file));
  console.log(`wrote public/icons/${file} (${size}x${size})`);
}
