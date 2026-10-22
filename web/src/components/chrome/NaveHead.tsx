import type { ReactNode } from "react";
import type { Culture } from "@/data/cultures";
import { ScriptName } from "@/components/chrome/ScriptName";

/** How long the culture name holds its script after the page paints (owner, 2026-10-20). */
export const CULTURE_NAME_INTRO_MS = 1200;

export interface NaveHeadProps {
  kicker: ReactNode;
  children: ReactNode;
  sub?: ReactNode;
  /**
   * The culture's tier-2 emblem, set above the kicker. A page that is one
   * culture passes a CultureEmblem here, which docs/design/culture-marks.md
   * calls a culture doorway. A head with no emblem is spaced exactly as before.
   */
  emblem?: ReactNode;
  /**
   * The culture whose name heads the page, set large above the kicker as a
   * ScriptName: script on load, Latin after CULTURE_NAME_INTRO_MS, then the
   * band rule (owner, 2026-10-20: the name larger and more prominent). A
   * page whose headline is already the culture's name passes none.
   */
  culture?: Culture;
}

/**
 * Centered emblem, kicker, 64x1 accent rule, Cinzel headline, optional sub
 * block, closing rule. At 1100px the home page's centre column holds about
 * 350px, and Rome's "paterfamilias" and Carthage's "moneychanger" are wider than
 * that at display-xl, so unbroken they would paint into the right rail. From
 * 1100px the headline may hyphenate a long word at a line end (hyphens-auto,
 * where the browser has a dictionary for the page's language). Below 1100px it
 * does not: at 375px, with Chrome's dictionaries, hyphens-auto split 56 of the
 * 250 day and slow headlines at a syllable where they otherwise wrap at a
 * space. A French headline (the legal pages, lang="fr-CA") hyphenates at every
 * width: at 375px "CONFIDENTIALITÉ" is wider than the column, and French rules
 * break it as CONFI-DENTIALITÉ where wrap-anywhere alone cuts it at the edge.
 * At every width a word wider than the column still breaks, without a hyphen
 * where the browser has no dictionary (wrap-anywhere).
 */
export function NaveHead({ kicker, children, sub, emblem, culture }: NaveHeadProps) {
  return (
    <div className="text-center">
      {emblem ? <div className="mb-[var(--space-3)] flex justify-center">{emblem}</div> : null}
      {culture ? (
        <div className="mb-[var(--space-3)] font-display text-display-l leading-display tracking-display text-accent">
          <ScriptName culture={culture} heading="culture" upper intro={CULTURE_NAME_INTRO_MS} />
        </div>
      ) : null}
      <div className="font-mono text-data-xs tracking-microcopy text-dim">{kicker}</div>
      <div className="mx-auto my-6 h-px w-16 bg-accent" />
      <h1 className="mx-auto max-w-[680px] text-balance wrap-anywhere min-[1100px]:hyphens-auto [&:lang(fr)]:hyphens-auto font-display text-display-l leading-display tracking-display text-bone md:text-display-xl">
        {children}
      </h1>
      {sub ? <div className="mt-4">{sub}</div> : null}
      <div className="mx-auto my-6 h-px w-16 bg-accent" />
    </div>
  );
}
