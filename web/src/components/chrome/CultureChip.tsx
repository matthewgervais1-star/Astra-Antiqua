"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { CULTURES, CULTURE_LABELS, type Culture } from "@/data/cultures";
import { useActivePantheon } from "@/components/pantheon/PantheonContext";
import { writePersistedPantheon } from "@/lib/pantheonPreference";
import { cn } from "@/lib/classNames";
import { CultureEmblem } from "@/components/chrome/CultureEmblem";

const CHIP_CLASS =
  "whitespace-nowrap border border-[var(--accent-strong-border)] px-[var(--space-2)] py-2 font-mono text-data-xs text-accent";

/** "CULTURE:" gives way below md so the sub-bar, with the horizon control
 * beside it, fits a 375px viewport. Screen readers still hear it. */
function ChipPrefix() {
  return <span className="sr-only md:not-sr-only">CULTURE: </span>;
}

function CultureChipImpl() {
  const culture = useActivePantheon();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement | null>(null);

  // Dismiss on outside click or Escape.
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

  const label = culture ? `${CULTURE_LABELS[culture].toUpperCase()} ▾` : "CHOOSE ▾";

  const select = (next: Culture) => {
    writePersistedPantheon(next);
    const params = new URLSearchParams(searchParams.toString());
    params.set("culture", next);
    params.delete("pantheon");
    const qs = params.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    setOpen(false);
  };

  return (
    <div className="relative" ref={wrapRef}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        className={cn(CHIP_CLASS, "inline-flex items-center gap-[var(--space-1)]")}
      >
        {culture ? <CultureEmblem culture={culture} size={14} decorative /> : null}
        <ChipPrefix />
        {label}
      </button>
      {open ? (
        <div
          role="menu"
          className="absolute right-0 top-full z-40 mt-1 min-w-[160px] border border-rule bg-ground"
        >
          {CULTURES.map((c) => (
            <button
              key={c}
              type="button"
              role="menuitem"
              onClick={() => select(c)}
              className={cn(
                "flex w-full items-center gap-[var(--space-2)] px-[var(--space-2)] py-2 text-left font-mono text-data-xs",
                c === culture ? "text-accent" : "text-bone/80 hover:text-bone",
              )}
            >
              <CultureEmblem culture={c} size={16} decorative />
              {CULTURE_LABELS[c].toUpperCase()}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

/**
 * useActivePantheon reads useSearchParams, which requires a Suspense
 * boundary to avoid forcing the whole route to opt out of static rendering.
 * Mirrors pantheon/PantheonSelector.tsx's own Suspense wrapper.
 */
export function CultureChip() {
  return (
    <Suspense
      fallback={
        <span className={CHIP_CLASS}>
          <ChipPrefix />
          CHOOSE ▾
        </span>
      }
    >
      <CultureChipImpl />
    </Suspense>
  );
}
