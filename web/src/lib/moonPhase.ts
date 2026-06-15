import { EclipticGeoMoon, SunPosition } from "astronomy-engine";

export type MoonPhaseName =
  | "New Moon"
  | "Waxing Crescent"
  | "First Quarter"
  | "Waxing Gibbous"
  | "Full Moon"
  | "Waning Gibbous"
  | "Last Quarter"
  | "Waning Crescent";

export interface MoonPhase {
  angle: number; // 0-360, angular separation moon-sun (sun-centered reference)
  illuminationFraction: number; // 0-1
  name: MoonPhaseName;
  isWaxing: boolean;
  nextQuarter: {
    name: MoonPhaseName;
    date: Date;
  };
}

function normalize360(v: number): number {
  const a = v % 360;
  return a < 0 ? a + 360 : a;
}

function phaseAngleAt(date: Date): number {
  // Phase angle conventionally measured from new (0) through first quarter (90),
  // full (180), last quarter (270), back to new (360 = 0).
  const sun = SunPosition(date).elon;
  const moon = EclipticGeoMoon(date).lon;
  return normalize360(moon - sun);
}

function nameForAngle(angle: number): MoonPhaseName {
  const a = normalize360(angle);
  if (a < 22.5) return "New Moon";
  if (a < 67.5) return "Waxing Crescent";
  if (a < 112.5) return "First Quarter";
  if (a < 157.5) return "Waxing Gibbous";
  if (a < 202.5) return "Full Moon";
  if (a < 247.5) return "Waning Gibbous";
  if (a < 292.5) return "Last Quarter";
  if (a < 337.5) return "Waning Crescent";
  return "New Moon";
}

function nextQuarterAngle(currentAngle: number): { angle: number; name: MoonPhaseName } {
  const a = normalize360(currentAngle);
  if (a < 90) return { angle: 90, name: "First Quarter" };
  if (a < 180) return { angle: 180, name: "Full Moon" };
  if (a < 270) return { angle: 270, name: "Last Quarter" };
  return { angle: 360, name: "New Moon" };
}

function searchForAngle(start: Date, targetAngle: number): Date {
  // The phase angle increases roughly 12.19 degrees per day. Step forward in
  // 6-hour increments until we cross the target, then binary-search the
  // crossing minute.
  const stepMs = 6 * 60 * 60 * 1000;
  const maxIterations = 4 * 40; // up to ~40 days ahead, safety bound
  let prevDate = start;
  let prevDelta = normalize360(phaseAngleAt(prevDate) - targetAngle);

  for (let i = 0; i < maxIterations; i += 1) {
    const nextDate = new Date(prevDate.getTime() + stepMs);
    const nextDelta = normalize360(phaseAngleAt(nextDate) - targetAngle);
    // Detect zero-crossing in the delta function (it should pass through 0
    // when angle reaches target). When prevDelta is close to 360 and nextDelta
    // is small, the crossing happened in this interval.
    if (prevDelta > 270 && nextDelta < 90) {
      // Binary search
      let lo = prevDate.getTime();
      let hi = nextDate.getTime();
      for (let j = 0; j < 30; j += 1) {
        const mid = (lo + hi) / 2;
        const midDelta = normalize360(phaseAngleAt(new Date(mid)) - targetAngle);
        if (midDelta > 270) {
          lo = mid;
        } else {
          hi = mid;
        }
      }
      return new Date(hi);
    }
    prevDate = nextDate;
    prevDelta = nextDelta;
  }
  return prevDate;
}

export function computeMoonPhase(date: Date): MoonPhase {
  const angle = phaseAngleAt(date);
  const name = nameForAngle(angle);
  const isWaxing = angle < 180;
  // Illumination fraction (Meeus eq 48.1, approximated as (1 - cos(angle)) / 2)
  const angleRad = (angle * Math.PI) / 180;
  const illuminationFraction = (1 - Math.cos(angleRad)) / 2;
  const next = nextQuarterAngle(angle);
  const nextDate = searchForAngle(date, next.angle);
  return {
    angle,
    illuminationFraction,
    name,
    isWaxing,
    nextQuarter: { name: next.name, date: nextDate },
  };
}
