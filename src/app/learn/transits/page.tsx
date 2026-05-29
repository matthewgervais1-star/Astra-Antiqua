import type { Metadata } from "next";
import Link from "next/link";
import { SectionContainer } from "@/components/ui/SectionContainer";
import { GoldText } from "@/components/ui/GoldText";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { LearnTOC } from "@/components/LearnTOC";

export const metadata: Metadata = {
  title: "Transits and Orbs",
  description:
    "A transit is the angle today's moving planets make to where the planets stood at your birth. An orb is the margin that decides when that angle counts. How transits time the seasons of a life.",
};

export default function TransitsLearnPage() {
  return (
    <>
      <SectionContainer size="default" spacing="tight">
        <div className="text-ink-tertiary font-mono text-xs uppercase tracking-[0.3em]">
          Learn · transits and orbs
        </div>
        <GoldText as="h1" className="mt-4 max-w-4xl text-5xl leading-tight md:text-7xl">
          Transits and orbs
        </GoldText>
        <p className="text-ink-secondary font-body mt-8 max-w-3xl text-lg leading-relaxed md:text-xl">
          Your natal chart is frozen at the minute of your birth. The sky is not. Since you were born the planets have kept moving, and a transit is what happens when one of them, where it is right now, makes an aspect to where a planet stood in your birth chart. It is how astrology marks the seasons of a life.
        </p>
      </SectionContainer>

      <SectionContainer size="default" spacing="default">
        <div className="grid gap-8 md:grid-cols-12 md:gap-12">
          <div className="md:col-span-5">
            <div className="text-ink-tertiary font-mono text-[11px] uppercase tracking-[0.3em]">
              One · the clock of the sky
            </div>
            <h2 className="font-display text-ink-primary mt-3 text-3xl md:text-4xl">
              Fast planets, slow planets
            </h2>
          </div>
          <div className="md:col-span-7">
            <p className="text-ink-primary font-body text-base leading-relaxed md:text-lg">
              Each planet keeps its own clock. The Sun rounds the zodiac once a year, so it makes a big transit to itself about every three months: a conjunction on your birthday (your solar return), a square three months later, an opposition at the half-year.
            </p>
            <p className="text-ink-secondary font-body mt-4 text-base leading-relaxed md:text-lg">
              Saturn takes about twenty-nine years to return to where it began, which is why the much-discussed Saturn return lands near ages twenty-nine, fifty-eight, and eighty-seven, each one a reckoning with responsibility. Slow planets make rare, heavy transits; fast ones make frequent, light ones.
            </p>
          </div>
        </div>
      </SectionContainer>

      <SectionContainer size="default" spacing="default">
        <div className="grid gap-8 md:grid-cols-12 md:gap-12">
          <div className="md:col-span-5">
            <div className="text-ink-tertiary font-mono text-[11px] uppercase tracking-[0.3em]">
              Two · how close counts
            </div>
            <h2 className="font-display text-ink-primary mt-3 text-3xl md:text-4xl">
              The orb
            </h2>
          </div>
          <div className="md:col-span-7">
            <p className="text-ink-primary font-body text-base leading-relaxed md:text-lg">
              A transit is rarely exact to the degree, and it would be useless if it only counted at the precise instant. An orb is the buffer around an angle: the margin within which we still call it an aspect. A square is strongest at exactly ninety degrees, but it is felt for a stretch on either side as the planet approaches and separates.
            </p>
            <p className="text-ink-secondary font-body mt-4 text-base leading-relaxed md:text-lg">
              Astra Antiqua uses tight, classical orbs so the readings stay honest: a wide orb will call almost anything an aspect. The closer a transit is to exact, the louder it is meant to read.
            </p>
          </div>
        </div>
      </SectionContainer>

      <SectionContainer size="default" spacing="default">
        <GlassPanel tone="solid" className="p-6 md:p-8">
          <div className="text-gold-leaf font-mono text-[10px] uppercase tracking-[0.3em]">
            Where you meet them here
          </div>
          <h2 className="font-display text-ink-primary mt-3 text-2xl md:text-3xl">
            Transits run through the whole app
          </h2>
          <p className="text-ink-secondary font-body mt-3 max-w-2xl text-base leading-relaxed md:text-lg">
            Your daily reading is built from the transits touching your chart today. The year-ahead forecast computes every major transit, eclipse, retrograde, and your solar return for the next twelve months, each timed to the day.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/forecast"
              className="border-gold-soft text-gold-leaf hover:bg-gold-leaf/10 inline-flex items-center gap-2 rounded-full border px-5 py-3 text-xs uppercase tracking-[0.2em] transition-colors"
            >
              The year ahead →
            </Link>
            <Link
              href="/reading"
              className="border-hairline text-ink-secondary hover:text-ink-primary hover:border-gold-soft inline-flex items-center gap-2 rounded-full border px-5 py-3 text-xs uppercase tracking-[0.2em] transition-colors"
            >
              Cast your chart
            </Link>
          </div>
        </GlassPanel>
      </SectionContainer>

      <LearnTOC current="/learn/transits" />
    </>
  );
}
