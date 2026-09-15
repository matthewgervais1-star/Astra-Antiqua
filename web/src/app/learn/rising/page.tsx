import type { Metadata } from "next";
import Link from "next/link";
import { NaveShell } from "@/components/chrome/NaveShell";
import { NaveHead } from "@/components/chrome/NaveHead";
import { SectionDivider } from "@/components/chrome/SectionDivider";
import { LearnTOC } from "@/components/LearnTOC";

export const metadata: Metadata = {
  title: "The Rising Sign",
  description:
    "The rising sign, or Ascendant: the zodiac sign climbing the eastern horizon at your birth. Why it changes every two hours, and how it differs from your planet signs.",
};

export default function RisingSignPage() {
  return (
    <NaveShell context="LEARN · THE RISING SIGN" active="learn">
      <NaveHead kicker="LEARN · 3 OF 7">THE RISING SIGN, OR ASCENDANT</NaveHead>

      <p className="mx-auto max-w-[560px] text-center font-body text-prose-m leading-prose text-prose">
        The rising sign, or Ascendant, is the zodiac sign that was climbing the eastern horizon
        at the hour and place you were born. It is the cusp of your First House, and the point
        from which all your other houses are raised. Where your Sun sign answers &ldquo;what,&rdquo;
        the rising sign answers &ldquo;how you arrive&rdquo;: the face you lead with.
      </p>

      <div className="mt-16 flex flex-col gap-5">
        <SectionDivider label="ONE · IT MOVES FAST" />
        <h2 className="text-center font-display text-display-m tracking-display text-bone">
          It changes every two hours
        </h2>
        <p className="font-body text-prose-m leading-prose text-prose">
          Across a day the whole zodiac appears to wheel past the horizon. The signs are not
          moving around us; the Earth is turning, a full three hundred and sixty degrees every
          twenty-four hours. Divide that by twelve and a new sign climbs the eastern horizon
          roughly every two hours. This is why the rising sign needs your birth time, not just
          your birth date.
        </p>
      </div>

      <div className="mt-16 flex flex-col gap-5">
        <SectionDivider label="TWO · TWO MOTIONS" />
        <h2 className="text-center font-display text-display-m tracking-display text-bone">
          The orbit and the spin
        </h2>
        <p className="font-body text-prose-m leading-prose text-prose">
          Two motions happen at once. The Earth orbits the Sun, one full revolution a year. The
          Earth also rotates on its own axis, one full turn a day.
        </p>
        <p className="font-body text-prose-m leading-prose text-prose">
          Your planet signs, your Sun in Scorpio, your Mercury in Aquarius, come from the slow
          yearly orbit: they say which stretch of the zodiac each planet stood in front of. Your
          rising sign comes from the fast daily spin: it says which stretch was on your eastern
          horizon at that exact minute. The first changes over weeks. The second changes every
          couple of hours.
        </p>
      </div>

      <div className="mt-16 flex flex-col gap-5">
        <SectionDivider label="THREE · SAME HOUR, FAR APART" />
        <h2 className="text-center font-display text-display-m tracking-display text-bone">
          Two births, opposite sides
        </h2>
        <p className="font-body text-prose-m leading-prose text-prose">
          Imagine two people born at the very same instant, but on opposite sides of the Earth.
          Their planet signs are nearly identical: from either place, the planets sit in front of
          the same far constellations.
        </p>
        <p className="font-body text-prose-m leading-prose text-prose">
          What changes is their horizon, literally what each of them sees to the east. Standing
          on opposite faces of a turning globe, they look out at different parts of the zodiac.
          Same charts, different risings. It is the one piece of the chart that is truly local to
          you.
        </p>
      </div>

      <div className="mt-16 border border-rule px-6 py-10 text-center">
        <h2 className="font-display text-display-m tracking-display text-bone">
          Find your rising sign.
        </h2>
        <p className="mx-auto mt-4 max-w-[440px] font-body text-prose-m leading-prose text-prose">
          Because it turns on the minute and the place, you need your birth time and city. Enter
          them and the Ascendant, and the twelve houses raised from it, will be computed for the
          exact moment you arrived.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-4 font-mono text-data-xs tracking-microcopy">
          <Link href="/reading" className="border border-[var(--accent-strong-border)] px-5 py-3 text-accent">
            CAST YOUR CHART →
          </Link>
          <Link href="/learn" className="border border-rule px-5 py-3 text-dim hover:text-bone">
            BACK TO LEARN
          </Link>
        </div>
      </div>

      <LearnTOC current="/learn/rising" />
    </NaveShell>
  );
}
