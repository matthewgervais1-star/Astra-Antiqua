"use client";

import { useEffect, useState } from "react";
import { readFeedback, writeFeedback, type FeedbackVerdict } from "@/lib/feedback";
import { cn } from "@/lib/classNames";

export interface FeedbackRowProps {
  readingId: string;
  noun: string;
}

const LINK_BASE = "border-b pb-[2px]";
const LINK_UNSELECTED = "border-bone/40 text-bone";
const LINK_SELECTED = "border-rule-active text-accent";

export function FeedbackRow({ readingId, noun }: FeedbackRowProps) {
  const [verdict, setVerdict] = useState<FeedbackVerdict | null>(null);

  useEffect(() => {
    // Read after mount only, so the server-rendered markup (always
    // unselected) matches the client's first paint before hydration.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setVerdict(readFeedback()[readingId] ?? null);
  }, [readingId]);

  const choose = (value: FeedbackVerdict) => {
    const next = verdict === value ? null : value;
    writeFeedback(readingId, next);
    setVerdict(next);
  };

  return (
    <div className="font-mono text-data-xs tracking-label text-dim">
      AGAINST THIS {noun} →{" "}
      <button
        type="button"
        onClick={() => choose("so")}
        className={cn(LINK_BASE, verdict === "so" ? LINK_SELECTED : LINK_UNSELECTED)}
      >
        IT WAS SO
      </button>{" "}
      ·{" "}
      <button
        type="button"
        onClick={() => choose("notso")}
        className={cn(LINK_BASE, verdict === "notso" ? LINK_SELECTED : LINK_UNSELECTED)}
      >
        IT WAS NOT SO
      </button>{" "}
      <span className="text-faint-ink">· KEPT ON THIS DEVICE</span>
    </div>
  );
}
