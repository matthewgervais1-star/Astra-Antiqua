import type { ReactNode } from "react";
import Link from "next/link";
import { CultureChip } from "@/components/chrome/CultureChip";
import { Wordmark } from "@/components/chrome/Wordmark";

export interface InstrumentSibling {
  label: string;
  href: string;
}

export interface InstrumentShellProps {
  children: ReactNode;
  context: ReactNode;
  siblings: readonly InstrumentSibling[];
}

/**
 * The instrument chassis: one 60px bar (wordmark, context, culture chip,
 * sibling-tool links) over a 3-column grid. Children are expected to be the
 * three column elements in DOM order (data rail, visualization, reading
 * rail). Below the `instrument` breakpoint (--breakpoint-instrument in
 * globals.css, 1200px) the grid stacks to one column and re-orders the
 * children center-first, so the reading never sits under two rails' worth of
 * scroll. The rails' minimum widths sum to 720px, and the placements table
 * needs the center column wider than that leaves, so the three columns wait
 * for 1200px, the smallest width measured that shows every body name whole.
 * ChartsInstrument keys off the same token.
 */
export function InstrumentShell({ children, context, siblings }: InstrumentShellProps) {
  return (
    <>
      <header className="flex h-[60px] flex-wrap items-center gap-6 border-b border-rule px-8">
        <Link href="/" className="whitespace-nowrap font-display text-[14px] font-medium tracking-[0.28em] text-bone">
          <Wordmark capHeight={9.8} />
        </Link>
        <span className="min-w-0 truncate font-mono text-data-xs text-dim">{context}</span>
        <div className="ml-auto flex items-center gap-6">
          <CultureChip />
          {siblings.map((s) => (
            <Link
              key={s.href}
              href={s.href}
              className="whitespace-nowrap font-mono text-data-xs text-dim hover:text-bone"
            >
              {s.label.toUpperCase()}
            </Link>
          ))}
        </div>
      </header>
      <div
        className={[
          "grid grid-cols-1",
          "instrument:grid-cols-[minmax(340px,360px)_1fr_minmax(380px,470px)]",
          "[&>*:nth-child(1)]:order-2 [&>*:nth-child(2)]:order-1 [&>*:nth-child(3)]:order-3",
          "instrument:[&>*]:order-none",
        ].join(" ")}
      >
        {children}
      </div>
    </>
  );
}
