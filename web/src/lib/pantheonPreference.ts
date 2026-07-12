import { isCulture, type Culture } from "@/data/cultures";

const STORAGE_KEY = "astra-antiqua.last-pantheon";

export function readPersistedPantheon(): Culture | null {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(STORAGE_KEY);
  return raw && isCulture(raw) ? raw : null;
}

export function writePersistedPantheon(culture: Culture | null): void {
  if (typeof window === "undefined") return;
  try {
    if (culture) {
      window.localStorage.setItem(STORAGE_KEY, culture);
    } else {
      window.localStorage.removeItem(STORAGE_KEY);
    }
  } catch {
    // localStorage may be unavailable; silently continue
  }
}
