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
