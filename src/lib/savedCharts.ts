/**
 * Persistent storage for multiple saved birth charts in localStorage.
 *
 * Storage shape: `astra-antiqua.saved-charts.v2` holds a JSON array of
 * SavedChartInputs. Each entry has a stable id, a user-facing name, a
 * relationship label, and the raw birth inputs needed to recompute the chart.
 *
 * Migration: on first read, if the legacy single-entry key
 * `astra-antiqua.birth-input.v1` exists and the new storage is empty, the
 * legacy entry is migrated into a primary "Me" chart.
 */

export type ChartRelationship =
  | "self"
  | "partner"
  | "family"
  | "friend"
  | "other";

export interface SavedChartInputs {
  id: string;
  name: string;
  relationship: ChartRelationship;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM (24-hour)
  cityLabel: string;
  latitude: number;
  longitude: number;
  primary: boolean;
  createdAt: string; // ISO timestamp
}

const STORAGE_KEY = "astra-antiqua.saved-charts.v2";
const LEGACY_KEY = "astra-antiqua.birth-input.v1";

function generateId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `chart-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function safeParse<T>(raw: string | null): T | null {
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

function writeRaw(charts: SavedChartInputs[]): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(charts));
  } catch {
    // localStorage may be unavailable; silently continue
  }
}

interface LegacyShape {
  date?: string;
  time?: string;
  cityLabel?: string;
  latitude?: number;
  longitude?: number;
}

function tryMigrateLegacy(): SavedChartInputs[] | null {
  if (typeof window === "undefined") return null;
  const legacy = safeParse<LegacyShape>(window.localStorage.getItem(LEGACY_KEY));
  if (
    !legacy ||
    typeof legacy.date !== "string" ||
    typeof legacy.time !== "string" ||
    typeof legacy.latitude !== "number" ||
    typeof legacy.longitude !== "number"
  ) {
    return null;
  }
  const migrated: SavedChartInputs = {
    id: generateId(),
    name: "Me",
    relationship: "self",
    date: legacy.date,
    time: legacy.time,
    cityLabel: typeof legacy.cityLabel === "string" ? legacy.cityLabel : "",
    latitude: legacy.latitude,
    longitude: legacy.longitude,
    primary: true,
    createdAt: new Date().toISOString(),
  };
  writeRaw([migrated]);
  return [migrated];
}

function readRaw(): SavedChartInputs[] {
  if (typeof window === "undefined") return [];
  const stored = safeParse<unknown>(window.localStorage.getItem(STORAGE_KEY));
  if (Array.isArray(stored)) return stored as SavedChartInputs[];
  return tryMigrateLegacy() ?? [];
}

export function listCharts(): readonly SavedChartInputs[] {
  return readRaw();
}

export function getChart(id: string): SavedChartInputs | null {
  return readRaw().find((c) => c.id === id) ?? null;
}

export function getPrimaryChart(): SavedChartInputs | null {
  const charts = readRaw();
  return charts.find((c) => c.primary) ?? charts[0] ?? null;
}

export interface ChartUpsertInput {
  id?: string;
  name: string;
  relationship: ChartRelationship;
  date: string;
  time: string;
  cityLabel: string;
  latitude: number;
  longitude: number;
  primary?: boolean;
}

export function upsertChart(input: ChartUpsertInput): SavedChartInputs {
  const charts = readRaw();
  const id = input.id ?? generateId();
  const wantsPrimary = input.primary ?? charts.length === 0;
  const updated: SavedChartInputs[] = wantsPrimary
    ? charts.map((c) => ({ ...c, primary: false }))
    : charts.slice();
  const existing = charts.find((c) => c.id === id);
  const entry: SavedChartInputs = {
    id,
    name: input.name.trim() || "Unnamed",
    relationship: input.relationship,
    date: input.date,
    time: input.time,
    cityLabel: input.cityLabel.trim(),
    latitude: input.latitude,
    longitude: input.longitude,
    primary: wantsPrimary,
    createdAt: existing?.createdAt ?? new Date().toISOString(),
  };
  const idx = updated.findIndex((c) => c.id === id);
  if (idx >= 0) {
    updated[idx] = entry;
  } else {
    updated.push(entry);
  }
  if (!updated.some((c) => c.primary) && updated.length > 0) {
    const first = updated[0];
    if (first) first.primary = true;
  }
  writeRaw(updated);
  return entry;
}

export function deleteChart(id: string): boolean {
  const charts = readRaw();
  const filtered = charts.filter((c) => c.id !== id);
  if (filtered.length === charts.length) return false;
  if (filtered.length > 0 && !filtered.some((c) => c.primary)) {
    const first = filtered[0];
    if (first) first.primary = true;
  }
  writeRaw(filtered);
  return true;
}

export function setPrimaryChart(id: string): boolean {
  const charts = readRaw();
  if (!charts.some((c) => c.id === id)) return false;
  const updated = charts.map((c) => ({ ...c, primary: c.id === id }));
  writeRaw(updated);
  return true;
}

export const RELATIONSHIP_LABELS: Readonly<Record<ChartRelationship, string>> = {
  self: "Myself",
  partner: "Partner",
  family: "Family",
  friend: "Friend",
  other: "Other",
};
