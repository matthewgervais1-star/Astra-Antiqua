"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useActivePantheon } from "@/components/pantheon/PantheonSelector";
import { useAuth } from "@/components/auth/AuthProvider";
import { loadSavedNatal, type SavedNatal } from "@/lib/savedNatal";
import { LifeAreaLegend } from "@/components/LifeAreaLegend";

/**
 * The life-area legend, personalized when the visitor has a saved chart: each
 * card then shows where that planet actually falls for them and the influence
 * written for that placement. Without a chart it shows the universal meanings
 * plus a prompt to cast one. Reads the primary saved chart and re-reads when
 * auth resolves (a signed-in user's charts land after the session loads).
 */
function PersonalLifeAreaLegendImpl() {
  const culture = useActivePantheon();
  const { status } = useAuth();
  const [natal, setNatal] = useState<SavedNatal | null>(null);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setNatal(loadSavedNatal());
  }, [status]);

  return (
    <div>
      {natal ? (
        <p className="text-ink-secondary font-body mb-5 max-w-2xl text-base leading-relaxed md:text-lg">
          Read for{" "}
          <span className="text-ink-primary">{natal.meta.name}</span>&apos;s chart:
          each card shows where that planet falls for you, and what it asks.
        </p>
      ) : (
        <p className="text-ink-secondary font-body mb-5 max-w-2xl text-base leading-relaxed md:text-lg">
          These are the universal meanings.{" "}
          <Link href="/reading" className="text-gold-leaf underline-offset-4 hover:underline">
            Cast your chart
          </Link>{" "}
          to see how each one falls for you.
        </p>
      )}
      <LifeAreaLegend culture={culture} natal={natal} />
    </div>
  );
}

// useActivePantheon reads useSearchParams, so the impl must sit inside a
// Suspense boundary or prerendering the pages that mount it fails.
export function PersonalLifeAreaLegend() {
  return (
    <Suspense fallback={null}>
      <PersonalLifeAreaLegendImpl />
    </Suspense>
  );
}
