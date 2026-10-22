"use client";

import type { CSSProperties } from "react";
import { CULTURES, type Culture } from "@/data/cultures";
import { CULTURE_VOICES } from "@/data/cultureVoice";
import { CULTURE_ACCENTS } from "@/data/palettes";
import { CultureEmblem } from "@/components/chrome/CultureEmblem";
import { CULTURE_NAME_INTRO_MS } from "@/components/chrome/NaveHead";
import { ScriptName } from "@/components/chrome/ScriptName";
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
 *
 * Each name is a large ScriptName (owner, 2026-10-20). The list does not
 * scroll, so the band rule alone would leave it all in script: the names
 * resolve to Latin one after another after the page paints, staggered by
 * PICKER_STAGGER_MS, and hover or keyboard focus resolves a name at once.
 * The institution sits under the name, since the larger name and the
 * institution side by side overflow the column for Carthage.
 */
const PICKER_STAGGER_MS = 200;

export function CultureSwitch({ value, onChange, showSurface = true }: CultureSwitchProps) {
  return (
    <div role="radiogroup" className="flex flex-col">
      {CULTURES.map((culture, index) => {
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
            <CultureEmblem culture={culture} size={28} decorative />
            <span className="flex min-w-0 flex-col gap-[var(--space-1)]">
              <span className="font-display text-display-m leading-display tracking-display">
                <ScriptName
                  culture={culture}
                  heading="culture"
                  upper
                  intro={CULTURE_NAME_INTRO_MS + index * PICKER_STAGGER_MS}
                />
              </span>
              {showSurface ? (
                <span className="font-mono text-data-xs lowercase tracking-data text-dim">
                  {CULTURE_VOICES[culture].institution}
                </span>
              ) : null}
            </span>
          </button>
        );
      })}
    </div>
  );
}
