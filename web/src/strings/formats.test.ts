import { test } from "node:test";
import assert from "node:assert/strict";
import { FORMAT_CASES, caseInput } from "@/strings/formatCases";
import { FORMAT_RULES, fmt, plural, type FormatName } from "@/strings/formats";

test("every format.json pair prints its ruled output", () => {
  for (const c of FORMAT_CASES) {
    assert.equal(fmt(c.name, caseInput(c) as never, c.zone), c.out, `${c.name} ${JSON.stringify(c.input)} in ${c.zone}`);
  }
});

test("every named format has a rule entry and at least one golden pair", () => {
  const covered = new Set(FORMAT_CASES.map((c) => c.name));
  for (const name of Object.keys(FORMAT_RULES) as FormatName[]) {
    assert.ok(covered.has(name), `no golden pair for ${name}`);
    assert.match(FORMAT_RULES[name].rule, /^F\d{1,2}$/);
  }
});

test("range.days covers the three shapes: same month, month end, year end (Review Focus 1)", () => {
  const shapes = FORMAT_CASES.filter((c) => c.name === "range.days").map((c) => c.out);
  assert.ok(shapes.some((s) => /^\d+ → \d+ [A-Z]{3} \d{4}$/.test(s)));
  assert.ok(shapes.some((s) => /^\d+ [A-Z]{3} → \d+ [A-Z]{3} \d{4}$/.test(s)));
  assert.ok(shapes.some((s) => /^\d+ [A-Z]{3} \d{4} → \d+ [A-Z]{3} \d{4}$/.test(s)));
});

test("the same instant reads a different day in UTC and in Montreal (Review Focus 2)", () => {
  const instant = new Date("2026-10-22T02:00:00Z");
  assert.notEqual(fmt("date.day", instant, "UTC"), fmt("date.day", instant, "America/Montreal"));
});

test("counts 0, 1, 2 and 7 print NONE, ONE, TWO, SEVEN (Review Focus 4)", () => {
  assert.deepEqual(
    [0, 1, 2, 7].map((n) => fmt("count.word", n)),
    ["NONE", "ONE", "TWO", "SEVEN"],
  );
  assert.equal(plural(1, "RETURN", "RETURNS"), "RETURN");
  assert.equal(plural(0, "RETURN", "RETURNS"), "RETURNS");
  assert.equal(plural(2, "PASS", "PASSES"), "PASSES");
});

test("no format output carries an ASCII apostrophe, an en dash or an em dash", () => {
  for (const c of FORMAT_CASES) {
    assert.doesNotMatch(c.out, /['–—]/, c.out);
  }
});
