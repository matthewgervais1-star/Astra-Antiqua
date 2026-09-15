import type { Planet } from "@/data/cultures";
import { computeGeocentricLongitude } from "@/lib/ephemeris";

export type Motion = "direct" | "retrograde";

const HALF_DAY_MS = 12 * 60 * 60 * 1000;

/**
 * Direct or retrograde at the instant, read from the sign of the geocentric
 * longitude's change across the surrounding day. The Sun and the Moon never
 * retrograde as seen from Earth, so they are answered without a lookup.
 * Nothing is estimated: both ends come from the same ephemeris as the chart.
 */
export function computeMotion(planet: Planet, date: Date): Motion {
  if (planet === "sun" || planet === "moon") return "direct";
  const before = computeGeocentricLongitude(planet, new Date(date.getTime() - HALF_DAY_MS));
  const after = computeGeocentricLongitude(planet, new Date(date.getTime() + HALF_DAY_MS));
  const delta = ((after - before + 540) % 360) - 180;
  return delta < 0 ? "retrograde" : "direct";
}
