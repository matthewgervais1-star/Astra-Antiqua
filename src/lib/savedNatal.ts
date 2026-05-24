import type { Planet } from "@/data/cultures";
import type { Longitude } from "@/data/sampleChart";
import { computeChart } from "@/lib/ephemeris";
import { resolveBirth, type ResolvedBirth } from "@/lib/birthDateTime";
import { computeAngularPoints, type AngularPoints } from "@/lib/ascendant";

const STORAGE_KEY = "astra-antiqua.birth-input.v1";

interface PersistedInputs {
  date?: string;
  time?: string;
  cityLabel?: string;
  latitude?: number;
  longitude?: number;
}

export interface SavedNatalInputs {
  date: string;
  time: string;
  cityLabel: string;
  latitude: number;
  longitude: number;
}

export interface SavedNatal {
  inputs: SavedNatalInputs;
  birth: ResolvedBirth;
  chart: Readonly<Record<Planet, Longitude>>;
  angles: AngularPoints;
}

function readPersistedInputs(): SavedNatalInputs | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as PersistedInputs;
    if (
      typeof parsed?.date !== "string" ||
      typeof parsed?.time !== "string" ||
      typeof parsed?.latitude !== "number" ||
      typeof parsed?.longitude !== "number"
    ) {
      return null;
    }
    const label = typeof parsed.cityLabel === "string" ? parsed.cityLabel : "";
    return {
      date: parsed.date,
      time: parsed.time,
      cityLabel: label,
      latitude: parsed.latitude,
      longitude: parsed.longitude,
    };
  } catch {
    return null;
  }
}

export function loadSavedNatal(): SavedNatal | null {
  const inputs = readPersistedInputs();
  if (!inputs) return null;

  const dateParts = inputs.date.split("-").map(Number);
  const timeParts = inputs.time.split(":").map(Number);
  const [year, month, day] = dateParts;
  const [hour, minute] = timeParts;
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
      year: year as number,
      month: month as number,
      day: day as number,
      hour: hour as number,
      minute: minute as number,
      latitude: inputs.latitude,
      longitude: inputs.longitude,
    });
    const chart = computeChart(birth.utcDate);
    const angles = computeAngularPoints(birth.utcDate, inputs.latitude, inputs.longitude);
    return { inputs, birth, chart, angles };
  } catch {
    return null;
  }
}
