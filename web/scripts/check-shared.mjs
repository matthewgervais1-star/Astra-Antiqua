/**
 * Checks that shared/ is what web's exporters write today, and that the
 * catalog keeps its characters and its case.
 *
 *   cd web && pnpm check:shared
 *
 * 1. Reruns export-content, export-strings (and export-screen-goldens when
 *    that script exists) into a temp folder and compares every file they
 *    write with shared/, ignoring each manifest's sourceCommit. A file in
 *    shared/strings or shared/goldens that no exporter writes also fails.
 * 2. Fails on an ASCII apostrophe in a catalog value, or a hyphen used as a
 *    range (plan Review Focus 5); keys listed in ALLOWED are exempt.
 * 3. Fails on a case transform applied to catalog text in web/src: a
 *    .toUpperCase() or .toLowerCase() on what str(), text() or fmt()
 *    returns, or a CSS uppercase, lowercase or capitalize class or
 *    text-transform on an element that prints str(), text() or <Fill>.
 *
 * Exits 1 on any failure, listing each.
 */
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const WEB = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SHARED = path.resolve(WEB, "../shared");
const SRC = path.join(WEB, "src");

/** Catalog keys allowed an ASCII apostrophe or a hyphen range. None today. */
const ALLOWED = new Set([]);

const failures = [];

// ---- 1. rerun the exporters into a temp folder ------------------------------

const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "astra-shared-"));
const exporters = ["export-content.mjs", "export-strings.mjs", "export-screen-goldens.mjs"].filter((name) =>
  fs.existsSync(path.join(WEB, "scripts", name)),
);
for (const name of exporters) {
  execFileSync(process.execPath, [path.join("scripts", name)], {
    cwd: WEB,
    env: { ...process.env, ASTRA_SHARED_OUT: tmp },
    stdio: ["ignore", "ignore", "inherit"],
  });
}

function walk(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const p = path.join(dir, e.name);
    return e.isDirectory() ? walk(p) : [p];
  });
}

/** The file's text with CRLF read as LF (git may check shared/ out with CRLF) and no manifest sourceCommit. */
function normalised(file) {
  const raw = fs.readFileSync(file, "utf8").replaceAll("\r\n", "\n");
  if (path.basename(file) !== "manifest.json") return raw;
  const doc = JSON.parse(raw);
  delete doc.sourceCommit;
  return JSON.stringify(doc, null, 2);
}

const produced = walk(tmp).map((f) => path.relative(tmp, f));
for (const rel of produced) {
  const live = path.join(SHARED, rel);
  if (!fs.existsSync(live)) {
    failures.push(`shared/${rel.replaceAll("\\", "/")} is missing: run the exporters`);
    continue;
  }
  if (normalised(live) !== normalised(path.join(tmp, rel))) {
    failures.push(`shared/${rel.replaceAll("\\", "/")} differs from what the exporters write: rerun them`);
  }
}
const producedSet = new Set(produced.map((r) => r.replaceAll("\\", "/")));
for (const dir of ["strings", "goldens"]) {
  for (const f of walk(path.join(SHARED, dir))) {
    const rel = path.relative(SHARED, f).replaceAll("\\", "/");
    if (!producedSet.has(rel)) failures.push(`shared/${rel} is written by no exporter`);
  }
}
fs.rmSync(tmp, { recursive: true, force: true });

// ---- 2. catalog characters ----------------------------------------------------

const catalog = JSON.parse(fs.readFileSync(path.join(SHARED, "strings/en.json"), "utf8"));
for (const [key, value] of Object.entries(catalog)) {
  if (ALLOWED.has(key)) continue;
  const texts = typeof value === "string" ? [value] : Object.values(value);
  for (const t of texts) {
    if (t.includes("'")) failures.push(`${key}: ASCII apostrophe in "${t}" (F10 wants ’)`);
    if (/\d\s*-\s*\d|\s-\s/.test(t)) failures.push(`${key}: hyphen used as a range in "${t}" (F13 wants →)`);
  }
}

// ---- 3. case transforms on catalog text in web/src ------------------------------

const CALL = /\b(str|text|fmt)\(/g;
const CASE_CLASS = /\b(uppercase|lowercase|capitalize)\b|text-transform|textTransform/;

/** The index just past the parenthesis that closes the call opening at `open`. */
function closeOf(src, open) {
  let depth = 0;
  for (let i = open; i < src.length; i += 1) {
    const ch = src[i];
    if (ch === "(") depth += 1;
    else if (ch === ")") {
      depth -= 1;
      if (depth === 0) return i + 1;
    }
  }
  return src.length;
}

const sources = walk(SRC).filter(
  (f) => /\.(ts|tsx)$/.test(f) && !f.endsWith(".test.ts") && !f.includes(`${path.sep}strings${path.sep}`),
);
for (const file of sources) {
  const src = fs.readFileSync(file, "utf8");
  if (!/\b(str|text|fmt)\(|<Fill\b/.test(src)) continue;
  const rel = path.relative(WEB, file).replaceAll("\\", "/");
  const lineOf = (at) => src.slice(0, at).split("\n").length;
  for (const m of src.matchAll(CALL)) {
    const end = closeOf(src, (m.index ?? 0) + m[0].length - 1);
    if (/^\s*\.\s*(toUpperCase|toLowerCase|toLocaleUpperCase|toLocaleLowerCase)\(/.test(src.slice(end, end + 40))) {
      failures.push(`${rel}:${lineOf(m.index ?? 0)}: case transform on ${m[1]}() output`);
    }
  }
  // A JSX element whose class transforms case and whose own text holds catalog text.
  for (const m of src.matchAll(/<([A-Za-z][\w.]*)\b[^>]*className=(\{`[^`]*`\}|"[^"]*"|\{[^}]*\})[^>]*>/g)) {
    if (!CASE_CLASS.test(m[2] ?? "")) continue;
    const start = (m.index ?? 0) + m[0].length;
    const closeTag = src.indexOf(`</${m[1]}>`, start);
    const body = src.slice(start, closeTag === -1 ? start + 400 : closeTag);
    if (/\b(str|text|fmt)\(|<Fill\b/.test(body)) {
      failures.push(`${rel}:${lineOf(m.index ?? 0)}: CSS case transform on an element that prints catalog text`);
    }
  }
}

if (failures.length > 0) {
  console.error(`check-shared: ${failures.length} failure(s)`);
  for (const f of failures) console.error(`  ${f}`);
  process.exit(1);
}
console.log(
  `check-shared: shared/ matches ${exporters.join(", ")}; ${Object.keys(catalog).length} catalog keys clean; ${sources.length} web/src files free of case transforms on catalog text`,
);
