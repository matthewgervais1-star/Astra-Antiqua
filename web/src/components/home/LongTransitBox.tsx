import Link from "next/link";
import type { LongTransitData } from "@/components/home/buildHomeBundle";
import { TransitProgress } from "@/components/home/TransitProgress";
import { cn } from "@/lib/classNames";

export interface LongTransitBoxProps {
  data: LongTransitData;
  className?: string;
}

/** The desktop long-transit box: the tightest active span read against the
 * saved chart, or a CAST CTA when there is no chart to read against. */
export function LongTransitBox({ data, className }: LongTransitBoxProps) {
  if (data.status === "cta") {
    return (
      <div className={cn("border border-[var(--accent-strong-border)] px-5 py-[var(--space-3)]", className)}>
        <div className="mb-[var(--space-2)] font-mono text-data-xs tracking-label text-accent">
          THE LONG TRANSIT
        </div>
        <div className="mb-3 font-display text-display-xs leading-[1.5] tracking-[0.04em] text-bone">
          THE LONG TRANSITS ARE READ AGAINST A CHART
        </div>
        <Link href="/reading" className="font-mono text-data-xs text-accent">
          CAST THE FIRST CHART →
        </Link>
      </div>
    );
  }

  if (data.status === "none" || !data.span || !data.title1 || !data.title2) {
    return (
      <div className={cn("border border-rule px-5 py-[var(--space-3)]", className)}>
        <div className="mb-[var(--space-2)] font-mono text-data-xs tracking-label text-dim">THE LONG TRANSIT</div>
        <div className="font-mono text-data-xs leading-data text-dim">
          No slow body holds within reach of your chart right now.
        </div>
      </div>
    );
  }

  return (
    <div className={cn("border border-[var(--accent-strong-border)] px-5 py-[var(--space-3)]", className)}>
      <div className="mb-[var(--space-2)] font-mono text-data-xs tracking-label text-accent">
        THE LONG TRANSIT · {data.status === "active" ? "ACTIVE" : "NEXT"}
      </div>
      <div className="mb-2 font-display text-display-xs leading-[1.5] tracking-[0.04em] text-bone">
        {data.title1}
        <br />
        {data.title2}
      </div>
      <div className="mb-[var(--space-2)] font-mono text-data-xs leading-data text-dim">{data.rangeLabel}</div>
      <div className="mb-3">
        <TransitProgress progressPct={data.progressPct ?? 0} />
      </div>
      <Link href={data.href ?? "/transits"} className="font-mono text-data-xs text-accent">
        READ THE LONG TRANSIT →
      </Link>
    </div>
  );
}
