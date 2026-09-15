"use client";

import { useMemo } from "react";
import type { Culture } from "@/data/cultures";
import { computeChart } from "@/lib/ephemeris";
import { composeDecree } from "@/lib/decree";

export interface TodaySpecimenProps {
  culture: Culture;
}

function firstSentence(text: string): string {
  const match = /^.*?[.!?](?=\s|$)/.exec(text);
  return match ? match[0] : text;
}

/**
 * A live specimen decree, computed on the client for the visitor's own clock:
 * today's sky read in this culture's voice, exactly the way the day's nave
 * decree is composed, cut to a headline and its first sentence.
 */
export function TodaySpecimen({ culture }: TodaySpecimenProps) {
  const specimen = useMemo(() => {
    const now = new Date();
    const chart = computeChart(now);
    const reading = composeDecree(culture, chart);
    return {
      headline: reading.headline,
      sentence: firstSentence(reading.paragraphs[0] ?? ""),
      dateLine: now
        .toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })
        .toUpperCase(),
    };
  }, [culture]);

  return (
    <div className="border border-rule px-6 py-7 text-center">
      <div className="font-mono text-data-xs tracking-microcopy text-dim">{specimen.dateLine}</div>
      <div className="mx-auto mt-4 h-px w-10 bg-accent" />
      <h3 className="mt-4 font-display text-display-s leading-display tracking-display text-bone">
        {specimen.headline}
      </h3>
      <p className="mx-auto mt-3 max-w-[440px] font-body text-prose-s italic leading-prose text-prose">
        {specimen.sentence}
      </p>
    </div>
  );
}
