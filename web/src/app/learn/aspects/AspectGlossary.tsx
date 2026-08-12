"use client";

import { useActivePantheon } from "@/components/pantheon/PantheonContext";
import { CULTURE_LABELS } from "@/data/cultures";
import { ASPECT_RULINGS } from "@/data/aspectRulings";
import { ASPECT_RULES, type AspectKind } from "@/data/sampleChart";
import { NaveHead } from "@/components/chrome/NaveHead";

const ASPECT_GLYPHS: Readonly<Record<AspectKind, string>> = {
  conjunction: "☌",
  sextile: "⚹",
  square: "□",
  trine: "△",
  opposition: "☍",
};

/** One universal sentence on the pure geometry, culture-neutral, kept from
 *  the page this glossary replaces. */
const GEOMETRY: Readonly<Record<AspectKind, string>> = {
  conjunction: "Same point in the sky; the two forces fuse and read as one.",
  sextile: "Sixty degrees apart, a third of a square; an opening, not a guarantee.",
  square: "Ninety degrees apart, a right angle; friction, and a forced choice.",
  trine: "A hundred twenty degrees, a third of the circle; the easiest geometry there is.",
  opposition: "A hundred eighty degrees, the two ends of one line; a mirror, not an enemy.",
};

/**
 * The culture-dependent body of the aspects glossary: the five fixed angles,
 * ruled in whichever voice is active. Reads useActivePantheon directly (the
 * same hook CultureGate uses), so it only ever mounts once a culture exists.
 */
export function AspectGlossary() {
  const culture = useActivePantheon();
  if (!culture) return null;
  const label = CULTURE_LABELS[culture].toUpperCase();
  const rulings = ASPECT_RULINGS[culture];

  return (
    <>
      <NaveHead kicker={`LEARN · THE ASPECTS, AS ${label} RULES THEM`}>THE ASPECTS</NaveHead>

      <div className="flex flex-col">
        {ASPECT_RULES.map((rule) => (
          <div
            key={rule.kind}
            className="grid grid-cols-[64px_1fr] gap-x-5 gap-y-2 border-t border-rule-row py-5 last:border-b sm:grid-cols-[92px_1fr]"
          >
            <div className="font-mono text-[15px] leading-[1.3] text-dim">
              <div className="text-[22px] leading-none">{ASPECT_GLYPHS[rule.kind]}</div>
              <div className="mt-1">{rule.angle}°</div>
            </div>
            <div>
              <div className="font-display text-[14px] tracking-[0.1em] text-bone">
                {rule.kind.toUpperCase()}
              </div>
              <p className="mt-2 font-body text-[15px] leading-[1.65] text-prose">
                {rulings[rule.kind]}
              </p>
              <p className="mt-2 font-mono text-[11px] leading-[1.6] tracking-[0.02em] text-faint-ink">
                {GEOMETRY[rule.kind]}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 font-mono text-[11px] leading-[1.7] tracking-[0.04em] text-dim">
        SAME ANGLES EVERYWHERE · EACH CULTURE SUPPLIES ITS OWN RULINGS · ORBS ON THE METHOD PAGE
      </div>
    </>
  );
}
