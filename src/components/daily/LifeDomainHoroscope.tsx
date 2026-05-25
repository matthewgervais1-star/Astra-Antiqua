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

const DIRECTIVE_BY_KIND: Readonly<Record<LifeDomain, Readonly<Record<AspectKind, string>>>> = {
  body: {
    conjunction: "Two appetites speak with one voice; trust the doubled signal.",
    sextile: "An opening for rest or movement; take it without explaining.",
    square: "The body asks for something the schedule will not grant; negotiate.",
    trine: "Sleep, eat, and move on instinct today; the body is right.",
    opposition: "The body's want and the day's demand pull apart; choose the body for one hour.",
  },
  love: {
    conjunction: "Desire and effort align; the move you have been delaying will land.",
    sextile: "A small clear yes is on offer; accept without ceremony.",
    square: "What you want and what they want do not match; say it plainly.",
    trine: "Easy attraction today; do not over-think why the other turned warm.",
    opposition: "Pursuit and being pursued switch hands; let them.",
  },
  friends: {
    conjunction: "The message and the meaning lock; say the thing the group has been circling.",
    sextile: "A useful introduction or an easy crossing; take the call.",
    square: "A misreading is brewing; pick up the phone before the email lands wrong.",
    trine: "Conversation flows where the group has been stuck; you are the bridge today.",
    opposition: "Two friends ask opposite things of you; do not split the difference.",
  },
  work: {
    conjunction: "Effort and structure pull together; the next stretch of the project will hold.",
    sextile: "A favorable hour for the unglamorous task; do it now while you have the slack.",
    square: "A wall in the work; push once with all your weight, or sit down beside it.",
    trine: "Sustained progress without strain; the structure carries you today.",
    opposition: "The deadline and the standard cannot both be met; pick which one you defend.",
  },
  family: {
    conjunction: "Body and structure speak with one voice; what you build today will be a shelter.",
    sextile: "An easy opening to make the call you have been avoiding; take it.",
    square: "The family room and the work room push against each other; close one door for the hour.",
    trine: "The shelter holds without effort today; do not test it on principle.",
    opposition: "Two generations want opposite things; do not pretend to translate.",
  },
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
  const directive = tightest ? DIRECTIVE_BY_KIND[domain.id][tightest.kind] : null;

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
