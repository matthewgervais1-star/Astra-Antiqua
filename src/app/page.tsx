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
      <section className="relative isolate flex min-h-[88vh] flex-col items-center justify-center px-6 py-24">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10"
          style={{
            background:
              "radial-gradient(circle at 30% 40%, rgba(212,175,55,0.08) 0%, rgba(5,5,5,0) 60%)",
          }}
        />
        <ZodiacWatermark />
        <div className="mx-auto flex w-full max-w-[1280px] flex-col items-center">
          <p className="text-ink-tertiary font-mono mb-8 text-xs uppercase tracking-[0.4em]">
            Astronomical · Ancient · Honest
          </p>
          <GoldText as="h1" className="text-center text-6xl leading-[0.95] md:text-[96px]">
            Astra Antiqua
          </GoldText>
          <p className="text-ink-secondary font-body mt-6 max-w-2xl text-center text-xl italic md:text-2xl">
            Read the sky as Carthage did. Or Memphis. Or Delphi. Or Ugarit.
          </p>
          <p className="text-ink-tertiary font-body mt-4 max-w-xl text-center text-base md:text-lg">
            Professional ephemeris calculations. Rendered through the religious frameworks of four ancient cultures.
          </p>
          <div className="mt-14 w-full max-w-3xl">
            <PantheonSelector />
          </div>
        </div>
      </section>

      <SectionContainer size="default" spacing="default">
        <div className="mb-12 md:mb-16 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="text-ink-tertiary font-mono text-[11px] uppercase tracking-[0.3em]">
              Section II · Today
            </div>
            <h2 className="font-display text-ink-primary mt-3 text-3xl md:text-5xl">
              The sky right now, narrated.
            </h2>
            <p className="text-ink-secondary font-body mt-4 max-w-2xl text-base md:text-lg">
              The Moon&apos;s sign, today&apos;s tightest aspects, the moon phase, and the upcoming sky events, computed live and rendered in the chosen pantheon&apos;s voice. If you have entered your birth data, your Big Three and personal transits appear above.
            </p>
          </div>
          <Link
            href="/reading"
            className="border-gold-soft text-gold-leaf hover:bg-gold-leaf/10 inline-flex shrink-0 items-center gap-2 self-start rounded-full border px-5 py-2.5 text-xs uppercase tracking-[0.2em] transition-colors md:self-end"
          >
            Read your own chart
            <span aria-hidden>→</span>
          </Link>
        </div>
        <TodayDashboard />
      </SectionContainer>

      <SectionContainer size="default" spacing="default">
        <div className="mb-10 md:mb-12">
          <div className="text-ink-tertiary font-mono text-[11px] uppercase tracking-[0.3em]">
            Section III · The coming week
          </div>
          <h2 className="font-display text-ink-primary mt-3 text-3xl md:text-5xl">
            Seven days of sky.
          </h2>
        </div>
        <WeekForecastSection />
      </SectionContainer>

      <SectionContainer size="default" spacing="default">
        <div className="mb-12 md:mb-16 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="text-ink-tertiary font-mono text-[11px] uppercase tracking-[0.3em]">
              Section IV · Demonstration
            </div>
            <h2 className="font-display text-ink-primary mt-3 text-3xl md:text-5xl">
              How the wheel reads.
            </h2>
            <p className="text-ink-secondary font-body mt-4 max-w-2xl text-base md:text-lg">
              A sample chart at fixed positions. Gold lines harmonize, red lines challenge. Hover or tap any glyph to read its placement.
            </p>
          </div>
        </div>
        <NatalWheel />
      </SectionContainer>

      <SectionContainer size="default" spacing="default">
        <div className="mb-12 md:mb-16">
          <div className="text-ink-tertiary font-mono text-[11px] uppercase tracking-[0.3em]">
            Section V · Method
          </div>
          <h2 className="font-display text-ink-primary mt-3 text-3xl md:text-5xl">
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
                Section VI · Pre-launch
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

function ZodiacWatermark() {
  return (
    <svg
      aria-hidden
      viewBox="0 0 1000 1000"
      className="pointer-events-none absolute inset-0 -z-10 m-auto h-[min(80vh,800px)] w-[min(80vh,800px)] opacity-[0.04]"
    >
      <circle cx="500" cy="500" r="400" stroke="#d4af37" strokeWidth="1" fill="none" />
      <circle cx="500" cy="500" r="320" stroke="#d4af37" strokeWidth="0.5" fill="none" />
      <circle cx="500" cy="500" r="240" stroke="#d4af37" strokeWidth="0.5" fill="none" />
      {Array.from({ length: 12 }).map((_, i) => {
        const angle = (i * 30 - 90) * (Math.PI / 180);
        const x1 = 500 + Math.cos(angle) * 240;
        const y1 = 500 + Math.sin(angle) * 240;
        const x2 = 500 + Math.cos(angle) * 400;
        const y2 = 500 + Math.sin(angle) * 400;
        return (
          <line
            key={i}
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            stroke="#d4af37"
            strokeWidth="0.5"
          />
        );
      })}
    </svg>
  );
}
