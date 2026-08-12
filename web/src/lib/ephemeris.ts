import {
  Body,
  Ecliptic,
  EclipticGeoMoon,
  GeoVector,
  SunPosition,
} from "astronomy-engine";
import { PLANETS, type Planet } from "@/data/cultures";

const BODY_FOR_PLANET: Readonly<Record<Exclude<Planet, "sun" | "moon">, Body>> = {
  mercury: Body.Mercury,
  venus: Body.Venus,
  mars: Body.Mars,
  jupiter: Body.Jupiter,
  saturn: Body.Saturn,
  uranus: Body.Uranus,
  neptune: Body.Neptune,
  pluto: Body.Pluto,
};

function normalize(longitude: number): number {
  const wrapped = longitude % 360;
  return wrapped < 0 ? wrapped + 360 : wrapped;
}

export function computeGeocentricLongitude(planet: Planet, date: Date): number {
  if (planet === "sun") {
    return normalize(SunPosition(date).elon);
  }
  if (planet === "moon") {
    return normalize(EclipticGeoMoon(date).lon);
  }
  const body = BODY_FOR_PLANET[planet];
  const vector = GeoVector(body, date, true);
  return normalize(Ecliptic(vector).elon);
}

export function computeChart(date: Date): Readonly<Record<Planet, number>> {
  const chart = Object.create(null) as Record<Planet, number>;
  for (const planet of PLANETS) {
    chart[planet] = computeGeocentricLongitude(planet, date);
  }
  return chart;
}
