import Link from "next/link";
import { NaveHead } from "@/components/chrome/NaveHead";
import { Votive } from "@/components/chrome/Votive";
import { FeedbackRow } from "@/components/chrome/FeedbackRow";
import { EvidenceLine } from "@/components/chrome/EvidenceLine";
import { ScriptName } from "@/components/chrome/ScriptName";
import type { Culture } from "@/data/cultures";
import type { DayDecree } from "@/lib/decree";
import { isoDateUtc } from "@/components/home/format";
import { cn } from "@/lib/classNames";
import { str } from "@/strings";
import { Fill } from "@/strings/Fill";

export interface CenterDecreeProps {
  className?: string;
  culture: Culture;
  /** "WED 21 OCT 2026" (F1, the UTC day). */
  dateLabel: string;
  reading: Pick<DayDecree, "headline" | "evidence" | "paragraphs" | "tone" | "figures">;
  votive: string;
  now: Date;
  /** The figure page for the day's headline figure; the headline links to it. Null on a quiet day. */
  figureHref?: string | null;
  /** A dated view (/?date=): a link back to today closes the column. */
  dated?: boolean;
}

/** The day's reading: institution kicker, the headline to the reader in
 * display type (a link to the figure page for the day's headline figure), the evidence line in mono beneath it, the paragraph, the
 * votive, feedback, the horizon links, and on a dated view the way back to
 * today. The come-back line closes the whole page, under the dive deeper
 * (DiveDeeper.tsx). Shared between the desktop grid and the mobile stack. */
export function CenterDecree({
  className,
  culture,
  dateLabel,
  reading,
  votive,
  now,
  figureHref = null,
  dated = false,
}: CenterDecreeProps) {
  const readingId = `day-${isoDateUtc(now)}`;
  return (
    <main id="day-figure" className={cn("flex flex-col items-center px-6 py-11 text-center md:px-14 md:py-[var(--space-6)]", className)}>
      <NaveHead
        culture={culture}
        kicker={
          <Fill
            k="day.kicker"
            culture={culture}
            slots={{ date: dateLabel, institution: <ScriptName culture={culture} heading="institution" /> }}
          />
        }
        sub={
          reading.figures[0] ? (
            <div className="font-mono text-data-xs tracking-data text-dim">
              <EvidenceLine culture={culture} figure={reading.figures[0]} />
            </div>
          ) : undefined
        }
      >
        {figureHref ? (
          <Link href={figureHref} className="hover:text-accent">
            {reading.headline}
          </Link>
        ) : (
          reading.headline
        )}
      </NaveHead>

      <div className="mx-auto max-w-[560px] text-left">
        {reading.paragraphs.map((paragraph, i) => (
          <p
            key={i}
            className="font-body text-prose-m font-light leading-prose text-prose text-pretty [&:not(:last-child)]:mb-[var(--space-3)]"
          >
            {paragraph}
          </p>
        ))}
      </div>

      <div className="mt-[var(--space-5)] w-full max-w-[560px]">
        <Votive>{votive}</Votive>
      </div>

      <div className="mt-4">
        <FeedbackRow readingId={readingId} noun={str("day.feedback.noun", culture)} />
      </div>

      <div className="mt-10 flex flex-wrap justify-center gap-x-[var(--space-2)] gap-y-[var(--space-2)] font-mono text-data-xs tracking-microcopy text-dim sm:gap-x-[var(--space-4)] [&>a]:whitespace-nowrap">
        <Link href="/week" className="hover:text-bone">
          {str("chrome.footer.toWeek", culture)}
        </Link>
        <Link href="/season" className="hover:text-bone">
          {str("chrome.footer.toSeason", culture)}
        </Link>
        <Link href="/year" className="hover:text-bone">
          {str("chrome.footer.toYear", culture)}
        </Link>
      </div>

      {dated ? (
        <Link href="/" className="mt-8 font-mono text-data-xs uppercase tracking-label text-bone hover:text-accent">
          ← BACK TO TODAY
        </Link>
      ) : null}
    </main>
  );
}
