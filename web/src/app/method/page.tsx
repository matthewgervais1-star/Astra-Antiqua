import type { Metadata } from "next";
import { NaveShell } from "@/components/chrome/NaveShell";
import { NaveHead } from "@/components/chrome/NaveHead";
import { SectionDivider } from "@/components/chrome/SectionDivider";
import { ASPECT_RULES, type AspectKind } from "@/data/sampleChart";
import { CULTURES, CULTURE_LABELS, RECEIVED_BODIES, PLANET_LABELS } from "@/data/cultures";
import { DEITY_MATRIX } from "@/data/deities";
import { SPAN_ORB } from "@/lib/transitSpans";

const CONTEXT = "HOW THE SKY IS COMPUTED";

export const metadata: Metadata = {
  title: "The Method",
  description:
    "How Astra Antiqua computes the sky: the astronomy-engine ephemeris, whole-sign houses, documented orbs, the five cultural voices, and the three received bodies.",
};

/** Display order and glyphs for the orb table. The degree values themselves
 * come from ASPECT_RULES, never hardcoded here. */
const ORB_DISPLAY_ORDER: readonly AspectKind[] = [
  "conjunction",
  "opposition",
  "square",
  "trine",
  "sextile",
];

const ORB_GLYPHS: Readonly<Record<AspectKind, string>> = {
  conjunction: "☌",
  opposition: "☍",
  square: "□",
  trine: "△",
  sextile: "⚹",
};

const PROSE_CLASS = "font-body text-prose-s leading-prose text-prose";

export default function MethodPage() {
  return (
    <NaveShell context={CONTEXT}>
      <NaveHead kicker={CONTEXT}>THE METHOD</NaveHead>

      <div className="mx-auto flex max-w-[560px] flex-col gap-11">
        <section className="flex flex-col gap-5">
          <SectionDivider label="THE EPHEMERIS" />
          <p className={PROSE_CLASS}>
            Positions come from the astronomy-engine ephemeris, the cosinekitty/astronomy library.
            They are geocentric ecliptic longitudes, computed for your place and hour. Nothing is
            estimated. Nothing is randomized.
          </p>
        </section>

        <section className="flex flex-col gap-5">
          <SectionDivider label="HOUSES" />
          <p className={PROSE_CLASS}>
            Whole-sign houses, the oldest system on record. Your rising sign is your first house.
            Every house is exactly one sign.
          </p>
        </section>

        <section className="flex flex-col gap-5">
          <SectionDivider label="ORBS" />
          <p className={PROSE_CLASS}>
            An aspect counts only inside these distances. When nothing is in orb, we say the day is
            quiet. We do not invent weather. A long transit is active while the body holds within{" "}
            {SPAN_ORB}° of exact.
          </p>
          <div className="flex flex-wrap items-center gap-x-[var(--space-3)] gap-y-2 border border-rule px-[var(--space-2)] py-[var(--space-2)] font-mono text-data-xs text-dim">
            {ORB_DISPLAY_ORDER.map((kind) => {
              const rule = ASPECT_RULES.find((r) => r.kind === kind);
              if (!rule) return null;
              return (
                <span key={kind}>
                  {ORB_GLYPHS[kind]} {rule.orb}°
                </span>
              );
            })}
            <span className="ml-auto tracking-label">TIGHTER = LOUDER</span>
          </div>
        </section>

        <section className="flex flex-col gap-5">
          <SectionDivider label="THE FIVE CULTURES" />
          <p className={PROSE_CLASS}>
            Every culture reads the same computed sky. A placement keeps its core meaning
            everywhere. What changes is the theology it must pass through, and that change is real:
            Egypt weighs, Greece questions, Canaan convenes, Carthage audits, Rome rules.
          </p>
        </section>

        <section className="flex flex-col gap-5">
          <SectionDivider label="THE THREE RECEIVED BODIES" />
          <p className={PROSE_CLASS}>
            No ancient culture knew Uranus, Neptune, or Pluto. We admit them the way Rome admitted
            foreign gods: formally, and under native names. The receptions are modern work, made in
            the ancient manner. This page will always say so.
          </p>
          <div className="overflow-x-auto border border-rule">
            <table className="w-full min-w-[480px] border-collapse font-mono text-data-xs">
              <thead>
                <tr>
                  <th scope="col" className="border-b border-r border-rule px-3 py-2 text-left text-dim">
                    <span className="sr-only">Body</span>
                  </th>
                  {CULTURES.map((culture) => (
                    <th
                      key={culture}
                      scope="col"
                      className="border-b border-r border-rule px-3 py-2 text-left tracking-data text-dim last:border-r-0"
                    >
                      {CULTURE_LABELS[culture].toUpperCase()}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {RECEIVED_BODIES.map((planet) => (
                  <tr key={planet}>
                    <th
                      scope="row"
                      className="border-r border-rule px-3 py-2 text-left tracking-data text-accent"
                    >
                      {PLANET_LABELS[planet].toUpperCase()}
                    </th>
                    {CULTURES.map((culture) => (
                      <td key={culture} className="border-r border-rule px-3 py-2 text-left text-bone last:border-r-0">
                        {DEITY_MATRIX[culture][planet].name}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="flex flex-col gap-5">
          <SectionDivider label="YOUR DATA" />
          <p className={PROSE_CLASS}>
            Everything works without an account. Your culture, charts, and feedback live on this
            device. An account adds sync and nothing else. Striking the account deletes the server
            copy.
          </p>
        </section>
      </div>
    </NaveShell>
  );
}
