import type { Metadata } from "next";
import Link from "next/link";
import { SectionContainer } from "@/components/ui/SectionContainer";
import { GoldText } from "@/components/ui/GoldText";
import { GlassPanel } from "@/components/ui/GlassPanel";

export const metadata: Metadata = {
  title: "The Rising Sign",
  description:
    "The rising sign, or Ascendant: the zodiac sign climbing the eastern horizon at your birth. Why it changes every two hours, and how it differs from your planet signs.",
};

const RING_TICKS = Array.from({ length: 12 }, (_, i) => {
  const angle = (i * 30 - 90) * (Math.PI / 180);
  return {
    x: 100 + 80 * Math.cos(angle),
    y: 100 + 80 * Math.sin(angle),
  };
});

/** Stylized diagram: the zodiac ring wheeling past a central Earth, with the
 *  point on the eastern horizon where a new sign rises roughly every two hours. */
function RotatingZodiac() {
  return (
    <svg
      viewBox="0 0 200 200"
      className="mx-auto h-56 w-56"
      aria-label="A diagram of the zodiac ring turning past Earth, marking the eastern horizon where a new sign rises about every two hours."
    >
      <circle cx="100" cy="100" r="80" fill="none" stroke="rgba(212,175,55,0.3)" strokeWidth="1" />
      <circle
        cx="100"
        cy="100"
        r="62"
        fill="none"
        stroke="rgba(212,175,55,0.3)"
        strokeWidth="0.8"
        strokeDasharray="4 5"
      />
      {RING_TICKS.map((t, i) => (
        <circle key={i} cx={t.x} cy={t.y} r="2.4" fill="rgba(244,208,63,0.8)" />
      ))}
      {/* Earth */}
      <circle cx="100" cy="100" r="13" fill="none" stroke="rgba(255,255,255,0.55)" strokeWidth="1" />
      <text x="100" y="103" textAnchor="middle" fill="rgba(255,255,255,0.6)" fontSize="7" fontFamily="ui-monospace, monospace" letterSpacing="1">
        EARTH
      </text>
      {/* Rotation arrowhead on the dashed ring */}
      <path d="M 162 96 l 6 4 l -6 4 z" fill="rgba(244,208,63,0.8)" />
      {/* Eastern horizon, where a sign rises */}
      <g stroke="rgba(244,208,63,0.9)" strokeWidth="1.5" fill="none" strokeLinecap="round">
        <circle cx="20" cy="100" r="4" fill="rgba(244,208,63,0.9)" stroke="none" />
        <path d="M 20 90 l 0 -10 M 15 84 l 5 -5 l 5 5" />
      </g>
      <text x="20" y="122" textAnchor="middle" fill="rgba(212,175,55,0.85)" fontSize="7.5" fontFamily="ui-monospace, monospace" letterSpacing="1.5">
        RISING (EAST)
      </text>
    </svg>
  );
}

export default function RisingSignPage() {
  return (
    <>
      <SectionContainer size="default" spacing="tight">
        <div className="text-ink-tertiary font-mono text-xs uppercase tracking-[0.3em]">
          Learn · the rising sign
        </div>
        <GoldText as="h1" className="mt-4 max-w-4xl text-5xl leading-tight md:text-7xl">
          The rising sign, or Ascendant.
        </GoldText>
        <p className="text-ink-secondary font-body mt-8 max-w-3xl text-lg leading-relaxed md:text-xl">
          The rising sign, or Ascendant, is the zodiac sign that was climbing the eastern horizon at the hour and place you were born. It is the cusp of your First House, and the point from which all your other houses are raised. Where your Sun sign answers &ldquo;what,&rdquo; the rising sign answers &ldquo;how you arrive&rdquo;: the face you lead with, and, some say, the lens you look through.
        </p>
      </SectionContainer>

      <SectionContainer size="default" spacing="default">
        <div className="grid gap-8 md:grid-cols-12 md:gap-12">
          <div className="md:col-span-5">
            <div className="text-ink-tertiary font-mono text-[11px] uppercase tracking-[0.3em]">
              One · it moves fast
            </div>
            <h2 className="font-display text-ink-primary mt-3 text-3xl md:text-4xl">
              It changes every two hours
            </h2>
            <p className="text-ink-secondary font-body mt-4 text-base leading-relaxed md:text-lg">
              Across a day the whole zodiac appears to wheel past the horizon. The signs are not moving around us; the Earth is turning, a full three hundred and sixty degrees every twenty-four hours. Divide that by twelve and a new sign climbs the eastern horizon roughly every two hours. This is why the rising sign needs your birth time, not just your birth date.
            </p>
          </div>
          <div className="md:col-span-7">
            <GlassPanel tone="solid" className="flex items-center justify-center p-6 md:p-8">
              <RotatingZodiac />
            </GlassPanel>
          </div>
        </div>
      </SectionContainer>

      <SectionContainer size="default" spacing="default">
        <div className="grid gap-8 md:grid-cols-12 md:gap-12">
          <div className="md:col-span-5">
            <div className="text-ink-tertiary font-mono text-[11px] uppercase tracking-[0.3em]">
              Two · two motions
            </div>
            <h2 className="font-display text-ink-primary mt-3 text-3xl md:text-4xl">
              The orbit and the spin
            </h2>
          </div>
          <div className="md:col-span-7">
            <p className="text-ink-primary font-body text-base leading-relaxed md:text-lg">
              Two motions happen at once. The Earth orbits the Sun, one full revolution a year. The Earth also rotates on its own axis, one full turn a day.
            </p>
            <p className="text-ink-secondary font-body mt-4 text-base leading-relaxed md:text-lg">
              Your planet signs, your Sun in Scorpio, your Mercury in Aquarius, come from the slow yearly orbit: they say which stretch of the zodiac each planet stood in front of. Your rising sign comes from the fast daily spin: it says which stretch was on your eastern horizon at that exact minute. The first changes over weeks. The second changes every couple of hours.
            </p>
          </div>
        </div>
      </SectionContainer>

      <SectionContainer size="default" spacing="default">
        <div className="grid gap-8 md:grid-cols-12 md:gap-12">
          <div className="md:col-span-5">
            <div className="text-ink-tertiary font-mono text-[11px] uppercase tracking-[0.3em]">
              Three · same hour, far apart
            </div>
            <h2 className="font-display text-ink-primary mt-3 text-3xl md:text-4xl">
              Two births, opposite sides
            </h2>
          </div>
          <div className="md:col-span-7">
            <p className="text-ink-primary font-body text-base leading-relaxed md:text-lg">
              Imagine two people born at the very same instant, but on opposite sides of the Earth. Their planet signs are nearly identical: from either place, the planets sit in front of the same far constellations.
            </p>
            <p className="text-ink-secondary font-body mt-4 text-base leading-relaxed md:text-lg">
              What changes is their horizon, literally what each of them sees to the east. Standing on opposite faces of a turning globe, they look out at different parts of the zodiac. Same charts, different risings. It is the one piece of the chart that is truly local to you.
            </p>
          </div>
        </div>
      </SectionContainer>

      <SectionContainer size="default" spacing="default">
        <div className="border-border-hairline rounded-3xl border bg-gradient-to-br from-[rgba(212,175,55,0.04)] via-transparent to-transparent p-10 md:p-14">
          <h2 className="font-display text-ink-primary max-w-2xl text-3xl md:text-5xl">
            Find your rising sign.
          </h2>
          <p className="text-ink-secondary font-body mt-4 max-w-xl text-base md:text-lg">
            Because it turns on the minute and the place, you need your birth time and city. Enter them and the Ascendant, and the twelve houses raised from it, will be computed for the exact moment you arrived.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/reading"
              className="border-gold-soft text-gold-leaf hover:bg-gold-leaf/10 inline-flex items-center gap-2 rounded-full border px-6 py-3 text-sm uppercase tracking-[0.2em] transition-colors"
            >
              Cast your chart →
            </Link>
            <Link
              href="/learn"
              className="border-hairline text-ink-secondary hover:text-ink-primary hover:border-gold-soft inline-flex items-center gap-2 rounded-full border px-6 py-3 text-sm uppercase tracking-[0.2em] transition-colors"
            >
              Back to Learn
            </Link>
          </div>
        </div>
      </SectionContainer>
    </>
  );
}
