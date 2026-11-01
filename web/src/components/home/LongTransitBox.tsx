import Link from "next/link";
import type { LongTransitData } from "@/components/home/buildHomeBundle";
import { TransitProgress } from "@/components/home/TransitProgress";
import { cn } from "@/lib/classNames";
import { text } from "@/strings";

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
          {text("day.longTransit.label")}
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
        <div className="mb-[var(--space-2)] font-mono text-data-xs tracking-label text-dim">{text("day.longTransit.label")}</div>
        <div className="font-mono text-data-xs leading-data text-dim">
          No slow body holds within reach of your chart right now.
        </div>
      </div>
    );
  }

  return (
    <div className={cn("border border-[var(--accent-strong-border)] px-5 py-[var(--space-3)]", className)}>
      <div className="mb-[var(--space-2)] font-mono text-data-xs tracking-label text-accent">
        {text("day.longTransit.label")}
      </div>
      <div className="mb-2 font-display text-display-xs leading-[1.5] tracking-[0.04em] text-bone">
        {data.title1}
        <br />
        {data.title2}
      </div>
      <div className="mb-[var(--space-2)] font-mono text-data-xs leading-data text-dim">
        {text("day.longTransit.meta", {
          status: text(data.status === "active" ? "day.longTransit.open" : "day.longTransit.next"),
          range: data.rangeLabel ?? "",
        })}
      </div>
      <div className="mb-3">
        <TransitProgress progressPct={data.progressPct ?? 0} />
      </div>
      {data.footerLabel ? (
        <div className="mb-[var(--space-2)] font-mono text-data-xs leading-data text-dim">{data.footerLabel}</div>
      ) : null}
      <Link href={data.href ?? "/transits"} className="font-mono text-data-xs text-accent">
        {text("day.longTransit.link")}
      </Link>
    </div>
  );
}
