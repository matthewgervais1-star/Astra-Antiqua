import type { Metadata } from "next";
import Link from "next/link";
import { SectionContainer } from "@/components/ui/SectionContainer";
import { GoldText } from "@/components/ui/GoldText";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { LearnTOC } from "@/components/LearnTOC";

export const metadata: Metadata = {
  title: "House Systems",
  description:
    "There is more than one way to divide the sky into twelve houses. Whole-sign, Placidus, and Porphyry compared, and why Astra Antiqua uses the ancient whole-sign system.",
};

const SYSTEMS = [
  {
    name: "Whole Sign",
    age: "About 2,100 years old",
    body: "The oldest method, and the one Hellenistic astrologers used for roughly a thousand years. The entire sign rising on the Ascendant becomes the First House; the next sign is the Second, and so on. Every house is exactly thirty degrees. It is simple to compute, and quirks like intercepted signs cannot occur.",
    ours: true,
  },
  {
    name: "Placidus",
    age: "Renaissance, most popular today",
    body: "A time-based method. The cusps are marked in two-hour steps from your birth: the degree rising at birth is the First House cusp, then where that degree has moved about two hours later is the next, and so on. Because signs spend unequal time on the horizon, the houses come out unequal, more so the farther from the equator you were born.",
    ours: false,
  },
  {
    name: "Porphyry",
    age: "Third century, angle-led",
    body: "Prioritizes the four angles. The Ascendant and Midheaven are computed exactly and become the First and Tenth cusps; the arc between each pair of angles is then split into three equal parts for the houses in between. A middle path between equal and time-based systems.",
    ours: false,
  },
];

export default function HouseSystemsPage() {
  return (
    <>
      <SectionContainer size="default" spacing="tight">
        <div className="text-ink-tertiary font-mono text-xs uppercase tracking-[0.3em]">
          Learn · house systems
        </div>
        <GoldText as="h1" className="mt-4 max-w-4xl text-5xl leading-tight md:text-7xl">
          House systems
        </GoldText>
        <p className="text-ink-secondary font-body mt-8 max-w-3xl text-lg leading-relaxed md:text-xl">
          Everyone agrees on where the planets are. Astrologers do not always agree on how to slice the sky into twelve houses. The planet positions stay the same; the house a planet lands in can shift depending on the method. Here are the three you are most likely to meet.
        </p>
      </SectionContainer>

      <SectionContainer size="default" spacing="tight">
        <div className="flex flex-col gap-4">
          {SYSTEMS.map((s) => (
            <GlassPanel
              key={s.name}
              tone="solid"
              className={s.ours ? "border-gold-soft border p-6 md:p-7" : "p-6 md:p-7"}
            >
              <div className="flex flex-wrap items-baseline justify-between gap-3">
                <h2 className="font-display text-gold-leaf text-2xl md:text-3xl">
                  {s.name}
                </h2>
                <div className="text-ink-tertiary font-mono text-[10px] uppercase tracking-[0.25em]">
                  {s.age}
                </div>
              </div>
              {s.ours ? (
                <div className="text-gold-leaf font-mono mt-2 text-[10px] uppercase tracking-[0.3em]">
                  What Astra Antiqua uses
                </div>
              ) : null}
              <p className="text-ink-secondary font-body mt-3 text-base leading-relaxed md:text-lg">
                {s.body}
              </p>
            </GlassPanel>
          ))}
        </div>
      </SectionContainer>

      <SectionContainer size="default" spacing="default">
        <div className="grid gap-8 md:grid-cols-12 md:gap-12">
          <div className="md:col-span-5">
            <div className="text-ink-tertiary font-mono text-[11px] uppercase tracking-[0.3em]">
              Our choice
            </div>
            <h2 className="font-display text-ink-primary mt-3 text-3xl md:text-4xl">
              Why we use whole-sign
            </h2>
          </div>
          <div className="md:col-span-7">
            <p className="text-ink-primary font-body text-base leading-relaxed md:text-lg">
              For an app that reads the sky the way the ancients did, whole-sign is the honest choice: it is the system the Hellenistic astrologers actually used, the one Egypt, Greece, Canaan, Carthage, and Rome would all recognize.
            </p>
            <p className="text-ink-secondary font-body mt-4 text-base leading-relaxed md:text-lg">
              It also fails gracefully. The time-based systems need your birth minute to be exact; a half-hour error can push a planet into the wrong house. Whole-sign only needs the rising sign, so an approximate birth time still gives a sound chart. Real ancient method, and steadier when the records are imperfect.
            </p>
            <Link
              href="/reading"
              className="border-gold-soft text-gold-leaf hover:bg-gold-leaf/10 mt-6 inline-flex items-center gap-2 rounded-full border px-5 py-3 text-xs uppercase tracking-[0.2em] transition-colors"
            >
              See your houses →
            </Link>
          </div>
        </div>
      </SectionContainer>

      <LearnTOC current="/learn/house-systems" />
    </>
  );
}
