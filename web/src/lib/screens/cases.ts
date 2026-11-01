import { CULTURES, type Culture } from "@/data/cultures";
import { resolveSavedChart, type SavedNatal } from "@/lib/savedNatal";
import type { BirthInputs } from "@/lib/savedCharts";

/** The smoke birth the board draws: Rome, 15 Jan 1990, 05:30 local (04:30 UTC). */
export const SMOKE_BIRTH: BirthInputs = {
  name: "Smoke Test",
  date: "1990-01-15",
  time: "05:30",
  cityLabel: "Rome, Italy",
  latitude: 41.9028,
  longitude: 12.4964,
};

/** One fixed golden case: what the screen is read with. */
export interface GoldenCase {
  culture: Culture;
  instant: string;
  zone: string;
  birth: "smoke" | null;
  /** Why the case is in the set (plan Task 3, Review Focus). */
  why: string;
}

const SAMPLE = "2026-10-21T06:00:00Z";

/**
 * The plan's fixed cases (Task 3): the smoke birth at the sample instant in
 * Rome for all five cultures; 2025-03-01 (the eclipse ranking); 2026-12-30
 * (the year end); the week of 29 SEP 2026; no birth; one Montreal case.
 */
export const GOLDEN_CASES: readonly GoldenCase[] = [
  ...CULTURES.map((culture) => ({ culture, instant: SAMPLE, zone: "Europe/Rome", birth: "smoke" as const, why: "the board's sample" })),
  { culture: "egypt", instant: "2025-03-01T06:00:00Z", zone: "Europe/Rome", birth: "smoke", why: "the eclipse ranking" },
  { culture: "egypt", instant: "2026-12-30T06:00:00Z", zone: "Europe/Rome", birth: "smoke", why: "the year end (Review Focus 1)" },
  { culture: "egypt", instant: "2026-09-29T06:00:00Z", zone: "Europe/Rome", birth: "smoke", why: "the week of 29 SEP 2026, across a month end" },
  { culture: "egypt", instant: SAMPLE, zone: "Europe/Rome", birth: null, why: "no birth record (Review Focus 3)" },
  { culture: "egypt", instant: SAMPLE, zone: "America/Montreal", birth: "smoke", why: "local days in another zone (Review Focus 2)" },
];

/** The case's id: screen, culture, the instant's UTC date, the zone's city, the birth. */
export function caseId(screen: string, c: GoldenCase): string {
  const city = (c.zone.split("/").pop() ?? c.zone).toLowerCase();
  return `${screen}-${c.culture}-${c.instant.slice(0, 10)}-${city}-${c.birth ?? "nobirth"}`;
}

let smoke: SavedNatal | null = null;

/** The smoke birth, computed once. */
export function smokeNatal(): SavedNatal {
  smoke ??= resolveSavedChart(SMOKE_BIRTH);
  if (!smoke) throw new Error("the smoke birth did not resolve");
  return smoke;
}
