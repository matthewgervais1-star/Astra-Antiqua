import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

/**
 * Proxy to OpenStreetMap Nominatim. Runs server-side so we can:
 *   1. Set a User-Agent identifying the app (Nominatim policy requires this;
 *      browser-set User-Agents are explicitly disallowed).
 *   2. Cache repeat lookups across the runtime instance.
 *   3. Centralize rate-limiting if needed later.
 *
 * Returns a small normalized shape rather than the raw Nominatim payload.
 */

const NOMINATIM_BASE = "https://nominatim.openstreetmap.org/search";
const USER_AGENT =
  "Astra-Antiqua/0.1 (https://github.com/astra-antiqua; geocoding for natal chart birth places)";

interface NominatimResult {
  lat: string;
  lon: string;
  display_name: string;
  type?: string;
  class?: string;
  address?: {
    city?: string;
    town?: string;
    village?: string;
    hamlet?: string;
    municipality?: string;
    county?: string;
    state?: string;
    country?: string;
  };
  importance?: number;
}

export interface GeocodeResult {
  name: string;
  context: string;
  country: string;
  latitude: number;
  longitude: number;
  importance: number;
}

interface CacheEntry {
  expiresAt: number;
  results: GeocodeResult[];
}

const cache = new Map<string, CacheEntry>();
const CACHE_TTL_MS = 24 * 60 * 60 * 1000;
const MAX_CACHE_SIZE = 512;

function getCached(key: string): GeocodeResult[] | null {
  const entry = cache.get(key);
  if (!entry) return null;
  if (entry.expiresAt < Date.now()) {
    cache.delete(key);
    return null;
  }
  return entry.results;
}

function putCached(key: string, results: GeocodeResult[]): void {
  if (cache.size >= MAX_CACHE_SIZE) {
    const firstKey = cache.keys().next().value;
    if (typeof firstKey === "string") cache.delete(firstKey);
  }
  cache.set(key, { expiresAt: Date.now() + CACHE_TTL_MS, results });
}

function normalize(item: NominatimResult): GeocodeResult | null {
  const lat = Number(item.lat);
  const lon = Number(item.lon);
  if (!Number.isFinite(lat) || !Number.isFinite(lon)) return null;

  const addr = item.address ?? {};
  const nameCandidates = [
    addr.city,
    addr.town,
    addr.village,
    addr.hamlet,
    addr.municipality,
    addr.county,
    item.display_name.split(",")[0]?.trim(),
  ];
  const name = nameCandidates.find((v) => typeof v === "string" && v.length > 0) ?? "Unknown";

  const contextCandidates = [addr.state, addr.country];
  const context = contextCandidates
    .filter((v): v is string => typeof v === "string" && v.length > 0)
    .join(", ");

  return {
    name,
    context,
    country: addr.country ?? "",
    latitude: lat,
    longitude: lon,
    importance: typeof item.importance === "number" ? item.importance : 0,
  };
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const q = (url.searchParams.get("q") ?? "").trim();
  if (q.length < 3) {
    return NextResponse.json({ ok: true, results: [] });
  }
  if (q.length > 200) {
    return NextResponse.json(
      { ok: false, error: "Query too long." },
      { status: 400 },
    );
  }

  const cacheKey = q.toLowerCase();
  const cached = getCached(cacheKey);
  if (cached) {
    return NextResponse.json({ ok: true, results: cached, cached: true });
  }

  const upstream = new URL(NOMINATIM_BASE);
  upstream.searchParams.set("q", q);
  upstream.searchParams.set("format", "jsonv2");
  upstream.searchParams.set("limit", "10");
  upstream.searchParams.set("addressdetails", "1");
  upstream.searchParams.set("accept-language", "en");

  try {
    const res = await fetch(upstream.toString(), {
      headers: {
        "User-Agent": USER_AGENT,
        Accept: "application/json",
      },
      // Nominatim has a 1 req/sec policy; this proxy enforces nothing extra
      // because individual user queries are well below that. Add a queue here
      // if traffic ramps up.
      cache: "no-store",
    });
    if (!res.ok) {
      return NextResponse.json(
        { ok: false, error: `Geocoder returned ${res.status}.`, results: [] },
        { status: 502 },
      );
    }
    const raw = (await res.json()) as NominatimResult[];
    const seen = new Set<string>();
    const results: GeocodeResult[] = [];
    for (const item of raw) {
      const normalized = normalize(item);
      if (!normalized) continue;
      const key = `${normalized.name}|${normalized.context}|${normalized.latitude.toFixed(2)}|${normalized.longitude.toFixed(2)}`;
      if (seen.has(key)) continue;
      seen.add(key);
      results.push(normalized);
    }
    results.sort((a, b) => b.importance - a.importance);
    const trimmed = results.slice(0, 8);
    putCached(cacheKey, trimmed);
    return NextResponse.json({ ok: true, results: trimmed });
  } catch (err) {
    console.error("[geocode] upstream error", err);
    return NextResponse.json(
      { ok: false, error: "Geocoder is unavailable. Please try again or enter coordinates manually.", results: [] },
      { status: 502 },
    );
  }
}
