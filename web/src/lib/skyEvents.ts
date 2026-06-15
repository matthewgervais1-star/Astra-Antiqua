import { PLANETS, type Planet } from "@/data/cultures";
import { computeGeocentricLongitude } from "@/lib/ephemeris";
import { longitudeToSign, type ZodiacSign } from "@/data/sampleChart";

export type SkyEventKind = "ingress";

export interface SkyEvent {
  kind: SkyEventKind;
  planet: Planet;
  date: Date;
  fromSign: ZodiacSign;
  toSign: ZodiacSign;
}

const MS_PER_DAY = 24 * 60 * 60 * 1000;
const MS_PER_HOUR = 60 * 60 * 1000;

function signIndex(longitude: number): number {
  return Math.floor((((longitude % 360) + 360) % 360) / 30);
}

function findIngressBetween(planet: Planet, lo: Date, hi: Date): Date {
  // Bracket the moment when the planet crosses a 30° boundary.
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
    if (hiTime - loTime < MS_PER_HOUR / 2) break;
  }
  return new Date(hiTime);
}

/**
 * Detect zodiac sign ingresses for the seven classical planets in the next
 * `days` days from `start`. Samples each planet daily and detects sign-index
 * changes between adjacent samples. Exact moment binary-searched to within
 * half an hour.
 */
export function computeUpcomingIngresses(start: Date, days: number): readonly SkyEvent[] {
  const events: SkyEvent[] = [];
  for (const planet of PLANETS) {
    let prevSample = start;
    let prevIdx = signIndex(computeGeocentricLongitude(planet, prevSample));
    for (let d = 1; d <= days; d += 1) {
      const next = new Date(start.getTime() + d * MS_PER_DAY);
      const nextIdx = signIndex(computeGeocentricLongitude(planet, next));
      if (nextIdx !== prevIdx) {
        const exact = findIngressBetween(planet, prevSample, next);
        events.push({
          kind: "ingress",
          planet,
          date: exact,
          fromSign: longitudeToSign(computeGeocentricLongitude(planet, prevSample)).sign,
          toSign: longitudeToSign(computeGeocentricLongitude(planet, next)).sign,
        });
      }
      prevSample = next;
      prevIdx = nextIdx;
    }
  }
  events.sort((a, b) => a.date.getTime() - b.date.getTime());
  return events;
}
