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
  type AspectKind,
  type Longitude,
} from "@/data/sampleChart";
import { LIFE_DOMAINS, type LifeDomain } from "@/data/lifeDomains";
import { SIGN_REGISTERS } from "@/data/interpretations";
import {
  TRANSIT_PRINCIPLE,
  lifeDomainMeaning,
} from "@/lib/personalReading";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { cn } from "@/lib/classNames";

interface LifeDomainHoroscopeProps {
  culture: Culture;
  chart: Readonly<Record<Planet, Longitude>>;
}

const ASPECT_VERBS: Readonly<Record<Culture, Readonly<Record<AspectKind, string>>>> = {
  egypt: {
    conjunction: "joins the barque of",
    sextile: "extends a steady hand to",
    square: "weighs against the heart of",
    trine: "lifts the gaze of",
    opposition: "faces across the river from",
  },
  greece: {
    conjunction: "stands shoulder to shoulder with",
    sextile: "offers fair counsel to",
    square: "challenges",
    trine: "harmonizes with",
    opposition: "stands across the agora from",
  },
  canaan: {
    conjunction: "shares the throne of the council with",
    sextile: "exchanges tribute with",
    square: "draws the bow against",
    trine: "speaks favor over",
    opposition: "convenes the council against",
  },
  carthage: {
    conjunction: "raises the standard alongside",
    sextile: "trades safe passage with",
    square: "raises the hand against",
    trine: "lights the fire alongside",
    opposition: "demands a price of",
  },
};

/**
 * Where each domain's reading is "happening" in the reader's life. Used as
 * the trailing phrase in the computed domain directive.
 */
const DOMAIN_PHRASE: Readonly<Record<LifeDomain, string>> = {
  body: "in your body",
  love: "between you and what you want",
  friends: "in the room you share with other people",
  work: "in the work you are sustaining",
  family: "in the house you keep",
};

interface DomainReading {
  domain: (typeof LIFE_DOMAINS)[number];
  placements: { planet: Planet; sentence: string }[];
  aspects: { aspect: Aspect; sentence: string }[];
  directive: string | null;
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
  const directive = tightest
    ? lifeDomainMeaning(
        tightest.kind,
        TRANSIT_PRINCIPLE[tightest.a],
        TRANSIT_PRINCIPLE[tightest.b],
        DOMAIN_PHRASE[domain.id],
      )
    : null;

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
        <ul className="text-ink-primary font-body mt-6 flex flex-col gap-2 text-[15px] md:text-base">
          {active.placements.map((p) => (
            <li key={p.planet}>
              <span className="text-gold-leaf font-display text-lg md:text-xl">
                {p.sentence}
              </span>
            </li>
          ))}
        </ul>
        {active.aspects.length > 0 ? (
          <ul className="text-ink-primary font-body border-border-hairline mt-4 flex flex-col gap-2 border-t pt-4 text-[15px] md:text-base">
            {active.aspects.map((a, idx) => (
              <li key={`${a.aspect.a}-${a.aspect.b}-${idx}`}>
                <span className="font-display text-ink-primary text-lg leading-snug">
                  {a.sentence}
                </span>
                <span className="text-ink-tertiary font-mono ml-2 text-[10px] uppercase tracking-[0.2em]">
                  {a.aspect.kind} · {PLANET_LABELS[a.aspect.a]} / {PLANET_LABELS[a.aspect.b]}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-ink-tertiary font-body mt-4 text-sm italic">
            No tight aspects touching this domain today.
          </p>
        )}
        {active.directive ? (
          <p className="text-ink-primary font-body border-border-hairline mt-6 border-t pt-5 text-base leading-relaxed md:text-lg">
            {active.directive}
          </p>
        ) : null}
      </GlassPanel>
    </div>
  );
}
