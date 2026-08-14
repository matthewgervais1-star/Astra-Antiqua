"use client";

import { useEffect, useRef, useState } from "react";
import type { SavedChartInputs } from "@/lib/savedCharts";
import { cn } from "@/lib/classNames";

export interface PartyPickerProps {
  /** "THE OWNER" style label, or null when no chart is assigned to this slot yet. */
  chart: SavedChartInputs | null;
  charts: readonly SavedChartInputs[];
  /** The other slot's chart id, excluded from this picker's menu. */
  excludeId?: string;
  onSelect: (id: string) => void;
}

function partyYearCity(chart: SavedChartInputs): string {
  const year = chart.date.slice(0, 4);
  const city = chart.cityLabel.trim();
  return city ? `${year} · ${city.toUpperCase()}` : year;
}

/**
 * A party card (name + year·city) with its own "CHANGE A PARTY ▾" bordered
 * dropdown of the other saved charts, following chrome/CultureChip's
 * dismiss-on-outside-click pattern without importing its internals.
 */
export function PartyPicker({ chart, charts, excludeId, onSelect }: PartyPickerProps) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;
    const onPointer = (e: PointerEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const options = charts.filter((c) => c.id !== excludeId);

  return (
    <div className="relative flex flex-col gap-2" ref={wrapRef}>
      <div className="flex items-baseline justify-between gap-3 border border-[var(--accent-strong-border)] px-[15px] py-[13px]">
        <span className="font-display text-[13px] tracking-[0.08em] text-bone">
          {chart ? chart.name.toUpperCase() : "NO PARTY CHOSEN"}
        </span>
        <span className="whitespace-nowrap font-mono text-[11px] text-dim">
          {chart ? partyYearCity(chart) : "–"}
        </span>
      </div>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        className="border border-rule px-[15px] py-3 text-center font-mono text-[11px] tracking-[0.1em] text-dim hover:text-bone"
      >
        CHANGE A PARTY ▾
      </button>
      {open ? (
        <div role="menu" className="absolute left-0 right-0 top-full z-40 mt-1 border border-rule bg-[var(--ground)]">
          {options.length === 0 ? (
            <div className="px-[15px] py-3 font-mono text-[11px] text-faint-ink">NO OTHER CHARTS SAVED</div>
          ) : (
            options.map((c) => (
              <button
                key={c.id}
                type="button"
                role="menuitem"
                onClick={() => {
                  onSelect(c.id);
                  setOpen(false);
                }}
                className={cn(
                  "block w-full px-[15px] py-2.5 text-left font-mono text-[11px]",
                  c.id === chart?.id ? "text-[var(--accent)]" : "text-bone/80 hover:text-bone",
                )}
              >
                {c.name.toUpperCase()} · {partyYearCity(c)}
              </button>
            ))
          )}
        </div>
      ) : null}
    </div>
  );
}
