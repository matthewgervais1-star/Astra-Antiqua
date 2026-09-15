"use client";

import { Suspense, useEffect, type ReactNode } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import type { Culture } from "@/data/cultures";
import { CultureSwitch } from "@/components/chrome/CultureSwitch";
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
      <div className="text-center font-mono text-data-xs tracking-microcopy text-dim">
        ONE SKY IS COMPUTED · FIVE CULTURES READ IT
      </div>
      <div className="mx-auto my-6 h-px w-16 bg-accent" />
      <CultureSwitch value={null} onChange={choose} />
      <div className="mt-5 text-center font-mono text-data-xs tracking-label text-faint-ink">
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
