import type { Metadata } from "next";
import Link from "next/link";
import { CULTURES, CULTURE_LABELS } from "@/data/cultures";
import { computeAspects, SAMPLE_CHART } from "@/data/sampleChart";
import { NaveShell } from "@/components/chrome/NaveShell";
import { NaveHead } from "@/components/chrome/NaveHead";
import { SectionDivider } from "@/components/chrome/SectionDivider";
import { WheelSvg } from "@/components/chrome/WheelSvg";
import { LearnTOC } from "@/components/LearnTOC";

export const metadata: Metadata = {
  title: "How the sky becomes a chart",
  description:
    "A plain-language explainer of what a natal chart is: the ten bodies this almanac tracks seen from Earth against the zodiac, the rising horizon at your birth, the twelve houses, and how five ancient cultures read meaning into the astronomy.",
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
  { symbol: "♅", name: "Uranus", verb: "I break, I free" },
  { symbol: "♆", name: "Neptune", verb: "I dissolve, I dream" },
  { symbol: "♇", name: "Pluto", verb: "I bury, I remake" },
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
  const sampleAspects = computeAspects(SAMPLE_CHART).map((a) => ({
    planetA: a.a,
    planetB: a.b,
    kind: a.kind,
  }));

  return (
    <NaveShell context="LEARN · HOW THE SKY BECOMES A CHART" active="learn">
      <NaveHead kicker="LEARN · 1 OF 7">HOW THE SKY BECOMES A CHART</NaveHead>

      <p className="mx-auto max-w-[560px] text-center font-body text-prose-m leading-prose text-prose">
        A natal chart is not a fortune. It is a map of where ten bodies stood, seen from the
        exact spot on Earth where you were born, at the minute you arrived. Seven were named by
        the ancients; three are modern receptions, said so wherever they appear. Here is how that
        map is drawn, and how five ancient cultures learned to read it.
      </p>

      <div className="mt-16 flex flex-col gap-5">
        <SectionDivider label="ONE · THE VIEW FROM EARTH" />
        <h2 className="text-center font-display text-display-m tracking-display text-bone">
          The signs are constellations
        </h2>
        <p className="font-body text-prose-m leading-prose text-prose">
          Look up from anywhere. The Sun, the Moon, and the planets visible to the naked eye all
          drift along a single narrow band of sky. Behind that band sits a ring of
          constellations. Ancient observers cut the ring into twelve equal arcs of thirty
          degrees and named them: Aries, Taurus, Gemini, and the rest.
        </p>
        <p className="font-body text-prose-m leading-prose text-prose">
          Those twelve arcs are the signs. A planet is &ldquo;in&rdquo; a sign when, from where
          you stand on Earth, it sits in front of that stretch of the ring. The signs hold still.
          The planets are the wanderers that cross them.
        </p>
        <Link
          href="/learn/signs"
          className="font-mono text-data-xs tracking-microcopy text-accent hover:underline"
        >
          SEE ALL TWELVE SIGNS →
        </Link>
      </div>

      <div className="mt-16 flex flex-col gap-5">
        <SectionDivider label="TWO · A WORKED EXAMPLE" />
        <h2 className="text-center font-display text-display-m tracking-display text-bone">
          This is a chart
        </h2>
        <p className="font-body text-prose-m leading-prose text-prose">
          Drawn at fixed positions so the structure is clear. The outer ring is the zodiac. Each
          glyph is one of the ten bodies. The lines between them are aspects: bone where the
          forces ease one another, rose where they pull against.
        </p>
        <div className="mt-4 flex justify-center">
          <WheelSvg
            chart={SAMPLE_CHART}
            aspects={sampleAspects}
            size={340}
            caption="A SAMPLE CHART, FIXED FOR ILLUSTRATION"
          />
        </div>
      </div>

      <div className="mt-16 flex flex-col gap-5">
        <SectionDivider label="THREE · THE GRAMMAR" />
        <h2 className="text-center font-display text-display-m tracking-display text-bone">
          The planets are verbs. The signs say how.
        </h2>
        <p className="font-body text-prose-m leading-prose text-prose">
          There is a simple grammar under all of it. A planet is the verb, the thing being done.
          A sign is the manner, the way it is done. The house, which you meet next, is the room
          it is done in. Put them together and a placement becomes a sentence.
        </p>
        <div className="mt-6 grid gap-10 sm:grid-cols-2">
          <div>
            <div className="font-mono text-data-xs tracking-microcopy text-dim">
              THE TEN, AND THE RISING, AS VERBS
            </div>
            <div className="mt-4 flex flex-col">
              {PLANET_VERBS.map((p) => (
                <div
                  key={p.name}
                  className="flex items-baseline justify-between gap-4 border-t border-rule-row py-2.5 last:border-b"
                >
                  <span className="font-display text-[14px] text-bone">
                    <span className="mr-2 font-mono text-data-xs text-dim">{p.symbol}</span>
                    {p.name.toUpperCase()}
                  </span>
                  <span className="font-body text-prose-s italic text-prose">{p.verb}</span>
                </div>
              ))}
            </div>
          </div>
          <div>
            <div className="font-mono text-data-xs tracking-microcopy text-dim">
              THE TWELVE SIGNS, AS MANNER
            </div>
            <div className="mt-4 flex flex-col">
              {SIGN_MANNERS.map((s) => (
                <div
                  key={s.sign}
                  className="flex items-baseline justify-between gap-4 border-t border-rule-row py-2.5 last:border-b"
                >
                  <span className="font-display text-[14px] text-bone">{s.sign.toUpperCase()}</span>
                  <span className="font-body text-prose-s italic text-prose">{s.manner}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
        <p className="font-body text-prose-m leading-prose text-prose">
          So Mars in Aries reads &ldquo;I act, boldly and first.&rdquo; Add the house and you have
          where: in the Tenth, that drive is spent on your public standing. Every culture on this
          site reads the same computed sky; what changes is the theology it must pass through.
          Mars becomes Resheph in Canaan, Ares in Greece, Mars Pater in Rome, and the sentence
          still holds.
        </p>
      </div>

      <div className="mt-16 flex flex-col gap-5">
        <SectionDivider label="FOUR · THE TURNING SKY" />
        <h2 className="text-center font-display text-display-m tracking-display text-bone">
          The rising horizon
        </h2>
        <p className="font-body text-prose-m leading-prose text-prose">
          The hour and the place matter because they fix the horizon. The sign climbing the
          eastern horizon at your birth is your Ascendant, the start of your First House. The
          sign setting in the west sits opposite. Two people born the same day, hours apart, do
          not share a chart: the sky has turned beneath them.
        </p>
        <Link
          href="/learn/rising"
          className="font-mono text-data-xs tracking-microcopy text-accent hover:underline"
        >
          MORE ON THE RISING SIGN →
        </Link>
      </div>

      <div className="mt-16 flex flex-col gap-5">
        <SectionDivider label="FIVE · THE TWELVE FIELDS" />
        <h2 className="text-center font-display text-display-m tracking-display text-bone">
          The houses
        </h2>
        <p className="font-body text-prose-m leading-prose text-prose">
          From the Ascendant, the sky is divided into twelve fields called houses, each a
          department of life: the body, what you own, kin, home, pleasure, work, partnership, and
          so on. A planet&rsquo;s sign says how it acts; its house says where in your life that
          force is spent.
        </p>
        <p className="font-body text-prose-m leading-prose text-prose">
          Astra Antiqua uses whole-sign houses, the oldest Hellenistic system: the rising sign
          becomes the entire First House, and each sign after it the next in order. It is the
          historically correct choice for an ancient system, and it stays meaningful even when
          the birth hour is only approximate.
        </p>
        <Link
          href="/learn/houses"
          className="font-mono text-data-xs tracking-microcopy text-accent hover:underline"
        >
          THE TWELVE HOUSES →
        </Link>
      </div>

      <div className="mt-16 flex flex-col gap-5">
        <SectionDivider label="SIX · FROM ASTRONOMY TO MEANING" />
        <h2 className="text-center font-display text-display-m tracking-display text-bone">
          Where astrology begins
        </h2>
        <p className="font-body text-prose-m leading-prose text-prose">
          Everything to this point is astronomy no observatory would dispute: real bodies in real
          positions, computed to the arcminute. Astrology is the interpretive layer laid on top,
          the old agreement that these positions carry meaning.
        </p>
        <p className="font-body text-prose-m leading-prose text-prose">
          We do not invent that layer. We borrow it from the people who built it: the priests of
          Memphis, the oracle at Delphi, the scribes of Ugarit, the suffetes of Carthage, the
          augurs of Rome. The same Mars at the same degree is read five different ways, and you
          choose whose voice to read it in.
        </p>
        <div className="mt-2 flex flex-wrap justify-center gap-x-8 gap-y-2">
          {CULTURES.map((c) => (
            <Link
              key={c}
              href={`/voices/${c}`}
              className="font-display text-[16px] tracking-[0.08em] text-prose hover:text-bone"
            >
              {CULTURE_LABELS[c].toUpperCase()}
            </Link>
          ))}
        </div>
      </div>

      <div className="mt-16 border border-rule px-6 py-10 text-center">
        <h2 className="font-display text-display-m tracking-display text-bone">Now draw yours.</h2>
        <p className="mx-auto mt-4 max-w-[440px] font-body text-prose-m leading-prose text-prose">
          Set the date, the hour, and the place of your birth. The ten bodies will be placed for
          the exact moment you arrived, your houses raised from the rising sign, and the whole
          thing read in whichever ancient voice you call on.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-4 font-mono text-data-xs tracking-microcopy">
          <Link href="/reading" className="border border-[var(--accent-strong-border)] px-5 py-3 text-accent">
            CAST YOUR CHART →
          </Link>
          <Link href="/method" className="border border-rule px-5 py-3 text-dim hover:text-bone">
            THE SOURCES BEHIND IT
          </Link>
        </div>
      </div>

      <LearnTOC current="/learn" />
    </NaveShell>
  );
}
