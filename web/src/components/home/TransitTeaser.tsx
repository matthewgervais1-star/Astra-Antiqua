import Link from "next/link";
import type { LongTransitData } from "@/components/home/buildHomeBundle";
import { cn } from "@/lib/classNames";

export interface TransitTeaserProps {
  className?: string;
  data: LongTransitData;
}

/** Mobile-only compact long-transit link: one line, or the CAST CTA when
 * there is no chart to read a long transit against. */
export function TransitTeaser({ className, data }: TransitTeaserProps) {
  const body =
    data.status === "cta" ? (
      <>
        <span className="mb-[var(--space-1)] block font-mono text-data-xs tracking-label text-accent">
          THE LONG TRANSIT
        </span>
        <span className="font-mono text-data-xs tracking-data text-bone">
          CAST THE FIRST CHART TO READ ONE&nbsp;→
        </span>
      </>
    ) : data.status === "none" || !data.title1 ? (
      <>
        <span className="mb-[var(--space-1)] block font-mono text-data-xs tracking-label text-dim">THE LONG TRANSIT</span>
        <span className="font-mono text-data-xs tracking-data text-bone">NO SLOW BODY IN REACH RIGHT NOW</span>
      </>
    ) : (
      <>
        <span className="mb-[var(--space-1)] block font-mono text-data-xs tracking-label text-accent">
          THE LONG TRANSIT
        </span>
        <span className="font-mono text-data-xs tracking-data text-bone">
          {data.title1} · THROUGH {data.rangeLabel?.split(" → ")[1] ?? ""}&nbsp;→
        </span>
      </>
    );

  return (
    <Link
      href={data.href ?? "/reading"}
      className={cn(
        "mt-[var(--space-2)] block border border-[var(--accent-strong-border)] px-4 py-[var(--space-2)] text-center",
        className,
      )}
    >
      {body}
    </Link>
  );
}
