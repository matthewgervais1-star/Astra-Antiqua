/**
 * Compiles specimen.css through the same @tailwindcss/postcss plugin Next uses,
 * so the sheet the preview cards link is the site's own CSS. Run from web/ so
 * Tailwind's automatic source detection also scans src/ and every theme token
 * the site uses is emitted, not only the ones the specimens happen to touch.
 *
 *   cd web && node scripts/specimens/build-css.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import postcss from "postcss";
import tailwind from "@tailwindcss/postcss";

const here = path.dirname(fileURLToPath(import.meta.url));
const from = path.join(here, "specimen.css");
const to = path.join(here, "out", "specimen.css");
fs.mkdirSync(path.dirname(to), { recursive: true });
const result = await postcss([tailwind()]).process(fs.readFileSync(from, "utf8"), { from, to });
fs.writeFileSync(to, result.css);
console.log(`wrote ${path.relative(process.cwd(), to)} (${(result.css.length / 1024).toFixed(1)} KB)`);
