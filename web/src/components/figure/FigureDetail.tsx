"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { isReceived } from "@/data/cultures";
import { CULTURE_VOICES } from "@/data/cultureVoice";
import { DEITY_MATRIX } from "@/data/deities";
import { useActivePantheon } from "@/components/pantheon/PantheonContext";
import { FeedbackRow } from "@/components/chrome/FeedbackRow";
import { NaveHead } from "@/components/chrome/NaveHead";
import { ReceptionNote } from "@/components/chrome/ReceptionNote";
import { Skeleton } from "@/components/chrome/Skeleton";
import { FigureAnatomy } from "@/components/figure/FigureAnatomy";
import { dateLongUpper, weekdayUpper } from "@/components/home/format";
import { composeFigurePage, parseIsoDate } from "@/lib/figureReading";
import { buildTimeline, type OrbWindow } from "@/lib/recurrence";
import { loadSavedNatal, type SavedNatal } from "@/lib/savedNatal";

const MONTHS = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"] as const;

/** "IN ORB FROM SEP 30 12:00 TO OCT 1 06:00 UTC", or dates alone for a figure of days. */
function orbSpan(window: OrbWindow): string {
  const hours = (window.end.getTime() - window.start.getTime()) / 3_600_000 < 96;
  const fmt = (d: Date) => {
    const day = `${MONTHS[d.getUTCMonth()]} ${d.getUTCDate()}`;
    return hours ? `${day} ${String(d.getUTCHours()).padStart(2, "0")}:00` : day;
  };
  return `IN ORB FROM ${fmt(window.start)} TO ${fmt(window.end)}${hours ? " UTC" : ""}`;
}

const LINKS = (
  <div className="mt-9 flex flex-wrap justify-center gap-8 font-display text-[11.5px] tracking-[0.2em]">
    <Link href="/" className="text-bone/65 hover:text-bone">
      ← THE DAY
    </Link>
    <Link href="/week" className="text-bone/65 hover:text-bone">
      THE WEEK
    </Link>
    <Link href="/transits" className="text-accent">
      ALL TRANSITS →
    </Link>
  </div>
);

export interface FigureDetailProps {
  date: string;
  id: string;
}

/**
 * The figure page for one day's figure. The reader's chart is read from the
 * device after mount, so the first paint is the skeleton and the reading
 * never flashes from the sky version to the natal one.
 */
export function FigureDetail({ date, id }: FigureDetailProps) {
  const culture = useActivePantheon();
  const [state, setState] = useState<{ natal: SavedNatal | null; now: Date } | null>(null);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setState({ natal: loadSavedNatal(), now: new Date() });
  }, []);

  const page = useMemo(() => {
    if (!culture || !state) return null;
    const natal = state.natal ? { chart: state.natal.chart, ascendant: state.natal.angles.ascendant } : null;
    return composeFigurePage(culture, date, id, natal);
  }, [culture, state, date, id]);

  if (!culture || !state) return <Skeleton />;

  const voice = CULTURE_VOICES[culture];
  const instant = parseIsoDate(date);

  if (!page || !instant) {
    return (
      <div className="mx-auto max-w-[640px] text-center">
        <NaveHead kicker={`${voice.institution} · THE FIGURE`}>The sky did not hold this figure that day.</NaveHead>
        <p className="font-mono text-data-xs tracking-label text-dim">
          {id.toUpperCase()} · {date}
        </p>
        {LINKS}
      </div>
    );
  }

  const timeline = buildTimeline(page.window, state.now, page.instant);
  const marker = timeline.presentInside ? "NOW" : dateLongUpper(instant);

  return (
    <div className="mx-auto max-w-[640px]">
      <NaveHead
        kicker={`${weekdayUpper(instant)} · ${dateLongUpper(instant)} · ${voice.institution}`}
        sub={<div className="font-mono text-data-xs tracking-data text-dim">{page.evidence}</div>}
      >
        {page.headline}
      </NaveHead>

      <FigureAnatomy
        culture={culture}
        anatomy={page}
        timeline={timeline}
        timelineCaption={`${marker} · ${orbSpan(page.window)}`}
        centerLabel={page.natal ? "YOU" : undefined}
      />

      <div className="mt-9 flex justify-center">
        <FeedbackRow readingId={page.feedbackId} noun="FIGURE" />
      </div>

      {isReceived(page.heroBody) ? (
        <div className="mt-8">
          <ReceptionNote
            intro={`${DEITY_MATRIX[culture][page.heroBody].name.toUpperCase()} IS A MODERN BODY. ${voice.receptionLine.toUpperCase()}`}
          />
        </div>
      ) : null}

      {LINKS}
    </div>
  );
}
