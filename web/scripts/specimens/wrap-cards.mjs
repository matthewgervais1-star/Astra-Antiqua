/**
 * Wraps each rendered specimen as a design-system card under
 * docs/design/system/components/previews/, with the @dsCard header the
 * Design System pane indexes, and copies the compiled site stylesheet beside
 * them with the Google Fonts import the design project uses prepended, since
 * the project has no woff2 files to serve.
 *
 *   cd web && node scripts/specimens/wrap-cards.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const DEST = path.resolve(here, "../../../docs/design/system/components/previews");
const manifest = JSON.parse(fs.readFileSync(path.join(here, "out", "manifest.json"), "utf8"));

const FONTS = `@import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;500;600&family=Spectral:ital,wght@0,300;0,400;0,500;1,400&family=Spectral+SC:wght@400;500&family=IBM+Plex+Mono:wght@400;500&display=swap');\n`;

fs.rmSync(DEST, { recursive: true, force: true });
fs.mkdirSync(DEST, { recursive: true });
fs.writeFileSync(path.join(DEST, "specimen.css"), FONTS + fs.readFileSync(path.join(here, "out", "specimen.css"), "utf8"));

const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
for (const m of manifest) {
  const src = fs.readFileSync(path.join(here, "html", `${m.name}.html`), "utf8").replace('href="../out/specimen.css"', 'href="./specimen.css"');
  const subtitle = m.spec && m.spec !== "none" ? `${m.role} (${m.spec})` : m.role;
  const head = `<!-- @dsCard group="Components" viewport="${m.viewport}" name="${esc(m.name)}" subtitle="${esc(subtitle)}" -->\n`;
  fs.writeFileSync(path.join(DEST, `${m.name}.html`), head + src);
}
console.log(`wrote ${manifest.length} cards + specimen.css to ${path.relative(process.cwd(), DEST)}`);
