/**
 * Downloads the site's font files (latin subset, woff2) from Google Fonts
 * into src/fonts/ for self-hosting via next/font/local.
 *
 * Why not next/font/google: it downloads every font in one parallel burst at
 * build time, and some networks reset bursty connections to fonts.gstatic.com
 * (ECONNRESET), which breaks `next build` entirely. Committing the files makes
 * builds offline-stable. Re-run only when changing families/weights:
 *   node scripts/fetch-fonts.mjs
 */
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const OUT_DIR = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "src", "fonts");

// A woff2-capable browser UA, so the CSS API returns woff2 sources.
const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36";

const FAMILIES = [
  {
    family: "Playfair Display",
    css: "family=Playfair+Display:wght@400;700",
    picks: [
      { weight: "400", style: "normal", file: "playfair-display-latin-400.woff2" },
      { weight: "700", style: "normal", file: "playfair-display-latin-700.woff2" },
    ],
  },
  {
    family: "Cormorant Garamond",
    css: "family=Cormorant+Garamond:ital,wght@0,400;0,500;1,400;1,500",
    picks: [
      { weight: "400", style: "normal", file: "cormorant-garamond-latin-400.woff2" },
      { weight: "500", style: "normal", file: "cormorant-garamond-latin-500.woff2" },
      { weight: "400", style: "italic", file: "cormorant-garamond-latin-400-italic.woff2" },
      { weight: "500", style: "italic", file: "cormorant-garamond-latin-500-italic.woff2" },
    ],
  },
  {
    family: "JetBrains Mono",
    css: "family=JetBrains+Mono:wght@400",
    picks: [{ weight: "400", style: "normal", file: "jetbrains-mono-latin-400.woff2" }],
  },
];

/** Parse @font-face blocks; return the latin-subset woff2 URL per weight/style. */
function pickUrl(cssText, weight, style) {
  const blocks = cssText.split("@font-face").slice(1);
  for (let i = 0; i < blocks.length; i += 1) {
    const block = blocks[i];
    // The CSS API precedes each block with a subset comment, e.g. /* latin */.
    const before = cssText.slice(0, cssText.indexOf(block));
    const lastComment = before.lastIndexOf("/*");
    const subset = before.slice(lastComment + 2, before.indexOf("*/", lastComment)).trim();
    if (subset !== "latin") continue;
    if (!block.includes(`font-weight: ${weight}`)) continue;
    if (!block.includes(`font-style: ${style}`)) continue;
    const m = block.match(/url\((https:[^)]+\.woff2)\)/);
    if (m) return m[1];
  }
  throw new Error(`No latin woff2 for weight ${weight} style ${style}`);
}

await mkdir(OUT_DIR, { recursive: true });

for (const fam of FAMILIES) {
  const cssUrl = `https://fonts.googleapis.com/css2?${fam.css}&display=swap`;
  const res = await fetch(cssUrl, { headers: { "User-Agent": UA } });
  if (!res.ok) throw new Error(`CSS fetch failed for ${fam.family}: ${res.status}`);
  const cssText = await res.text();
  for (const pick of fam.picks) {
    const url = pickUrl(cssText, pick.weight, pick.style);
    // Sequential on purpose: parallel bursts are exactly what breaks here.
    const fontRes = await fetch(url);
    if (!fontRes.ok) throw new Error(`Font fetch failed: ${url} (${fontRes.status})`);
    const buf = Buffer.from(await fontRes.arrayBuffer());
    await writeFile(path.join(OUT_DIR, pick.file), buf);
    console.log(`wrote src/fonts/${pick.file} (${(buf.length / 1024).toFixed(0)} KB)`);
  }
}
