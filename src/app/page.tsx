import Link from "next/link";
import { PantheonSelector } from "@/components/pantheon/PantheonSelector";
import { TodayDashboard } from "@/components/daily/TodayDashboard";
import { WeekForecastSection } from "@/components/daily/WeekForecastSection";
import { NatalWheel } from "@/components/wheel/NatalWheel";
import { WaitListForm } from "@/components/waitlist/WaitListForm";
import { SectionContainer } from "@/components/ui/SectionContainer";
import { GoldText } from "@/components/ui/GoldText";
import { CULTURES, CULTURE_LABELS } from "@/data/cultures";

export default function HomePage() {
  return (
    <>
      {/* Compact hero ribbon: title + tagline + pantheon selector. */}
      <section className="border-border-hairline relative isolate border-b">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10"
          style={{
            background:
              "radial-gradient(circle at 30% 40%, rgba(212,175,55,0.06) 0%, rgba(5,5,5,0) 60%)",
          }}
        />
        <div className="mx-auto flex w-full max-w-[1280px] flex-col items-center gap-6 px-6 py-12 md:py-16">
          <div className="text-center">
            <GoldText as="h1" className="text-4xl leading-tight md:text-6xl">
              Astra Antiqua
            </GoldText>
            <p className="text-ink-secondary font-body mt-3 text-base italic md:text-lg">
              Read the sky as Carthage did. Or Memphis. Or Delphi. Or Ugarit.
            </p>
          </div>
          <div className="w-full max-w-3xl">
            <PantheonSelector />
          </div>
        </div>
      </section>

      {/* The day itself, immediately. */}
      <SectionContainer size="default" spacing="tight">
        <div className="mb-8 md:mb-10 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="text-ink-tertiary font-mono text-[11px] uppercase tracking-[0.3em]">
              Today
            </div>
            <h2 className="font-display text-ink-primary mt-2 text-3xl md:text-4xl">
              The sky right now, narrated.
            </h2>
          </div>
          <div className="flex flex-wrap gap-3 self-start md:self-end">
            <Link
              href="/reading"
              className="border-gold-soft text-gold-leaf hover:bg-gold-leaf/10 inline-flex items-center gap-2 rounded-full border px-4 py-2 text-[11px] uppercase tracking-[0.2em] transition-colors"
            >
              Your chart →
            </Link>
            <Link
              href="/charts"
              className="border-hairline text-ink-secondary hover:text-ink-primary hover:border-gold-soft inline-flex items-center gap-2 rounded-full border px-4 py-2 text-[11px] uppercase tracking-[0.2em] transition-colors"
            >
              Saved charts
            </Link>
          </div>
        </div>
        <TodayDashboard />
      </SectionContainer>

      <SectionContainer size="default" spacing="default">
        <div className="mb-10 md:mb-12">
          <div className="text-ink-tertiary font-mono text-[11px] uppercase tracking-[0.3em]">
            The coming week
          </div>
          <h2 className="font-display text-ink-primary mt-3 text-3xl md:text-4xl">
            Seven days of sky.
          </h2>
        </div>
        <WeekForecastSection />
      </SectionContainer>

      <SectionContainer size="default" spacing="default">
        <div className="mb-10 md:mb-12">
          <div className="text-ink-tertiary font-mono text-[11px] uppercase tracking-[0.3em]">
            The demonstration
          </div>
          <h2 className="font-display text-ink-primary mt-3 text-3xl md:text-4xl">
            How the wheel reads.
          </h2>
          <p className="text-ink-secondary font-body mt-3 max-w-2xl text-base md:text-lg">
            A sample chart at fixed positions. Gold lines harmonize, red lines challenge. Hover or tap any glyph to read its placement.
          </p>
        </div>
        <NatalWheel />
      </SectionContainer>

      <SectionContainer size="default" spacing="default">
        <div className="mb-10 md:mb-12">
          <div className="text-ink-tertiary font-mono text-[11px] uppercase tracking-[0.3em]">
            The method
          </div>
          <h2 className="font-display text-ink-primary mt-3 text-3xl md:text-4xl">
            How the translation works
          </h2>
        </div>
        <div className="grid gap-8 md:grid-cols-3 md:gap-10">
          <Column
            title="Real ephemeris"
            body="The astronomical engine computes planetary positions to the precision required for professional natal chart and transit work. No approximations of convenience."
            ctaHref="/methodology"
            ctaLabel="Methodology"
          />
          <Column
            title="Historical syncretism"
            body="The mapping from planet to deity is grounded in primary sources: Ugaritic tablets, Hellenistic astrological literature, Punic inscriptions, Egyptian funerary texts. Contested choices are flagged."
            ctaHref="/translation-matrix"
            ctaLabel="Translation matrix"
          />
          <Column
            title="Cultural voice"
            body="Once a pantheon is chosen, the interface stops speaking in modern terminology and begins speaking in the chosen tradition's ritual register. Real math, ancient voice."
            ctaHref="/pantheon/canaan"
            ctaLabel="Sample a pantheon"
          />
        </div>
      </SectionContainer>

      <SectionContainer size="default" spacing="default">
        <div className="border-border-hairline rounded-3xl border bg-gradient-to-br from-[rgba(212,175,55,0.04)] via-transparent to-transparent p-10 md:p-14">
          <div className="grid gap-12 md:grid-cols-12 md:gap-10">
            <div className="md:col-span-6">
              <div className="text-ink-tertiary font-mono text-[11px] uppercase tracking-[0.3em]">
                Pre-launch
              </div>
              <h2 className="font-display text-ink-primary mt-3 max-w-xl text-3xl md:text-5xl">
                Be told when Astra Antiqua arrives on Android.
              </h2>
              <p className="text-ink-secondary font-body mt-4 max-w-md text-base md:text-lg">
                One short email at launch. No newsletter. No drip sequence. If you have a classics or religious-studies background, the form below has a field to say so.
              </p>
              <p className="text-ink-tertiary font-body mt-6 text-sm">
                Prefer the long version?{" "}
                <Link href="/wait-list" className="text-gold-leaf underline-offset-4 hover:underline">
                  Read the standalone page
                </Link>
                .
              </p>
            </div>
            <div className="md:col-span-6">
              <WaitListForm />
            </div>
          </div>
        </div>
      </SectionContainer>

      <SectionContainer size="default" spacing="tight">
        <div className="border-border-hairline border-t pt-10">
          <div className="text-ink-tertiary font-mono text-[11px] uppercase tracking-[0.3em]">
            Browse the pantheons
          </div>
          <div className="text-ink-secondary mt-4 flex flex-wrap gap-x-6 gap-y-3 text-base">
            {CULTURES.map((c) => (
              <Link
                key={c}
                href={`/pantheon/${c}`}
                className="hover:text-gold-leaf font-display text-2xl underline-offset-4 hover:underline md:text-3xl"
              >
                {CULTURE_LABELS[c]}
              </Link>
            ))}
          </div>
        </div>
      </SectionContainer>
    </>
  );
}

function Column({
  title,
  body,
  ctaHref,
  ctaLabel,
}: {
  title: string;
  body: string;
  ctaHref: string;
  ctaLabel: string;
}) {
  return (
    <div className="border-border-hairline border-t pt-6">
      <h3 className="font-display text-gold-leaf text-2xl md:text-3xl">{title}</h3>
      <p className="text-ink-secondary font-body mt-3 text-base leading-relaxed md:text-lg">
        {body}
      </p>
      <Link
        href={ctaHref}
        className="text-ink-primary font-mono mt-6 inline-block text-[11px] uppercase tracking-[0.3em] underline-offset-4 hover:underline"
      >
        {ctaLabel} →
      </Link>
    </div>
  );
}
