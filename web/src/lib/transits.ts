import { PLANETS, type Planet } from "@/data/cultures";
import { ASPECT_RULES } from "@/data/sampleChart";
import type { AspectKind, Longitude } from "@/data/sampleChart";

export interface TransitAspect {
  transit: Planet; // body in today's sky
  natal: Planet; // body in the natal chart
  kind: AspectKind;
  exactAngle: number;
  orb: number;
}

function angularDelta(a: number, b: number): number {
  const raw = Math.abs(a - b) % 360;
  return raw > 180 ? 360 - raw : raw;
}

/**
 * Compute today-to-natal aspects: each transit planet against each natal
 * planet. Uses tighter orbs than the natal-internal aspect detector because
 * transit hits are more clinically meaningful when close.
 */
export function computeTransits(
  transitChart: Readonly<Record<Planet, Longitude>>,
  natalChart: Readonly<Record<Planet, Longitude>>,
): readonly TransitAspect[] {
  const hits: TransitAspect[] = [];
  for (const transit of PLANETS) {
    for (const natal of PLANETS) {
      const angle = angularDelta(transitChart[transit], natalChart[natal]);
      for (const rule of ASPECT_RULES) {
        const delta = Math.abs(angle - rule.angle);
        if (delta <= rule.orb) {
          hits.push({
            transit,
            natal,
            kind: rule.kind,
            exactAngle: angle,
            orb: delta,
          });
          break;
        }
      }
    }
  }
  return hits;
}

/** How much a moving planet's touch matters, slowest heaviest. */
export function transitPlanetWeight(planet: Planet): number {
  switch (planet) {
    case "saturn":
      return 4;
    case "jupiter":
      return 3;
    case "mars":
      return 2;
    case "venus":
    case "mercury":
      return 1.5;
    case "sun":
    case "moon":
      return 1;
  }
}

/**
 * The "headline transits" of the day: tightest hits, optionally excluding
 * cross-body same-planet (transit Mars to natal Mars) which is common and
 * less personally striking.
 */
export function topTransits(
  transits: readonly TransitAspect[],
  count = 5,
  excludeSelfPairs = true,
): readonly TransitAspect[] {
  const filtered = excludeSelfPairs
    ? transits.filter((t) => t.transit !== t.natal)
    : [...transits];
  filtered.sort((a, b) => a.orb - b.orb);
  return filtered.slice(0, count);
}
