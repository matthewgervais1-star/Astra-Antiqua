/**
 * Runs the web surface's own chart pipeline for fixed instants and locations
 * and records the outputs as golden fixtures for the C# core's parity tests:
 *
 *   cd web && npm run export:goldens
 *   -> dotnet/AstraAntiqua.Core.Tests/TestData/goldens.json
 *
 * The C# port must reproduce these within the stated tolerance; the goldens
 * are what "the two surfaces agree" means, concretely.
 */
import { register } from "node:module";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

// The week and season builders count LOCAL calendar days. The fixtures are
// recorded in UTC so the C# tests can replay them with an explicit zone and
// the output never depends on the machine that ran the export.
process.env.TZ = "UTC";

register("./resolve-at-alias.mjs", import.meta.url);

const { computeChart } = await import("../src/lib/ephemeris.ts");
const { computeAngularPoints } = await import("../src/lib/ascendant.ts");
const { computeWholeSignHouses, houseOfLongitude } = await import("../src/lib/houses.ts");
const { computeAspects, longitudeToSign } = await import("../src/data/sampleChart.ts");

const OUT_FILE = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../../dotnet/AstraAntiqua.Core.Tests/TestData/goldens.json",
);

// Chosen to span hemispheres, decades, and the ascendant-sign wraparound.
const CASES = [
  { name: "alexandria-2000", utc: "2000-06-21T12:00:00Z", lat: 31.2001, lon: 29.9187 },
  { name: "rome-1990", utc: "1990-01-15T04:30:00Z", lat: 41.9028, lon: 12.4964 },
  { name: "southern-1985", utc: "1985-11-03T22:15:00Z", lat: -33.8688, lon: 151.2093 },
  { name: "carthage-2026", utc: "2026-08-24T09:00:00Z", lat: 36.8529, lon: 10.3233 },
];

const cases = CASES.map(({ name, utc, lat, lon }) => {
  const date = new Date(utc);
  const chart = computeChart(date);
  const { ascendant, midheaven } = computeAngularPoints(date, lat, lon);
  const wholeSign = computeWholeSignHouses(ascendant);
  const houses = Object.fromEntries(
    Object.entries(chart).map(([planet, longitude]) => [
      planet,
      houseOfLongitude(longitude, wholeSign.ascendantSignIndex),
    ]),
  );
  const aspects = computeAspects(chart).map(({ a, b, kind }) => ({ a, b, kind }));
  return {
    name,
    utc,
    lat,
    lon,
    longitudes: chart,
    ascendant,
    midheaven,
    ascendantSign: longitudeToSign(ascendant).sign,
    houses,
    aspects,
  };
});

fs.mkdirSync(path.dirname(OUT_FILE), { recursive: true });
const tmp = `${OUT_FILE}.tmp`;
fs.writeFileSync(tmp, `${JSON.stringify({ tolerance: 0.001, cases }, null, 2)}\n`, "utf8");
fs.renameSync(tmp, OUT_FILE);

console.log(
  `export-goldens: wrote ${cases.length} cases ` +
    `(${cases.map((c) => `${c.name}: asc ${c.ascendantSign}, ${c.aspects.length} aspects`).join("; ")})`,
);

// ---- Horizons: readings, the week, the season, transits, synastry. --------
// Everything the iOS surface composes past the bare chart, recorded from the
// web functions that compose it, so the C# port is held to web's sentences
// and web's dates rather than to a reading of web's code.
//   -> dotnet/AstraAntiqua.Core.Tests/TestData/horizons.json

const { CULTURES, PLANETS } = await import("../src/data/cultures.ts");
const { buildReading } = await import("../src/lib/reading.ts");
const { buildWeekDays } = await import("../src/lib/weekReading.ts");
const { mondayOf } = await import("../src/components/horizons/format.ts");
const { computeTransitSpans } = await import("../src/lib/transitSpans.ts");
const {
  SLOW_BODIES,
  findYearIngresses,
  findRetrogradeStations,
  findMoonPhases,
  findSolarReturn,
  findEclipses,
} = await import("../src/lib/yearForecast.ts");
const { getCurrentSeason, getSeasonSkyEvents } = await import("../src/lib/season.ts");
const { computeMoonPhase } = await import("../src/lib/moonPhase.ts");
const { computeSynastry, topSynastry } = await import("../src/lib/synastry.ts");
const { computeTransits, topTransits } = await import("../src/lib/transits.ts");
const { resolveBirth } = await import("../src/lib/birthDateTime.ts");
const { houseReading } = await import("../src/lib/houseReading.ts");

const HORIZONS_FILE = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../../dotnet/AstraAntiqua.Core.Tests/TestData/horizons.json",
);

const iso = (d) => d.toISOString();
const chartOf = (name) => cases.find((c) => c.name === name).longitudes;

// Synthetic charts force each summary branch (more hard angles, more soft,
// even, and fused pairs), which four real charts need not happen to cover.
const synthetic = {
  "hard-angles": [0, 90, 180, 270, 45, 135, 225, 315, 3, 93],
  "soft-angles": [0, 120, 240, 60, 180, 300, 30, 150, 270, 2],
  "fused-pairs": [0, 1, 2, 100, 101, 200, 201, 300, 301, 302],
  "even-angles": [147, 353, 336, 321, 10, 219, 188, 72, 125, 57],
};
const readingCharts = {
  "alexandria-2000": chartOf("alexandria-2000"),
  "carthage-2026": chartOf("carthage-2026"),
  ...Object.fromEntries(
    Object.entries(synthetic).map(([name, lons]) => [
      name,
      Object.fromEntries(PLANETS.map((p, i) => [p, lons[i]])),
    ]),
  ),
};

const readings = [];
for (const [chartName, chart] of Object.entries(readingCharts)) {
  for (const culture of CULTURES) {
    const r = buildReading(culture, chart);
    readings.push({
      chart: chartName,
      culture,
      longitudes: chart,
      placements: r.placements.map((p) => ({
        planet: p.planet,
        sign: p.sign,
        degreeInSign: p.degreeInSign,
        deityName: p.deityName,
        deityEpithet: p.deityEpithet,
        domain: p.domain,
        culturalLine: p.culturalLine,
        signReading: p.signReading,
      })),
      aspects: r.aspects.map((a) => ({
        a: a.a,
        b: a.b,
        kind: a.kind,
        verbLine: a.verbLine,
        pairTheme: a.pairTheme,
        culturalReflection: a.culturalReflection,
      })),
      summary: r.summary,
    });
  }
}

const WEEK_ANCHORS = ["2026-10-20T12:00:00Z", "2026-03-18T12:00:00Z"];
const weeks = [];
for (const anchor of WEEK_ANCHORS) {
  const start = mondayOf(new Date(anchor));
  for (const culture of CULTURES) {
    weeks.push({
      weekStart: iso(start),
      culture,
      days: buildWeekDays(culture, start, null).map((d) => ({
        date: iso(d.date),
        label: d.label,
        line: d.line,
        tone: d.tone,
        flag: d.flag ?? null,
        shorthand: d.shorthand,
      })),
    });
  }
}

const natal = cases.find((c) => c.name === "rome-1990");
const natalPoints = [
  { key: "sun", longitude: natal.longitudes.sun },
  { key: "moon", longitude: natal.longitudes.moon },
  { key: "asc", longitude: natal.ascendant },
];
const SPAN_START = "2025-09-01T00:00:00Z";
const SPAN_DAYS = 730;
const spans = computeTransitSpans(natalPoints, SLOW_BODIES, new Date(SPAN_START), SPAN_DAYS).map(
  (s) => ({
    id: s.id,
    transitPlanet: s.transitPlanet,
    natalKey: s.natalKey,
    aspectKind: s.aspectKind,
    start: iso(s.start),
    end: iso(s.end),
    passes: s.passes.map(iso),
    transitSign: s.transitSign,
    transitDegree: s.transitDegree,
  }),
);

const INGRESS_START = "2026-03-01T00:00:00Z";
const INGRESS_DAYS = 60;
const ingresses = findYearIngresses(new Date(INGRESS_START), INGRESS_DAYS, PLANETS).map((e) => ({
  planet: e.planet,
  date: iso(e.date),
  fromSign: e.fromSign,
  toSign: e.toSign,
}));

const STATION_START = "2026-01-01T00:00:00Z";
const STATION_DAYS = 365;
const stations = findRetrogradeStations(new Date(STATION_START), STATION_DAYS).map((e) => ({
  planet: e.planet,
  kind: e.kind,
  date: iso(e.date),
  sign: e.sign,
  degree: e.degree,
}));

const QUARTER_START = "2026-01-01T00:00:00Z";
const QUARTER_DAYS = 60;
const moonQuarters = findMoonPhases(new Date(QUARTER_START), QUARTER_DAYS).map((e) => ({
  name: e.name,
  date: iso(e.date),
  sign: e.sign,
  degree: e.degree,
}));

const seasons = ["2026-10-20T12:00:00Z", "2027-02-01T08:00:00Z"].map((at) => {
  const w = getCurrentSeason(new Date(at));
  return {
    at,
    sign: w.sign,
    start: iso(w.start),
    end: iso(w.end),
    dayOfSeason: w.dayOfSeason,
    totalDays: w.totalDays,
    daysRemaining: w.daysRemaining,
  };
});

const ECLIPSE_START = "2026-01-01T00:00:00Z";
const ECLIPSE_DAYS = 730;
const eclipses = findEclipses(new Date(ECLIPSE_START), ECLIPSE_DAYS).map((e) => ({
  date: iso(e.date),
  scope: e.scope,
  kind: e.kind,
  obscuration: e.obscuration,
  sign: e.sign,
  degree: e.degree,
}));

const SEASON_EVENTS_AT = "2026-10-20T12:00:00Z";
const seasonSky = getSeasonSkyEvents(getCurrentSeason(new Date(SEASON_EVENTS_AT)));
const seasonEvents = {
  at: SEASON_EVENTS_AT,
  moonPhases: seasonSky.moonPhases.map((e) => ({ name: e.name, date: iso(e.date) })),
  eclipses: seasonSky.eclipses.map((e) => ({ scope: e.scope, kind: e.kind, date: iso(e.date) })),
  retrogrades: seasonSky.retrogrades.map((e) => ({ planet: e.planet, kind: e.kind, date: iso(e.date) })),
  ingresses: seasonSky.ingresses.map((e) => ({ planet: e.planet, toSign: e.toSign, date: iso(e.date) })),
};

const moonPhases = ["2026-10-20T12:00:00Z", "2026-01-03T00:00:00Z", "2026-07-15T18:30:00Z"].map(
  (at) => {
    const m = computeMoonPhase(new Date(at));
    return {
      at,
      angle: m.angle,
      illuminationFraction: m.illuminationFraction,
      name: m.name,
      isWaxing: m.isWaxing,
      nextQuarterName: m.nextQuarter.name,
      nextQuarterDate: iso(m.nextQuarter.date),
    };
  },
);

const solarReturns = [
  { natal: "rome-1990", from: "2026-10-20T00:00:00Z" },
  { natal: "alexandria-2000", from: "2026-10-20T00:00:00Z" },
].map(({ natal: name, from }) => {
  const sun = chartOf(name).sun;
  const r = findSolarReturn(sun, new Date(from));
  return { natal: name, natalSunLongitude: sun, from, date: iso(r.date), sign: r.sign, degree: r.degree };
});

const synastryAspects = computeSynastry(chartOf("alexandria-2000"), chartOf("rome-1990"));
const synastry = {
  chartA: "alexandria-2000",
  chartB: "rome-1990",
  aspects: synastryAspects.map((a) => ({ a: a.planetA, b: a.planetB, kind: a.kind, orb: a.orb })),
  top5: topSynastry(synastryAspects, 5).map((a) => ({ a: a.planetA, b: a.planetB, kind: a.kind })),
};

const transitHits = computeTransits(chartOf("carthage-2026"), chartOf("rome-1990"));
const transits = {
  transitChart: "carthage-2026",
  natalChart: "rome-1990",
  hits: transitHits.map((t) => ({ transit: t.transit, natal: t.natal, kind: t.kind, orb: t.orb })),
  top5: topTransits(transitHits, 5).map((t) => ({ transit: t.transit, natal: t.natal, kind: t.kind })),
};

// Births: zones on both sides of the meridian, a half-hour zone, a southern
// summer under DST, the hour a clock springs forward, and North Africa.
const BIRTHS = [
  { year: 1990, month: 7, day: 4, hour: 14, minute: 30, latitude: 40.7128, longitude: -74.006 },
  { year: 1985, month: 1, day: 15, hour: 6, minute: 5, latitude: 19.076, longitude: 72.8777 },
  { year: 2001, month: 11, day: 3, hour: 23, minute: 50, latitude: -33.8688, longitude: 151.2093 },
  { year: 2021, month: 3, day: 28, hour: 2, minute: 30, latitude: 51.5074, longitude: -0.1278 },
  { year: 1978, month: 8, day: 9, hour: 9, minute: 0, latitude: 36.8065, longitude: 10.1815 },
];
const births = BIRTHS.map((input) => {
  const r = resolveBirth(input);
  return { input, utc: iso(r.utcDate), timezone: r.timezone, offsetMinutes: r.offsetMinutes };
});

const houseReadings = [];
for (const culture of CULTURES)
  for (const planet of ["sun", "moon", "saturn", "pluto"])
    for (const house of [1, 4, 7, 12])
      houseReadings.push({ culture, planet, house, line: houseReading(culture, planet, house) });

const horizons = {
  readings,
  houseReadings,
  weeks,
  spans: { natal: natal.name, natalPoints, start: SPAN_START, days: SPAN_DAYS, spans },
  ingresses: { start: INGRESS_START, days: INGRESS_DAYS, events: ingresses },
  stations: { start: STATION_START, days: STATION_DAYS, events: stations },
  moonQuarters: { start: QUARTER_START, days: QUARTER_DAYS, events: moonQuarters },
  seasons,
  seasonEvents,
  eclipses: { start: ECLIPSE_START, days: ECLIPSE_DAYS, events: eclipses },
  moonPhases,
  solarReturns,
  synastry,
  transits,
  births,
};

const htmp = `${HORIZONS_FILE}.tmp`;
fs.writeFileSync(htmp, `${JSON.stringify(horizons, null, 2)}\n`, "utf8");
fs.renameSync(htmp, HORIZONS_FILE);

const summaries = new Set(readings.map((r) => r.summary.replace(/^[^.]*\. /, "")));
console.log(
  `export-goldens: wrote horizons (${readings.length} readings, ${weeks.length} weeks, ` +
    `${spans.length} spans, ${ingresses.length} ingresses, ${stations.length} stations, ` +
    `${moonQuarters.length} quarters, ${births.length} births; ${summaries.size} distinct summary tails)`,
);
