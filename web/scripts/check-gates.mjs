/**
 * Style gates for web/src, runnable form of the README's documented checks:
 *   1. no em dashes anywhere
 *   2. no banned terms (whole words, any case)
 *   3. no framer-motion (motion/react only)
 * Exits 1 listing file:line for every hit. `npm run gates`.
 */
import { readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const SRC = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "src");

const GATES = [
  { name: "em dash", pattern: /—/ },
  { name: "banned term", pattern: /\b(inter|roboto|harness|unlock your|discover your)\b/i },
  { name: "framer-motion", pattern: /framer-motion/ },
];

const SKIP_EXT = new Set([".woff2", ".ttf", ".png", ".ico", ".jpg", ".svg"]);

function* walk(dir) {
  for (const entry of readdirSync(dir)) {
    const full = path.join(dir, entry);
    if (statSync(full).isDirectory()) yield* walk(full);
    else if (!SKIP_EXT.has(path.extname(full))) yield full;
  }
}

let failures = 0;
for (const file of walk(SRC)) {
  const lines = readFileSync(file, "utf8").split("\n");
  lines.forEach((line, i) => {
    for (const gate of GATES) {
      if (gate.pattern.test(line)) {
        failures += 1;
        console.error(`${path.relative(SRC, file)}:${i + 1}  [${gate.name}]  ${line.trim().slice(0, 120)}`);
      }
    }
  });
}

if (failures > 0) {
  console.error(`\n${failures} gate violation(s).`);
  process.exit(1);
}
console.log("gates clean");
