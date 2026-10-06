/**
 * Downloads the identity's font files from Google Fonts.
 *
 * Default: latin-subset woff2 into web/src/fonts/, self-hosted via
 * next/font/local. With `--android`: the product faces, Spectral SC and the symbols face as TTF into
 * android/app/src/main/res/font/, because Compose cannot read woff2 and
 * Android resource names allow only lowercase letters, digits and
 * underscores. One pipeline for both surfaces, so the two cannot drift onto
 * different cuts of the same typeface.
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

// Cinzel is a VARIABLE font: the css2 API returns the same woff2 URL for
// every requested weight, so one file covers the whole range (layout.tsx
// declares it as a range). Spectral and IBM Plex Mono are STATIC families:
// one file per weight/style, so each pick names its weight.
const FAMILIES = [
  {
    family: "Cinzel",
    css: "family=Cinzel:wght@400;500;600",
    picks: [{ style: "normal", file: "cinzel-latin-var.woff2" }],
  },
  {
    family: "Spectral",
    css: "family=Spectral:ital,wght@0,300;0,400;1,300;1,400",
    picks: [
      { style: "normal", weight: "300", file: "spectral-latin-300.woff2" },
      { style: "normal", weight: "400", file: "spectral-latin-400.woff2" },
      { style: "italic", weight: "300", file: "spectral-latin-300-italic.woff2" },
      { style: "italic", weight: "400", file: "spectral-latin-400-italic.woff2" },
    ],
  },
  {
    family: "IBM Plex Mono",
    css: "family=IBM+Plex+Mono:wght@400;500",
    picks: [
      { style: "normal", weight: "400", file: "ibm-plex-mono-latin-400.woff2" },
      { style: "normal", weight: "500", file: "ibm-plex-mono-latin-500.woff2" },
    ],
  },
  // Spectral SC carries TRUE small caps. Regular Spectral's latin subset has no
  // `smcp` feature, so `font-variant-caps: small-caps` on it makes the browser
  // synthesise them by scaling capitals down: thinner strokes, wrong
  // proportions, and no longer weight-matched to Cinzel 600. Used by the
  // display-type prototype on the four non-Roman surfaces.
  {
    family: "Spectral SC",
    css: "family=Spectral+SC:wght@400;500",
    picks: [
      { style: "normal", weight: "400", file: "spectral-sc-latin-400.woff2" },
      { style: "normal", weight: "500", file: "spectral-sc-latin-500.woff2" },
    ],
  },
  // Epigraphic faces (docs/design/system/readme.md, Type). They set attested
  // signs only, never copy: the sign the design system draws from each family
  // lives outside the latin subset, so each family names the css2 subset that
  // carries it. The API's unicode-range is a range label, not a glyph
  // inventory, so each sign was verified in the vendored file's cmap
  // (format 12 for the supplementary planes, format 4 for the BMP) on
  // 2026-09-10:
  //   egyptian-hieroglyphs U+13080 gid 138
  //   ugaritic             U+1038D gid 17, U+1039B gid 31
  //   symbols              U+2625  gid 203
  //   greek                U+03A9  gid 43
  // The design system's tokens/fonts.css names Noto Sans Symbols 2 for the
  // ankh, but on Google Fonts that family lacks U+2625; Noto Sans Symbols
  // carries it, so that is the family vendored under the same token.
  // Web only: the Android build draws these signs as outlines, not text.
  {
    family: "Noto Sans Egyptian Hieroglyphs",
    css: "family=Noto+Sans+Egyptian+Hieroglyphs",
    subset: "egyptian-hieroglyphs",
    picks: [{ style: "normal", weight: "400", file: "noto-sans-egyptian-hieroglyphs-400.woff2" }],
  },
  {
    family: "Noto Sans Ugaritic",
    css: "family=Noto+Sans+Ugaritic",
    subset: "ugaritic",
    picks: [{ style: "normal", weight: "400", file: "noto-sans-ugaritic-400.woff2" }],
  },
  {
    family: "Noto Sans Symbols",
    css: "family=Noto+Sans+Symbols",
    subset: "symbols",
    picks: [{ style: "normal", weight: "400", file: "noto-sans-symbols-400.woff2" }],
  },
  {
    family: "GFS Didot",
    css: "family=GFS+Didot",
    subset: "greek",
    picks: [{ style: "normal", weight: "400", file: "gfs-didot-400.woff2" }],
  },
];

const ANDROID_OUT_DIR = path.join(
  path.dirname(fileURLToPath(import.meta.url)), "..", "..",
  "android", "app", "src", "main", "res", "font",
);

// The css2 API serves TTF to clients that do not look like a modern browser,
// so the android pass simply omits the spoofed user-agent. Names are
// res/font-legal: lowercase, digits, underscore.
const ANDROID_FAMILIES = [
  {
    family: "Cinzel",
    css: "family=Cinzel:wght@400;500;600",
    picks: [
      { style: "normal", weight: "400", file: "cinzel_regular.ttf" },
      { style: "normal", weight: "500", file: "cinzel_medium.ttf" },
      { style: "normal", weight: "600", file: "cinzel_semibold.ttf" },
    ],
  },
  {
    family: "Spectral",
    css: "family=Spectral:ital,wght@0,300;0,400;1,300;1,400",
    picks: [
      { style: "normal", weight: "300", file: "spectral_light.ttf" },
      { style: "normal", weight: "400", file: "spectral_regular.ttf" },
      { style: "italic", weight: "300", file: "spectral_light_italic.ttf" },
      { style: "italic", weight: "400", file: "spectral_regular_italic.ttf" },
    ],
  },
  {
    family: "IBM Plex Mono",
    css: "family=IBM+Plex+Mono:wght@400;500",
    picks: [
      { style: "normal", weight: "400", file: "ibm_plex_mono_regular.ttf" },
      { style: "normal", weight: "500", file: "ibm_plex_mono_medium.ttf" },
    ],
  },
  // The small-caps display face for the four non-Roman cultures. It draws
  // its small capitals on the lowercase codepoints, so the call sites pass
  // lowercase text (see displaySc in ui/theme/Type.kt).
  {
    family: "Spectral SC",
    css: "family=Spectral+SC:wght@400;500",
    picks: [
      { style: "normal", weight: "400", file: "spectral_sc_regular.ttf" },
      { style: "normal", weight: "500", file: "spectral_sc_medium.ttf" },
    ],
  },
  /**
   * The symbols face, for the zodiac and planet notation the Learn pages set
   * as text. None of the three product faces carries those codepoints, so
   * Android's font chain falls through to the colour emoji font and paints
   * them as orange pictographs: two dozen hues the palette does not own, on
   * pages whose whole job is to separate by form. This is the same family the
   * web surface vendors under --font-symbols. Notation, never copy.
   */
  {
    family: "Noto Sans Symbols",
    css: "family=Noto+Sans+Symbols",
    subset: "symbols",
    picks: [{ style: "normal", weight: "400", file: "noto_sans_symbols.ttf" }],
  },
];

/**
 * Parse @font-face blocks; return the woff2 URL for one subset (latin unless
 * the family names another) and a style (and, for static families, a
 * specific weight). Errors if the request resolves to more than one URL,
 * which for a weight-less pick would mean the family is no longer served as
 * a single variable file.
 */
function pickUrl(cssText, style, weight, ext = "woff2", subset = "latin") {
  const urls = new Set();
  const blocks = cssText.split("@font-face").slice(1);
  // The woff2 response splits each family across subsets and labels each
  // block with a comment such as /* latin */. The ttf response is one block
  // per weight with no subset comments at all, so the subset filter only
  // applies to woff2.
  const hasSubsetComments = cssText.includes(`/* ${subset} */`);
  for (let i = 0; i < blocks.length; i += 1) {
    const block = blocks[i];
    if (hasSubsetComments) {
      const before = cssText.slice(0, cssText.indexOf(block));
      const lastComment = before.lastIndexOf("/*");
      const label = before.slice(lastComment + 2, before.indexOf("*/", lastComment)).trim();
      if (label !== subset) continue;
    }
    if (!block.includes(`font-style: ${style}`)) continue;
    if (weight && !block.includes(`font-weight: ${weight}`)) continue;
    // Extracted without a regex: the url is always url(...) and the closing
    // paren cannot appear inside it, so indexOf is both simpler and immune to
    // escaping mistakes.
    const start = block.indexOf("url(");
    if (start !== -1) {
      const raw = block.slice(start + 4, block.indexOf(")", start));
      if (raw.startsWith("https:") && raw.endsWith("." + ext)) urls.add(raw);
    }
  }
  if (urls.size === 0) throw new Error(`No ${ext} for style ${style} weight ${weight ?? "any"}`);
  if (urls.size > 1) {
    throw new Error(
      `Multiple woff2 URLs for style ${style}; the family is not a single variable file anymore. Update the picks to per-weight files.`,
    );
  }
  return [...urls][0];
}

const android = process.argv.includes("--android");
const outDir = android ? ANDROID_OUT_DIR : OUT_DIR;
const families = android ? ANDROID_FAMILIES : FAMILIES;
const label = android ? "android/app/src/main/res/font" : "src/fonts";

await mkdir(outDir, { recursive: true });

for (const fam of families) {
  const cssUrl = `https://fonts.googleapis.com/css2?${fam.css}&display=swap`;
  // No spoofed UA on the android pass: that is what makes the API serve TTF.
  const res = await fetch(cssUrl, android ? {} : { headers: { "User-Agent": UA } });
  if (!res.ok) throw new Error(`CSS fetch failed for ${fam.family}: ${res.status}`);
  const cssText = await res.text();
  for (const pick of fam.picks) {
    const url = pickUrl(cssText, pick.style, pick.weight, android ? "ttf" : "woff2", fam.subset);
    // Sequential on purpose: parallel bursts are exactly what breaks here.
    const fontRes = await fetch(url);
    if (!fontRes.ok) throw new Error(`Font fetch failed: ${url} (${fontRes.status})`);
    const buf = Buffer.from(await fontRes.arrayBuffer());
    await writeFile(path.join(outDir, pick.file), buf);
    console.log(`wrote ${label}/${pick.file} (${(buf.length / 1024).toFixed(0)} KB)`);
  }
}
