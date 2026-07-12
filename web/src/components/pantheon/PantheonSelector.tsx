"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useCallback, useEffect, useMemo } from "react";
import {
  CULTURES,
  CULTURE_LABELS,
  CULTURE_SUBTITLES,
  isCulture,
  type Culture,
} from "@/data/cultures";
import { DeityGlyph } from "@/components/glyphs/DeityGlyph";
import { cn } from "@/lib/classNames";
import { readPersistedPantheon, writePersistedPantheon } from "@/lib/pantheonPreference";

// Re-exported here for back-compat: callers across the app import the active
// pantheon hook from this module. The implementation now lives in the context.
export { useActivePantheon } from "@/components/pantheon/PantheonContext";

const SEARCH_PARAM = "pantheon";

/**
 * "filter":   toggles the ?pantheon= query param on the current page (used by
 *             the global /reading and /forecast pages to re-skin in place).
 * "navigate": pushes /pantheon/[culture], entering that culture's own space
 *             (used by the home hero so picking a culture leads to its pages).
 */
type SelectorMode = "filter" | "navigate";

function PantheonSelectorImpl({ mode }: { mode: SelectorMode }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const raw = searchParams.get(SEARCH_PARAM);
  const active: Culture | null = useMemo(
    () => (mode === "filter" && raw && isCulture(raw) ? raw : null),
    [mode, raw],
  );

  useEffect(() => {
    if (mode !== "filter") return;
    const persisted = readPersistedPantheon();
    if (!persisted) return;
    const next = new URLSearchParams(searchParams.toString());
    if (!next.get(SEARCH_PARAM) && persisted) {
      next.set(SEARCH_PARAM, persisted);
      router.replace(next.toString() ? `?${next.toString()}` : "?", { scroll: false });
    }
  }, [mode, router, searchParams]);

  const onSelect = useCallback(
    (culture: Culture) => {
      if (mode === "navigate") {
        // Navigating to a culture's journey page is browsing, not choosing a
        // global filter — only explicit filter selections persist.
        router.push(`/pantheon/${culture}`);
        return;
      }
      writePersistedPantheon(culture);
      const next = new URLSearchParams(searchParams.toString());
      if (active === culture) {
        next.delete(SEARCH_PARAM);
        writePersistedPantheon(null);
      } else {
        next.set(SEARCH_PARAM, culture);
      }
      const qs = next.toString();
      router.replace(qs ? `?${qs}` : "?", { scroll: false });
    },
    [active, mode, router, searchParams],
  );

  return (
    <div
      role={mode === "filter" ? "radiogroup" : undefined}
      aria-label="Select a pantheon"
      className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5 md:gap-4"
    >
      {CULTURES.map((culture) => {
        const isActive = active === culture;
        return (
          <button
            key={culture}
            type="button"
            role={mode === "filter" ? "radio" : undefined}
            aria-checked={mode === "filter" ? isActive : undefined}
            onClick={() => onSelect(culture)}
            className={cn(
              "group glass-panel relative flex flex-col items-center gap-3 rounded-2xl p-5 text-left transition-all duration-300 hover:-translate-y-1 md:p-6",
              isActive
                ? "border-gold-soft accent-glow"
                : "hover:border-gold-soft hover:accent-glow",
            )}
          >
            <DeityGlyph
              culture={culture}
              planet="sun"
              size={44}
              className="transition-transform duration-500 ease-out group-hover:scale-110"
            />
            <div className="w-full text-center">
              <div
                className={cn(
                  "font-display text-lg md:text-xl",
                  isActive ? "text-gold-leaf" : "text-ink-primary",
                )}
              >
                {CULTURE_LABELS[culture]}
              </div>
              <div className="text-ink-tertiary mt-1 font-mono text-[10px] uppercase tracking-[0.2em]">
                {CULTURE_SUBTITLES[culture].split(".")[0]}
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}

export function PantheonSelector({ mode = "filter" }: { mode?: SelectorMode }) {
  return (
    <Suspense
      fallback={
        <div className="text-ink-tertiary font-mono text-xs uppercase tracking-[0.2em]">
          Loading pantheons
        </div>
      }
    >
      <PantheonSelectorImpl mode={mode} />
    </Suspense>
  );
}
