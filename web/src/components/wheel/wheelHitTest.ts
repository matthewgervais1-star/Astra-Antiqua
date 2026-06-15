import { PLANETS, type Planet } from "@/data/cultures";
import { SAMPLE_CHART, type Longitude } from "@/data/sampleChart";

export interface PlanetPosition {
  planet: Planet;
  longitude: Longitude;
  x: number;
  y: number;
  radius: number;
}

export interface WheelGeometry {
  size: number;
  cx: number;
  cy: number;
  outerRadius: number;
  zodiacRadius: number;
  planetRadius: number;
  innerRadius: number;
  glyphSize: number;
  hitRadius: number;
}

export function makeGeometry(size: number): WheelGeometry {
  const cx = size / 2;
  const cy = size / 2;
  const outerRadius = (size / 2) * 0.95;
  const zodiacRadius = outerRadius * 0.92;
  const planetRadius = outerRadius * 0.74;
  const innerRadius = outerRadius * 0.34;
  const glyphSize = Math.max(20, Math.min(36, size * 0.06));
  const hitRadius = Math.max(20, glyphSize * 0.9);
  return { size, cx, cy, outerRadius, zodiacRadius, planetRadius, innerRadius, glyphSize, hitRadius };
}

export function longitudeToCartesian(
  longitude: Longitude,
  radius: number,
  cx: number,
  cy: number,
): { x: number; y: number } {
  const angleRad = ((180 - longitude) * Math.PI) / 180;
  return {
    x: cx + Math.cos(angleRad) * radius,
    y: cy - Math.sin(angleRad) * radius,
  };
}

export function computePlanetPositions(
  geometry: WheelGeometry,
  chart: Readonly<Record<Planet, Longitude>> = SAMPLE_CHART,
): readonly PlanetPosition[] {
  return PLANETS.map((planet) => {
    const longitude = chart[planet];
    const { x, y } = longitudeToCartesian(longitude, geometry.planetRadius, geometry.cx, geometry.cy);
    return {
      planet,
      longitude,
      x,
      y,
      radius: geometry.hitRadius,
    };
  });
}

export function hitTest(
  positions: readonly PlanetPosition[],
  pointerX: number,
  pointerY: number,
): Planet | null {
  let closest: { planet: Planet; distance: number } | null = null;
  for (const p of positions) {
    const dx = p.x - pointerX;
    const dy = p.y - pointerY;
    const distance = Math.sqrt(dx * dx + dy * dy);
    if (distance <= p.radius && (closest === null || distance < closest.distance)) {
      closest = { planet: p.planet, distance };
    }
  }
  return closest?.planet ?? null;
}
