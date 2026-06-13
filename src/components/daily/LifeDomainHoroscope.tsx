"use client";

import { useMemo, useState } from "react";
import {
  PLANET_LABELS,
  type Culture,
  type Planet,
} from "@/data/cultures";
import { DEITY_MATRIX } from "@/data/deities";
import {
  computeAspects,
  longitudeToSign,
  type Aspect,
  type Longitude,
} from "@/data/sampleChart";
import { LIFE_DOMAINS, type LifeDomain } from "@/data/lifeDomains";
import { SIGN_REGISTERS } from "@/data/interpretations";
import { getDomainReading, type DomainReading as DomainDirective } from "@/data/domainReadings";
import { ASPECT_VERBS } from "@/data/aspectVerbs";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { cn } from "@/lib/classNames";

interface LifeDomainHoroscopeProps {
  culture: Culture;
  chart: Readonly<Record<Planet, Longitude>>;
}

interface DomainReading {
  domain: (typeof LIFE_DOMAINS)[number];
  placements: { planet: Planet; sentence: string }[];
  aspects: { aspect: Aspect; sentence: string }[];
  directive: DomainDirective | null;
}

function buildDomainReading(
  domain: (typeof LIFE_DOMAINS)[number],
  culture: Culture,
  chart: Readonly<Record<Planet, Longitude>>,
  allAspects: readonly Aspect[],
): DomainReading {
  const placements = domain.planets.map((planet) => {
    const deity = DEITY_MATRIX[culture][planet];
    const { sign } = longitudeToSign(chart[planet]);
    return {
      planet,
      sentence: `${deity.name} holds ${SIGN_REGISTERS[sign]}.`,
    };
  });

  const domainAspects = allAspects
    .filter(
      (a) => domain.planets.includes(a.a) || domain.planets.includes(a.b),
    )
    .sort((x, y) => x.orb - y.orb)
    .slice(0, 2);

  const aspects = domainAspects.map((aspect) => {
    const deityA = DEITY_MATRIX[culture][aspect.a];
    const deityB = DEITY_MATRIX[culture][aspect.b];
    const verb = ASPECT_VERBS[culture][aspect.kind];
    return {
      aspect,
      sentence: `${deityA.name} ${verb} ${deityB.name}.`,
    };
  });

  const tightest = domainAspects[0];
  const directive = tightest ? getDomainReading(domain.id, tightest.kind) : null;

  return { domain, placements, aspects, directive };
}

export function LifeDomainHoroscope({ culture, chart }: LifeDomainHoroscopeProps) {
  const aspects = useMemo(() => computeAspects(chart), [chart]);
  const readings = useMemo<readonly DomainReading[]>(
    () => LIFE_DOMAINS.map((d) => buildDomainReading(d, culture, chart, aspects)),
    [culture, chart, aspects],
  );
  const [activeId, setActiveId] = useState<LifeDomain>(LIFE_DOMAINS[0]?.id ?? "body");
  const active = readings.find((r) => r.domain.id === activeId) ?? readings[0];

  if (!active) return null;

  return (
    <div>
      <div className="mb-6 md:mb-8">
        <h3 className="font-display text-ink-primary text-2xl md:text-3xl">
          Today by life domain
        </h3>
        <p className="text-ink-tertiary font-mono mt-2 text-[11px] uppercase tracking-[0.3em]">
          Which corner of your life the sky is most concerned with right now
        </p>
      </div>
      <div className="border-border-hairline mb-6 flex flex-wrap gap-x-6 gap-y-3 border-b pb-3">
        {readings.map((r) => (
          <button
            key={r.domain.id}
            type="button"
            onClick={() => setActiveId(r.domain.id)}
            className={cn(
              "font-mono text-[11px] uppercase tracking-[0.25em] transition-colors",
              activeId === r.domain.id
                ? "text-gold-leaf border-gold-soft border-b-2 pb-2"
                : "text-ink-secondary hover:text-ink-primary pb-2",
            )}
          >
            {r.domain.kicker}
          </button>
        ))}
      </div>
      <GlassPanel tone="solid" className="p-6 md:p-8">
        <div className="text-gold-leaf font-mono text-[10px] uppercase tracking-[0.3em]">
          ○ {active.domain.label}
        </div>
        <p className="text-ink-secondary font-body mt-2 text-sm italic md:text-base">
          {active.domain.description}
        </p>
        {active.directive ? (
          <>
            <h4 className="font-display text-gold-leaf mt-6 text-2xl leading-snug md:text-3xl">
              {active.directive.headline}
            </h4>
            <p className="text-ink-primary font-body mt-3 max-w-2xl text-base leading-relaxed md:text-lg">
              {active.directive.body}
            </p>
          </>
        ) : (
          <p className="text-ink-secondary font-body mt-6 text-base italic">
            Nothing in the sky is pressing on this corner of your life today. Quiet here is not neglect; it is room.
          </p>
        )}
        <div className="border-border-hairline mt-7 border-t pt-5">
          <div className="text-ink-tertiary font-mono text-[10px] uppercase tracking-[0.3em]">
            The sky behind it
          </div>
          <ul className="text-ink-primary font-body mt-3 flex flex-col gap-1.5 text-[15px] md:text-base">
            {active.placements.map((p) => (
              <li key={p.planet}>
                <span className="text-gold-leaf/80 font-display text-base md:text-lg">
                  {p.sentence}
                </span>
              </li>
            ))}
          </ul>
          {active.aspects.length > 0 ? (
            <ul className="text-ink-primary font-body mt-3 flex flex-col gap-1.5 text-[15px] md:text-base">
              {active.aspects.map((a, idx) => (
                <li key={`${a.aspect.a}-${a.aspect.b}-${idx}`}>
                  <span className="font-display text-ink-secondary text-base leading-snug">
                    {a.sentence}
                  </span>
                  <span className="text-ink-tertiary font-mono ml-2 text-[10px] uppercase tracking-[0.2em]">
                    {a.aspect.kind} · {PLANET_LABELS[a.aspect.a]} / {PLANET_LABELS[a.aspect.b]}
                  </span>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      </GlassPanel>
    </div>
  );
}
