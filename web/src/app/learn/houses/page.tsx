import type { Metadata } from "next";
import Link from "next/link";
import { HOUSE_MEANINGS } from "@/data/houses";
import { NaveShell } from "@/components/chrome/NaveShell";
import { NaveHead } from "@/components/chrome/NaveHead";
import { LearnTOC } from "@/components/LearnTOC";

export const metadata: Metadata = {
  title: "The Houses",
  description:
    "The twelve houses are the fields of life a chart is divided into, raised from the Ascendant. Each governs a different department: body, money, kin, home, work, partnership, and the rest.",
};

export default function HousesLearnPage() {
  return (
    <NaveShell context="LEARN · THE HOUSES" active="learn">
      <NaveHead kicker="LEARN · 4 OF 7">THE TWELVE HOUSES</NaveHead>

      <p className="mx-auto max-w-[560px] text-center font-body text-prose-m leading-prose text-prose">
        If the signs are how a planet acts and the planets are what is acting, the houses are
        where it acts. They are the twelve fields of life, raised from the sign rising at your
        birth: the body, what you own, kin, home, pleasure, work, partnership, and so on around
        the wheel. A planet&rsquo;s house tells you which corner of your life its force is spent
        in.
      </p>

      <div className="mt-14 flex flex-col">
        {HOUSE_MEANINGS.map((h) => (
          <div
            key={h.house}
            className="border-t border-rule-row py-5 last:border-b"
          >
            <div className="flex flex-wrap items-baseline justify-between gap-3">
              <div className="font-display text-[17px] tracking-[0.05em] text-bone">
                {h.ordinal.toUpperCase()} HOUSE
                <span className="ml-3 font-body text-prose-s italic text-prose">{h.title}</span>
              </div>
              <div className="font-mono text-data-xs tracking-label text-dim">
                HOUSE {h.house}
              </div>
            </div>
            <p className="mt-2 font-body text-prose-s leading-prose text-prose">{h.domain}</p>
          </div>
        ))}
      </div>

      <p className="mt-8 font-body text-prose-s leading-prose text-dim">
        Astra Antiqua raises these with whole-sign houses, where the rising sign becomes the
        entire First House and each sign after it the next. For how that compares to other
        methods, see{" "}
        <Link href="/learn/house-systems" className="text-accent hover:underline">
          house systems
        </Link>
        .
      </p>

      <LearnTOC current="/learn/houses" />
    </NaveShell>
  );
}
