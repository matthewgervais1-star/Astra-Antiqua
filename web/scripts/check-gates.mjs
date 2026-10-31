/**
 * Style gates for web/src, runnable form of the README's documented checks:
 *   1. no em dashes anywhere
 *   2. no banned terms (whole words, any case)
 *   3. no framer-motion (motion/react only)
 *   4. no backdrop filter: `backdrop-filter`, the `backdropFilter` style key,
 *      or a Tailwind `backdrop-blur` class
 *   5. no non-zero radius: `border-radius` and its four corner longhands, the
 *      camelCase `borderRadius` style keys (Satori cards use style objects),
 *      and any Tailwind `rounded` class except `rounded-none`. `0`, `0px` and
 *      `0 !important` pass.
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
  { name: "backdrop filter", pattern: /backdrop-?filter|backdrop-blur/i },
  {
    name: "non-zero border-radius",
    pattern: new RegExp(
      [
        /border(-(top|bottom)-(left|right))?-radius\s*:\s*(?!0(px)?\s*(!important\s*)?([;}]|$))\S/.source,
        /border(Top|Bottom)?(Left|Right)?Radius\s*:\s*(?!["']?0(px)?["']?\s*([,}]|$))\S/.source,
        // English "a rounded time", "no rounded corners": no Tailwind class is
        // named a, an, the or no, so an article before the word marks prose.
        /(?<!\b(a|an|the|no)\s)(?<![\w-])rounded(?!-none(?![\w-]))(-[\w[\]./%-]+)?(?![\w-])/.source,
      ].join("|"),
      "i",
    ),
  },
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
