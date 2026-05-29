"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useSearchParams } from "next/navigation";
import { isCulture, type Culture } from "@/data/cultures";

interface PantheonContextValue {
  routeCulture: Culture | null;
  setRouteCulture: (culture: Culture | null) => void;
}

const PantheonCtx = createContext<PantheonContextValue | null>(null);

/**
 * Holds the active pantheon as plain state. Deliberately does NOT read
 * useSearchParams, so it is safe to mount at the root without forcing every
 * page to become dynamic. The query-param fallback lives in useActivePantheon
 * (a leaf hook whose callers already sit inside Suspense boundaries).
 */
export function PantheonProvider({ children }: { children: React.ReactNode }) {
  const [routeCulture, setRouteCulture] = useState<Culture | null>(null);
  const value = useMemo(
    () => ({ routeCulture, setRouteCulture }),
    [routeCulture],
  );
  return <PantheonCtx.Provider value={value}>{children}</PantheonCtx.Provider>;
}

/**
 * The active pantheon. On a per-culture route the route segment wins (pushed
 * into context by useSetRoutePantheon from the [culture] layout). Everywhere
 * else it falls back to the ?pantheon= query param, so the global pages
 * (/reading, /forecast, the home dashboard) keep working unchanged.
 *
 * Reads useSearchParams, so callers must sit inside a <Suspense> boundary
 * during prerender. Every existing caller already does.
 */
export function useActivePantheon(): Culture | null {
  const ctx = useContext(PantheonCtx);
  const searchParams = useSearchParams();
  const raw = searchParams.get("pantheon");
  const queryCulture = raw && isCulture(raw) ? raw : null;
  return ctx?.routeCulture ?? queryCulture;
}

/**
 * Push a route-derived culture into context for the lifetime of the calling
 * component. Clears on unmount and re-syncs when the culture changes (switching
 * pantheons keeps the shared [culture] layout mounted but changes the prop).
 */
export function useSetRoutePantheon(culture: Culture | null): void {
  const ctx = useContext(PantheonCtx);
  const setRouteCulture = ctx?.setRouteCulture;
  useEffect(() => {
    if (!setRouteCulture) return;
    setRouteCulture(culture);
    return () => setRouteCulture(null);
  }, [culture, setRouteCulture]);
}
