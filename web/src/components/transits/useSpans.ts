"use client";

import { useEffect, useState } from "react";
import { loadSavedNatal, type SavedNatal } from "@/lib/savedNatal";
import type { TransitSpan } from "@/lib/transitSpans";
import { readerSpans } from "@/lib/screens/transits";

export interface SpansState {
  loading: boolean;
  now: Date;
  natal: SavedNatal | null;
  spans: readonly TransitSpan[];
}

/**
 * Every long-transit span (the five slow bodies against Sun, Moon, Ascendant,
 * and Midheaven), computed once on mount by readerSpans (lib/screens/
 * transits.ts): about 1200 days starting 420 days back, so today sits inside
 * the window with room for spans that are already active. This is expensive,
 * so callers hold `loading` behind a Skeleton rather than recomputing on
 * every render.
 */
export function useSpans(): SpansState {
  const [state, setState] = useState<SpansState>({
    loading: true,
    now: new Date(),
    natal: null,
    spans: [],
  });

  useEffect(() => {
    const now = new Date();
    const natal = loadSavedNatal();
    const spans: readonly TransitSpan[] = natal ? readerSpans(natal, now) : [];
    // One computation on mount; never re-runs on re-render.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setState({ loading: false, now, natal, spans });
  }, []);

  return state;
}
