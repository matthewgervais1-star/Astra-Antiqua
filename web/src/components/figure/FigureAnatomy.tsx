import type { ReactNode } from "react";
import Link from "next/link";
import type { Culture } from "@/data/cultures";
import { DeityGlyph } from "@/components/chrome/DeityGlyph";
import { FigureDiagram } from "@/components/chrome/FigureDiagram";
import { SectionDivider } from "@/components/chrome/SectionDivider";
import { SpanBar } from "@/components/chrome/SpanBar";
import { ASPECT_GLYPH } from "@/lib/decree";
import type { FigureAnatomy as Anatomy } from "@/lib/figureReading";
import { ASPECT_ANGLE, type Timeline } from "@/lib/recurrence";

export interface FigureAnatomyProps {
  culture: Culture;
  anatomy: Anatomy;
  timeline: Timeline;
  /** Under the timeline: what the marker marks and the span it sits in. */
  timelineCaption: string;
  /** Set at the diagram's center when the figure lands on the reader's chart. */
  centerLabel?: string;
  /** Printed between the paragraph and the figure in space: the long transit's four-part spine. */
  afterParagraph?: ReactNode;
}

const PROSE = "text-pretty font-body text-prose-m font-light leading-prose text-prose";
const CARD_LABEL = { consider: "CONSIDER", read: "READ", keep: "KEEP" } as const;

/** The span the figure holds, four ticks, the present marked with the accent square. */
function FigureTimeline({ timeline, caption }: { timeline: Timeline; caption: string }) {
  return (
    <div className="mx-auto max-w-[560px]">
      <div className="relative">
        <SpanBar startPct={0} endPct={timeline.presentPct} ticks={timeline.ticks.map((t) => t.pct)} />
        <span
          className="absolute top-1/2 h-[9px] w-[9px] -translate-x-1/2 -translate-y-1/2 bg-accent"
          style={{ left: `${timeline.presentPct}%` }}
          aria-hidden="true"
        />
      </div>
      <div className="relative mt-2 h-[30px] font-mono text-[10px] leading-tight tracking-label text-dim">
        {timeline.ticks.map((tick, i) => (
          <span
            key={i}
            className={
              i === 0
                ? "absolute left-0 text-left"
                : i === timeline.ticks.length - 1
                  ? "absolute right-0 text-right"
                  : "absolute -translate-x-1/2 text-center"
            }
            style={i === 0 || i === timeline.ticks.length - 1 ? undefined : { left: `${tick.pct}%` }}
          >
            {tick.label}
            {tick.sub ? (
              <>
                <br />
                {tick.sub}
              </>
            ) : null}
          </span>
        ))}
      </div>
      <div className="mt-2 text-center font-mono text-data-xs tracking-label text-dim">{caption}</div>
    </div>
  );
}

/**
 * Everything the figure page says below its headline, in the reference's
 * order: the hero, the paragraph in two moves, the figure in space and its
 * sentence taken apart, how often it returns and where it stands now, how it
 * plays out in the culture's institution, three things to try, and the
 * lesson. The day's figure and the long transit both print it.
 */
export function FigureAnatomy({ culture, anatomy, timeline, timelineCaption, centerLabel, afterParagraph }: FigureAnatomyProps) {
  return (
    <div className="flex flex-col gap-9">
      <div className="flex justify-center text-bone" aria-hidden="true">
        <DeityGlyph body={anatomy.heroBody} culture={culture} size={96} decorative />
      </div>

      <div className="mx-auto flex max-w-[560px] flex-col gap-[var(--space-3)] text-left">
        <p className={PROSE}>{anatomy.moveOne}</p>
        <p className={PROSE}>{anatomy.moveTwo}</p>
      </div>

      {afterParagraph}

      <section>
        <SectionDivider label="WHAT IT LOOKS LIKE IN SPACE" />
        <div className="mt-6">
          <FigureDiagram
            culture={culture}
            from={anatomy.diagram.from}
            to={anatomy.diagram.to}
            kind={anatomy.diagram.kind}
            angle={ASPECT_ANGLE[anatomy.diagram.kind]}
            centerLabel={centerLabel}
          />
        </div>
        <ol className="mx-auto mt-6 flex max-w-[560px] flex-col gap-4 text-left">
          {anatomy.parts.map((part, i) => (
            <li key={i} className="grid grid-cols-[28px_1fr] items-start gap-3">
              <span className="flex h-[28px] items-center justify-center text-bone" aria-hidden="true">
                {part.body ? (
                  <DeityGlyph body={part.body} culture={culture} size={22} decorative />
                ) : i === 1 ? (
                  <span className="font-mono text-[18px] text-dim">{ASPECT_GLYPH[anatomy.kind]}</span>
                ) : (
                  // An angle (the rising, the midheaven) has no glyph: the diagram's own square marks it.
                  <span className="block h-[7px] w-[7px] bg-bone" />
                )}
              </span>
              <span className="flex flex-col gap-1">
                <span className="font-display text-display-xs leading-display text-bone">{part.phrase}</span>
                <span className="font-mono text-data-xs tracking-label text-dim">{part.tag}</span>
              </span>
            </li>
          ))}
        </ol>
      </section>

      <section className="flex flex-col gap-5">
        <p className={`${PROSE} mx-auto max-w-[560px] text-left`}>{anatomy.recurrence}</p>
        <FigureTimeline timeline={timeline} caption={timelineCaption} />
        <div className="text-center font-mono text-data-xs tracking-label">
          <Link href="/learn/aspects" className="border-b border-bone/40 pb-[2px] text-bone hover:text-accent">
            WHAT IS THIS? →
          </Link>
        </div>
      </section>

      <section>
        <SectionDivider label={anatomy.playsOutTitle} />
        <p className="mx-auto mt-5 max-w-[560px] text-left font-display text-display-xs leading-display text-bone">
          {anatomy.actLine}
        </p>
        <ul className="mx-auto mt-4 flex max-w-[560px] flex-col gap-2 text-left">
          {anatomy.manifestations.map((item) => (
            <li key={item} className="grid grid-cols-[18px_1fr] gap-2 font-body text-prose-s leading-prose text-prose">
              <span className="font-mono text-accent" aria-hidden="true">
                ✓
              </span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <SectionDivider label="TRY THIS" />
        <div className="mx-auto mt-5 grid max-w-[640px] grid-cols-1 gap-3 text-left md:grid-cols-3">
          {anatomy.cards.map((card) => (
            <div key={card.kind} className="flex flex-col gap-2 border border-rule p-4">
              <span className="font-mono text-data-xs tracking-label text-accent">{CARD_LABEL[card.kind]}</span>
              <span className="font-body text-prose-s leading-prose text-prose">{card.title}</span>
              <span className="font-mono text-[10.5px] leading-snug text-dim">{card.source}</span>
            </div>
          ))}
        </div>
      </section>

      <section>
        <SectionDivider label="THE LESSON" />
        <p className="mx-auto mt-5 max-w-[520px] text-balance text-center font-display text-display-xs leading-display text-bone">
          {anatomy.lesson}
        </p>
      </section>
    </div>
  );
}
