export interface GeocodeResult {
  name: string;
  context: string;
  country: string;
  latitude: number;
  longitude: number;
  importance: number;
}

interface ApiResponse {
  ok: boolean;
  results?: GeocodeResult[];
  error?: string;
}

/**
 * Looks up a free-text place query against the server-side geocoding proxy
 * (OpenStreetMap Nominatim). Returns an empty array for short queries or on
 * error rather than throwing, so the BirthForm can render results
 * progressively without crashing.
 */
export async function geocodePlace(
  query: string,
  signal?: AbortSignal,
): Promise<readonly GeocodeResult[]> {
  const trimmed = query.trim();
  if (trimmed.length < 3) return [];

  const url = new URL("/api/geocode", window.location.origin);
  url.searchParams.set("q", trimmed);

  try {
    const res = await fetch(url.toString(), {
      method: "GET",
      headers: { Accept: "application/json" },
      signal,
    });
    if (!res.ok) return [];
    const data = (await res.json()) as ApiResponse;
    if (!data.ok || !Array.isArray(data.results)) return [];
    return data.results;
  } catch {
    return [];
  }
}
