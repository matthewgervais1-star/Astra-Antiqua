import { test } from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const WEB = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../..");

function run(): Map<string, Buffer> {
  const out = fs.mkdtempSync(path.join(os.tmpdir(), "astra-screens-"));
  try {
    execFileSync(process.execPath, ["--no-warnings", path.join("scripts", "export-screen-goldens.mjs")], {
      cwd: WEB,
      env: { ...process.env, ASTRA_SHARED_OUT: out },
      stdio: ["ignore", "ignore", "inherit"],
    });
    const dir = path.join(out, "goldens", "screens");
    return new Map(fs.readdirSync(dir).map((f) => [f, fs.readFileSync(path.join(dir, f))]));
  } finally {
    fs.rmSync(out, { recursive: true, force: true });
  }
}

test("the screen goldens exporter writes the same bytes on two runs", () => {
  const a = run();
  const b = run();
  assert.deepEqual([...a.keys()].sort(), [...b.keys()].sort());
  assert.equal(a.size, 8, "one file per screen");
  for (const [name, bytes] of a) assert.ok(bytes.equals(b.get(name)!), `${name} differs between runs`);
});
