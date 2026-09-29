import Link from "next/link";
import { NaveHead } from "@/components/chrome/NaveHead";
import { Votive } from "@/components/chrome/Votive";
import { FeedbackRow } from "@/components/chrome/FeedbackRow";
import type { DayDecree } from "@/lib/decree";
import { isoDateUtc } from "@/components/home/format";
import { cn } from "@/lib/classNames";

export interface CenterDecreeProps {
  className?: string;
  institution: string;
  weekday: string;
  dateLong: string;
  reading: DayDecree;
  votive: string;
  /** The culture's come-back line, closing the day page. */
  comeBack: string;
  now: Date;
}

/** The day's reading: institution kicker, the headline to the reader in
 * display type, the evidence line in mono beneath it, the paragraph, the
 * votive, feedback, the horizon links, and the come-back line. Shared between
 * the desktop grid and the mobile stack. */
export function CenterDecree({
  className,
  institution,
  weekday,
  dateLong,
  reading,
  votive,
  comeBack,
  now,
}: CenterDecreeProps) {
  const readingId = `day-${isoDateUtc(now)}`;
  return (
    <main className={cn("flex flex-col items-center px-6 py-11 text-center md:px-14 md:py-[var(--space-6)]", className)}>
      <NaveHead
        kicker={`${weekday} · ${dateLong} · ${institution}`}
        sub={
          reading.evidence ? (
            <div className="font-mono text-data-xs tracking-data text-dim">{reading.evidence}</div>
          ) : undefined
        }
      >
        {reading.headline}
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
        <FeedbackRow readingId={readingId} noun="DECREE" />
      </div>

      <div className="mt-10 flex justify-center gap-[var(--space-4)] font-display text-[11.5px] tracking-[0.2em] text-dim">
        <Link href="/week" className="hover:text-bone">
          THE WEEK →
        </Link>
        <Link href="/season" className="hover:text-bone">
          THE SEASON →
        </Link>
        <Link href="/year" className="hover:text-bone">
          THE YEAR →
        </Link>
      </div>

      <div className="mt-8 max-w-[560px] font-mono text-data-xs uppercase tracking-label text-dim">{comeBack}</div>
    </main>
  );
}
