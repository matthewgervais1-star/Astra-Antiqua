/**
 * Well-formedness gate for every SVG under a directory, run before pushing
 * to the design project, whose sanitizer parses SVG as strict XML. Catches the
 * things a browser forgives and Go's encoding/xml does not: "--" inside a
 * comment, a bare "&", an unquoted attribute, an unbalanced tag.
 *
 *   node scripts/check-svgs.mjs docs/design/system
 */
import { readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";

const root = process.argv[2] ?? ".";
const files = [];
(function walk(d) {
  for (const f of readdirSync(d)) {
    const p = path.join(d, f);
    if (statSync(p).isDirectory()) walk(p);
    else if (f.endsWith(".svg")) files.push(p);
  }
})(root);

const ENTITY = /^&(#x[0-9a-fA-F]+|#\d+|amp|lt|gt|quot|apos);/;
const VOID = new Set(); // SVG has no void elements; every tag closes or self-closes

function check(src) {
  const errs = [];
  const stack = [];
  let i = 0;
  const line = () => src.slice(0, i).split("\n").length;
  while (i < src.length) {
    if (src.startsWith("<!--", i)) {
      const end = src.indexOf("-->", i + 4);
      if (end < 0) { errs.push(`line ${line()}: unterminated comment`); break; }
      const body = src.slice(i + 4, end);
      if (body.includes("--")) errs.push(`line ${line()}: "--" inside a comment`);
      i = end + 3;
    } else if (src.startsWith("<?", i)) {
      const end = src.indexOf("?>", i);
      if (end < 0) { errs.push(`line ${line()}: unterminated processing instruction`); break; }
      i = end + 2;
    } else if (src[i] === "<") {
      const end = src.indexOf(">", i);
      if (end < 0) { errs.push(`line ${line()}: unterminated tag`); break; }
      const raw = src.slice(i + 1, end);
      if (raw.startsWith("/")) {
        const name = raw.slice(1).trim();
        const open = stack.pop();
        if (open !== name) errs.push(`line ${line()}: </${name}> closes <${open ?? "nothing"}>`);
      } else {
        const selfClose = raw.endsWith("/");
        const body = selfClose ? raw.slice(0, -1) : raw;
        const name = body.match(/^[A-Za-z_][\w:.-]*/)?.[0];
        if (!name) errs.push(`line ${line()}: bad tag name in <${raw.slice(0, 20)}>`);
        // attributes: name="..." or name='...' only
        const attrs = body.slice(name?.length ?? 0);
        const re = /\s+([A-Za-z_:][\w:.-]*)\s*=\s*("[^"]*"|'[^']*')/g;
        const stripped = attrs.replace(re, "").trim();
        if (stripped) errs.push(`line ${line()}: unquoted or malformed attribute near "${stripped.slice(0, 30)}"`);
        for (const m of attrs.matchAll(re)) {
          const v = m[2].slice(1, -1);
          for (const a of v.matchAll(/&[^;]*;?/g)) if (!ENTITY.test(a[0])) errs.push(`line ${line()}: bad entity ${a[0]} in attribute`);
          if (v.includes("<")) errs.push(`line ${line()}: "<" inside attribute value`);
        }
        if (!selfClose && name && !VOID.has(name)) stack.push(name);
      }
      i = end + 1;
    } else {
      const next = src.indexOf("<", i);
      const text = src.slice(i, next < 0 ? src.length : next);
      for (const a of text.matchAll(/&[^;\s]*;?/g)) if (!ENTITY.test(a[0])) errs.push(`line ${line()}: bad entity ${a[0]} in text`);
      i = next < 0 ? src.length : next;
    }
  }
  if (stack.length) errs.push(`unclosed: ${stack.join(", ")}`);
  return errs;
}

let bad = 0;
for (const f of files) {
  const errs = check(readFileSync(f, "utf8"));
  if (errs.length) { bad += 1; console.log(`FAIL ${path.relative(root, f)}\n  ${errs.join("\n  ")}`); }
}
console.log(`${files.length - bad}/${files.length} svg files well-formed`);
process.exit(bad ? 1 : 0);
