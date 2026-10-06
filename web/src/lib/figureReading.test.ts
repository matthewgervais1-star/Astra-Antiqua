import { test } from "node:test";
import assert from "node:assert/strict";
import {
  composeFigurePage,
  composeNatalMoveOne,
  composeSpanFigure,
  figureHref,
  figureId,
  natalContact,
  parseFigureId,
  parseIsoDate,
  placementClause,
  type NatalPoints,
} from "@/lib/figureReading";
import { composeDayPage, meaningClause, utcDayNumber } from "@/lib/decree";
import { computeChart } from "@/lib/ephemeris";
import { FIGURE_BANKS } from "@/data/figureBanks";
import { PLANET_IN_SIGN } from "@/data/planetInSign";
import { CULTURES, PLANETS, type Planet } from "@/data/cultures";

const DATE = "2026-10-03";
const ID = "mars-trine-neptune";

/** A fixed chart: every natal planet parked where nothing on DATE can touch it but Mars, which meets natal Saturn. */
function natalFor(date: string): NatalPoints {
  const sky = computeChart(parseIsoDate(date)!);
  const chart = {} as Record<Planet, number>;
  PLANETS.forEach((p, i) => (chart[p] = (sky.mars + 37 + i * 2.5) % 360));
  chart.saturn = (sky.mars + 90.4) % 360;
  return { chart, ascendant: (sky.mars + 200) % 360 };
}

test("ids and dates round-trip, and a figure id is canonical whichever way it was written", () => {
  assert.equal(figureId({ a: "neptune", b: "mars", kind: "trine" }), ID);
  assert.deepEqual(parseFigureId(ID), { a: "mars", kind: "trine", b: "neptune" });
  assert.equal(parseFigureId("mars-trine-mars"), null);
  assert.equal(parseFigureId("mars-tryne-neptune"), null);
  assert.equal(parseIsoDate("2026-02-30"), null);
  assert.equal(parseIsoDate(DATE)?.toISOString(), "2026-10-03T00:00:00.000Z");
  assert.equal(figureHref(DATE, { a: "mars", b: "neptune", kind: "trine" }), `/day/${DATE}/figure/${ID}`);
  assert.equal(composeFigurePage("rome", DATE, "neptune-trine-mars", null)?.id, ID);
});

test("a figure the sky does not hold that day, a slow pair, or a bad date opens on nothing", () => {
  assert.equal(composeFigurePage("rome", DATE, "mars-square-neptune", null), null);
  assert.equal(composeFigurePage("rome", DATE, "jupiter-trine-saturn", null), null);
  assert.equal(composeFigurePage("rome", "2026-13-01", ID, null), null);
});

test("without a chart the page reads the sky figure, in the day page's own headline and evidence", () => {
  for (const culture of CULTURES) {
    const page = composeFigurePage(culture, DATE, ID, null)!;
    const day = composeDayPage(culture, parseIsoDate(DATE)!);
    assert.equal(page.headline, day.headline);
    assert.equal(page.evidence, day.evidence);
    assert.equal(page.natal, false);
    assert.equal(page.heroBody, "mars");
    assert.match(page.moveTwo, /^Right now .+, and .+\.$/);
    // The meaning clause without its tight tail: the evidence line already says how close.
    const clause = meaningClause(culture, { a: "mars", b: "neptune", kind: "trine", orb: 0 }, utcDayNumber(page.instant));
    assert.ok(page.moveTwo.startsWith(`Right now ${clause}, and `), `${culture}: ${page.moveTwo}`);
    assert.deepEqual(page.parts.map((p) => p.body), ["mars", null, "neptune"]);
    assert.equal(page.parts[1].tag, "TRINE (120°)");
    assert.match(page.parts[0].tag, / NOW$/);
    assert.match(page.parts[2].tag, / NOW$/);
    assert.equal(page.manifestations.length, 4);
    // No chart: the group is the partner's domain group (Neptune, the inner room), the tone the kind's.
    assert.deepEqual(page.manifestations, FIGURE_BANKS[culture].manifestations[3].harmony);
    assert.equal(page.cards, FIGURE_BANKS[culture].tryThis.mars);
    assert.equal(page.feedbackId, `figure-${DATE}-${ID}`);
    assert.ok(page.window.start <= page.instant && page.window.end >= page.instant);
  }
});

test("with a chart the page reads the figure against the natal point it touches", () => {
  const natal = natalFor(DATE);
  for (const culture of CULTURES) {
    const page = composeFigurePage(culture, DATE, ID, natal)!;
    assert.equal(page.natal, true);
    assert.equal(page.kind, "square");
    assert.equal(page.parts[1].tag, "SQUARE (90°)");
    assert.match(page.parts[2].tag, /^YOUR .+ IN [A-Z]+$/);
    assert.equal(page.parts[2].body, "saturn");
    assert.equal(page.moveOne, composeNatalMoveOne(culture, "saturn", natal.chart.saturn));
    // The headline and move two still read the sky figure the reader opened.
    assert.equal(page.headline, composeFigurePage(culture, DATE, ID, null)!.headline);
    assert.equal(page.moveTwo, composeFigurePage(culture, DATE, ID, null)!.moveTwo);
  }
});

test("the natal contact prefers the headline body, then the partner, then none", () => {
  const sky = computeChart(parseIsoDate(DATE)!);
  const natal = natalFor(DATE);
  assert.deepEqual(
    (({ body, point, kind }) => ({ body, point, kind }))(natalContact(sky, natal, "mars", "neptune")!),
    { body: "mars", point: "saturn", kind: "square" },
  );
  const far = { chart: Object.fromEntries(PLANETS.map((p) => [p, (sky.mars + 23) % 360])) as Record<Planet, number>, ascendant: 0 };
  const contact = natalContact(sky, far, "mars", "neptune");
  assert.ok(contact === null || contact.body === "neptune");
});

test("the five-voice check: one figure, five cultures, no shared sentence", () => {
  for (const natal of [null, natalFor(DATE)]) {
    const owner = new Map<string, string>();
    for (const culture of CULTURES) {
      const p = composeFigurePage(culture, DATE, ID, natal)!;
      const lines = [
        p.headline,
        p.moveOne,
        p.moveTwo,
        p.parts.map((x) => x.phrase).join(" "),
        p.recurrence,
        p.actLine,
        p.lesson,
        ...p.manifestations,
        ...p.cards.map((c) => c.title),
      ];
      for (const line of lines) {
        const prior = owner.get(line);
        assert.ok(prior === undefined || prior === culture, `"${line}" is in ${prior} and ${culture}`);
        owner.set(line, culture);
      }
    }
  }
});

test("every placement recasts to one clean second-person clause", () => {
  for (const planet of PLANETS) {
    for (const [sign, paragraph] of Object.entries(PLANET_IN_SIGN[planet])) {
      const clause = placementClause(paragraph);
      assert.match(clause, /^[a-z]/, `${planet}.${sign}`);
      assert.doesNotMatch(clause, /[;.]$|^(the (cost|gift|risk|shadow|price|bill)|it |then )/, `${planet}.${sign}: "${clause}"`);
      assert.ok(clause.split(" ").length >= 3, `${planet}.${sign}: "${clause}"`);
    }
  }
  // Rome takes the reference's "As ..., you" shape only when the clause opens on "you".
  assert.equal(composeNatalMoveOne("rome", "jupiter", 165), "The augurs found Iuppiter in the Maiden at your birth: increase is refinement.");
  assert.equal(composeNatalMoveOne("rome", "mercury", 195), "As Mercurius in the Scales, you hold both arguments.");
});

test("a long transit reads its slow headline and the natal point or angle it touches", () => {
  const natal = natalFor(DATE);
  const now = parseIsoDate(DATE)!;
  for (const culture of CULTURES) {
    const sun = composeSpanFigure(
      culture,
      { transitPlanet: "saturn", natalKey: "sun", natalLongitude: 10, aspectKind: "square" },
      natal,
      100,
      now,
    );
    assert.equal(sun.headline, FIGURE_BANKS[culture].slowHeadlines.square.saturn);
    assert.match(sun.parts[2].tag, /^YOUR .+ IN ARIES$/);
    assert.equal(sun.heroBody, "saturn");
    assert.equal(sun.cards, FIGURE_BANKS[culture].tryThis.saturn);

    const mc = composeSpanFigure(
      culture,
      { transitPlanet: "pluto", natalKey: "mc", natalLongitude: 130, aspectKind: "opposition" },
      natal,
      310,
      now,
    );
    assert.equal(mc.parts[2].tag, "YOUR MIDHEAVEN IN LEO");
    assert.equal(mc.parts[2].body, null);
    assert.ok(mc.moveOne.includes("Lion"), mc.moveOne);
    assert.ok(mc.moveTwo.includes(FIGURE_BANKS[culture].angleDomains.mc), mc.moveTwo);
  }
});
