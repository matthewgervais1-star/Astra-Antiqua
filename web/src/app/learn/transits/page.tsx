import type { Metadata } from "next";
import Link from "next/link";
import { ASPECT_RULES, type AspectKind } from "@/data/sampleChart";
import { NaveShell } from "@/components/chrome/NaveShell";
import { NaveHead } from "@/components/chrome/NaveHead";
import { SectionDivider } from "@/components/chrome/SectionDivider";
import { LearnTOC } from "@/components/LearnTOC";

export const metadata: Metadata = {
  title: "Transits and Orbs",
  description:
    "A transit is the angle today's moving planets make to where the planets stood at your birth. An orb is the margin that decides when that angle counts. The one documented orb table this app runs on.",
};

const ASPECT_GLYPHS: Readonly<Record<AspectKind, string>> = {
  conjunction: "☌",
  sextile: "⚹",
  square: "□",
  trine: "△",
  opposition: "☍",
};

export default function TransitsLearnPage() {
  return (
    <NaveShell context="LEARN · TRANSITS AND ORBS" active="learn">
      <NaveHead kicker="LEARN · 6 OF 7">TRANSITS AND ORBS</NaveHead>

      <p className="mx-auto max-w-[560px] text-center font-body text-[17px] leading-[1.75] text-prose">
        Your natal chart is frozen at the minute of your birth. The sky is not. Since you were
        born the planets have kept moving, and a transit is what happens when one of them, where
        it is right now, makes an aspect to where a planet stood in your birth chart. It is how
        astrology marks the seasons of a life.
      </p>

      <div className="mt-16 flex flex-col gap-5">
        <SectionDivider label="ONE · THE CLOCK OF THE SKY" />
        <h2 className="text-center font-display text-[24px] tracking-[0.05em] text-bone">
          Fast planets, slow planets
        </h2>
        <p className="font-body text-[16px] leading-[1.75] text-prose">
          Each planet keeps its own clock. The Sun rounds the zodiac once a year, so it makes a
          big transit to itself about every three months: a conjunction on your birthday (your
          solar return), a square three months later, an opposition at the half-year.
        </p>
        <p className="font-body text-[16px] leading-[1.75] text-prose">
          Saturn takes about twenty-nine years to return to where it began, which is why the
          much-discussed Saturn return lands near ages twenty-nine, fifty-eight, and eighty-seven,
          each one a reckoning with responsibility. Uranus, Neptune, and Pluto move slower still;
          their transits are rare enough to mark whole chapters, not seasons.
        </p>
      </div>

      <div className="mt-16 flex flex-col gap-5">
        <SectionDivider label="TWO · HOW CLOSE COUNTS" />
        <h2 className="text-center font-display text-[24px] tracking-[0.05em] text-bone">
          The orb
        </h2>
        <p className="font-body text-[16px] leading-[1.75] text-prose">
          A transit is rarely exact to the degree, and it would be useless if it only counted at
          the precise instant. An orb is the buffer around an angle: the margin within which we
          still call it an aspect. Astra Antiqua runs one documented orb table everywhere on this
          site, natal, transit, and synastry alike. Nothing is estimated and nothing is widened
          to manufacture a reading; when nothing sits inside these margins, the day is quiet.
        </p>
        <div className="flex flex-col">
          {ASPECT_RULES.map((rule) => (
            <div
              key={rule.kind}
              className="flex items-baseline justify-between gap-4 border-t border-rule-row py-3 last:border-b"
            >
              <span className="font-display text-[14px] tracking-[0.06em] text-bone">
                {ASPECT_GLYPHS[rule.kind]} {rule.kind.toUpperCase()}
              </span>
              <span className="font-mono text-[11px] tracking-[0.12em] text-dim">
                {rule.angle}° · ORB {rule.orb}°
              </span>
            </div>
          ))}
        </div>
        <p className="font-body text-[16px] leading-[1.75] text-prose">
          The closer a transit is to exact, the louder it is meant to read.
        </p>
      </div>

      <div className="mt-16 border border-rule px-6 py-10">
        <div className="font-mono text-[11px] tracking-[0.2em] text-[var(--accent)]">
          WHERE YOU MEET THEM HERE
        </div>
        <h2 className="mt-3 font-display text-[22px] tracking-[0.05em] text-bone">
          Transits run through the whole app
        </h2>
        <p className="mt-3 max-w-[520px] font-body text-[15px] leading-[1.7] text-prose">
          Your daily reading is built from the transits touching your chart today. The long
          transits and the year-ahead forecast track every major transit, eclipse, retrograde,
          and your solar return for the next twelve months, each timed to the day.
        </p>
        <div className="mt-8 flex flex-wrap gap-4 font-mono text-[11px] tracking-[0.2em]">
          <Link href="/forecast" className="border border-[var(--accent-strong-border)] px-5 py-3 text-[var(--accent)]">
            THE YEAR AHEAD →
          </Link>
          <Link href="/reading" className="border border-rule px-5 py-3 text-dim hover:text-bone">
            CAST YOUR CHART
          </Link>
        </div>
      </div>

      <LearnTOC current="/learn/transits" />
    </NaveShell>
  );
}
