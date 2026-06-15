import type { Deity } from "@/types/deity";
import { DeityGlyph } from "@/components/glyphs/DeityGlyph";
import { PLANET_LABELS, PLANET_SYMBOLS } from "@/data/cultures";

interface DeityCardProps {
  deity: Deity;
}

export function DeityCard({ deity }: DeityCardProps) {
  return (
    <article className="border-border-hairline bg-bg-deep hover:border-border-gold relative overflow-hidden rounded-2xl border p-6 transition-colors md:p-8">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-[88px_1fr_140px] md:items-center">
        <div className="flex items-center justify-center">
          <DeityGlyph
            culture={deity.culture}
            planet={deity.planet}
            size={64}
            decorative
          />
        </div>
        <div>
          <div className="flex items-baseline gap-3">
            <h3 className="font-display text-gold-leaf text-2xl md:text-[28px]">
              {deity.name}
            </h3>
            {deity.contested ? (
              <span className="text-conflict-red font-mono text-[10px] uppercase tracking-[0.3em]">
                contested
              </span>
            ) : null}
          </div>
          <p className="text-ink-secondary font-body mt-1 text-base italic md:text-lg">
            {deity.epithet}
          </p>
          <p className="text-ink-primary font-body mt-3 max-w-prose text-[16px] leading-relaxed md:text-[17px]">
            {deity.note}
          </p>
        </div>
        <div className="text-ink-tertiary font-mono text-xs uppercase tracking-[0.25em] md:text-right">
          <div className="text-ink-secondary text-2xl">
            {PLANET_SYMBOLS[deity.planet]}
          </div>
          <div className="mt-1">{PLANET_LABELS[deity.planet]}</div>
        </div>
      </div>
    </article>
  );
}
