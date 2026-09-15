"use client";

import Link from "next/link";
import { motion } from "motion/react";
import {
  PLANETS,
  isReceived,
  type Culture,
} from "@/data/cultures";
import type { Reading } from "@/lib/reading";
import { formatOffset, type ResolvedBirth } from "@/lib/birthDateTime";
import { CULTURE_LABELS } from "@/data/cultures";
import { DEITY_MATRIX } from "@/data/deities";
import { PLANET_AREAS } from "@/data/planetAreas";
import { DeityGlyph } from "@/components/chrome/DeityGlyph";
import { SectionDivider } from "@/components/chrome/SectionDivider";
import { OrbBar, type OrbTone } from "@/components/chrome/OrbBar";
import { ReceptionNote } from "@/components/chrome/ReceptionNote";
import { usePrefersReducedMotion } from "@/lib/reducedMotion";
import { computeWholeSignHouses, houseOfSign } from "@/lib/houses";
import { houseReading } from "@/lib/houseReading";
import { getHouseMeaning } from "@/data/houses";
import { longitudeToSign, orbFor, type AspectKind } from "@/data/sampleChart";
import { cn } from "@/lib/classNames";

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
  /** The id of the saved chart this reading was cast from, if any. Placement
   *  rows link to /charts/{chartId}/{body} only once the chart is saved. */
  chartId: string | null;
}

const ASPECT_GROUPS = [
  {
    kinds: ["conjunction"] as const,
    title: "CONJUNCTIONS",
    description: "Bodies bound at the same point of the wheel; their forces double and amplify.",
    tone: "quiet" as OrbTone,
  },
  {
    kinds: ["trine", "sextile"] as const,
    title: "LINES THAT EASE",
    description: "Aspects of harmony, support, and flow between deities.",
    tone: "harmony" as OrbTone,
  },
  {
    kinds: ["square", "opposition"] as const,
    title: "LINES THAT CHALLENGE",
    description: "Aspects of tension, conflict, and forced choice between deities.",
    tone: "conflict" as OrbTone,
  },
] as const;

function toneForKind(kind: AspectKind): OrbTone {
  if (kind === "trine" || kind === "sextile") return "harmony";
  if (kind === "square" || kind === "opposition") return "conflict";
  return "quiet";
}

export function ReadingDisplay({
  culture,
  reading,
  birth,
  inputs,
  ascendant,
  midheaven,
  chartId,
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
  const anyReceived = reading.placements.some((p) => isReceived(p.planet));

  return (
    <motion.div
      initial={reduce ? false : { opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: reduce ? 0.01 : 0.55, ease: "easeOut" }}
      className="flex flex-col gap-14"
    >
      <header>
        <div className="font-mono text-data-xs uppercase tracking-microcopy text-dim">
          READING IN THE VOICE OF {CULTURE_LABELS[culture].toUpperCase()}
        </div>
        <h2 className="mt-3 font-display text-display-m tracking-display text-bone md:text-display-l">
          {inputs.cityLabel.toUpperCase()}
        </h2>
        <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 font-mono text-data-xs uppercase tracking-label text-dim">
          <span>{inputs.date} · {inputs.time}</span>
          <span>{birth.timezone} ({formatOffset(birth.offsetMinutes)})</span>
          <span>{inputs.latitude.toFixed(3)}°, {inputs.longitude.toFixed(3)}°</span>
        </div>
        <p className="mt-6 max-w-2xl font-body text-prose-m leading-prose text-prose">
          {reading.summary}
        </p>
      </header>

      <section className="flex flex-col gap-6">
        <SectionDivider label="WHERE THE TEN STAND" />
        <ul className="flex flex-col">
          {reading.placements.map((p) => {
            const received = isReceived(p.planet);
            const header = (
              <div className="flex flex-wrap items-center justify-between gap-3">
                <span
                  className={cn(
                    "inline-flex items-center gap-[var(--space-1)] font-mono text-data-s uppercase tracking-data",
                    received ? "text-accent" : "text-bone",
                  )}
                >
                  <DeityGlyph body={p.planet} culture={culture} size={16} />
                  {p.deityName.toUpperCase()}
                  <span className="ml-2 font-body text-prose-s normal-case italic text-dim">
                    {p.deityEpithet}
                  </span>
                </span>
                <span className="shrink-0 font-mono text-data-xs text-dim">
                  {p.degreeInSign.toFixed(1)}° {p.sign}
                </span>
              </div>
            );
            return (
              <li key={p.planet} className="border-t border-rule-row py-5 first:border-t-0">
                {chartId ? (
                  <Link
                    href={`/charts/${chartId}/${p.planet}`}
                    className="block hover:opacity-80"
                  >
                    {header}
                  </Link>
                ) : (
                  header
                )}
                <p className="mt-3 font-body text-prose-s leading-prose text-prose">
                  {p.culturalLine}
                </p>
                <p className="mt-2 font-body text-prose-s leading-prose text-prose">
                  {p.signReading}
                </p>
                <p className="mt-2 font-body text-prose-s italic leading-prose text-dim">
                  {p.domain}
                </p>
              </li>
            );
          })}
        </ul>
        {anyReceived ? <ReceptionNote intro={`${CULTURE_LABELS[culture].toUpperCase()} RECEIVES THREE MODERN BODIES AMONG THE TEN ABOVE.`} /> : null}
      </section>

      <section className="flex flex-col gap-6">
        <SectionDivider label="WHAT EACH OF THE TEN GOVERNS" />
        <p className="font-mono text-data-xs uppercase tracking-label text-dim">
          The life area each body rules, in the names of {CULTURE_LABELS[culture]}
        </p>
        <div className="grid gap-x-8 gap-y-6 sm:grid-cols-2">
          {PLANETS.map((planet) => {
            const area = PLANET_AREAS[planet];
            const deity = DEITY_MATRIX[culture][planet];
            const received = isReceived(planet);
            return (
              <div key={planet} className="border-t border-rule-row pt-4">
                <div
                  className={cn(
                    "flex items-center gap-[var(--space-1)] font-mono text-data-xs uppercase tracking-label",
                    received ? "text-accent" : "text-bone",
                  )}
                >
                  <DeityGlyph body={planet} culture={culture} size={16} />
                  {deity.name.toUpperCase()} · {area.area.toUpperCase()}
                </div>
                <p className="mt-2 font-body text-prose-s leading-prose text-prose">{area.blurb}</p>
              </div>
            );
          })}
        </div>
      </section>

      <section className="flex flex-col gap-6">
        <SectionDivider label="THE TWELVE HOUSES" />
        <p className="font-mono text-data-xs uppercase tracking-label text-dim">
          Whole-sign houses · Rising in {ascendantSign} · Midheaven in {midheavenSign}
        </p>
        <p className="max-w-2xl font-body text-prose-s leading-prose text-prose">
          The sign rising at the hour of your birth becomes the First House; each sign after it takes the next house in order. Because the houses are anchored to the Ascendant, they depend on an accurate birth time.
        </p>
        <div className="grid gap-x-8 gap-y-6 md:grid-cols-2">
          {housesWithOccupants.map((h) => (
            <div key={h.house} className="border-t border-rule-row pt-4">
              <div className="flex items-baseline justify-between gap-3">
                <div className="font-display text-[16px] tracking-[0.04em] text-bone">
                  {h.meaning.ordinal.toUpperCase()} HOUSE
                  <span className="ml-2 font-body text-prose-s italic text-prose">
                    {h.meaning.title}
                  </span>
                </div>
                <div className="shrink-0 font-mono text-data-xs uppercase tracking-label text-dim">
                  {h.sign}
                  {h.house === 1 ? " · rising" : ""}
                </div>
              </div>
              {h.occupants.length > 0 ? (
                <ul className="mt-3 flex flex-col gap-2">
                  {h.occupants.map((p) => (
                    <li key={p.planet} className="flex items-start gap-2 font-body text-prose-s leading-prose text-prose">
                      {/* The prose line box is 14px at leading 1.6, 22.4px tall; a 3px top offset centres the 16px glyph on its first line. */}
                      <span
                        className={cn(
                          "mt-[3px] flex font-mono text-data-s",
                          isReceived(p.planet) ? "text-accent" : "text-bone",
                        )}
                      >
                        <DeityGlyph body={p.planet} culture={culture} size={16} />
                      </span>
                      <span>{houseReading(culture, p.planet, h.house)}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-3 font-body text-prose-s leading-prose text-dim">
                  {h.meaning.domain}
                </p>
              )}
            </div>
          ))}
        </div>
      </section>

      <section className="flex flex-col gap-6">
        <SectionDivider label="HOW THE TEN SPEAK TO ONE ANOTHER" />
        <p className="font-mono text-data-xs uppercase tracking-label text-dim">
          Major aspects, by kind
        </p>
        <div className="grid gap-8 md:grid-cols-3">
          {ASPECT_GROUPS.map((group) => {
            const items = reading.aspects.filter((a) =>
              (group.kinds as readonly string[]).includes(a.kind),
            );
            return (
              <div key={group.title} className="flex flex-col gap-3">
                <div>
                  <div className="font-mono text-data-xs uppercase tracking-microcopy text-dim">
                    {items.length} FOUND
                  </div>
                  <h4 className="mt-2 font-display text-[16px] tracking-[0.06em] text-bone">
                    {group.title}
                  </h4>
                  <p className="mt-1 font-body text-prose-s leading-prose text-dim">
                    {group.description}
                  </p>
                </div>
                {items.length === 0 ? (
                  <p className="font-mono text-data-xs uppercase tracking-label text-dim">
                    NONE AT THE STANDARD ORBS.
                  </p>
                ) : (
                  <ul className="flex flex-col gap-5">
                    {items.map((a, idx) => (
                      <li key={`${a.a}-${a.b}-${idx}`} className="border-t border-rule-row pt-4">
                        <div className="font-mono text-data-xs uppercase tracking-label text-dim">
                          {a.kind} · {a.exactAngle.toFixed(1)}° (orb {a.orb.toFixed(1)}°)
                        </div>
                        <div className="mt-2">
                          <OrbBar orb={a.orb} maxOrb={orbFor(a.kind)} tone={toneForKind(a.kind)} />
                        </div>
                        <p className="mt-3 font-display text-[17px] leading-[1.4] text-bone">
                          {a.verbLine}
                        </p>
                        <p className="mt-2 font-body text-prose-s italic leading-prose text-prose">
                          {a.pairTheme}
                        </p>
                        <p className="mt-2 font-body text-prose-s leading-prose text-prose">
                          {a.culturalReflection}
                        </p>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            );
          })}
        </div>
      </section>

      <footer className="border-t border-rule pt-8">
        <p className="font-body text-prose-s leading-prose text-dim">
          Computed locally in your browser from your birth time and coordinates, using the astronomy-engine ephemeris (cosinekitty/astronomy). No birth data is sent to a server.
        </p>
      </footer>
    </motion.div>
  );
}
