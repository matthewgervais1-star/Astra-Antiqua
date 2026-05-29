import type { Metadata } from "next";
import Link from "next/link";
import { ZODIAC_SIGN_INFO } from "@/data/zodiacSigns";
import { SectionContainer } from "@/components/ui/SectionContainer";
import { GoldText } from "@/components/ui/GoldText";
import { GlassPanel } from "@/components/ui/GlassPanel";

export const metadata: Metadata = {
  title: "Zodiac Sun Signs",
  description:
    "The twelve zodiac sun signs with their date ranges, elements, and traits. Your sun sign is the sign the Sun stood in at your birth, in the tropical zodiac.",
};

function Constellation({
  points,
}: {
  points: ReadonlyArray<readonly [number, number]>;
}) {
  const polyline = points.map(([x, y]) => `${x},${y}`).join(" ");
  return (
    <svg viewBox="0 0 100 100" className="h-16 w-16 shrink-0" aria-hidden>
      <polyline
        points={polyline}
        fill="none"
        stroke="rgba(212,175,55,0.4)"
        strokeWidth="1.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {points.map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r="2.2" fill="rgba(244,208,63,0.85)" />
      ))}
    </svg>
  );
}

export default function ZodiacSignsPage() {
  return (
    <>
      <SectionContainer size="default" spacing="tight">
        <div className="text-ink-tertiary font-mono text-xs uppercase tracking-[0.3em]">
          Learn · the signs
        </div>
        <GoldText as="h1" className="mt-4 max-w-4xl text-5xl leading-tight md:text-7xl">
          Zodiac Sun Signs
        </GoldText>
        <p className="text-ink-secondary font-body mt-8 max-w-3xl text-lg leading-relaxed md:text-xl">
          The part of astrology almost everyone already knows. When you say &ldquo;I am a Leo,&rdquo; you mean the Sun stood in Leo at the hour of your birth. Because the Earth circles the Sun once a year, the Sun walks through all twelve signs in the same order every year, so the dates barely move. Astra Antiqua uses the tropical zodiac, anchored to the seasons rather than to the slowly drifting constellations.
        </p>
      </SectionContainer>

      <SectionContainer size="default" spacing="tight">
        <div className="grid gap-4 sm:grid-cols-2">
          {ZODIAC_SIGN_INFO.map((s) => (
            <GlassPanel key={s.sign} tone="solid" className="p-5 md:p-6">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="font-display text-gold-leaf text-2xl">
                    <span className="mr-2">{s.symbol}</span>
                    {s.sign}
                  </div>
                  <div className="text-ink-tertiary font-mono mt-1.5 text-[10px] uppercase tracking-[0.2em]">
                    {s.dates}
                  </div>
                  <div className="text-ink-tertiary font-mono mt-0.5 text-[10px] uppercase tracking-[0.2em]">
                    {s.element} · {s.modality}
                  </div>
                </div>
                <Constellation points={s.points} />
              </div>
              <div className="text-ink-secondary font-display mt-3 text-base italic">
                {s.traits}
              </div>
              <p className="text-ink-primary font-body mt-2 text-sm leading-relaxed">
                {s.blurb}
              </p>
            </GlassPanel>
          ))}
        </div>
      </SectionContainer>

      <SectionContainer size="default" spacing="default">
        <div className="border-border-hairline flex flex-wrap items-center justify-between gap-4 border-t pt-8">
          <Link
            href="/learn"
            className="text-ink-secondary hover:text-gold-leaf font-mono text-[11px] uppercase tracking-[0.25em]"
          >
            ← How the sky becomes a chart
          </Link>
          <Link
            href="/reading"
            className="border-gold-soft text-gold-leaf hover:bg-gold-leaf/10 inline-flex items-center gap-2 rounded-full border px-5 py-3 text-xs uppercase tracking-[0.2em] transition-colors"
          >
            Find your sun sign →
          </Link>
        </div>
      </SectionContainer>
    </>
  );
}
