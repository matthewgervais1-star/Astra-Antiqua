import type { Metadata } from "next";
import Link from "next/link";
import { CULTURES, CULTURE_LABELS, CULTURE_TAGLINES } from "@/data/cultures";
import { SectionContainer } from "@/components/ui/SectionContainer";
import { GoldText } from "@/components/ui/GoldText";
import { GlassPanel } from "@/components/ui/GlassPanel";

export const metadata: Metadata = {
  title: "About",
  description:
    "Astra Antiqua computes the real sky of your birth and renders it through the religious frameworks of five ancient cultures. Real ephemeris, primary sources, no machine-written mysticism.",
};

const METHOD = [
  {
    title: "A real chart, not generated text",
    body: "Every placement is computed from a geocentric ephemeris derived from Jean Meeus's algorithms, accurate to within an arcminute for the seven classical planets. The mathematics runs entirely in your browser. Nothing about your reading is invented by a language model.",
  },
  {
    title: "The oldest house system",
    body: "Houses are whole-sign, the framework Hellenistic astrologers actually used: the sign rising at your birth becomes the First House, and each sign after it the next. It is the historically correct choice for an ancient system, and it stays meaningful even when the birth hour is approximate.",
  },
  {
    title: "Mappings with a paper trail",
    body: "Each planet-to-deity correspondence is grounded in primary sources: Ugaritic tablets, Hellenistic astrological literature, Punic inscriptions, Egyptian funerary texts, and the Roman augural tradition. Where the evidence is thin or contested, we flag it on the methodology page instead of smoothing it over.",
  },
];

export default function AboutPage() {
  return (
    <>
      <SectionContainer size="default" spacing="tight">
        <div className="text-ink-tertiary font-mono text-xs uppercase tracking-[0.3em]">
          About
        </div>
        <GoldText as="h1" className="mt-4 max-w-4xl text-5xl leading-tight md:text-7xl">
          Real astronomy, in the voices that first read it.
        </GoldText>
        <p className="text-ink-secondary font-body mt-8 max-w-3xl text-lg leading-relaxed md:text-2xl">
          Most astrology apps generate words. Astra Antiqua computes a chart. We place the seven classical planets for the exact moment you were born, then speak them in the names a Theban priest, a Delphic oracle, an Ugaritic scribe, a Punic suffete, or a Roman augur would have used. The measurement is modern and exact. The voice is ancient.
        </p>
      </SectionContainer>

      <SectionContainer size="default" spacing="default">
        <div className="mb-10 md:mb-12">
          <div className="text-ink-tertiary font-mono text-[11px] uppercase tracking-[0.3em]">
            How it works
          </div>
          <h2 className="font-display text-ink-primary mt-3 text-3xl md:text-4xl">
            Computed, not conjured
          </h2>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {METHOD.map((m) => (
            <GlassPanel key={m.title} tone="solid" className="flex flex-col gap-3 p-6 md:p-7">
              <h3 className="font-display text-gold-leaf text-xl md:text-2xl">
                {m.title}
              </h3>
              <p className="text-ink-secondary font-body text-base leading-relaxed">
                {m.body}
              </p>
            </GlassPanel>
          ))}
        </div>
      </SectionContainer>

      <SectionContainer size="default" spacing="default">
        <div className="grid gap-10 md:grid-cols-12 md:gap-12">
          <div className="md:col-span-5">
            <div className="text-ink-tertiary font-mono text-[11px] uppercase tracking-[0.3em]">
              What we will not do
            </div>
            <h2 className="font-display text-ink-primary mt-3 text-3xl md:text-4xl">
              The honest version
            </h2>
          </div>
          <div className="md:col-span-7">
            <ul className="flex flex-col gap-5">
              <li className="border-border-hairline border-t pt-5">
                <p className="text-ink-primary font-body text-base leading-relaxed md:text-lg">
                  We do not use AI to write your reading. The interpretive lines are composed from your actual placements and the cultural register you choose, not paraphrased from a model.
                </p>
              </li>
              <li className="border-border-hairline border-t pt-5">
                <p className="text-ink-primary font-body text-base leading-relaxed md:text-lg">
                  We do not claim the planets cause your life. This is a cultural and religious lens laid over real astronomy, offered for reflection, not prophecy.
                </p>
              </li>
              <li className="border-border-hairline border-t pt-5">
                <p className="text-ink-primary font-body text-base leading-relaxed md:text-lg">
                  We do not send your birth data to a server. It is computed on your device. If you sign in, it is stored only so you do not have to enter it again, and you can export or delete it whenever you like.
                </p>
              </li>
            </ul>
          </div>
        </div>
      </SectionContainer>

      <SectionContainer size="default" spacing="default">
        <div className="mb-10">
          <div className="text-ink-tertiary font-mono text-[11px] uppercase tracking-[0.3em]">
            Five traditions
          </div>
          <h2 className="font-display text-ink-primary mt-3 text-3xl md:text-4xl">
            The same sky, read five ways
          </h2>
          <p className="text-ink-secondary font-body mt-4 max-w-2xl text-base leading-relaxed md:text-lg">
            The planets do not change. The framework you read them through does. Each tradition has its own deities, its own register, its own way of asking what the hour of your birth meant.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
          {CULTURES.map((c) => (
            <Link
              key={c}
              href={`/pantheon/${c}`}
              className="border-border-hairline hover:border-gold-soft group rounded-2xl border p-6 transition-colors"
            >
              <div className="font-display text-gold-leaf text-2xl md:text-3xl">
                {CULTURE_LABELS[c]}
              </div>
              <div className="text-ink-tertiary font-body mt-2 text-sm italic">
                {CULTURE_TAGLINES[c]}
              </div>
            </Link>
          ))}
        </div>
      </SectionContainer>

      <SectionContainer size="default" spacing="default">
        <div className="border-border-hairline rounded-3xl border bg-gradient-to-br from-[rgba(212,175,55,0.04)] via-transparent to-transparent p-10 md:p-14">
          <h2 className="font-display text-ink-primary max-w-2xl text-3xl md:text-5xl">
            Cast the chart of your birth.
          </h2>
          <p className="text-ink-secondary font-body mt-4 max-w-xl text-base md:text-lg">
            Set the date, the hour, and the place. The seven planets are placed for the exact moment you arrived, and the reading is given in whichever ancient voice you call on.
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
              Read the methodology
            </Link>
          </div>
        </div>
      </SectionContainer>
    </>
  );
}
