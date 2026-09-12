/**
 * Converts the three typeset launcher signs to outlines, once, at build time.
 *
 *   cd web && node scripts/outline-signs.mjs
 *
 * Egypt's mark is the ankh U+2625, Greece's is omega U+03A9, and Canaan's is
 * the two Ugaritic letters U+1039B U+1038D (docs/design/culture-marks.md).
 * Each exists as an encoded character rather than a drawing, so palaeographers
 * have already cut it and the design system sets it as type rather than
 * redrawing it (docs/design/system/readme.md, Iconography). Neither platform
 * may depend on those fonts at runtime for an icon, so each sign becomes a
 * path here and ships as
 * docs/design/system/assets/marks/ts-{ankh,omega,il}.svg on the same 512 grid
 * and the same fill="currentColor" convention as the drawn marks.
 *
 * The glyph geometry is the font's own, scaled and centred and nothing else.
 * This script reads the TrueType tables directly (head, maxp, cmap, loca,
 * glyf, hhea, hmtx) rather than taking a font library, because this
 * repository's node_modules is a pnpm tree that npm's resolver will not add to.
 * Quadratic contours become SVG Q commands with TrueType's implied on-curve
 * midpoints; composite glyphs are followed through their component
 * transforms; anything else fails loudly.
 *
 * TODO: the weighted cut. The design notes record that the hieroglyph-class
 * signs go thin at 48px and want a heavier cut of the same outline, same
 * shape, more weight (docs/design/canvas-1a/DECISIONS.md, "What this costs in
 * engineering"). That is type work rather than illustration and is not
 * attempted here; this script ships the plain outline.
 */
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url));
const OUT_DIR = path.join(SCRIPT_DIR, "..", "..", "docs", "design", "system", "assets", "marks");

const CANVAS = 512;
/** The sign's bounding box spans this share of the canvas, as the drawn marks do. */
const FIT = 0.66;

/**
 * The three signs. Each names the family that actually carries its codepoint.
 * The design system's tokens/fonts.css names Noto Sans Symbols 2 for the ankh;
 * that family has no U+2625 on Google Fonts, so the outline is cut from Noto
 * Sans Symbols, which does. Nothing else departs from the design system.
 */
const SIGNS = [
  {
    file: "ts-ankh.svg",
    culture: "Egypt",
    label: "The ankh",
    family: "Noto Sans Symbols",
    css: "family=Noto+Sans+Symbols",
    codepoints: [0x2625],
  },
  {
    file: "ts-omega.svg",
    culture: "Greece",
    label: "Omega",
    family: "GFS Didot",
    css: "family=GFS+Didot",
    codepoints: [0x03a9],
  },
  {
    file: "ts-il.svg",
    culture: "Canaan",
    label: "The name of El in Ugaritic",
    family: "Noto Sans Ugaritic",
    css: "family=Noto+Sans+Ugaritic",
    codepoints: [0x1039b, 0x1038d],
  },
];

function fail(message) {
  throw new Error(`outline-signs: ${message}`);
}

/**
 * The css2 API serves TrueType when the request carries no browser User-Agent,
 * which is the same trick fetch-fonts.mjs uses for its Android pass.
 */
async function fetchTtf(css, family) {
  const res = await fetch(`https://fonts.googleapis.com/css2?${css}`);
  if (!res.ok) fail(`CSS fetch failed for ${family}: ${res.status}`);
  const text = await res.text();
  const urls = new Set();
  for (const block of text.split("@font-face").slice(1)) {
    const start = block.indexOf("url(");
    if (start === -1) continue;
    const url = block.slice(start + 4, block.indexOf(")", start));
    if (url.startsWith("https:") && url.endsWith(".ttf")) urls.add(url);
  }
  if (urls.size === 0) fail(`${family}: the API served no TTF (is a UA leaking into the request?)`);
  if (urls.size > 1) fail(`${family}: ${urls.size} TTF URLs, expected one`);
  const fontRes = await fetch([...urls][0]);
  if (!fontRes.ok) fail(`font fetch failed for ${family}: ${fontRes.status}`);
  return Buffer.from(await fontRes.arrayBuffer());
}

/** The sfnt table directory. */
function readTables(buf) {
  const version = buf.readUInt32BE(0);
  if (version !== 0x00010000 && version !== 0x74727565) fail(`unsupported sfnt version 0x${version.toString(16)}`);
  const tables = new Map();
  const count = buf.readUInt16BE(4);
  for (let i = 0; i < count; i += 1) {
    const o = 12 + i * 16;
    tables.set(buf.toString("latin1", o, o + 4), { offset: buf.readUInt32BE(o + 8), length: buf.readUInt32BE(o + 12) });
  }
  for (const tag of ["head", "maxp", "cmap", "loca", "glyf", "hhea", "hmtx"]) {
    if (!tables.has(tag)) fail(`the font has no ${tag} table`);
  }
  return tables;
}

/** The glyph id for a codepoint, from the best cmap subtable the font offers. */
function cmapLookup(buf, cmap, cp) {
  const count = buf.readUInt16BE(cmap.offset + 2);
  const offsets = [];
  for (let i = 0; i < count; i += 1) offsets.push(cmap.offset + buf.readUInt32BE(cmap.offset + 8 + i * 8));
  for (const off of offsets) {
    const format = buf.readUInt16BE(off);
    if (format === 12) {
      const groups = buf.readUInt32BE(off + 12);
      for (let i = 0; i < groups; i += 1) {
        const g = off + 16 + i * 12;
        const start = buf.readUInt32BE(g);
        const end = buf.readUInt32BE(g + 4);
        if (cp >= start && cp <= end) return buf.readUInt32BE(g + 8) + (cp - start);
      }
    } else if (format === 4 && cp <= 0xffff) {
      const segX2 = buf.readUInt16BE(off + 6);
      const ends = off + 14;
      const starts = ends + segX2 + 2;
      const deltas = starts + segX2;
      const ranges = deltas + segX2;
      for (let i = 0; i < segX2 / 2; i += 1) {
        if (cp > buf.readUInt16BE(ends + i * 2)) continue;
        const start = buf.readUInt16BE(starts + i * 2);
        if (cp < start) break;
        const delta = buf.readInt16BE(deltas + i * 2);
        const rangeOffset = buf.readUInt16BE(ranges + i * 2);
        if (rangeOffset === 0) return (cp + delta) & 0xffff;
        const gi = ranges + i * 2 + rangeOffset + (cp - start) * 2;
        const gid = buf.readUInt16BE(gi);
        return gid === 0 ? 0 : (gid + delta) & 0xffff;
      }
    }
  }
  return 0;
}

/** Glyph outlines in font units, y up, as contours of {x, y, onCurve} points. */
function glyphContours(font, gid, depth = 0) {
  if (depth > 4) fail("composite glyph nested more than four deep");
  const { buf, loca, glyf, longLoca } = font;
  const at = (i) => (longLoca ? buf.readUInt32BE(loca.offset + i * 4) : buf.readUInt16BE(loca.offset + i * 2) * 2);
  const start = at(gid);
  const end = at(gid + 1);
  if (end <= start) return []; // a blank glyph, such as a space
  let o = glyf.offset + start;
  const numContours = buf.readInt16BE(o);
  o += 10; // skip the glyph's own bounding box

  if (numContours < 0) {
    // Composite: each component is another glyph under a transform.
    const contours = [];
    for (;;) {
      const flags = buf.readUInt16BE(o);
      const componentGid = buf.readUInt16BE(o + 2);
      o += 4;
      let dx;
      let dy;
      if (flags & 0x0001) {
        dx = buf.readInt16BE(o);
        dy = buf.readInt16BE(o + 2);
        o += 4;
      } else {
        dx = buf.readInt8(o);
        dy = buf.readInt8(o + 1);
        o += 2;
      }
      if (!(flags & 0x0002)) fail("composite component positioned by point matching, which this script does not do");
      const f2dot14 = (at14) => buf.readInt16BE(at14) / 16384;
      let a = 1;
      let b = 0;
      let c = 0;
      let d = 1;
      if (flags & 0x0008) {
        a = f2dot14(o);
        d = a;
        o += 2;
      } else if (flags & 0x0040) {
        a = f2dot14(o);
        d = f2dot14(o + 2);
        o += 4;
      } else if (flags & 0x0080) {
        a = f2dot14(o);
        b = f2dot14(o + 2);
        c = f2dot14(o + 4);
        d = f2dot14(o + 6);
        o += 8;
      }
      for (const contour of glyphContours(font, componentGid, depth + 1)) {
        contours.push(contour.map((p) => ({ x: a * p.x + c * p.y + dx, y: b * p.x + d * p.y + dy, onCurve: p.onCurve })));
      }
      if (!(flags & 0x0020)) break;
    }
    return contours;
  }

  const endPts = [];
  for (let i = 0; i < numContours; i += 1) endPts.push(buf.readUInt16BE(o + i * 2));
  o += numContours * 2;
  o += 2 + buf.readUInt16BE(o); // instructions

  const total = numContours === 0 ? 0 : endPts[endPts.length - 1] + 1;
  const flags = [];
  while (flags.length < total) {
    const flag = buf.readUInt8(o);
    o += 1;
    flags.push(flag);
    if (flag & 0x08) {
      let repeat = buf.readUInt8(o);
      o += 1;
      while (repeat > 0 && flags.length < total) {
        flags.push(flag);
        repeat -= 1;
      }
    }
  }

  const readCoords = (shortBit, sameBit) => {
    const values = [];
    let value = 0;
    for (const flag of flags) {
      if (flag & shortBit) {
        const delta = buf.readUInt8(o);
        o += 1;
        value += flag & sameBit ? delta : -delta;
      } else if (!(flag & sameBit)) {
        value += buf.readInt16BE(o);
        o += 2;
      }
      values.push(value);
    }
    return values;
  };
  const xs = readCoords(0x02, 0x10);
  const ys = readCoords(0x04, 0x20);

  const contours = [];
  let first = 0;
  for (const last of endPts) {
    const points = [];
    for (let i = first; i <= last; i += 1) points.push({ x: xs[i], y: ys[i], onCurve: Boolean(flags[i] & 0x01) });
    if (points.length > 0) contours.push(points);
    first = last + 1;
  }
  return contours;
}

/**
 * One contour as SVG commands. TrueType stores quadratic B-splines: two
 * off-curve points in a row imply an on-curve point at their midpoint, and a
 * contour may begin off-curve.
 */
function contourPath(points, project) {
  const mid = (p, q) => ({ x: (p.x + q.x) / 2, y: (p.y + q.y) / 2, onCurve: true });
  let ordered = points;
  let startIndex = points.findIndex((p) => p.onCurve);
  if (startIndex < 0) {
    ordered = [mid(points[points.length - 1], points[0]), ...points];
    startIndex = 0;
  }
  const n = ordered.length;
  const walk = [];
  for (let k = 0; k <= n; k += 1) {
    const point = ordered[(startIndex + k) % n];
    const previous = walk[walk.length - 1];
    if (previous && !previous.onCurve && !point.onCurve) walk.push(mid(previous, point));
    walk.push(point);
  }

  const xy = (p) => {
    const [x, y] = project(p);
    return `${x} ${y}`;
  };
  const out = [`M${xy(walk[0])}`];
  let i = 1;
  while (i < walk.length) {
    if (walk[i].onCurve) {
      out.push(`L${xy(walk[i])}`);
      i += 1;
    } else {
      if (i + 1 >= walk.length || !walk[i + 1].onCurve) fail("an off-curve point was not followed by an on-curve point");
      out.push(`Q${xy(walk[i])} ${xy(walk[i + 1])}`);
      i += 2;
    }
  }
  out.push("Z");
  return out.join("");
}

const round = (v) => Number(v.toFixed(2)).toString();

const results = [];
for (const sign of SIGNS) {
  const buf = await fetchTtf(sign.css, sign.family);
  const tables = readTables(buf);
  const longLoca = buf.readInt16BE(tables.get("head").offset + 50) === 1;
  const unitsPerEm = buf.readUInt16BE(tables.get("head").offset + 18);
  const numberOfHMetrics = buf.readUInt16BE(tables.get("hhea").offset + 34);
  const font = { buf, loca: tables.get("loca"), glyf: tables.get("glyf"), longLoca };

  // Lay the run out on its baseline with the font's own advance widths, so a
  // pair sits at the spacing the type designer set rather than one invented here.
  let pen = 0;
  const contours = [];
  for (const cp of sign.codepoints) {
    const gid = cmapLookup(buf, tables.get("cmap"), cp);
    if (gid === 0) fail(`${sign.family} has no glyph for U+${cp.toString(16).toUpperCase()}`);
    for (const contour of glyphContours(font, gid)) {
      contours.push(contour.map((p) => ({ ...p, x: p.x + pen })));
    }
    const metric = Math.min(gid, numberOfHMetrics - 1);
    pen += buf.readUInt16BE(tables.get("hmtx").offset + metric * 4);
  }
  if (contours.length === 0) fail(`${sign.label}: the glyphs have no outlines`);

  let minX = Infinity;
  let maxX = -Infinity;
  let minY = Infinity;
  let maxY = -Infinity;
  for (const contour of contours) {
    for (const p of contour) {
      // The control points of a quadratic lie outside the curve, so this box
      // is the convex hull of the outline rather than its exact extent. It is
      // the same box the font's own bbox reports and it never clips the ink.
      if (p.x < minX) minX = p.x;
      if (p.x > maxX) maxX = p.x;
      if (p.y < minY) minY = p.y;
      if (p.y > maxY) maxY = p.y;
    }
  }
  const width = maxX - minX;
  const height = maxY - minY;
  const scale = (CANVAS * FIT) / Math.max(width, height);
  const tx = (CANVAS - width * scale) / 2;
  const ty = (CANVAS - height * scale) / 2;
  // Font units run y up and SVG runs y down, so the glyph is flipped about
  // its own box rather than translated by the baseline.
  const project = (p) => [round((p.x - minX) * scale + tx), round((maxY - p.y) * scale + ty)];

  const d = contours.map((contour) => contourPath(contour, project)).join(" ");
  const codes = sign.codepoints.map((cp) => `U+${cp.toString(16).toUpperCase().padStart(4, "0")}`).join(" ");
  const title = `${sign.label}, ${codes} outlined from ${sign.family}`;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${CANVAS} ${CANVAS}" width="${CANVAS}" height="${CANVAS}" role="img" aria-label="${title}">
<title>${title}</title>
<path fill="currentColor" stroke="none" d="${d}"/>
</svg>
`;
  await mkdir(OUT_DIR, { recursive: true });
  await writeFile(path.join(OUT_DIR, sign.file), svg);
  results.push(
    `${sign.file}: ${sign.culture}, ${codes} from ${sign.family} ` +
      `(${unitsPerEm} upem, ${contours.length} contour(s), box ${Math.round(width)}x${Math.round(height)} units, ` +
      `scale ${scale.toFixed(4)}, ${svg.length} bytes)`,
  );
}

console.log(`outline-signs: wrote ${results.length} marks to docs/design/system/assets/marks`);
for (const line of results) console.log(`  ${line}`);
