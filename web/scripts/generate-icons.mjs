/**
 * Generates the PWA icon set in public/icons/ from a programmatic SVG:
 * the "Instrument in the Temple" identity. Flat neutral ground, two incised
 * 1px inset rules, an AA monogram built from straight-stroke polygons
 * (bone over harmony gold), and a single gold rule beneath.
 *
 * Run once after changing the design:  node scripts/generate-icons.mjs
 */
import sharp from "sharp";
import { mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const OUT_DIR = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "public", "icons");

const GROUND = "#171310";
const BONE = "#E6DECC";
const GOLD = "#B59A55";
const RULE_OUTER = "rgba(230,222,204,0.35)";
const RULE_INNER = "rgba(230,222,204,0.16)";

const CANVAS = 512;
const CENTER = CANVAS / 2;

/**
 * Capital A letterform as pure polygons: two angled legs and a crossbar,
 * every stroke 10px wide (perpendicular), sharp corners throughout.
 * Three convex quads, no holes; the legs overlap under the flat apex,
 * which is invisible in a single fill color.
 * Local coordinates: x is centered on the letter axis, y runs 0 (top)
 * to H (baseline).
 */
const A = {
  H: 150, // letter height
  S: 60, // half-width at the baseline
  APEX: 8, // half-width of the flat apex
  STROKE: 10, // perpendicular stroke width of legs and crossbar
  BAR_TOP: 92, // crossbar top edge (y)
};

/** Horizontal inset of a leg's inner edge from its outer edge. */
function legRun() {
  const slope = Math.atan((A.S - A.APEX) / A.H);
  return A.STROKE / Math.cos(slope);
}

/** Outer-edge x of the right leg at height y (mirror for the left leg). */
function outerX(y) {
  return A.APEX + ((A.S - A.APEX) * y) / A.H;
}

/**
 * Path data for one letter A. `tx`/`ty` map local letter coordinates into
 * canvas space (they carry both placement and the maskable scale).
 */
function letterAPath(tx, ty) {
  const run = legRun();
  const innerX = (y) => outerX(y) - run; // inner leg edge, right side
  const barBot = A.BAR_TOP + A.STROKE;

  const p = (x, y) => `${tx(x).toFixed(2)} ${ty(y).toFixed(2)}`;

  const leftLeg = `M ${p(-A.APEX, 0)} L ${p(-A.APEX + run, 0)} L ${p(-innerX(A.H), A.H)} L ${p(-A.S, A.H)} Z`;
  const rightLeg = `M ${p(A.APEX, 0)} L ${p(A.S, A.H)} L ${p(innerX(A.H), A.H)} L ${p(A.APEX - run, 0)} Z`;
  const crossbar =
    `M ${p(-innerX(A.BAR_TOP), A.BAR_TOP)} L ${p(innerX(A.BAR_TOP), A.BAR_TOP)} ` +
    `L ${p(innerX(barBot), barBot)} L ${p(-innerX(barBot), barBot)} Z`;

  return `${leftLeg} ${rightLeg} ${crossbar}`;
}

/** Crisp 1px inset rule rect, stroke centered on the half-pixel. */
function insetRuleRect(inset, color, coord) {
  const lo = Math.round(coord(inset));
  const hi = Math.round(coord(CANVAS - inset));
  const span = hi - lo - 1;
  return `<rect x="${lo + 0.5}" y="${lo + 0.5}" width="${span}" height="${span}" fill="none" stroke="${color}" stroke-width="1"/>`;
}

/** Full icon artwork at a given scale (1 = standard, <1 leaves maskable safe-zone padding). */
function iconSvg(scale) {
  const coord = (v) => CENTER + (v - CENTER) * scale;

  // Monogram layout: two 120px-wide As overlapping by ~25 percent.
  const letterW = 2 * A.S;
  const offset = letterW * 0.75; // second A shifted right, 25 percent overlap
  const firstCx = CENTER - offset / 2;
  const secondCx = CENTER + offset / 2;
  const topY = 168;

  const mapA = (cx) => ({
    tx: (x) => coord(cx + x),
    ty: (y) => coord(topY + y),
  });
  const first = mapA(firstCx);
  const second = mapA(secondCx);

  // Single 64x1 gold rule below the monogram.
  const ruleY = Math.round(coord(350));
  const ruleW = 64 * scale;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${CANVAS}" height="${CANVAS}" viewBox="0 0 ${CANVAS} ${CANVAS}">
  <rect width="${CANVAS}" height="${CANVAS}" fill="${GROUND}"/>
  ${insetRuleRect(28, RULE_OUTER, coord)}
  ${insetRuleRect(44, RULE_INNER, coord)}
  <path d="${letterAPath(first.tx, first.ty)}" fill="${BONE}"/>
  <path d="${letterAPath(second.tx, second.ty)}" fill="${GOLD}"/>
  <rect x="${(CENTER - ruleW / 2).toFixed(2)}" y="${ruleY}" width="${ruleW.toFixed(2)}" height="1" fill="${GOLD}"/>
</svg>`;
}

await mkdir(OUT_DIR, { recursive: true });

const standard = Buffer.from(iconSvg(1));
const maskable = Buffer.from(iconSvg(0.72));

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
