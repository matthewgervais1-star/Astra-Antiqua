/**
 * Renders every specimen to static HTML with react-dom/server, inside the same
 * providers layout.tsx uses, with next/* replaced by the stubs. One file per
 * specimen under html/, each a full document carrying <body data-pantheon>
 * because the culture CSS keys on that attribute.
 *
 * jiti is imported from the pnpm store: it arrives as a transitive dependency
 * of @tailwindcss/node and eslint and is not hoisted. If a dependency bump moves
 * it, add it explicitly.
 *
 *   cd web && node scripts/specimens/render.mjs
 */
import { createJiti } from "../../node_modules/.pnpm/jiti@2.7.0/node_modules/jiti/lib/jiti.mjs";
import path from "node:path";
import fs from "node:fs";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const SRC = path.resolve(here, "../../src");
const OUT = path.join(here, "html");

const jiti = createJiti(import.meta.url, {
  jsx: { runtime: "automatic" },
  moduleCache: false,
  fsCache: false,
  alias: {
    "@": SRC,
    "next/link": path.join(here, "stubs/next-link.tsx"),
    "next/navigation": path.join(here, "stubs/next-navigation.ts"),
    "next/font/local": path.join(here, "stubs/next-font-local.ts"),
    "next/image": path.join(here, "stubs/next-image.tsx"),
  },
});

const React = await jiti.import("react");
const { renderToStaticMarkup } = await jiti.import("react-dom/server");
const { PantheonProvider } = await jiti.import("@/components/pantheon/PantheonContext");
const { AuthProvider } = await jiti.import("@/components/auth/AuthProvider");
const { SPECIMENS } = await jiti.import("./specimens.generated.tsx");

const h = React.createElement;
const wrap = (el) => h(AuthProvider, null, h(PantheonProvider, null, el));

fs.rmSync(OUT, { recursive: true, force: true });
fs.mkdirSync(OUT, { recursive: true });
fs.mkdirSync(path.join(here, "out"), { recursive: true });

const manifest = [];
let failed = 0;
for (const s of SPECIMENS) {
  process.env.SPECIMEN_QUERY = `culture=${s.culture}`;
  process.env.SPECIMEN_PATH = "/";
  try {
    const inner = renderToStaticMarkup(wrap(s.render()));
    if (!inner.trim()) throw new Error("rendered nothing");
    const doc = `<!doctype html><html lang="en"><head><meta charset="utf-8"><link rel="stylesheet" href="../out/specimen.css"></head><body data-pantheon="${s.culture}" class="flex min-h-screen flex-col text-bone"><div class="p-6">${inner}</div></body></html>`;
    fs.writeFileSync(path.join(OUT, `${s.name}.html`), doc);
    manifest.push({ name: s.name, culture: s.culture, viewport: s.viewport, role: s.role, spec: s.spec, bytes: inner.length });
    console.log(`ok    ${s.name.padEnd(20)} ${s.culture.padEnd(9)} ${inner.length}B`);
  } catch (e) {
    failed += 1;
    console.log(`FAIL  ${s.name.padEnd(20)} ${String(e.message ?? e).split("\n")[0].slice(0, 160)}`);
  }
}
fs.writeFileSync(path.join(here, "out", "manifest.json"), JSON.stringify(manifest, null, 1));
console.log(`\n${manifest.length} rendered, ${failed} failed`);
