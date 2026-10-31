import Link from "next/link";
import { Button } from "@/components/chrome/Button";

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
      <div className="font-mono text-data-xs tracking-microcopy text-dim">THE LONG TRANSITS</div>
      <div className="mx-auto my-5 h-px w-11 bg-accent" />
      <div className="text-balance font-display text-display-s leading-display tracking-display text-bone">
        THE LONG TRANSITS ARE READ AGAINST A CHART
      </div>
      <p className="mx-auto mt-3.5 max-w-[360px] font-body text-prose-s leading-prose text-prose">
        A long transit is scored against your own sky, the chart cast once at the hour of your birth and kept.
      </p>
      <Button href="/reading" variant="votive" className="mt-[var(--space-4)]">
        CAST THE FIRST CHART
      </Button>
      <div className="mt-3.5 font-mono text-data-xs tracking-data text-dim">
        KEPT ON THIS DEVICE · AN ACCOUNT ADDS SYNC
      </div>
      {showAllLink ? (
        <div className="mt-5">
          <Link href="/transits" className="font-mono text-data-xs tracking-microcopy text-accent">
            SEE ALL LONG TRANSITS →
          </Link>
        </div>
      ) : null}
    </div>
  );
}
