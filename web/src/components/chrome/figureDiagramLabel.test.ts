import { test } from "node:test";
import assert from "node:assert/strict";
import { figureDiagramLabel } from "@/components/chrome/figureDiagramLabel";

const from = { body: "mars" as const, longitude: 10, label: "MARS NOW" };
const to = { body: "jupiter" as const, longitude: 130, label: "YOUR IUPPITER" };

test("the aria-label names both points, the kind and the angle", () => {
  assert.equal(
    figureDiagramLabel({ from, to, kind: "trine", angle: 120 }),
    "MARS NOW and YOUR IUPPITER, trine, 120 degrees apart",
  );
});

test("the aria-label names the center label a sighted reader sees", () => {
  assert.equal(
    figureDiagramLabel({ from, to, kind: "trine", angle: 120, centerLabel: "YOU" }),
    "MARS NOW and YOUR IUPPITER, trine, 120 degrees apart, YOU at the center",
  );
});
