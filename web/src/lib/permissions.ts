import type { Culture } from "@/data/cultures";
import type { Tone } from "@/lib/tone";
import { CULTURE_VOICES } from "@/data/cultureVoice";
import { PERMISSIONS_REGISTER } from "@/data/permissionsRegister";

/**
 * The day's permissions: PROCEED/REFRAIN (or the culture's own pair, see
 * cultureVoice.permissionPair) columns, four items each, drawn from the
 * per-culture verb banks in permissionsRegister.ts. Selection is a
 * deterministic pseudo-random pick seeded by the culture, the calendar day,
 * and the day's aspect tone (not Math.random, not a live shuffle) so the
 * same day always renders the same permissions until the tone genuinely
 * changes.
 */
export interface DayPermissions {
  proceed: string[];
  refrain: string[];
}

// FNV-1a: a small, dependency-free string hash, good enough to seed a PRNG
// deterministically from a composite key (culture|day-of-year|year|tone|salt).
function fnv1a(input: string): number {
  let hash = 0x811c9dc5;
  for (let i = 0; i < input.length; i += 1) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return hash >>> 0;
}

// mulberry32: a tiny deterministic PRNG. Given the same seed it always
// produces the same stream, which is the whole point here: no Math.random.
function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function dayOfYear(date: Date): number {
  const start = Date.UTC(date.getUTCFullYear(), 0, 1);
  const current = Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
  return Math.floor((current - start) / 86_400_000) + 1;
}

function seedFor(culture: Culture, date: Date, tone: Tone, salt: string): number {
  return fnv1a(`${culture}|${date.getUTCFullYear()}|${dayOfYear(date)}|${tone}|${salt}`);
}

function shuffledIndices(rng: () => number, length: number): number[] {
  const order = Array.from({ length }, (_, i) => i);
  for (let i = order.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rng() * (i + 1));
    const a = order[i]!;
    const b = order[j]!;
    order[i] = b;
    order[j] = a;
  }
  return order;
}

function pickN(rng: () => number, list: readonly string[], n: number): string[] {
  return shuffledIndices(rng, list.length)
    .slice(0, Math.min(n, list.length))
    .map((i) => list[i]!);
}

/**
 * Four proceed items + four refrain items for the given culture and day,
 * seeded by the date and the day's aspect tone so the list is stable across
 * reloads and only changes when the day (or the sky) does.
 */
export function dayPermissions(culture: Culture, date: Date, tone: Tone): DayPermissions {
  const register = PERMISSIONS_REGISTER[culture];
  const proceedRng = mulberry32(seedFor(culture, date, tone, "proceed"));
  const refrainRng = mulberry32(seedFor(culture, date, tone, "refrain"));
  return {
    proceed: pickN(proceedRng, register.proceed, 4),
    refrain: pickN(refrainRng, register.refrain, 4),
  };
}

// Draws a small handful of deterministic candidates and keeps the shortest,
// so the two-line Votive stays two lines more often without breaking
// determinism (no live randomness, just more of the same seeded stream).
function shortestOf(rng: () => number, list: readonly string[], attempts = 5): string {
  let best: string | null = null;
  for (let i = 0; i < attempts; i += 1) {
    const candidate = list[Math.floor(rng() * list.length)]!;
    if (best === null || candidate.length < best.length) best = candidate;
  }
  return best ?? list[0] ?? "";
}

/**
 * The day's two-line votive imperative: one proceed item and one refrain
 * item from the register, seeded by date + tone, shaped
 * "LET {proceed line};\n{refrain verb} {refrain line}" and uppercased in the
 * culture's own permission pair (PROCEED/REFRAIN, OFFER/WITHHOLD, ...).
 */
export function composeDayVotive(culture: Culture, tone: Tone, date: Date): string {
  const register = PERMISSIONS_REGISTER[culture];
  const [, refrainVerb] = CULTURE_VOICES[culture].permissionPair;
  const proceedRng = mulberry32(seedFor(culture, date, tone, "votive-proceed"));
  const refrainRng = mulberry32(seedFor(culture, date, tone, "votive-refrain"));
  const proceed = shortestOf(proceedRng, register.proceed);
  const refrain = shortestOf(refrainRng, register.refrain);
  return `LET ${proceed.toUpperCase()};\n${refrainVerb.toUpperCase()} ${refrain.toUpperCase()}`;
}
