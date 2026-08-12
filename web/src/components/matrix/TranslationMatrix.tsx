"use client";

import { useMemo, useState } from "react";
import {
  CULTURES,
  CULTURE_LABELS,
  PLANETS,
  PLANET_LABELS,
  PLANET_SYMBOLS,
  type Culture,
  type Planet,
} from "@/data/cultures";
import { DEITY_MATRIX } from "@/data/deities";
import { DeityGlyph } from "@/components/glyphs/DeityGlyph";
import { cn } from "@/lib/classNames";

const PLANET_ARCHETYPES: Readonly<Record<Planet, string>> = {
  sun: "Identity, sovereignty, the conscious self",
  moon: "Feeling, memory, the rhythms of the body",
  mercury: "Mind, message, exchange across boundaries",
  venus: "Attraction, beauty, the binding of pairs",
  mars: "Force, conflict, the work of cutting away",
  jupiter: "Growth, blessing, the law that expands",
  saturn: "Limit, time, the cost of holding form",
  uranus: "Rupture, sudden change, the received body of freedom",
  neptune: "Dissolution, longing, the received body of the ideal",
  pluto: "Buried power, forced transformation, the received body of the dead",
};

export function TranslationMatrix() {
  const [cultureFilter, setCultureFilter] = useState<Culture | null>(null);
  const [planetFilter, setPlanetFilter] = useState<Planet | null>(null);

  const visibleCultures = useMemo(
    () => (cultureFilter ? [cultureFilter] : [...CULTURES]),
    [cultureFilter],
  );
  const visiblePlanets = useMemo(
    () => (planetFilter ? [planetFilter] : [...PLANETS]),
    [planetFilter],
  );

  return (
    <div>
      <div className="mb-8 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="text-ink-tertiary font-mono text-[11px] uppercase tracking-[0.3em]">
            Filter by pantheon
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            <FilterChip
              active={cultureFilter === null}
              onClick={() => setCultureFilter(null)}
            >
              All
            </FilterChip>
            {CULTURES.map((c) => (
              <FilterChip
                key={c}
                active={cultureFilter === c}
                onClick={() => setCultureFilter(c)}
              >
                {CULTURE_LABELS[c]}
              </FilterChip>
            ))}
          </div>
        </div>
        <div>
          <div className="text-ink-tertiary font-mono text-[11px] uppercase tracking-[0.3em]">
            Filter by planet
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            <FilterChip
              active={planetFilter === null}
              onClick={() => setPlanetFilter(null)}
            >
              All
            </FilterChip>
            {PLANETS.map((p) => (
              <FilterChip
                key={p}
                active={planetFilter === p}
                onClick={() => setPlanetFilter(p)}
              >
                <span className="mr-1">{PLANET_SYMBOLS[p]}</span>
                {PLANET_LABELS[p]}
              </FilterChip>
            ))}
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[840px] border-separate border-spacing-2">
          <caption className="sr-only">
            Translation matrix of seven classical planets across five ancient pantheons.
          </caption>
          <thead>
            <tr>
              <th scope="col" className="text-ink-tertiary font-mono p-3 text-left text-[11px] uppercase tracking-[0.3em]">
                Planet
              </th>
              {visibleCultures.map((c) => (
                <th
                  key={c}
                  scope="col"
                  className="text-gold-leaf font-display p-3 text-left text-lg md:text-xl"
                >
                  {CULTURE_LABELS[c]}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {visiblePlanets.map((planet) => (
              <tr key={planet}>
                <th
                  scope="row"
                  className="bg-bg-deep border-hairline rounded-2xl p-4 text-left align-top"
                >
                  <div className="text-ink-secondary text-2xl">
                    {PLANET_SYMBOLS[planet]}
                  </div>
                  <div className="font-display text-ink-primary mt-1 text-xl">
                    {PLANET_LABELS[planet]}
                  </div>
                  <div className="text-ink-tertiary font-body mt-2 text-sm leading-relaxed">
                    {PLANET_ARCHETYPES[planet]}
                  </div>
                </th>
                {visibleCultures.map((culture) => {
                  const deity = DEITY_MATRIX[culture][planet];
                  return (
                    <td
                      key={`${culture}-${planet}`}
                      className="bg-bg-deep border-hairline hover:border-gold-soft group relative rounded-2xl p-4 align-top transition-colors"
                    >
                      <div className="flex items-start gap-3">
                        <DeityGlyph
                          culture={culture}
                          planet={planet}
                          size={40}
                          decorative
                        />
                        <div className="min-w-0 flex-1">
                          <div className="font-display text-ink-primary text-lg leading-tight">
                            {deity.name}
                          </div>
                          <div className="text-ink-secondary font-body mt-1 text-sm italic">
                            {deity.epithet}
                          </div>
                          {deity.contested ? (
                            <div className="text-conflict-red font-mono mt-2 text-[9px] uppercase tracking-[0.3em]">
                              contested
                            </div>
                          ) : null}
                        </div>
                      </div>
                      <p className="text-ink-tertiary font-body mt-3 text-[13px] leading-relaxed">
                        {deity.note}
                      </p>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

interface FilterChipProps {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}

function FilterChip({ active, onClick, children }: FilterChipProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "border-hairline font-mono rounded-full px-3 py-1.5 text-[11px] uppercase tracking-[0.2em] transition-colors",
        active
          ? "border-gold-soft text-gold-leaf bg-gold-leaf/10"
          : "text-ink-secondary hover:text-ink-primary",
      )}
    >
      {children}
    </button>
  );
}
