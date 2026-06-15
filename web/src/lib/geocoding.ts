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
 * Geocoder failure carrying an optional user-facing message. When set (e.g. on
 * a rate limit), the caller should show it verbatim instead of the generic
 * "map unreachable" fallback that nudges toward manual coordinates.
 */
export class GeocodeError extends Error {
  readonly userMessage?: string;
  constructor(message: string, userMessage?: string) {
    super(message);
    this.name = "GeocodeError";
    this.userMessage = userMessage;
  }
}

/**
 * Looks up a free-text place query against the server-side geocoding proxy
 * (OpenStreetMap Nominatim). Returns an empty array for genuinely empty
 * results, but THROWS on transport/proxy errors so the caller can tell the
 * difference between "no such place" and "the geocoder is unavailable" (e.g.
 * a TLS or network failure) and message the user honestly. Abort errors
 * propagate too; the caller checks signal.aborted to ignore them.
 */
export async function geocodePlace(
  query: string,
  signal?: AbortSignal,
): Promise<readonly GeocodeResult[]> {
  const trimmed = query.trim();
  if (trimmed.length < 3) return [];

  const url = new URL("/api/geocode", window.location.origin);
  url.searchParams.set("q", trimmed);

  const res = await fetch(url.toString(), {
    method: "GET",
    headers: { Accept: "application/json" },
    signal,
  });
  if (!res.ok) {
    if (res.status === 429) {
      let msg = "Too many place lookups. Wait a minute, then try again.";
      try {
        const body = (await res.json()) as ApiResponse;
        if (body.error) msg = body.error;
      } catch {
        // keep the default rate-limit message
      }
      throw new GeocodeError(`Geocoder returned 429`, msg);
    }
    throw new GeocodeError(`Geocoder returned ${res.status}`);
  }
  const data = (await res.json()) as ApiResponse;
  if (!data.ok) {
    throw new GeocodeError(data.error ?? "Geocoder error");
  }
  if (!Array.isArray(data.results)) return [];
  return data.results;
}
