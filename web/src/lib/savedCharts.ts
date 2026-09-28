/**
 * The reader's own birth chart, in localStorage.
 *
 * One chart, not a list. This app used to keep a set of charts with a
 * relationship label on each (self, partner, family, friend, other), which
 * meant the database held the name and exact birth moment of identifiable
 * people who had never used the service and had never agreed to anything.
 * That is the thing Quebec's Law 25 s. 6 is about, and no amount of policy
 * wording fixes a schema that records it.
 *
 * So the schema stopped recording it. You keep your own chart. Comparing
 * against someone else is a calculation, not a record: their details are
 * entered, used, and dropped. See ComparisonParty below, and the Android
 * app's SynastryViewModel.compare, which has always worked this way.
 *
 * Storage: `astra-antiqua.chart.v3` holds one SavedChartInputs object.
 */

/** Everything needed to compute a chart. Shared by the one that is kept and
 *  the one that is not, so the astronomy code cannot tell them apart. */
export interface BirthInputs {
  name: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM (24-hour)
  cityLabel: string;
  latitude: number;
  longitude: number;
}

export interface SavedChartInputs extends BirthInputs {
  id: string;
  createdAt: string; // ISO timestamp
}

/**
 * A second party for a comparison. Deliberately has no id and no createdAt,
 * because there is nowhere to put them: this never becomes a row. It exists
 * for the length of one calculation and then it is gone.
 */
export type ComparisonParty = BirthInputs;

export type ChartUpsertInput = Omit<SavedChartInputs, "id" | "createdAt"> &
  Partial<Pick<SavedChartInputs, "id" | "createdAt">>;

const STORAGE_KEY = "astra-antiqua.chart.v3";
/** The multi-chart key this replaced, and the single-chart key before that. */
const LEGACY_LIST_KEY = "astra-antiqua.saved-charts.v2";
const LEGACY_SINGLE_KEY = "astra-antiqua.birth-input.v1";

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

function writeRaw(chart: SavedChartInputs | null): void {
  if (typeof window === "undefined") return;
  try {
    if (chart) window.localStorage.setItem(STORAGE_KEY, JSON.stringify(chart));
    else window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // localStorage may be unavailable; silently continue
  }
}

interface LegacyListEntry {
  id?: string;
  name?: string;
  relationship?: string;
  date?: string;
  time?: string;
  cityLabel?: string;
  latitude?: number;
  longitude?: number;
  primary?: boolean;
  createdAt?: string;
}

function isUsable(entry: LegacyListEntry): boolean {
  return (
    typeof entry.date === "string" &&
    typeof entry.time === "string" &&
    typeof entry.latitude === "number" &&
    typeof entry.longitude === "number"
  );
}

/**
 * Brings forward the reader's OWN chart from the old multi-chart storage and
 * discards the rest.
 *
 * Dropping the others is the migration, not a side effect of it: charts about
 * other people are what this change exists to stop keeping. The primary chart
 * wins, then the one marked self, then the first usable entry.
 */
function migrateFromList(): SavedChartInputs | null {
  if (typeof window === "undefined") return null;
  const list = safeParse<LegacyListEntry[]>(window.localStorage.getItem(LEGACY_LIST_KEY));
  if (!Array.isArray(list) || list.length === 0) return null;
  const usable = list.filter(isUsable);
  const mine =
    usable.find((c) => c.primary) ?? usable.find((c) => c.relationship === "self") ?? usable[0];
  if (!mine) return null;
  const migrated: SavedChartInputs = {
    id: mine.id ?? generateId(),
    name: mine.name?.trim() || "Me",
    date: mine.date as string,
    time: mine.time as string,
    cityLabel: mine.cityLabel ?? "",
    latitude: mine.latitude as number,
    longitude: mine.longitude as number,
    createdAt: mine.createdAt ?? new Date().toISOString(),
  };
  writeRaw(migrated);
  try {
    window.localStorage.removeItem(LEGACY_LIST_KEY);
    window.localStorage.removeItem(LEGACY_SINGLE_KEY);
  } catch {
    // Nothing to do; the new key is written either way.
  }
  return migrated;
}

/** The reader's chart, or null if they have not cast one. */
export function readChart(): SavedChartInputs | null {
  if (typeof window === "undefined") return null;
  const stored = safeParse<SavedChartInputs>(window.localStorage.getItem(STORAGE_KEY));
  if (stored && typeof stored.date === "string" && typeof stored.latitude === "number") {
    return stored;
  }
  return migrateFromList();
}

/**
 * Records the reader's chart, replacing whatever was there.
 *
 * Casting again replaces rather than adds, which is what one chart per reader
 * means. The Android app has always behaved this way.
 */
export function writeChart(input: ChartUpsertInput): SavedChartInputs {
  const existing = readChart();
  const chart: SavedChartInputs = {
    id: input.id ?? existing?.id ?? generateId(),
    name: input.name.trim() || "Me",
    date: input.date,
    time: input.time,
    cityLabel: input.cityLabel,
    latitude: input.latitude,
    longitude: input.longitude,
    createdAt: input.createdAt ?? existing?.createdAt ?? new Date().toISOString(),
  };
  writeRaw(chart);
  return chart;
}

/** Forgets the reader's chart on this device. */
export function clearChart(): void {
  writeRaw(null);
}
