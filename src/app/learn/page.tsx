import type { Metadata } from "next";
import Link from "next/link";
import { CULTURES, CULTURE_LABELS } from "@/data/cultures";
import { NatalWheel } from "@/components/wheel/NatalWheel";
import { LifeAreaLegend } from "@/components/LifeAreaLegend";
import { SectionContainer } from "@/components/ui/SectionContainer";
import { GoldText } from "@/components/ui/GoldText";
import { GlassPanel } from "@/components/ui/GlassPanel";

export const metadata: Metadata = {
  title: "How the sky becomes a chart",
  description:
    "A plain-language explainer of what a natal chart is: the seven classical planets seen from Earth against the zodiac, the rising horizon at your birth, the twelve houses, and how five ancient cultures read meaning into the astronomy.",
};

const PLANET_VERBS: ReadonlyArray<{ symbol: string; name: string; verb: string }> = [
  { symbol: "☉", name: "Sun", verb: "I shine, I rule" },
  { symbol: "☽", name: "Moon", verb: "I feel, I need" },
  { symbol: "↑", name: "Ascendant", verb: "I appear, I begin" },
  { symbol: "☿", name: "Mercury", verb: "I think, I speak" },
  { symbol: "♀", name: "Venus", verb: "I love, I draw near" },
  { symbol: "♂", name: "Mars", verb: "I act, I cut" },
  { symbol: "♃", name: "Jupiter", verb: "I expand, I trust" },
  { symbol: "♄", name: "Saturn", verb: "I endure, I bind" },
];

const SIGN_MANNERS: ReadonlyArray<{ sign: string; manner: string }> = [
  { sign: "Aries", manner: "boldly, first" },
  { sign: "Taurus", manner: "steadily, sensuously" },
  { sign: "Gemini", manner: "restlessly, every way at once" },
  { sign: "Cancer", manner: "tenderly, protectively" },
  { sign: "Leo", manner: "proudly, warmly" },
  { sign: "Virgo", manner: "carefully, precisely" },
  { sign: "Libra", manner: "fairly, in pairs" },
  { sign: "Scorpio", manner: "intensely, to the depths" },
  { sign: "Sagittarius", manner: "freely, seeking meaning" },
  { sign: "Capricorn", manner: "patiently, toward the summit" },
  { sign: "Aquarius", manner: "differently, against the grain" },
  { sign: "Pisces", manner: "dreamily, without edges" },
];

export default function LearnPage() {
  return (
    <>
      <SectionContainer size="default" spacing="tight">
        <div className="text-ink-tertiary font-mono text-xs uppercase tracking-[0.3em]">
          Learn
        </div>
        <GoldText as="h1" className="mt-4 max-w-4xl text-5xl leading-tight md:text-7xl">
          How the sky becomes a chart.
        </GoldText>
        <p className="text-ink-secondary font-body mt-8 max-w-3xl text-lg leading-relaxed md:text-2xl">
          A natal chart is not a fortune. It is a map of where the seven classical planets stood, seen from the exact spot on Earth where you were born, at the minute you arrived. Here is how that map is drawn, and how five ancient cultures learned to read it.
        </p>
      </SectionContainer>

      <SectionContainer size="default" spacing="default">
        <div className="grid gap-8 md:grid-cols-12 md:gap-12">
          <div className="md:col-span-5">
            <div className="text-ink-tertiary font-mono text-[11px] uppercase tracking-[0.3em]">
              One · the view from Earth
            </div>
            <h2 className="font-display text-ink-primary mt-3 text-3xl md:text-4xl">
              The signs are constellations
            </h2>
          </div>
          <div className="md:col-span-7">
            <p className="text-ink-primary font-body text-base leading-relaxed md:text-lg">
              Look up from anywhere. The Sun, the Moon, and the five planets visible to the naked eye all drift along a single narrow band of sky. Behind that band sits a ring of constellations. Ancient observers cut the ring into twelve equal arcs of thirty degrees and named them: Aries, Taurus, Gemini, and the rest.
            </p>
            <p className="text-ink-secondary font-body mt-4 text-base leading-relaxed md:text-lg">
              Those twelve arcs are the signs. A planet is &ldquo;in&rdquo; a sign when, from where you stand on Earth, it sits in front of that stretch of the ring. The signs hold still. The planets are the wanderers that cross them.
            </p>
            <Link
              href="/learn/signs"
              className="text-gold-leaf font-mono mt-5 inline-block text-[11px] uppercase tracking-[0.25em] underline-offset-4 hover:underline"
            >
              See all twelve signs →
            </Link>
          </div>
        </div>
      </SectionContainer>

      <SectionContainer size="default" spacing="default">
        <div className="mb-10 md:mb-12">
          <div className="text-ink-tertiary font-mono text-[11px] uppercase tracking-[0.3em]">
            Two · a worked example
          </div>
          <h2 className="font-display text-ink-primary mt-3 text-3xl md:text-4xl">
            This is a chart
          </h2>
          <p className="text-ink-secondary font-body mt-4 max-w-2xl text-base leading-relaxed md:text-lg">
            Drawn at fixed positions so the structure is clear. The outer ring is the zodiac. Each glyph is one of the seven planets, rendered here in an ancient hand. The lines between them are aspects: gold where the forces ease one another, red where they pull against. Hover or tap any glyph to read its placement.
          </p>
        </div>
        <NatalWheel />
      </SectionContainer>

      <SectionContainer size="default" spacing="default">
        <div className="mb-10 md:mb-12">
          <div className="text-ink-tertiary font-mono text-[11px] uppercase tracking-[0.3em]">
            Three · the grammar
          </div>
          <h2 className="font-display text-ink-primary mt-3 text-3xl md:text-4xl">
            The planets are verbs. The signs say how.
          </h2>
          <p className="text-ink-secondary font-body mt-4 max-w-2xl text-base leading-relaxed md:text-lg">
            There is a simple grammar under all of it. A planet is the verb, the thing being done. A sign is the manner, the way it is done. The house, which you meet next, is the room it is done in. Put them together and a placement becomes a sentence.
          </p>
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          <GlassPanel tone="solid" className="p-6 md:p-7">
            <div className="text-gold-leaf font-mono text-[10px] uppercase tracking-[0.3em]">
              The seven, and the rising, as verbs
            </div>
            <ul className="mt-4 flex flex-col">
              {PLANET_VERBS.map((p) => (
                <li
                  key={p.name}
                  className="border-border-hairline flex items-baseline justify-between gap-4 border-t py-2.5 first:border-t-0"
                >
                  <span className="text-ink-primary font-display text-base">
                    <span className="text-ink-tertiary mr-2 font-mono text-sm">{p.symbol}</span>
                    {p.name}
                  </span>
                  <span className="text-ink-secondary font-body text-right text-sm italic md:text-base">
                    {p.verb}
                  </span>
                </li>
              ))}
            </ul>
          </GlassPanel>
          <GlassPanel tone="solid" className="p-6 md:p-7">
            <div className="text-gold-leaf font-mono text-[10px] uppercase tracking-[0.3em]">
              The twelve signs, as manner
            </div>
            <ul className="mt-4 flex flex-col">
              {SIGN_MANNERS.map((s) => (
                <li
                  key={s.sign}
                  className="border-border-hairline flex items-baseline justify-between gap-4 border-t py-2.5 first:border-t-0"
                >
                  <span className="text-ink-primary font-display text-base">{s.sign}</span>
                  <span className="text-ink-secondary font-body text-right text-sm italic md:text-base">
                    {s.manner}
                  </span>
                </li>
              ))}
            </ul>
          </GlassPanel>
        </div>
        <p className="text-ink-primary font-body mt-8 max-w-3xl text-base leading-relaxed md:text-lg">
          So Mars in Aries reads &ldquo;I act, boldly and first.&rdquo; Add the house and you have where: in the Tenth, that drive is spent on your public standing. In Astra Antiqua the verb wears a face. Mars becomes Nergal in Canaan, Ares in Greece, Mars Pater in Rome. The grammar holds; only the names change.
        </p>
        <div className="mt-12">
          <div className="text-gold-leaf font-mono text-[11px] uppercase tracking-[0.3em]">
            What each planet governs
          </div>
          <p className="text-ink-secondary font-body mt-2 max-w-2xl text-base leading-relaxed md:text-lg">
            Each verb owns a department of life. This is the legend the rest of the chart is read against.
          </p>
          <div className="mt-6">
            <LifeAreaLegend />
          </div>
        </div>
      </SectionContainer>

      <SectionContainer size="default" spacing="default">
        <div className="grid gap-8 md:grid-cols-12 md:gap-12">
          <div className="md:col-span-5">
            <div className="text-ink-tertiary font-mono text-[11px] uppercase tracking-[0.3em]">
              Four · the turning sky
            </div>
            <h2 className="font-display text-ink-primary mt-3 text-3xl md:text-4xl">
              The rising horizon
            </h2>
            <p className="text-ink-secondary font-body mt-4 text-base leading-relaxed md:text-lg">
              The hour and the place matter because they fix the horizon. The sign climbing the eastern horizon at your birth is your Ascendant, the start of your First House. The sign setting in the west sits opposite. Two people born the same day, hours apart, do not share a chart: the sky has turned beneath them.
            </p>
            <Link
              href="/learn/rising"
              className="text-gold-leaf font-mono mt-5 inline-block text-[11px] uppercase tracking-[0.25em] underline-offset-4 hover:underline"
            >
              More on the rising sign →
            </Link>
          </div>
          <div className="md:col-span-7">
            <GlassPanel tone="solid" className="p-6 md:p-8">
              <HorizonDiagram />
            </GlassPanel>
          </div>
        </div>
      </SectionContainer>

      <SectionContainer size="default" spacing="default">
        <div className="grid gap-8 md:grid-cols-12 md:gap-12">
          <div className="md:col-span-5">
            <div className="text-ink-tertiary font-mono text-[11px] uppercase tracking-[0.3em]">
              Five · the twelve fields
            </div>
            <h2 className="font-display text-ink-primary mt-3 text-3xl md:text-4xl">
              The houses
            </h2>
          </div>
          <div className="md:col-span-7">
            <p className="text-ink-primary font-body text-base leading-relaxed md:text-lg">
              From the Ascendant, the sky is divided into twelve fields called houses, each a department of life: the body, what you own, kin, home, pleasure, work, partnership, and so on. A planet&rsquo;s sign says how it acts; its house says where in your life that force is spent.
            </p>
            <p className="text-ink-secondary font-body mt-4 text-base leading-relaxed md:text-lg">
              Astra Antiqua uses whole-sign houses, the oldest Hellenistic system: the rising sign becomes the entire First House, and each sign after it the next in order. It is the historically correct choice for an ancient system, and it stays meaningful even when the birth hour is only approximate.
            </p>
          </div>
        </div>
      </SectionContainer>

      <SectionContainer size="default" spacing="default">
        <div className="grid gap-8 md:grid-cols-12 md:gap-12">
          <div className="md:col-span-5">
            <div className="text-ink-tertiary font-mono text-[11px] uppercase tracking-[0.3em]">
              Six · from astronomy to meaning
            </div>
            <h2 className="font-display text-ink-primary mt-3 text-3xl md:text-4xl">
              Where astrology begins
            </h2>
          </div>
          <div className="md:col-span-7">
            <p className="text-ink-primary font-body text-base leading-relaxed md:text-lg">
              Everything to this point is astronomy no observatory would dispute: real bodies in real positions, computed to the arcminute. Astrology is the interpretive layer laid on top, the old agreement that these positions carry meaning.
            </p>
            <p className="text-ink-secondary font-body mt-4 text-base leading-relaxed md:text-lg">
              We do not invent that layer. We borrow it from the people who built it: the priests of Memphis, the oracle at Delphi, the scribes of Ugarit, the suffetes of Carthage, the augurs of Rome. The same Mars at the same degree is read five different ways, and you choose whose eyes to read it through.
            </p>
            <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2">
              {CULTURES.map((c) => (
                <Link
                  key={c}
                  href={`/pantheon/${c}`}
                  className="text-ink-secondary hover:text-gold-leaf font-display text-xl underline-offset-4 hover:underline md:text-2xl"
                >
                  {CULTURE_LABELS[c]}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </SectionContainer>

      <SectionContainer size="default" spacing="default">
        <div className="border-border-hairline rounded-3xl border bg-gradient-to-br from-[rgba(212,175,55,0.04)] via-transparent to-transparent p-10 md:p-14">
          <h2 className="font-display text-ink-primary max-w-2xl text-3xl md:text-5xl">
            Now draw yours.
          </h2>
          <p className="text-ink-secondary font-body mt-4 max-w-xl text-base md:text-lg">
            Set the date, the hour, and the place of your birth. The seven planets will be placed for the exact moment you arrived, your houses raised from the rising sign, and the whole thing read in whichever ancient voice you call on.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/reading"
              className="border-gold-soft text-gold-leaf hover:bg-gold-leaf/10 inline-flex items-center gap-2 rounded-full border px-6 py-3 text-sm uppercase tracking-[0.2em] transition-colors"
            >
              Cast your chart →
            </Link>
            <Link
              href="/methodology"
              className="border-hairline text-ink-secondary hover:text-ink-primary hover:border-gold-soft inline-flex items-center gap-2 rounded-full border px-6 py-3 text-sm uppercase tracking-[0.2em] transition-colors"
            >
              The sources behind it
            </Link>
          </div>
        </div>
      </SectionContainer>
    </>
  );
}

/**
 * A small hand-authored diagram of the sky at the moment of birth: the dome of
 * the visible sky, the horizon, the Sun setting in the west and the Moon rising
 * in the east. Stroke-only, gold-on-dark, matching the Relic aesthetic.
 */
function HorizonDiagram() {
  return (
    <svg
      viewBox="0 0 420 220"
      role="img"
      aria-label="The sky at the moment of birth: the Sun setting in the west, a sign rising on the eastern horizon."
      className="w-full"
    >
      {/* Dome of the visible sky */}
      <path
        d="M 30 170 A 180 150 0 0 1 390 170"
        fill="none"
        stroke="rgba(212,175,55,0.35)"
        strokeWidth="1"
      />
      {/* Horizon */}
      <line
        x1="20"
        y1="170"
        x2="400"
        y2="170"
        stroke="rgba(212,175,55,0.55)"
        strokeWidth="1.25"
      />
      {/* Eastern horizon, a sign rising */}
      <g stroke="rgba(244,208,63,0.85)" strokeWidth="1.25" fill="none" strokeLinecap="round">
        <circle cx="58" cy="150" r="11" />
        <path d="M 58 132 l 0 -16 M 52 122 l 6 -6 l 6 6" />
      </g>
      {/* Western horizon, the Sun setting */}
      <g stroke="rgba(212,175,55,0.7)" strokeWidth="1.25" fill="none" strokeLinecap="round">
        <circle cx="362" cy="158" r="12" />
        <path d="M 362 184 l 0 14 M 356 192 l 6 6 l 6 -6" />
      </g>
      {/* The moment of birth, at center */}
      <circle cx="210" cy="170" r="3" fill="rgba(255,255,255,0.85)" stroke="none" />
      <text
        x="210"
        y="192"
        textAnchor="middle"
        fill="rgba(255,255,255,0.6)"
        fontSize="10"
        fontFamily="ui-monospace, monospace"
        letterSpacing="2"
      >
        BORN HERE
      </text>
      {/* Labels */}
      <text x="40" y="206" textAnchor="middle" fill="rgba(212,175,55,0.8)" fontSize="9.5" fontFamily="ui-monospace, monospace" letterSpacing="2">
        EAST · RISING
      </text>
      <text x="380" y="206" textAnchor="middle" fill="rgba(212,175,55,0.8)" fontSize="9.5" fontFamily="ui-monospace, monospace" letterSpacing="2">
        WEST · SETTING
      </text>
    </svg>
  );
}
