"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useCallback, useMemo } from "react";
import {
  CULTURES,
  CULTURE_LABELS,
  CULTURE_SUBTITLES,
  isCulture,
  type Culture,
} from "@/data/cultures";
import { DeityGlyph } from "@/components/glyphs/DeityGlyph";
import { cn } from "@/lib/classNames";

const SEARCH_PARAM = "pantheon";

function PantheonSelectorImpl() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const raw = searchParams.get(SEARCH_PARAM);
  const active: Culture | null = useMemo(
    () => (raw && isCulture(raw) ? raw : null),
    [raw],
  );

  const onSelect = useCallback(
    (culture: Culture) => {
      const next = new URLSearchParams(searchParams.toString());
      if (active === culture) {
        next.delete(SEARCH_PARAM);
      } else {
        next.set(SEARCH_PARAM, culture);
      }
      const qs = next.toString();
      router.replace(qs ? `?${qs}` : "?", { scroll: false });
    },
    [active, router, searchParams],
  );

  return (
    <div
      role="radiogroup"
      aria-label="Select a pantheon"
      className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-5"
    >
      {CULTURES.map((culture) => {
        const isActive = active === culture;
        return (
          <button
            key={culture}
            type="button"
            role="radio"
            aria-checked={isActive}
            onClick={() => onSelect(culture)}
            className={cn(
              "group glass-panel relative flex flex-col items-center gap-3 rounded-2xl p-5 text-left transition-all duration-300 md:p-6",
              isActive
                ? "border-gold-soft shadow-[0_0_60px_-30px_rgba(244,208,63,0.55)]"
                : "hover:border-gold-soft",
            )}
          >
            <DeityGlyph culture={culture} planet="sun" size={44} />
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

export function PantheonSelector() {
  return (
    <Suspense
      fallback={
        <div className="text-ink-tertiary font-mono text-xs uppercase tracking-[0.2em]">
          Loading pantheons
        </div>
      }
    >
      <PantheonSelectorImpl />
    </Suspense>
  );
}

export function useActivePantheon(): Culture | null {
  const searchParams = useSearchParams();
  const raw = searchParams.get(SEARCH_PARAM);
  return raw && isCulture(raw) ? raw : null;
}
