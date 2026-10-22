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
 * The instrument chassis: one bar (60px minimum, taller when it wraps) holding the wordmark, context, culture chip,
 * sibling-tool links) over a 3-column grid. Children are expected to be the
 * three column elements in DOM order (data rail, visualization, reading
 * rail). Below the `instrument` breakpoint (--breakpoint-instrument in
 * globals.css, 68.75rem = 1100px) the grid stacks to one column and the
 * `max-instrument:` order utilities put the center first, so the reading never
 * sits under two rails' worth of scroll. At and above the breakpoint no order
 * rule applies, so the columns keep DOM order. The data rail tops out at 360px,
 * which leaves the placements table's body-name cell about 61px, short of
 * Egypt's "HORUS THE RED" (86px), so no breakpoint would show it on one line;
 * the name wraps to a second line instead of truncating.
 * ChartsInstrument keys off the same token.
 */
export function InstrumentShell({ children, context, siblings }: InstrumentShellProps) {
  return (
    <>
      <header className="flex min-h-[60px] flex-wrap items-center gap-x-6 gap-y-2 border-b border-rule px-5 py-3 sm:px-8">
        <Link href="/" className="whitespace-nowrap font-display text-[14px] font-medium tracking-[0.28em] text-bone">
          <Wordmark capHeight={9.8} />
        </Link>
        <span className="min-w-0 basis-full font-mono text-data-xs text-dim sm:basis-auto sm:truncate">{context}</span>
        <div className="ml-auto flex flex-wrap items-center gap-x-6 gap-y-2">
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
          "max-instrument:[&>*:nth-child(1)]:order-2 max-instrument:[&>*:nth-child(2)]:order-1 max-instrument:[&>*:nth-child(3)]:order-3",
        ].join(" ")}
      >
        {children}
      </div>
    </>
  );
}
