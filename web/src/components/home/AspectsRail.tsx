import { DeityGlyph } from "@/components/chrome/DeityGlyph";
import { OrbBar } from "@/components/chrome/OrbBar";
import { LongTransitBox } from "@/components/home/LongTransitBox";
import type { AspectRow, LongTransitData } from "@/components/home/buildHomeBundle";
import type { Culture } from "@/data/cultures";
import { cn } from "@/lib/classNames";

export interface AspectsRailProps {
  className?: string;
  culture: Culture;
  aspects: readonly AspectRow[];
  longTransit: LongTransitData;
}

const LABEL_TONE_CLASS: Readonly<Record<AspectRow["tone"], string>> = {
  harmony: "text-harmony",
  conflict: "text-conflict",
  quiet: "text-dim",
};

/** Desktop-only right rail: the day's tightest aspects in orb, and the long
 * transit box pinned to the bottom of the column. */
export function AspectsRail({ className, culture, aspects, longTransit }: AspectsRailProps) {
  return (
    <aside id="aspects" className={cn("flex flex-col px-7 py-[var(--space-4)]", className)}>
      <div className="mb-[var(--space-2)] font-mono text-data-xs tracking-label text-dim">ASPECTS IN ORB</div>
      <div className="flex flex-col gap-4">
        {aspects.length === 0 ? (
          <div className="font-mono text-data-xs text-dim">Nothing is in orb today. A quiet sky.</div>
        ) : (
          aspects.map((row) => (
            <div key={row.key}>
              <div className="mb-2 flex items-center justify-between font-mono text-data-xs text-bone">
                <span className="inline-flex items-center gap-[var(--space-1)]">
                  <DeityGlyph body={row.a} culture={culture} size={16} decorative />
                  {row.kindGlyph}
                  <DeityGlyph body={row.b} culture={culture} size={16} decorative />
                  <span>
                    {row.nameA}–{row.nameB}
                  </span>
                </span>
                <span className="text-dim">{row.orbLabel}</span>
              </div>
              <OrbBar orb={row.orb} maxOrb={row.maxOrb} tone={row.tone} />
              <div className={cn("mt-[var(--space-1)] font-mono text-data-xs", LABEL_TONE_CLASS[row.tone])}>
                {row.rulingLabel}
              </div>
            </div>
          ))
        )}
      </div>
      <LongTransitBox data={longTransit} className="mt-auto pt-6" />
    </aside>
  );
}
