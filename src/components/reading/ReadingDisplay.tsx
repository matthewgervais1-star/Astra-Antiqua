"use client";

import { motion } from "motion/react";
import type { Culture } from "@/data/cultures";
import { PLANET_LABELS, PLANET_SYMBOLS } from "@/data/cultures";
import type { Reading } from "@/lib/reading";
import { formatOffset, type ResolvedBirth } from "@/lib/birthDateTime";
import { CULTURE_LABELS } from "@/data/cultures";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { DeityGlyph } from "@/components/glyphs/DeityGlyph";
import { PrintButton } from "@/components/ui/PrintButton";
import { usePrefersReducedMotion } from "@/lib/reducedMotion";
import { computeWholeSignHouses, houseOfSign } from "@/lib/houses";
import { houseReading } from "@/lib/houseReading";
import { getHouseMeaning } from "@/data/houses";
import { longitudeToSign } from "@/data/sampleChart";
import { LifeAreaLegend } from "@/components/LifeAreaLegend";

interface ReadingDisplayProps {
  culture: Culture;
  reading: Reading;
  birth: ResolvedBirth;
  inputs: {
    date: string;
    time: string;
    cityLabel: string;
    latitude: number;
    longitude: number;
  };
  ascendant: number;
  midheaven: number;
}

const ASPECT_GROUPS = [
  {
    kinds: ["conjunction"] as const,
    title: "Conjunctions",
    description: "Bodies bound at the same point of the wheel; their forces double and amplify.",
  },
  {
    kinds: ["trine", "sextile"] as const,
    title: "Lines that ease",
    description: "Aspects of harmony, support, and flow between deities.",
  },
  {
    kinds: ["square", "opposition"] as const,
    title: "Lines that challenge",
    description: "Aspects of tension, conflict, and forced choice between deities.",
  },
] as const;

export function ReadingDisplay({
  culture,
  reading,
  birth,
  inputs,
  ascendant,
  midheaven,
}: ReadingDisplayProps) {
  const reduce = usePrefersReducedMotion();

  const { ascendantSign, ascendantSignIndex, houses } =
    computeWholeSignHouses(ascendant);
  const midheavenSign = longitudeToSign(midheaven).sign;
  const housesWithOccupants = houses.map((h) => ({
    house: h.house,
    sign: h.sign,
    meaning: getHouseMeaning(h.house),
    occupants: reading.placements.filter(
      (p) => houseOfSign(p.sign, ascendantSignIndex) === h.house,
    ),
  }));

  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: reduce ? 0.01 : 0.55, ease: "easeOut" }}
      className="flex flex-col gap-12 md:gap-16"
    >
      <header>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="text-gold-leaf font-mono text-[10px] uppercase tracking-[0.3em]">
              Reading in the voice of {CULTURE_LABELS[culture]}
            </div>
            <h2 className="font-display text-ink-primary mt-3 text-3xl md:text-5xl">
              {inputs.cityLabel}
            </h2>
          </div>
          <PrintButton label="Save as PDF" />
        </div>
        <div className="text-ink-secondary font-mono mt-3 flex flex-wrap gap-x-4 gap-y-1 text-[11px] uppercase tracking-[0.25em]">
          <span>{inputs.date} · {inputs.time}</span>
          <span>{birth.timezone} ({formatOffset(birth.offsetMinutes)})</span>
          <span>{inputs.latitude.toFixed(3)}°, {inputs.longitude.toFixed(3)}°</span>
        </div>
        <p className="text-ink-primary font-body mt-6 max-w-3xl text-lg leading-relaxed md:text-xl">
          {reading.summary}
        </p>
      </header>

      <section>
        <div className="mb-8">
          <h3 className="font-display text-ink-primary text-2xl md:text-3xl">
            Where the seven stand
          </h3>
          <p className="text-ink-tertiary font-mono mt-2 text-[11px] uppercase tracking-[0.3em]">
            Planetary placements in the names of {CULTURE_LABELS[culture]}
          </p>
        </div>
        <ul className="flex flex-col gap-3">
          {reading.placements.map((p) => (
            <li key={p.planet}>
              <GlassPanel tone="solid" className="p-5 md:p-6">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-[72px_1fr_180px] md:items-start">
                  <div className="flex items-center gap-3 md:flex-col md:items-start md:gap-1">
                    <DeityGlyph culture={culture} planet={p.planet} size={48} decorative />
                    <div className="text-ink-tertiary font-mono text-[10px] uppercase tracking-[0.25em] md:hidden">
                      {PLANET_SYMBOLS[p.planet]} {PLANET_LABELS[p.planet]}
                    </div>
                  </div>
                  <div>
                    <div className="flex flex-wrap items-baseline gap-3">
                      <h4 className="font-display text-gold-leaf text-2xl">
                        {p.deityName}
                      </h4>
                      <span className="text-ink-secondary font-body text-base italic">
                        {p.deityEpithet}
                      </span>
                    </div>
                    <p className="text-ink-primary font-body mt-2 text-base leading-relaxed md:text-[17px]">
                      {p.culturalLine}
                    </p>
                    <p className="text-ink-primary font-body mt-3 text-[15px] leading-relaxed md:text-base">
                      {p.signReading}
                    </p>
                    <p className="text-ink-tertiary font-body mt-2 text-sm leading-relaxed italic">
                      {p.domain}
                    </p>
                  </div>
                  <div className="text-ink-tertiary font-mono text-[11px] uppercase tracking-[0.2em] md:text-right">
                    <div className="text-ink-secondary text-lg normal-case">
                      {PLANET_SYMBOLS[p.planet]} {PLANET_LABELS[p.planet]}
                    </div>
                    <div className="mt-1">{p.degreeInSign.toFixed(1)}° {p.sign}</div>
                  </div>
                </div>
              </GlassPanel>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <div className="mb-8">
          <h3 className="font-display text-ink-primary text-2xl md:text-3xl">
            What each of the seven governs
          </h3>
          <p className="text-ink-tertiary font-mono mt-2 text-[11px] uppercase tracking-[0.3em]">
            The life area each planet rules, in the names of {CULTURE_LABELS[culture]}
          </p>
        </div>
        <LifeAreaLegend culture={culture} />
      </section>

      <section>
        <div className="mb-8">
          <h3 className="font-display text-ink-primary text-2xl md:text-3xl">
            The twelve houses
          </h3>
          <p className="text-ink-tertiary font-mono mt-2 text-[11px] uppercase tracking-[0.3em]">
            Whole-sign houses · Rising in {ascendantSign} · Midheaven in {midheavenSign}
          </p>
          <p className="text-ink-tertiary font-body mt-3 max-w-2xl text-sm leading-relaxed">
            The sign rising at the hour of your birth becomes the First House; each sign after it takes the next house in order. Because the houses are anchored to the Ascendant, they depend on an accurate birth time.
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {housesWithOccupants.map((h) => (
            <GlassPanel key={h.house} tone="solid" className="p-5">
              <div className="flex items-baseline justify-between gap-3">
                <div className="font-display text-gold-leaf text-lg">
                  {h.meaning.ordinal} House
                  <span className="text-ink-secondary font-body ml-2 text-base italic">
                    {h.meaning.title}
                  </span>
                </div>
                <div className="text-ink-tertiary font-mono shrink-0 text-[10px] uppercase tracking-[0.2em]">
                  {h.sign}
                  {h.house === 1 ? " · rising" : ""}
                </div>
              </div>
              {h.occupants.length > 0 ? (
                <ul className="mt-3 flex flex-col gap-3">
                  {h.occupants.map((p) => (
                    <li key={p.planet} className="flex items-start gap-3">
                      <DeityGlyph
                        culture={culture}
                        planet={p.planet}
                        size={28}
                        decorative
                        className="mt-0.5 shrink-0"
                      />
                      <p className="text-ink-primary font-body text-sm leading-relaxed">
                        {houseReading(culture, p.planet, h.house)}
                      </p>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-ink-tertiary font-body mt-3 text-sm leading-relaxed">
                  {h.meaning.domain}
                </p>
              )}
            </GlassPanel>
          ))}
        </div>
      </section>

      <section>
        <div className="mb-8">
          <h3 className="font-display text-ink-primary text-2xl md:text-3xl">
            How the seven speak to one another
          </h3>
          <p className="text-ink-tertiary font-mono mt-2 text-[11px] uppercase tracking-[0.3em]">
            Major aspects, by kind
          </p>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {ASPECT_GROUPS.map((group) => {
            const items = reading.aspects.filter((a) =>
              (group.kinds as readonly string[]).includes(a.kind),
            );
            return (
              <GlassPanel
                key={group.title}
                tone="solid"
                className="flex flex-col gap-3 p-5 md:p-6"
              >
                <div>
                  <div className="text-gold-leaf font-mono text-[10px] uppercase tracking-[0.3em]">
                    {items.length} found
                  </div>
                  <h4 className="font-display text-ink-primary mt-2 text-xl md:text-2xl">
                    {group.title}
                  </h4>
                  <p className="text-ink-tertiary font-body mt-1 text-sm leading-relaxed">
                    {group.description}
                  </p>
                </div>
                {items.length === 0 ? (
                  <p className="text-ink-tertiary font-mono mt-2 text-[11px] uppercase tracking-[0.2em]">
                    None at the standard orbs.
                  </p>
                ) : (
                  <ul className="mt-2 flex flex-col gap-5">
                    {items.map((a, idx) => (
                      <li key={`${a.a}-${a.b}-${idx}`} className="border-border-hairline border-t pt-4">
                        <div className="text-ink-tertiary font-mono text-[10px] uppercase tracking-[0.25em]">
                          {a.kind} · {a.exactAngle.toFixed(1)}° (orb {a.orb.toFixed(1)}°)
                        </div>
                        <p className="font-display text-gold-leaf mt-2 text-lg leading-snug md:text-xl">
                          {a.verbLine}
                        </p>
                        <p className="text-ink-secondary font-body mt-2 text-sm italic leading-relaxed md:text-base">
                          {a.pairTheme}
                        </p>
                        <p className="text-ink-primary font-body mt-2 text-sm leading-relaxed md:text-[15px]">
                          {a.culturalReflection}
                        </p>
                      </li>
                    ))}
                  </ul>
                )}
              </GlassPanel>
            );
          })}
        </div>
      </section>

      <footer className="border-border-hairline border-t pt-8">
        <p className="text-ink-tertiary font-body text-sm md:text-base">
          Computed locally in your browser from your birth time and coordinates, using a Meeus-derived geocentric ephemeris (sub-arcminute precision for inner planets, arcminute precision for the outer classical planets). No birth data is sent to a server.
        </p>
      </footer>
    </motion.div>
  );
}
