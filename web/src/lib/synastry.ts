import { PLANETS, type Planet } from "@/data/cultures";
import { ASPECT_RULES } from "@/data/sampleChart";
import type { AspectKind, Longitude } from "@/data/sampleChart";

export interface SynastryAspect {
  /** Planet from chart A (the "first" chart in the pair) */
  planetA: Planet;
  /** Planet from chart B */
  planetB: Planet;
  kind: AspectKind;
  exactAngle: number;
  orb: number;
}

function angularSeparation(a: Longitude, b: Longitude): number {
  const raw = Math.abs(a - b) % 360;
  return raw > 180 ? 360 - raw : raw;
}

export function computeSynastry(
  chartA: Readonly<Record<Planet, Longitude>>,
  chartB: Readonly<Record<Planet, Longitude>>,
): readonly SynastryAspect[] {
  const out: SynastryAspect[] = [];
  for (const planetA of PLANETS) {
    for (const planetB of PLANETS) {
      const sep = angularSeparation(chartA[planetA], chartB[planetB]);
      for (const rule of ASPECT_RULES) {
        const delta = Math.abs(sep - rule.angle);
        if (delta <= rule.orb) {
          out.push({
            planetA,
            planetB,
            kind: rule.kind,
            exactAngle: sep,
            orb: delta,
          });
          break;
        }
      }
    }
  }
  return out;
}

export function topSynastry(
  aspects: readonly SynastryAspect[],
  count: number,
): readonly SynastryAspect[] {
  return [...aspects].sort((a, b) => a.orb - b.orb).slice(0, count);
}
