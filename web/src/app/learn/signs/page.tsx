import type { Metadata } from "next";
import Link from "next/link";
import { ZODIAC_SIGN_INFO } from "@/data/zodiacSigns";
import { NaveShell } from "@/components/chrome/NaveShell";
import { NaveHead } from "@/components/chrome/NaveHead";
import { LearnTOC } from "@/components/LearnTOC";

export const metadata: Metadata = {
  title: "Zodiac Sun Signs",
  description:
    "The twelve zodiac sun signs with their date ranges, elements, and traits. Your sun sign is the sign the Sun stood in at your birth, in the tropical zodiac.",
};

export default function ZodiacSignsPage() {
  return (
    <NaveShell context="LEARN · SUN SIGNS" active="learn">
      <NaveHead kicker="LEARN · 2 OF 7">ZODIAC SUN SIGNS</NaveHead>

      <p className="mx-auto max-w-[560px] text-center font-body text-[17px] leading-[1.75] text-prose">
        The part of astrology almost everyone already knows. When you say &ldquo;I am a
        Leo,&rdquo; you mean the Sun stood in Leo at the hour of your birth. Because the Earth
        circles the Sun once a year, the Sun walks through all twelve signs in the same order
        every year, so the dates barely move. Astra Antiqua uses the tropical zodiac, anchored to
        the seasons rather than to the slowly drifting constellations.
      </p>

      <div className="mt-14 flex flex-col">
        {ZODIAC_SIGN_INFO.map((s) => (
          <div key={s.sign} className="border-t border-rule-row py-5 last:border-b">
            <div className="flex flex-wrap items-baseline justify-between gap-3">
              <div className="font-display text-[18px] tracking-[0.05em] text-bone">
                <span className="mr-2 font-mono text-[14px] text-dim">{s.symbol}</span>
                {s.sign.toUpperCase()}
              </div>
              <div className="font-mono text-[11px] tracking-[0.14em] text-dim">
                {s.dates.toUpperCase()}
              </div>
            </div>
            <div className="mt-1 font-mono text-[11px] tracking-[0.14em] text-faint-ink">
              {s.element.toUpperCase()} · {s.modality.toUpperCase()}
            </div>
            <div className="mt-3 font-body text-[15px] italic text-prose">{s.traits}</div>
            <p className="mt-1 font-body text-[15px] leading-[1.7] text-bone">{s.blurb}</p>
          </div>
        ))}
      </div>

      <div className="mt-14 flex flex-wrap items-center justify-between gap-4 border-t border-rule pt-8 font-mono text-[11px] tracking-[0.2em]">
        <Link href="/learn" className="text-dim hover:text-bone">
          ← HOW THE SKY BECOMES A CHART
        </Link>
        <Link href="/reading" className="border border-[var(--accent-strong-border)] px-5 py-3 text-[var(--accent)]">
          FIND YOUR SUN SIGN →
        </Link>
      </div>

      <LearnTOC current="/learn/signs" />
    </NaveShell>
  );
}
