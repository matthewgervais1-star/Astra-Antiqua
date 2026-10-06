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
  figureMissing,
  type NatalPoints,
} from "@/lib/figureReading";
import { composeDayPage, meaningClause, utcDayNumber } from "@/lib/decree";
import { computeChart } from "@/lib/ephemeris";
import { FIGURE_BANKS } from "@/data/figureBanks";
import { DECREE_BANKS } from "@/data/decreeBanks";
import { DEITY_DOMAINS } from "@/data/deityDomains";
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

test("a figure the sky does not hold that day, a slow pair, or a bad date opens on nothing, and says which", () => {
  assert.equal(composeFigurePage("rome", DATE, "mars-square-neptune", null), null);
  assert.equal(figureMissing(DATE, "mars-square-neptune"), "absent");
  assert.equal(composeFigurePage("rome", DATE, "jupiter-trine-saturn", null), null);
  assert.equal(figureMissing(DATE, "jupiter-trine-saturn"), "slow");
  assert.equal(composeFigurePage("rome", "2026-13-01", ID, null), null);
  assert.equal(figureMissing("2026-13-01", ID), "malformed");
  assert.equal(figureMissing(DATE, "mars-trine-mars"), "malformed");
  assert.equal(figureMissing(DATE, ID), null);
});

test("without a chart the page reads the sky figure, in the day page's own headline and evidence", () => {
  for (const culture of CULTURES) {
    const page = composeFigurePage(culture, DATE, ID, null)!;
    const day = composeDayPage(culture, parseIsoDate(DATE)!);
    assert.equal(page.headline, day.headline);
    assert.equal(page.evidence, day.evidence);
    assert.equal(page.natal, false);
    assert.equal(page.heroBody, "mars");
    assert.match(page.moveTwo, /^Right now .+: .+\.$/);
    // The meaning clause without its tight tail: the evidence line already says how close.
    const clause = meaningClause(culture, { a: "mars", b: "neptune", kind: "trine", orb: 0 }, utcDayNumber(page.instant));
    assert.ok(page.moveTwo.startsWith(`Right now ${clause}: `), `${culture}: ${page.moveTwo}`);
    assert.doesNotMatch(page.moveTwo, /, and .*\band\b.*\band\b/, `${culture}: stacked and`);
    assert.equal(page.bridge, null);
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
    // The headline and evidence still name the sky figure the reader opened;
    // the bridge names the contact, and move two reads it.
    const sky = composeFigurePage(culture, DATE, ID, null)!;
    assert.equal(page.headline, sky.headline);
    assert.equal(page.evidence, sky.evidence);
    assert.match(page.bridge!, /^[A-Z ]+ □ YOUR [A-Z ]+ · 0°24′$/);
    const domains = DEITY_DOMAINS[culture];
    assert.ok(page.moveTwo.startsWith(`Right now ${domains.mars} and ${domains.saturn} `), page.moveTwo);
    assert.ok(page.moveTwo.endsWith(DECREE_BANKS[culture].consequences.square.saturn.charAt(0).toLowerCase() + DECREE_BANKS[culture].consequences.square.saturn.slice(1)), page.moveTwo);
    // Hero, act and cards name the same god.
    assert.equal(page.heroBody, "mars");
    assert.equal(page.cards, FIGURE_BANKS[culture].tryThis.mars);
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

test("move one sets an authored clause in each culture's frame", () => {
  assert.equal(composeNatalMoveOne("rome", "jupiter", 165), "As Iuppiter in the Maiden, you weigh a thing before you bless it, and you bless little.");
  assert.equal(composeNatalMoveOne("rome", "mercury", 195), "As Mercurius in the Scales, you can argue both sides and hate to choose one.");
  assert.equal(composeNatalMoveOne("egypt", "jupiter", 165), "Your birth set Amun in the Maiden: you weigh a thing before you bless it, and you bless little.");
  for (const culture of CULTURES) {
    for (const planet of PLANETS) assert.match(composeNatalMoveOne(culture, planet, 10), /\b(you|your)\b/);
  }
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
