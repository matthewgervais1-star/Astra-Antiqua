import {
  PLANETS,
  PLANET_LABELS,
  PLANET_SYMBOLS,
  type Culture,
} from "@/data/cultures";
import { DEITY_MATRIX } from "@/data/deities";
import { PLANET_AREAS, ASCENDANT_AREA } from "@/data/planetAreas";
import { DeityGlyph } from "@/components/glyphs/DeityGlyph";
import { GlassPanel } from "@/components/ui/GlassPanel";

interface LifeAreaLegendProps {
  /** When set, rows show the culture's deity glyph and name; otherwise the
   *  classical planet symbol and label. */
  culture?: Culture | null;
}

export function LifeAreaLegend({ culture = null }: LifeAreaLegendProps) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {PLANETS.map((planet) => {
        const area = PLANET_AREAS[planet];
        const deity = culture ? DEITY_MATRIX[culture][planet] : null;
        const sub = deity
          ? `${deity.name} · ${PLANET_LABELS[planet]}`
          : PLANET_LABELS[planet];
        return (
          <GlassPanel
            key={planet}
            tone="solid"
            className="flex items-start gap-4 p-4 md:p-5"
          >
            {culture ? (
              <DeityGlyph
                culture={culture}
                planet={planet}
                size={36}
                decorative
                className="mt-0.5 shrink-0"
              />
            ) : (
              <span className="text-gold-leaf font-display mt-0.5 w-9 shrink-0 text-center text-2xl">
                {PLANET_SYMBOLS[planet]}
              </span>
            )}
            <div className="min-w-0">
              <div className="font-display text-gold-leaf text-lg">{area.area}</div>
              <div className="text-ink-tertiary font-mono mt-0.5 text-[10px] uppercase tracking-[0.2em]">
                {sub}
              </div>
              <p className="text-ink-secondary font-body mt-1.5 text-sm leading-relaxed">
                {area.blurb}
              </p>
            </div>
          </GlassPanel>
        );
      })}
      <GlassPanel tone="solid" className="flex items-start gap-4 p-4 md:p-5">
        <span className="text-gold-leaf font-display mt-0.5 w-9 shrink-0 text-center text-2xl">
          ↑
        </span>
        <div className="min-w-0">
          <div className="font-display text-gold-leaf text-lg">
            {ASCENDANT_AREA.area}
          </div>
          <div className="text-ink-tertiary font-mono mt-0.5 text-[10px] uppercase tracking-[0.2em]">
            Ascendant · Rising
          </div>
          <p className="text-ink-secondary font-body mt-1.5 text-sm leading-relaxed">
            {ASCENDANT_AREA.blurb}
          </p>
        </div>
      </GlassPanel>
    </div>
  );
}
