import type { Metadata } from "next";
import Link from "next/link";
import { HOUSE_MEANINGS } from "@/data/houses";
import { SectionContainer } from "@/components/ui/SectionContainer";
import { GoldText } from "@/components/ui/GoldText";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { LearnTOC } from "@/components/LearnTOC";

export const metadata: Metadata = {
  title: "The Houses",
  description:
    "The twelve houses are the fields of life a chart is divided into, raised from the Ascendant. Each governs a different department: body, money, kin, home, work, partnership, and the rest.",
};

export default function HousesLearnPage() {
  return (
    <>
      <SectionContainer size="default" spacing="tight">
        <div className="text-ink-tertiary font-mono text-xs uppercase tracking-[0.3em]">
          Learn · the houses
        </div>
        <GoldText as="h1" className="mt-4 max-w-4xl text-5xl leading-tight md:text-7xl">
          The twelve houses
        </GoldText>
        <p className="text-ink-secondary font-body mt-8 max-w-3xl text-lg leading-relaxed md:text-xl">
          If the signs are how a planet acts and the planets are what is acting, the houses are where it acts. They are the twelve fields of life, raised from the sign rising at your birth: the body, what you own, kin, home, pleasure, work, partnership, and so on around the wheel. A planet&rsquo;s house tells you which corner of your life its force is spent in.
        </p>
      </SectionContainer>

      <SectionContainer size="default" spacing="tight">
        <div className="grid gap-4 md:grid-cols-2">
          {HOUSE_MEANINGS.map((h) => (
            <GlassPanel key={h.house} tone="solid" className="p-5 md:p-6">
              <div className="flex items-baseline justify-between gap-3">
                <div className="font-display text-gold-leaf text-xl">
                  {h.ordinal} House
                  <span className="text-ink-secondary font-body ml-2 text-base italic">
                    {h.title}
                  </span>
                </div>
                <div className="text-ink-tertiary font-mono shrink-0 text-[10px] uppercase tracking-[0.2em]">
                  {h.house}
                </div>
              </div>
              <p className="text-ink-secondary font-body mt-2 text-sm leading-relaxed">
                {h.domain}
              </p>
            </GlassPanel>
          ))}
        </div>
        <p className="text-ink-tertiary font-body mt-6 max-w-2xl text-sm leading-relaxed md:text-base">
          Astra Antiqua raises these with whole-sign houses, where the rising sign becomes the entire First House and each sign after it the next. For how that compares to other methods, see{" "}
          <Link href="/learn/house-systems" className="text-gold-leaf underline-offset-4 hover:underline">
            house systems
          </Link>
          .
        </p>
      </SectionContainer>

      <LearnTOC current="/learn/houses" />
    </>
  );
}
