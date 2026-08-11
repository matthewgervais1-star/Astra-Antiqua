import type { Planet } from "@/data/cultures";
import type { AspectKind, ZodiacSign } from "@/data/sampleChart";
import { computeGeocentricLongitude } from "@/lib/ephemeris";
import { findMajorTransits, type NatalTransitPeak } from "@/lib/yearForecast";

/**
 * A long transit as a SPAN, not a moment: the stretch during which the
 * transiting body holds within SPAN_ORB degrees of exact, with every exact
 * pass (retrograde returns included) inside it. The three-degree rule is
 * documented on /method; the reading pages scope their prose to this span.
 */
export interface TransitSpan {
  /** `${transitPlanet}-${aspectKind}-${natalKey}`, the /transits/[id] param */
  id: string;
  transitPlanet: Planet;
  natalKey: string;
  natalLongitude: number;
  aspectKind: AspectKind;
  start: Date;
  end: Date;
  passes: readonly Date[];
  transitSign: ZodiacSign;
  transitDegree: number;
}

export const SPAN_ORB = 3;

const ASPECT_ANGLE: Readonly<Record<AspectKind, number>> = {
  conjunction: 0,
  sextile: 60,
  square: 90,
  trine: 120,
  opposition: 180,
};

const WALK_STEP_DAYS = 5;
const WALK_CAP_DAYS = 700;
const DAY_MS = 86_400_000;

function separation(a: number, b: number): number {
  const raw = Math.abs(a - b) % 360;
  return raw > 180 ? 360 - raw : raw;
}

function distanceFromExact(
  planet: Planet,
  natalLongitude: number,
  kind: AspectKind,
  date: Date,
): number {
  const lon = computeGeocentricLongitude(planet, date);
  return Math.abs(separation(lon, natalLongitude) - ASPECT_ANGLE[kind]);
}

/** Walk from an exact pass until the body leaves SPAN_ORB, capped. */
function walkEdge(
  planet: Planet,
  natalLongitude: number,
  kind: AspectKind,
  from: Date,
  direction: -1 | 1,
): Date {
  let edge = from;
  for (let step = 1; step * WALK_STEP_DAYS <= WALK_CAP_DAYS; step += 1) {
    const probe = new Date(from.getTime() + direction * step * WALK_STEP_DAYS * DAY_MS);
    if (distanceFromExact(planet, natalLongitude, kind, probe) > SPAN_ORB) break;
    edge = probe;
  }
  return edge;
}

export interface SpanNatalPoint {
  key: string;
  longitude: number;
}

/**
 * Group the exact passes from findMajorTransits into spans. Slow bodies
 * triple-hit a degree across retrogradation; those passes share one span.
 */
export function computeTransitSpans(
  natalPoints: readonly SpanNatalPoint[],
  transitPlanets: readonly Planet[],
  start: Date,
  days: number,
): readonly TransitSpan[] {
  const peaks = findMajorTransits(natalPoints, transitPlanets, start, days);
  const groups = new Map<string, NatalTransitPeak[]>();
  for (const peak of peaks) {
    const id = `${peak.transitPlanet}-${peak.aspectKind}-${peak.natalKey}`;
    const group = groups.get(id);
    if (group) group.push(peak);
    else groups.set(id, [peak]);
  }

  const spans: TransitSpan[] = [];
  for (const [id, group] of groups) {
    group.sort((a, b) => a.date.getTime() - b.date.getTime());
    const first = group[0];
    const last = group[group.length - 1];
    if (!first || !last) continue;
    spans.push({
      id,
      transitPlanet: first.transitPlanet,
      natalKey: first.natalKey,
      natalLongitude: first.natalLongitude,
      aspectKind: first.aspectKind,
      start: walkEdge(first.transitPlanet, first.natalLongitude, first.aspectKind, first.date, -1),
      end: walkEdge(last.transitPlanet, last.natalLongitude, last.aspectKind, last.date, 1),
      passes: group.map((peak) => peak.date),
      transitSign: first.transitSign,
      transitDegree: first.transitDegree,
    });
  }
  return spans.sort((a, b) => a.start.getTime() - b.start.getTime());
}

export function findSpanById(
  spans: readonly TransitSpan[],
  id: string,
): TransitSpan | undefined {
  return spans.find((span) => span.id === id);
}
