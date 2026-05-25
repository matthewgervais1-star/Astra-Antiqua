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
    conjunction:
      "Two appetites you have been pretending are separate are the same hunger today. You know which.",
    sextile:
      "Your body has an opening today and is not asking you to justify taking it.",
    square:
      "Your body is asking for something the schedule will not grant. You can feel the bargain coming.",
    trine:
      "Your instincts are accurate today. You do not have to talk yourself out of them.",
    opposition:
      "The body wants one thing and the day demands the other. You already know which call you are going to take.",
  },
  love: {
    conjunction:
      "What you want and the work to get it are pointing at the same person today. You know who.",
    sextile:
      "A small clear yes is on offer for you today, and the small ones are the ones you usually miss.",
    square:
      "What you want and what they want do not match today. You knew this last week.",
    trine:
      "The other turned warm without you having to do anything. You do not have to ask why.",
    opposition:
      "Pursuit and being pursued are changing hands today. You can let it happen and see what you actually want.",
  },
  friends: {
    conjunction:
      "The thing the group has been circling is the thing you are about to say. You can feel it gathering.",
    sextile:
      "A useful introduction or an easy crossing is on the way. You will know it when you see it.",
    square:
      "A misreading is brewing in the thread. You can feel the shape of it before the message lands.",
    trine:
      "You are the bridge in the conversation today. The group has been waiting on you without knowing it.",
    opposition:
      "Two friends are asking opposite things of you today. You already know which one to honor first.",
  },
  work: {
    conjunction:
      "Effort and structure are pulling in the same direction today. The thing you have been putting off is the thing that will move.",
    sextile:
      "The unglamorous task is available to you right now, and you have more energy for it than you think.",
    square:
      "There is a wall in the work and you can feel its exact shape today. You know whether you are pushing through it or sitting beside it.",
    trine:
      "The structure is carrying you today. You can stop checking whether it will hold.",
    opposition:
      "The deadline and the standard cannot both be met this time. You already know which one you are going to defend.",
  },
  family: {
    conjunction:
      "Body and structure speak with one voice in your house today. What you build will hold.",
    sextile:
      "The call you have been avoiding is the one that will land softly today, if you make it.",
    square:
      "The family room and the work room are pushing against each other today. You know which door needs to close for the hour.",
    trine:
      "The shelter is holding today without effort. You can stop testing whether it will.",
    opposition:
      "Two generations are wanting opposite things from you. You are not the translator today, and you can stop trying to be.",
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
