import type { Metadata } from "next";
import { SectionContainer } from "@/components/ui/SectionContainer";
import { GoldText } from "@/components/ui/GoldText";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { LearnTOC } from "@/components/LearnTOC";
import { cn } from "@/lib/classNames";

export const metadata: Metadata = {
  title: "Aspects",
  description:
    "Aspects are the meaningful angles planets make to each other: conjunction, sextile, square, trine, opposition, and the minor angles. What each means, and how Astra Antiqua weights them.",
};

type Tone = "ease" | "tension" | "neutral";

interface AspectInfo {
  symbol: string;
  name: string;
  degrees: string;
  tone: Tone;
  meaning: string;
  weight: string;
  major: boolean;
}

const ASPECTS: readonly AspectInfo[] = [
  { symbol: "☌", name: "Conjunction", degrees: "0°", tone: "neutral", meaning: "Same point; the two forces fuse and amplify", weight: "Major", major: true },
  { symbol: "☍", name: "Opposition", degrees: "180°", tone: "tension", meaning: "Mirror opposites; a stand-off across the wheel", weight: "Major", major: true },
  { symbol: "△", name: "Trine", degrees: "120°", tone: "ease", meaning: "Harmony; the forces flow without effort", weight: "Major", major: true },
  { symbol: "□", name: "Square", degrees: "90°", tone: "tension", meaning: "Friction; a forced choice, growth under pressure", weight: "Major", major: true },
  { symbol: "✶", name: "Sextile", degrees: "60°", tone: "ease", meaning: "Support; an open opportunity if you take it", weight: "Major", major: true },
  { symbol: "⚺", name: "Semisextile", degrees: "30°", tone: "ease", meaning: "A faint nudge; minor, easy to miss", weight: "Minor", major: false },
  { symbol: "∠", name: "Semisquare", degrees: "45°", tone: "tension", meaning: "Low-grade friction; a small irritation", weight: "Minor", major: false },
  { symbol: "⚻", name: "Quincunx", degrees: "150°", tone: "tension", meaning: "Awkward; two things that do not quite fit, needing adjustment", weight: "Minor", major: false },
];

const TONE_LABEL: Readonly<Record<Tone, string>> = {
  ease: "Harmonious",
  tension: "Challenging",
  neutral: "Neutral",
};

const TONE_CLASS: Readonly<Record<Tone, string>> = {
  ease: "border-gold-soft text-gold-leaf bg-gold-leaf/10",
  tension: "border-conflict-red/40 text-conflict-red bg-conflict-red/10",
  neutral: "border-hairline text-ink-secondary",
};

export default function AspectsPage() {
  return (
    <>
      <SectionContainer size="default" spacing="tight">
        <div className="text-ink-tertiary font-mono text-xs uppercase tracking-[0.3em]">
          Learn · aspects
        </div>
        <GoldText as="h1" className="mt-4 max-w-4xl text-5xl leading-tight md:text-7xl">
          Aspects
        </GoldText>
        <p className="text-ink-secondary font-body mt-8 max-w-3xl text-lg leading-relaxed md:text-xl">
          Planets are always at some angle to one another. A few of those angles are treated as meaningful; astrology calls them aspects. They are the conversation of the chart: where the planets agree, where they strain, where they ignore each other entirely. In Astra Antiqua, gold lines on the wheel are the easy aspects and red lines are the hard ones.
        </p>
      </SectionContainer>

      <SectionContainer size="default" spacing="tight">
        <div className="grid gap-4 sm:grid-cols-2">
          {ASPECTS.map((a) => (
            <GlassPanel key={a.name} tone="solid" className="p-5 md:p-6">
              <div className="flex items-baseline justify-between gap-3">
                <div className="font-display text-gold-leaf text-2xl">
                  <span className="mr-2">{a.symbol}</span>
                  {a.name}
                </div>
                <div className="text-ink-tertiary font-mono text-sm tracking-[0.1em]">
                  {a.degrees}
                </div>
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <span
                  className={cn(
                    "rounded-full border px-3 py-1 font-mono text-[9px] uppercase tracking-[0.2em]",
                    TONE_CLASS[a.tone],
                  )}
                >
                  {TONE_LABEL[a.tone]}
                </span>
                <span className="text-ink-tertiary font-mono text-[9px] uppercase tracking-[0.2em]">
                  {a.weight}
                </span>
              </div>
              <p className="text-ink-secondary font-body mt-3 text-sm leading-relaxed">
                {a.meaning}
              </p>
            </GlassPanel>
          ))}
        </div>
      </SectionContainer>

      <SectionContainer size="default" spacing="default">
        <div className="grid gap-8 md:grid-cols-12 md:gap-12">
          <div className="md:col-span-5">
            <div className="text-ink-tertiary font-mono text-[11px] uppercase tracking-[0.3em]">
              How we weight them
            </div>
            <h2 className="font-display text-ink-primary mt-3 text-3xl md:text-4xl">
              The five that carry the reading
            </h2>
          </div>
          <div className="md:col-span-7">
            <p className="text-ink-primary font-body text-base leading-relaxed md:text-lg">
              Astra Antiqua reads the five major aspects: the conjunction, sextile, square, trine, and opposition. These are the angles the ancient astrologers leaned on, and the ones strong enough to shape a chart. The minor aspects above are real but faint; we leave them out rather than crowd the reading with noise.
            </p>
            <p className="text-ink-secondary font-body mt-4 text-base leading-relaxed md:text-lg">
              An aspect is rarely exact to the degree. We count one as active when the planets are within an orb, a small margin, of the perfect angle. How that orb works is the{" "}
              <span className="text-ink-primary">next section</span>.
            </p>
          </div>
        </div>
      </SectionContainer>

      <LearnTOC current="/learn/aspects" />
    </>
  );
}
