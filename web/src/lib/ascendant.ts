import { SiderealTime } from "astronomy-engine";

const MEAN_OBLIQUITY_DEG = 23.4392911;
const DEG_TO_RAD = Math.PI / 180;
const RAD_TO_DEG = 180 / Math.PI;

function normalize360(angle: number): number {
  const a = angle % 360;
  return a < 0 ? a + 360 : a;
}

export interface AngularPoints {
  ascendant: number; // ecliptic longitude in degrees, 0-360
  midheaven: number; // ecliptic longitude in degrees, 0-360
}

/**
 * Compute the Ascendant (rising sign) and Midheaven for a given UTC instant
 * and geographic location. Uses the standard formulas from Meeus chapter 13,
 * with mean obliquity of date (J2000 epoch approximation; the error is well
 * under a degree for any modern birth date).
 */
export function computeAngularPoints(
  utcDate: Date,
  latitudeDeg: number,
  longitudeDeg: number,
): AngularPoints {
  // Greenwich Sidereal Time, in hours.
  const gstHours = SiderealTime(utcDate);
  // Local Sidereal Time = GST + east-longitude in hours.
  const lstHours = ((gstHours + longitudeDeg / 15) % 24 + 24) % 24;
  // RAMC: Right Ascension of the Midheaven, in degrees.
  const ramcDeg = lstHours * 15;

  const ramcRad = ramcDeg * DEG_TO_RAD;
  const oblRad = MEAN_OBLIQUITY_DEG * DEG_TO_RAD;
  const latRad = latitudeDeg * DEG_TO_RAD;

  // Midheaven (ecliptic longitude where the meridian intersects the ecliptic):
  // tan(MC) = tan(RAMC) / cos(obliquity)
  let mcDeg = Math.atan2(Math.sin(ramcRad), Math.cos(ramcRad) * Math.cos(oblRad)) * RAD_TO_DEG;
  mcDeg = normalize360(mcDeg);

  // Ascendant (ecliptic longitude where the ecliptic intersects the eastern horizon):
  // tan(ASC) = -cos(RAMC) / (sin(RAMC) * cos(oblq) + tan(lat) * sin(oblq))
  const numer = -Math.cos(ramcRad);
  const denom = Math.sin(ramcRad) * Math.cos(oblRad) + Math.tan(latRad) * Math.sin(oblRad);
  let ascDeg = Math.atan2(numer, denom) * RAD_TO_DEG;
  ascDeg = normalize360(ascDeg);

  // The Ascendant must be on the eastern horizon. atan2 returns the principal
  // value, which can be on the wrong side; rotate by 180 if the MC is in a
  // quadrant that places ASC on the western horizon.
  // Check: ASC should be 90 degrees ahead of MC in mean motion. Normalize:
  const asc_minus_mc = normalize360(ascDeg - mcDeg);
  if (asc_minus_mc > 180) {
    ascDeg = normalize360(ascDeg + 180);
  }

  return { ascendant: ascDeg, midheaven: mcDeg };
}
