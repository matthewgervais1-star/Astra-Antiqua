import type { Planet } from "@/data/cultures";
import type { Longitude } from "@/data/sampleChart";
import { computeChart } from "@/lib/ephemeris";
import { resolveBirth, type ResolvedBirth } from "@/lib/birthDateTime";
import { computeAngularPoints, type AngularPoints } from "@/lib/ascendant";
import { readChart, type BirthInputs } from "@/lib/savedCharts";

export interface SavedNatalInputs {
  date: string;
  time: string;
  cityLabel: string;
  latitude: number;
  longitude: number;
}

export interface SavedNatal {
  inputs: SavedNatalInputs;
  meta: BirthInputs;
  birth: ResolvedBirth;
  chart: Readonly<Record<Planet, Longitude>>;
  angles: AngularPoints;
}

function resolveChart(meta: BirthInputs): SavedNatal | null {
  const [yearStr, monthStr, dayStr] = meta.date.split("-");
  const [hourStr, minuteStr] = meta.time.split(":");
  const year = Number(yearStr);
  const month = Number(monthStr);
  const day = Number(dayStr);
  const hour = Number(hourStr);
  const minute = Number(minuteStr);
  if (
    !Number.isFinite(year) ||
    !Number.isFinite(month) ||
    !Number.isFinite(day) ||
    !Number.isFinite(hour) ||
    !Number.isFinite(minute)
  ) {
    return null;
  }

  try {
    const birth = resolveBirth({
      year,
      month,
      day,
      hour,
      minute,
      latitude: meta.latitude,
      longitude: meta.longitude,
    });
    const chart = computeChart(birth.utcDate);
    const angles = computeAngularPoints(birth.utcDate, meta.latitude, meta.longitude);
    return {
      inputs: {
        date: meta.date,
        time: meta.time,
        cityLabel: meta.cityLabel,
        latitude: meta.latitude,
        longitude: meta.longitude,
      },
      meta,
      birth,
      chart,
      angles,
    };
  } catch {
    return null;
  }
}

/** The reader's own saved chart, computed. */
export function loadSavedNatal(): SavedNatal | null {
  const meta = readChart();
  if (!meta) return null;
  return resolveChart(meta);
}

/**
 * Computes any birth inputs, saved or not.
 *
 * The comparison party goes through here too. Nothing downstream can tell
 * whether a chart came from storage, which is the point: the second party is
 * a calculation, not a record.
 */
export function resolveSavedChart(meta: BirthInputs): SavedNatal | null {
  return resolveChart(meta);
}
