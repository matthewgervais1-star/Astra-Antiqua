"use client";

import type { CSSProperties } from "react";
import { CULTURES, CULTURE_LABELS, type Culture } from "@/data/cultures";
import { CULTURE_VOICES } from "@/data/cultureVoice";
import { CULTURE_ACCENTS } from "@/data/palettes";
import { CultureEmblem } from "@/components/chrome/CultureEmblem";
import { cn } from "@/lib/classNames";

export interface CultureSwitchProps {
  value: Culture | null;
  onChange: (culture: Culture) => void;
  /** Print each culture's institution beside its name. */
  showSurface?: boolean;
}

/**
 * The five-culture picker
 * (docs/design/system/components/specs/CultureSwitch.prompt.md). Each row is
 * the culture's tier-2 emblem beside its name, and the active culture is the
 * only thing on screen wearing the accent: its own accent, since this picker
 * stands on the neutral ground where no culture is yet in force, and the row
 * sets --accent for itself so the shared utilities resolve to it.
 */
export function CultureSwitch({ value, onChange, showSurface = true }: CultureSwitchProps) {
  return (
    <div role="radiogroup" className="flex flex-col">
      {CULTURES.map((culture) => {
        const active = culture === value;
        const style = active ? ({ "--accent": CULTURE_ACCENTS[culture] } as CSSProperties) : undefined;
        return (
          <button
            key={culture}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(culture)}
            style={style}
            className={cn(
              "flex items-center gap-[var(--space-2)] border-t border-rule px-[var(--space-3)] py-[var(--space-2)] text-left last:border-b hover:bg-bone/5",
              active ? "text-accent" : "text-bone",
            )}
          >
            <CultureEmblem culture={culture} size={20} decorative />
            <span className="font-display text-[15px] tracking-[0.14em]">
              {CULTURE_LABELS[culture].toUpperCase()}
            </span>
            {showSurface ? (
              <span className="ml-auto font-mono text-data-xs lowercase tracking-data text-dim">
                {CULTURE_VOICES[culture].institution}
              </span>
            ) : null}
          </button>
        );
      })}
    </div>
  );
}
