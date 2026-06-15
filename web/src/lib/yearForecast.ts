import {
  Body,
  EclipseKind,
  NextGlobalSolarEclipse,
  NextLunarEclipse,
  NextMoonQuarter,
  SearchGlobalSolarEclipse,
  SearchLunarEclipse,
  SearchMoonQuarter,
  SearchSunLongitude,
} from "astronomy-engine";
import { computeGeocentricLongitude } from "@/lib/ephemeris";
import { longitudeToSign, type ZodiacSign } from "@/data/sampleChart";
import type { Planet } from "@/data/cultures";

const MS_PER_DAY = 24 * 60 * 60 * 1000;

function normalize360(angle: number): number {
  const a = angle % 360;
  return a < 0 ? a + 360 : a;
}

// =============== Moon phases ===============

export type MoonPhaseName = "New Moon" | "First Quarter" | "Full Moon" | "Last Quarter";

export interface MoonPhaseEvent {
  date: Date;
  name: MoonPhaseName;
  sign: ZodiacSign;
  degree: number;
}

const QUARTER_NAMES: readonly MoonPhaseName[] = [
  "New Moon",
  "First Quarter",
  "Full Moon",
  "Last Quarter",
];

export function findMoonPhases(start: Date, days: number): readonly MoonPhaseEvent[] {
  const end = new Date(start.getTime() + days * MS_PER_DAY);
  const out: MoonPhaseEvent[] = [];
  let q = SearchMoonQuarter(start);
  // Safety bound: at most one quarter every ~7 days, so days/7 + a buffer is plenty
  const maxIter = Math.ceil(days / 7) + 4;
  for (let i = 0; i < maxIter; i += 1) {
    if (q.time.date >= end) break;
    const lon = computeGeocentricLongitude("moon", q.time.date);
    const { sign, degree } = longitudeToSign(lon);
    const name = QUARTER_NAMES[q.quarter] ?? "New Moon";
    out.push({ date: q.time.date, name, sign, degree });
    q = NextMoonQuarter(q);
  }
  return out;
}

// =============== Eclipses ===============

export type EclipseKindName = "penumbral" | "partial" | "annular" | "total";
export type EclipseScope = "lunar" | "solar";

export interface EclipseEvent {
  date: Date;
  scope: EclipseScope;
  kind: EclipseKindName;
  obscuration: number;
  sign: ZodiacSign;
  degree: number;
}

function kindToName(k: EclipseKind): EclipseKindName {
  switch (k) {
    case EclipseKind.Penumbral:
      return "penumbral";
    case EclipseKind.Partial:
      return "partial";
    case EclipseKind.Annular:
      return "annular";
    case EclipseKind.Total:
      return "total";
    default:
      return "partial";
  }
}

export function findEclipses(start: Date, days: number): readonly EclipseEvent[] {
  const end = new Date(start.getTime() + days * MS_PER_DAY);
  const out: EclipseEvent[] = [];

  // Lunar eclipses (Moon-position-based; ecliptic longitude at eclipse peak)
  let lunar = SearchLunarEclipse(start);
  for (let i = 0; i < 12; i += 1) {
    if (lunar.peak.date >= end) break;
    const lon = computeGeocentricLongitude("moon", lunar.peak.date);
    const { sign, degree } = longitudeToSign(lon);
    out.push({
      date: lunar.peak.date,
      scope: "lunar",
      kind: kindToName(lunar.kind),
      obscuration: lunar.obscuration,
      sign,
      degree,
    });
    lunar = NextLunarEclipse(lunar.peak);
  }

  // Global solar eclipses (Sun-position-based at peak)
  let solar = SearchGlobalSolarEclipse(start);
  for (let i = 0; i < 12; i += 1) {
    if (solar.peak.date >= end) break;
    const lon = computeGeocentricLongitude("sun", solar.peak.date);
    const { sign, degree } = longitudeToSign(lon);
    out.push({
      date: solar.peak.date,
      scope: "solar",
      kind: kindToName(solar.kind),
      obscuration: solar.obscuration ?? 0,
      sign,
      degree,
    });
    solar = NextGlobalSolarEclipse(solar.peak);
  }

  return out.sort((a, b) => a.date.getTime() - b.date.getTime());
}

// =============== Retrograde stations ===============

export type StationKind = "retrograde" | "direct";

export interface RetrogradeEvent {
  planet: Planet;
  kind: StationKind;
  date: Date;
  sign: ZodiacSign;
  degree: number;
}

const RETROGRADE_PLANETS: readonly Planet[] = [
  "mercury",
  "venus",
  "mars",
  "jupiter",
  "saturn",
];

function planetVelocity(planet: Planet, date: Date): number {
  // Returns approximate angular velocity in degrees per day (signed).
  const dtHours = 1;
  const before = computeGeocentricLongitude(
    planet,
    new Date(date.getTime() - dtHours * 60 * 60 * 1000),
  );
  const after = computeGeocentricLongitude(
    planet,
    new Date(date.getTime() + dtHours * 60 * 60 * 1000),
  );
  let delta = after - before;
  if (delta > 180) delta -= 360;
  if (delta < -180) delta += 360;
  return delta * (24 / (2 * dtHours));
}

function binarySearchStation(planet: Planet, lo: Date, hi: Date): Date {
  let loT = lo.getTime();
  let hiT = hi.getTime();
  let loV = planetVelocity(planet, lo);
  for (let i = 0; i < 32; i += 1) {
    const midT = (loT + hiT) / 2;
    const midDate = new Date(midT);
    const midV = planetVelocity(planet, midDate);
    if (loV * midV <= 0) {
      hiT = midT;
    } else {
      loT = midT;
      loV = midV;
    }
    if (hiT - loT < 60 * 1000) break;
  }
  return new Date((loT + hiT) / 2);
}

export function findRetrogradeStations(start: Date, days: number): readonly RetrogradeEvent[] {
  const out: RetrogradeEvent[] = [];
  for (const planet of RETROGRADE_PLANETS) {
    // Sample weekly for slow planets; daily for Mercury would also work but is slower.
    const stepDays = planet === "saturn" || planet === "jupiter" ? 3 : 1;
    let prevDate = start;
    let prevVel = planetVelocity(planet, prevDate);
    for (let d = stepDays; d <= days; d += stepDays) {
      const date = new Date(start.getTime() + d * MS_PER_DAY);
      const vel = planetVelocity(planet, date);
      if (prevVel * vel < 0) {
        const exact = binarySearchStation(planet, prevDate, date);
        const lon = computeGeocentricLongitude(planet, exact);
        const { sign, degree } = longitudeToSign(lon);
        out.push({
          planet,
          kind: prevVel > 0 ? "retrograde" : "direct",
          date: exact,
          sign,
          degree,
        });
      }
      prevDate = date;
      prevVel = vel;
    }
  }
  return out.sort((a, b) => a.date.getTime() - b.date.getTime());
}

// =============== Solar return ===============

export interface SolarReturnEvent {
  date: Date;
  natalSunLongitude: number;
  sign: ZodiacSign;
  degree: number;
}

export function findSolarReturn(
  natalSunLongitude: number,
  fromDate: Date,
  limitDays = 400,
): SolarReturnEvent | null {
  const target = normalize360(natalSunLongitude);
  const result = SearchSunLongitude(target, fromDate, limitDays);
  if (!result) return null;
  const { sign, degree } = longitudeToSign(target);
  return {
    date: result.date,
    natalSunLongitude: target,
    sign,
    degree,
  };
}

// =============== Sign ingresses ===============

const ALL_BODIES: ReadonlyArray<{ planet: Planet; body: Body | "sun" | "moon" }> = [
  { planet: "sun", body: "sun" },
  { planet: "moon", body: "moon" },
  { planet: "mercury", body: Body.Mercury },
  { planet: "venus", body: Body.Venus },
  { planet: "mars", body: Body.Mars },
  { planet: "jupiter", body: Body.Jupiter },
  { planet: "saturn", body: Body.Saturn },
];

export interface YearIngressEvent {
  planet: Planet;
  date: Date;
  fromSign: ZodiacSign;
  toSign: ZodiacSign;
}

function signIndex(longitude: number): number {
  return Math.floor((((longitude % 360) + 360) % 360) / 30);
}

function findIngressBetween(planet: Planet, lo: Date, hi: Date): Date {
  let loTime = lo.getTime();
  let hiTime = hi.getTime();
  const loIdx = signIndex(computeGeocentricLongitude(planet, lo));
  for (let i = 0; i < 40; i += 1) {
    const mid = (loTime + hiTime) / 2;
    const midIdx = signIndex(computeGeocentricLongitude(planet, new Date(mid)));
    if (midIdx === loIdx) {
      loTime = mid;
    } else {
      hiTime = mid;
    }
    if (hiTime - loTime < 30 * 60 * 1000) break;
  }
  return new Date(hiTime);
}

/**
 * Year-long ingress finder. Same idea as the existing skyEvents.ts version
 * but configured for longer windows and works for all seven classical
 * planets. (Mercury, Venus, Mars cross signs frequently; Jupiter and Saturn
 * cross only a handful of times in a year.)
 */
export function findYearIngresses(
  start: Date,
  days: number,
  planets: readonly Planet[] = ALL_BODIES.map((b) => b.planet),
): readonly YearIngressEvent[] {
  const out: YearIngressEvent[] = [];
  for (const planet of planets) {
    const sampleDays = planet === "moon" ? 1 : planet === "sun" || planet === "mercury" || planet === "venus" ? 2 : planet === "mars" ? 5 : 14;
    let prevDate = start;
    let prevIdx = signIndex(computeGeocentricLongitude(planet, prevDate));
    for (let d = sampleDays; d <= days; d += sampleDays) {
      const next = new Date(start.getTime() + d * MS_PER_DAY);
      const nextIdx = signIndex(computeGeocentricLongitude(planet, next));
      if (nextIdx !== prevIdx) {
        const exact = findIngressBetween(planet, prevDate, next);
        out.push({
          planet,
          date: exact,
          fromSign: longitudeToSign(computeGeocentricLongitude(planet, prevDate)).sign,
          toSign: longitudeToSign(computeGeocentricLongitude(planet, next)).sign,
        });
      }
      prevDate = next;
      prevIdx = nextIdx;
    }
  }
  return out.sort((a, b) => a.date.getTime() - b.date.getTime());
}

// =============== Major transits to natal ===============

export interface NatalTransitPeak {
  transitPlanet: Planet;
  natalKey: string; // "sun", "moon", "asc", "mc"
  natalLongitude: number;
  aspectKind: "conjunction" | "sextile" | "square" | "trine" | "opposition";
  date: Date;
  transitSign: ZodiacSign;
  transitDegree: number;
}

interface NatalPoint {
  key: string;
  longitude: number;
}

const ASPECT_ANGLES: ReadonlyArray<{ kind: NatalTransitPeak["aspectKind"]; angle: number }> = [
  { kind: "conjunction", angle: 0 },
  { kind: "sextile", angle: 60 },
  { kind: "square", angle: 90 },
  { kind: "trine", angle: 120 },
  { kind: "opposition", angle: 180 },
];

function angularSeparation(a: number, b: number): number {
  const raw = Math.abs(a - b) % 360;
  return raw > 180 ? 360 - raw : raw;
}

/**
 * For each (transit planet × natal point × aspect angle), find when the
 * transit planet's longitude first hits the target angle (within 0.5 degree).
 * Then continue the search past that hit to find any subsequent hits in the
 * window (planets can retrograde and form the same aspect multiple times).
 */
export function findMajorTransits(
  natalPoints: readonly NatalPoint[],
  transitPlanets: readonly Planet[],
  start: Date,
  days: number,
): readonly NatalTransitPeak[] {
  const out: NatalTransitPeak[] = [];
  const sampleDays = 2;
  for (const planet of transitPlanets) {
    for (const point of natalPoints) {
      for (const rule of ASPECT_ANGLES) {
        // For each target angle, the transit planet's longitude should equal
        // (point.longitude + rule.angle) mod 360 OR (point.longitude - rule.angle).
        // We track the signed difference (transit - target) mod 360 mapped to [-180, 180]
        // and detect zero crossings.
        const targets: number[] = rule.angle === 0 || rule.angle === 180
          ? [normalize360(point.longitude + rule.angle)]
          : [normalize360(point.longitude + rule.angle), normalize360(point.longitude - rule.angle)];
        for (const target of targets) {
          let prevDate = start;
          let prevDiff = signedDiff(computeGeocentricLongitude(planet, prevDate), target);
          for (let d = sampleDays; d <= days; d += sampleDays) {
            const date = new Date(start.getTime() + d * MS_PER_DAY);
            const lon = computeGeocentricLongitude(planet, date);
            const diff = signedDiff(lon, target);
            // Zero crossing detection: prev and current have opposite signs and the
            // jump is not a 360 wraparound (rare for diff series of < 60 deg/day moves)
            if (prevDiff * diff < 0 && Math.abs(prevDiff - diff) < 30) {
              const exact = binarySearchLongitudeTarget(planet, target, prevDate, date);
              const lonAtExact = computeGeocentricLongitude(planet, exact);
              const { sign, degree } = longitudeToSign(lonAtExact);
              // Confirm orb is tight at the found moment
              const angularDist = angularSeparation(lonAtExact, point.longitude);
              if (Math.abs(angularDist - rule.angle) < 0.5) {
                out.push({
                  transitPlanet: planet,
                  natalKey: point.key,
                  natalLongitude: point.longitude,
                  aspectKind: rule.kind,
                  date: exact,
                  transitSign: sign,
                  transitDegree: degree,
                });
              }
            }
            prevDate = date;
            prevDiff = diff;
          }
        }
      }
    }
  }
  return out.sort((a, b) => a.date.getTime() - b.date.getTime());
}

function signedDiff(longitude: number, target: number): number {
  let diff = longitude - target;
  while (diff > 180) diff -= 360;
  while (diff < -180) diff += 360;
  return diff;
}

function binarySearchLongitudeTarget(
  planet: Planet,
  target: number,
  lo: Date,
  hi: Date,
): Date {
  let loTime = lo.getTime();
  let hiTime = hi.getTime();
  const loDiff = signedDiff(computeGeocentricLongitude(planet, lo), target);
  for (let i = 0; i < 32; i += 1) {
    const mid = (loTime + hiTime) / 2;
    const midDiff = signedDiff(computeGeocentricLongitude(planet, new Date(mid)), target);
    if (loDiff * midDiff <= 0) {
      hiTime = mid;
    } else {
      loTime = mid;
    }
    if (hiTime - loTime < 60 * 1000) break;
  }
  return new Date((loTime + hiTime) / 2);
}
