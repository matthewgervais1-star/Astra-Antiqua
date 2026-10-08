import type { ReactNode } from "react";

export interface NaveHeadProps {
  kicker: string;
  children: ReactNode;
  sub?: ReactNode;
  /**
   * The culture's tier-2 emblem, set above the kicker. A page that is one
   * culture passes a CultureEmblem here, which docs/design/culture-marks.md
   * calls a culture doorway. A head with no emblem is spaced exactly as before.
   */
  emblem?: ReactNode;
}

/**
 * Centered emblem, kicker, 64x1 accent rule, Cinzel headline, optional sub
 * block, closing rule. At 1100px the home page's centre column holds about
 * 350px, and Rome's "paterfamilias" and Carthage's "moneychanger" are wider than
 * that at display-xl, so unbroken they would paint into the right rail. The
 * headline may hyphenate a long word at a line end (hyphens-auto, where the
 * browser has an English dictionary), and breaks inside a word without a
 * hyphen only when the word is wider than the column (wrap-anywhere).
 */
export function NaveHead({ kicker, children, sub, emblem }: NaveHeadProps) {
  return (
    <div className="text-center">
      {emblem ? <div className="mb-[var(--space-3)] flex justify-center">{emblem}</div> : null}
      <div className="font-mono text-data-xs tracking-microcopy text-dim">{kicker}</div>
      <div className="mx-auto my-6 h-px w-16 bg-accent" />
      <h1 className="mx-auto max-w-[680px] text-balance wrap-anywhere hyphens-auto font-display text-display-l leading-display tracking-display text-bone md:text-display-xl">
        {children}
      </h1>
      {sub ? <div className="mt-4">{sub}</div> : null}
      <div className="mx-auto my-6 h-px w-16 bg-accent" />
    </div>
  );
}
