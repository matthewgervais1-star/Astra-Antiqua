import type { Metadata } from "next";
import Link from "next/link";
import { NaveShell } from "@/components/chrome/NaveShell";
import { NaveHead } from "@/components/chrome/NaveHead";
import { SectionDivider } from "@/components/chrome/SectionDivider";
import { LearnTOC } from "@/components/LearnTOC";
import { cn } from "@/lib/classNames";

export const metadata: Metadata = {
  title: "House Systems",
  description:
    "There is more than one way to divide the sky into twelve houses. Whole-sign, Placidus, and Porphyry compared, and why Astra Antiqua uses the ancient whole-sign system.",
};

const SYSTEMS: ReadonlyArray<{ name: string; age: string; body: string; ours: boolean }> = [
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
    <NaveShell context="LEARN · HOUSE SYSTEMS" active="learn">
      <NaveHead kicker="LEARN · 5 OF 7">HOUSE SYSTEMS</NaveHead>

      <p className="mx-auto max-w-[560px] text-center font-body text-[17px] leading-[1.75] text-prose">
        Everyone agrees on where the planets are. Astrologers do not always agree on how to slice
        the sky into twelve houses. The planet positions stay the same; the house a planet lands
        in can shift depending on the method. Here are the three you are most likely to meet.
      </p>

      <div className="mt-14 flex flex-col">
        {SYSTEMS.map((s) => (
          <div
            key={s.name}
            className={cn(
              "border-t border-rule-row py-6 last:border-b",
              s.ours && "border-l-2 border-l-[var(--accent)] pl-4",
            )}
          >
            <div className="flex flex-wrap items-baseline justify-between gap-3">
              <h2 className="font-display text-[19px] tracking-[0.05em] text-bone">
                {s.name.toUpperCase()}
              </h2>
              <div className="font-mono text-[11px] tracking-[0.14em] text-dim">
                {s.age.toUpperCase()}
              </div>
            </div>
            {s.ours ? (
              <div className="mt-2 font-mono text-[11px] tracking-[0.2em] text-[var(--accent)]">
                WHAT ASTRA ANTIQUA USES
              </div>
            ) : null}
            <p className="mt-3 font-body text-[15px] leading-[1.7] text-prose">{s.body}</p>
          </div>
        ))}
      </div>

      <div className="mt-16 flex flex-col gap-5">
        <SectionDivider label="OUR CHOICE" />
        <h2 className="text-center font-display text-[24px] tracking-[0.05em] text-bone">
          Why we use whole-sign
        </h2>
        <p className="font-body text-[16px] leading-[1.75] text-prose">
          For an app that reads the sky the way the ancients did, whole-sign is the honest
          choice: it is the system the Hellenistic astrologers actually used, the one Egypt,
          Greece, Canaan, Carthage, and Rome would all recognize.
        </p>
        <p className="font-body text-[16px] leading-[1.75] text-prose">
          It also fails gracefully. The time-based systems need your birth minute to be exact; a
          half-hour error can push a planet into the wrong house. Whole-sign only needs the
          rising sign, so an approximate birth time still gives a sound chart. Real ancient
          method, and steadier when the records are imperfect.
        </p>
        <Link
          href="/reading"
          className="mx-auto border border-[var(--accent-strong-border)] px-5 py-3 font-mono text-[11px] tracking-[0.2em] text-[var(--accent)]"
        >
          SEE YOUR HOUSES →
        </Link>
      </div>

      <LearnTOC current="/learn/house-systems" />
    </NaveShell>
  );
}
