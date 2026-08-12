"use client";

import { useEffect, useState } from "react";
import { loadSavedNatal, type SavedNatal } from "@/lib/savedNatal";
import { computeTransitSpans, type SpanNatalPoint, type TransitSpan } from "@/lib/transitSpans";
import { SLOW_BODIES } from "@/lib/yearForecast";

const DAY_MS = 86_400_000;
const LOOKBACK_DAYS = 420;
const WINDOW_DAYS = 1200;

export interface SpansState {
  loading: boolean;
  now: Date;
  natal: SavedNatal | null;
  spans: readonly TransitSpan[];
}

/**
 * Every long-transit span (the five slow bodies against Sun, Moon, Ascendant,
 * and Midheaven), computed once on mount. The ephemeris walk covers ~1200
 * days starting 420 days back, so today sits inside the window with room for
 * spans that are already active. This is expensive (the walk samples the
 * outers every 8 days across four natal points), so callers hold `loading`
 * behind a Skeleton rather than recomputing on every render.
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
    let spans: readonly TransitSpan[] = [];
    if (natal) {
      const natalPoints: SpanNatalPoint[] = [
        { key: "sun", longitude: natal.chart.sun },
        { key: "moon", longitude: natal.chart.moon },
        { key: "asc", longitude: natal.angles.ascendant },
        { key: "mc", longitude: natal.angles.midheaven },
      ];
      const start = new Date(now.getTime() - LOOKBACK_DAYS * DAY_MS);
      spans = computeTransitSpans(natalPoints, SLOW_BODIES, start, WINDOW_DAYS);
    }
    // One computation on mount; never re-runs on re-render.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setState({ loading: false, now, natal, spans });
  }, []);

  return state;
}
