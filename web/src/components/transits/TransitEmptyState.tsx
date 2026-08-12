import Link from "next/link";

export interface TransitEmptyStateProps {
  /** Adds a "SEE ALL LONG TRANSITS" link, used when /transits/[id] resolves
   *  to an unknown id or the reader has no chart to read one against. */
  showAllLink?: boolean;
}

/**
 * The 3a-empty-state-rome register (kicker, accent rule, Cinzel headline,
 * one explaining sentence, accent-bordered CTA, mono anonymity note), worded
 * for the long-transit surfaces rather than the saved-charts list it was
 * mocked for.
 */
export function TransitEmptyState({ showAllLink }: TransitEmptyStateProps) {
  return (
    <div className="mx-auto max-w-[400px] py-10 text-center">
      <div className="font-mono text-[11px] tracking-[0.18em] text-dim">THE LONG TRANSITS</div>
      <div className="mx-auto my-5 h-px w-11 bg-[var(--accent)]" />
      <div className="text-balance font-display text-[19px] leading-[1.5] tracking-[0.1em] text-bone">
        THE LONG TRANSITS ARE READ AGAINST A CHART
      </div>
      <p className="mx-auto mt-3.5 max-w-[360px] font-body text-[14px] leading-[1.65] text-prose">
        A long transit is scored against your own sky, the chart cast once at the hour of your birth and kept.
      </p>
      <Link
        href="/reading"
        className="mt-[22px] inline-block border border-[var(--accent)] px-[30px] py-[14px] font-display text-[12px] tracking-[0.2em] text-[var(--accent)]"
      >
        CAST THE FIRST CHART
      </Link>
      <div className="mt-3.5 font-mono text-[11px] tracking-[0.08em] text-dim">
        KEPT ON THIS DEVICE · AN ACCOUNT ADDS SYNC
      </div>
      {showAllLink ? (
        <div className="mt-5">
          <Link href="/transits" className="font-display text-[11.5px] tracking-[0.18em] text-[var(--accent)]">
            SEE ALL LONG TRANSITS →
          </Link>
        </div>
      ) : null}
    </div>
  );
}
