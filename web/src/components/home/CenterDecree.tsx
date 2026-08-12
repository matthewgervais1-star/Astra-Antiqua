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
  now: Date;
}

/** The day's reading: institution kicker, the day's headline, two prose
 * paragraphs, the votive instruction, feedback, and the horizon links.
 * Shared between the desktop grid and the mobile stack. */
export function CenterDecree({
  className,
  institution,
  weekday,
  dateLong,
  reading,
  votive,
  now,
}: CenterDecreeProps) {
  const readingId = `day-${isoDateUtc(now)}`;
  return (
    <main className={cn("flex flex-col items-center px-6 py-11 text-center md:px-14 md:py-[44px]", className)}>
      <NaveHead kicker={`${weekday} · ${dateLong} · ${institution}`}>
        <span className="uppercase">{reading.headline}</span>
      </NaveHead>

      <div className="mx-auto max-w-[560px] text-left">
        {reading.paragraphs.map((paragraph, i) => (
          <p
            key={i}
            className="font-body text-[17.5px] font-light leading-[1.72] text-prose text-pretty [&:not(:last-child)]:mb-[15px]"
          >
            {paragraph}
          </p>
        ))}
      </div>

      <div className="mt-[30px] w-full max-w-[560px]">
        <Votive>{votive}</Votive>
      </div>

      <div className="mt-4">
        <FeedbackRow readingId={readingId} noun="DECREE" />
      </div>

      <div className="mt-10 flex justify-center gap-[26px] font-display text-[11.5px] tracking-[0.2em] text-dim">
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
    </main>
  );
}
