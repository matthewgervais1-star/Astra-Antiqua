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
        <span className="mb-[7px] block font-mono text-[11px] tracking-[0.16em] text-[var(--accent)]">
          THE LONG TRANSIT
        </span>
        <span className="font-display text-[11.5px] tracking-[0.1em] text-bone">
          CAST THE FIRST CHART TO READ ONE →
        </span>
      </>
    ) : data.status === "none" || !data.title1 ? (
      <>
        <span className="mb-[7px] block font-mono text-[11px] tracking-[0.16em] text-dim">THE LONG TRANSIT</span>
        <span className="font-display text-[11.5px] tracking-[0.1em] text-bone">No slow body in reach right now</span>
      </>
    ) : (
      <>
        <span className="mb-[7px] block font-mono text-[11px] tracking-[0.16em] text-[var(--accent)]">
          THE LONG TRANSIT
        </span>
        <span className="font-display text-[11.5px] tracking-[0.1em] text-bone">
          {data.title1} · THROUGH {data.rangeLabel?.split(" → ")[1] ?? ""} →
        </span>
      </>
    );

  return (
    <Link
      href={data.href ?? "/reading"}
      className={cn(
        "mt-[14px] block border border-[var(--accent-strong-border)] px-4 py-[14px] text-center",
        className,
      )}
    >
      {body}
    </Link>
  );
}
