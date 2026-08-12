"use client";

import { Suspense, useEffect, type ReactNode } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { CULTURES, CULTURE_LABELS, type Culture } from "@/data/cultures";
import { CULTURE_VOICES } from "@/data/cultureVoice";
import { useActivePantheon } from "@/components/pantheon/PantheonContext";
import { readPersistedPantheon, writePersistedPantheon } from "@/lib/pantheonPreference";
import { Skeleton } from "@/components/chrome/Skeleton";

export interface CultureGateProps {
  children: ReactNode;
}

function CultureGateImpl({ children }: CultureGateProps) {
  const culture = useActivePantheon();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // A returning reader's persisted culture re-enters through the URL, the
  // job the old filter-mode selector did on mount.
  useEffect(() => {
    if (culture) return;
    const persisted = readPersistedPantheon();
    if (!persisted) return;
    const params = new URLSearchParams(searchParams.toString());
    params.set("culture", persisted);
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }, [culture, pathname, router, searchParams]);

  if (culture) return <>{children}</>;

  const choose = (next: Culture) => {
    writePersistedPantheon(next);
    const params = new URLSearchParams(searchParams.toString());
    params.set("culture", next);
    params.delete("pantheon");
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  return (
    <div className="mx-auto max-w-[560px] py-10">
      <div className="text-center font-mono text-[11px] tracking-[0.2em] text-dim">
        ONE SKY IS COMPUTED · FIVE CULTURES READ IT
      </div>
      <div className="mx-auto my-6 h-px w-16 bg-[var(--accent)]" />
      <div className="flex flex-col">
        {CULTURES.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => choose(c)}
            className="flex items-baseline justify-between gap-4 border-t border-rule px-4 py-4 text-left last:border-b hover:bg-bone/5"
          >
            <span className="font-display text-[15px] tracking-[0.14em]">
              {CULTURE_LABELS[c].toUpperCase()}
            </span>
            <span className="font-mono text-[11px] tracking-[0.08em] text-dim">
              {CULTURE_VOICES[c].institution.toLowerCase()}
            </span>
          </button>
        ))}
      </div>
      <div className="mt-5 text-center font-mono text-[11px] tracking-[0.14em] text-faint-ink">
        THE CHOICE PERSISTS ON THIS DEVICE · CHANGE IT ANY TIME
      </div>
    </div>
  );
}

/**
 * Wraps a reading surface that needs an active culture. Applies the
 * persisted preference when the URL carries none, and renders the
 * five-doorway chooser when the reader has never picked.
 */
export function CultureGate({ children }: CultureGateProps) {
  return (
    <Suspense fallback={<Skeleton />}>
      <CultureGateImpl>{children}</CultureGateImpl>
    </Suspense>
  );
}
