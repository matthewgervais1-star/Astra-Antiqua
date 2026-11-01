import type { Culture } from "@/data/cultures";
import { COMMON } from "@/strings/common";
import { DAY, DAY_COMPOSED } from "@/strings/day";
import { WEEK, WEEK_COMPOSED } from "@/strings/week";
import { SEASON, SEASON_COMPOSED } from "@/strings/season";
import { YEAR, YEAR_COMPOSED } from "@/strings/year";
import { TRANSITS } from "@/strings/transits";
import { CHART, CHART_COMPOSED } from "@/strings/chart";
import { PLACEMENT, PLACEMENT_COMPOSED } from "@/strings/placement";
import { TRANSIT, TRANSIT_COMPOSED } from "@/strings/transit";
import { MORE } from "@/strings/more";
import { NAV } from "@/strings/nav";
import type { CatalogValue, PerCulture } from "@/strings/types";
import type { MoonPhaseName } from "@/lib/moonPhase";

/**
 * The shared strings catalog: every printed string of the ruled table
 * (docs/design/shared-strings-table-2026-11.md) under its `<screen>.<slot>`
 * key, in the case the reader sees. Web authors it here; scripts/
 * export-strings.mjs writes shared/strings/en.json from it, and Android,
 * Swift and C# read that file. Never transform the case of what str() returns.
 */
export const CATALOG = {
  ...COMMON,
  ...DAY,
  ...WEEK,
  ...SEASON,
  ...YEAR,
  ...TRANSITS,
  ...CHART,
  ...PLACEMENT,
  ...TRANSIT,
  ...MORE,
  ...NAV,
} as const;

/** The screens, in export order, for the exporter and the tests. */
export const SCREENS = {
  common: COMMON,
  day: DAY,
  week: WEEK,
  season: SEASON,
  year: YEAR,
  transits: TRANSITS,
  chart: CHART,
  placement: PLACEMENT,
  transit: TRANSIT,
  more: MORE,
  nav: NAV,
} as const;

/** Ruled rows whose words web's reading code composes (not stored as strings). */
export const COMPOSED = {
  ...DAY_COMPOSED,
  ...WEEK_COMPOSED,
  ...SEASON_COMPOSED,
  ...YEAR_COMPOSED,
  ...CHART_COMPOSED,
  ...PLACEMENT_COMPOSED,
  ...TRANSIT_COMPOSED,
} as const;

export type StringKey = keyof typeof CATALOG;

export type Slots = Readonly<Record<string, string | number>>;

const SLOT_PATTERN = /\{([A-Za-z][A-Za-z0-9]*)\}/g;

export function isPerCulture(value: CatalogValue): value is PerCulture {
  return typeof value === "object";
}

/** The raw template for `key` in `culture`, slots unfilled. */
export function template(key: StringKey, culture: Culture): string {
  const value: CatalogValue = CATALOG[key];
  return isPerCulture(value) ? value[culture] : value;
}

/** The slot names a template uses, in order of first appearance. */
export function slotNames(text: string): string[] {
  const out: string[] = [];
  for (const m of text.matchAll(SLOT_PATTERN)) {
    const name = m[1] ?? "";
    if (!out.includes(name)) out.push(name);
  }
  return out;
}

/**
 * The printed string for `key` in `culture`, with each `{slot}` filled from
 * `slots`. A slot the template names and `slots` leaves out throws, so a
 * screen never prints a raw brace.
 */
export function str(key: StringKey, culture: Culture, slots: Slots = {}): string {
  return template(key, culture).replace(SLOT_PATTERN, (_, name: string) => {
    const v = slots[name];
    if (v === undefined) throw new Error(`str: ${key} needs slot {${name}}`);
    return String(v);
  });
}

/** The keys whose value is one string for every culture. */
export type PlainKey = { [K in StringKey]: (typeof CATALOG)[K] extends string ? K : never }[StringKey];

/** str() for a key with no culture dimension, where the caller has no culture to hand. */
export function text(key: PlainKey, slots: Slots = {}): string {
  return str(key, "egypt", slots);
}

/**
 * The template split into text and slot parts, so a component can put an
 * element (a ScriptName, a glyph) where a slot sits. Text parts come back
 * as strings, slots as { slot }.
 */
export function strParts(key: StringKey, culture: Culture): Array<string | { slot: string }> {
  const t = template(key, culture);
  const parts: Array<string | { slot: string }> = [];
  let last = 0;
  for (const m of t.matchAll(SLOT_PATTERN)) {
    const at = m.index ?? 0;
    if (at > last) parts.push(t.slice(last, at));
    parts.push({ slot: m[1] ?? "" });
    last = at + m[0].length;
  }
  if (last < t.length) parts.push(t.slice(last));
  return parts;
}

/** The catalog key for a moon phase name. */
export function moonPhaseKey(name: MoonPhaseName): StringKey {
  const camel = name.charAt(0).toLowerCase() + name.slice(1).replace(/\s+(\w)/g, (_, c: string) => c.toUpperCase());
  return `common.moon.${camel}` as StringKey;
}

export { fmt, type FormatName, type Zone } from "@/strings/formats";
