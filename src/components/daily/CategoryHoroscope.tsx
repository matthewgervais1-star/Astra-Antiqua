"use client";

import { useMemo } from "react";
import {
  PLANETS,
  PLANET_LABELS,
  PLANET_SYMBOLS,
  type Culture,
  type Planet,
} from "@/data/cultures";
import { DEITY_MATRIX } from "@/data/deities";
import { longitudeToSign, computeAspects, type Longitude } from "@/data/sampleChart";
import { PLANET_DOMAINS, SIGN_REGISTERS } from "@/data/interpretations";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { DeityGlyph } from "@/components/glyphs/DeityGlyph";

interface CategoryHoroscopeProps {
  culture: Culture;
  chart: Readonly<Record<Planet, Longitude>>;
}

const PLACEMENT_VERBS: Readonly<Record<Culture, string>> = {
  egypt: "stands in",
  greece: "walks in",
  canaan: "takes the seat of",
  carthage: "raises the standard of",
};

const ASPECT_VERBS: Readonly<Record<Culture, Readonly<Record<string, string>>>> = {
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

const CATEGORY_HEADERS: Readonly<Record<Planet, { kicker: string; domain: string }>> = {
  sun: { kicker: "Will", domain: "What asks to be visible" },
  moon: { kicker: "Body", domain: "What asks to be felt" },
  mercury: { kicker: "Speech", domain: "What asks to be said" },
  venus: { kicker: "Pull", domain: "What you are drawn toward" },
  mars: { kicker: "Friction", domain: "What asks to be done" },
  jupiter: { kicker: "Blessing", domain: "What is allowed to grow" },
  saturn: { kicker: "Weight", domain: "What asks for endurance" },
};

export function CategoryHoroscope({ culture, chart }: CategoryHoroscopeProps) {
  const aspects = useMemo(() => computeAspects(chart), [chart]);
  const placementVerb = PLACEMENT_VERBS[culture];

  return (
    <div>
      <div className="mb-8">
        <h3 className="font-display text-ink-primary text-2xl md:text-3xl">
          The seven, by domain
        </h3>
        <p className="text-ink-tertiary font-mono mt-2 text-[11px] uppercase tracking-[0.3em]">
          What each planet is doing right now
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-2 md:gap-5">
        {PLANETS.map((planet) => {
          const deity = DEITY_MATRIX[culture][planet];
          const { sign, degree } = longitudeToSign(chart[planet]);
          const header = CATEGORY_HEADERS[planet];
          const planetAspects = aspects
            .filter((a) => a.a === planet || a.b === planet)
            .slice(0, 2);
          return (
            <GlassPanel
              key={planet}
              tone="solid"
              className="flex h-full flex-col gap-3 p-5 md:p-6"
            >
              <header className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="text-gold-leaf font-mono text-[10px] uppercase tracking-[0.3em]">
                    {PLANET_SYMBOLS[planet]} {PLANET_LABELS[planet]} · {header.kicker}
                  </div>
                  <h4 className="font-display text-ink-primary mt-2 text-xl md:text-2xl">
                    {deity.name}
                  </h4>
                  <div className="text-ink-secondary font-body text-xs italic md:text-sm">
                    {deity.epithet}
                  </div>
                </div>
                <DeityGlyph culture={culture} planet={planet} size={40} decorative />
              </header>
              <p className="text-ink-primary font-body mt-2 text-[15px] leading-relaxed md:text-base">
                {deity.name} {placementVerb} {SIGN_REGISTERS[sign]}, at {degree.toFixed(0)}° {sign}.
              </p>
              {planetAspects.length > 0 ? (
                <ul className="border-border-hairline mt-2 flex flex-col gap-2 border-t pt-3">
                  {planetAspects.map((aspect, idx) => {
                    const otherPlanet = aspect.a === planet ? aspect.b : aspect.a;
                    const otherDeity = DEITY_MATRIX[culture][otherPlanet];
                    const verb = ASPECT_VERBS[culture][aspect.kind] ?? "meets";
                    return (
                      <li
                        key={`${aspect.a}-${aspect.b}-${idx}`}
                        className="text-ink-secondary font-body text-[14px] leading-snug md:text-[15px]"
                      >
                        <span className="text-gold-leaf font-display text-base">
                          {deity.name} {verb} {otherDeity.name}.
                        </span>{" "}
                        <span className="text-ink-tertiary font-mono ml-1 text-[10px] uppercase tracking-[0.2em]">
                          {aspect.kind} · orb {aspect.orb.toFixed(1)}°
                        </span>
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <p className="text-ink-tertiary font-body mt-1 text-sm italic">
                  No tight aspects to other planets today.
                </p>
              )}
              <p className="text-ink-tertiary font-body mt-auto pt-3 text-xs leading-relaxed italic">
                {header.domain}. {PLANET_DOMAINS[planet]}
              </p>
            </GlassPanel>
          );
        })}
      </div>
    </div>
  );
}
