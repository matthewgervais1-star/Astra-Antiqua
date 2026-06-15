import type { Metadata } from "next";
import Link from "next/link";
import { SectionContainer } from "@/components/ui/SectionContainer";
import { GoldText } from "@/components/ui/GoldText";
import { InterpretiveNote } from "@/components/pantheon/InterpretiveNote";
import {
  METHODOLOGY_SECTIONS,
  INTERPRETIVE_NOTES,
  SOURCES,
} from "@/data/methodologyContent";

export const metadata: Metadata = {
  title: "Methodology",
  description:
    "How Astra Antiqua maps the seven classical planets onto the religious frameworks of Egypt, Greece, Canaan, Carthage, and Rome. Sources, interpretive choices, and the cases where the evidence is contested.",
};

export default function MethodologyPage() {
  return (
    <>
      <SectionContainer size="default" spacing="tight">
        <div className="text-ink-tertiary font-mono text-xs uppercase tracking-[0.3em]">
          On method
        </div>
        <GoldText as="h1" className="mt-4 max-w-3xl text-5xl leading-tight md:text-7xl">
          The mapping is the work.
        </GoldText>
        <p className="text-ink-secondary font-body mt-8 max-w-2xl text-lg leading-relaxed md:text-xl">
          Astra Antiqua performs standard astronomical ephemeris and then translates the result into the voice of an ancient tradition. The translation has to be defensible. This page documents how it is done, where the evidence is strong, and where we have made interpretive choices that a specialist might dispute.
        </p>
      </SectionContainer>

      <SectionContainer size="default" spacing="tight">
        <div className="space-y-16 md:space-y-20">
          {METHODOLOGY_SECTIONS.map((section, idx) => (
            <article key={section.heading} className="grid gap-6 md:grid-cols-12">
              <div className="md:col-span-3">
                <div className="text-gold-leaf font-mono text-[11px] uppercase tracking-[0.3em]">
                  {String(idx + 1).padStart(2, "0")}
                </div>
                <h2 className="font-display text-ink-primary mt-3 text-2xl md:text-[32px]">
                  {section.heading}
                </h2>
              </div>
              <div className="md:col-span-8 md:col-start-5">
                <div className="text-ink-primary font-body space-y-5 text-lg leading-relaxed md:text-xl">
                  {section.paragraphs.map((p, pIdx) => (
                    <p key={pIdx}>{p}</p>
                  ))}
                </div>
              </div>
            </article>
          ))}
        </div>
      </SectionContainer>

      <SectionContainer size="default" spacing="default">
        <div className="mb-12 grid gap-6 md:grid-cols-12">
          <div className="md:col-span-3">
            <div className="text-gold-leaf font-mono text-[11px] uppercase tracking-[0.3em]">
              {String(METHODOLOGY_SECTIONS.length + 1).padStart(2, "0")}
            </div>
            <h2 className="font-display text-ink-primary mt-3 text-2xl md:text-[32px]">
              Where we made interpretive choices
            </h2>
          </div>
          <p className="text-ink-secondary font-body md:col-span-8 md:col-start-5 text-lg leading-relaxed md:text-xl">
            The four cases below involve reconstructive identifications. A specialist could reasonably argue different choices in each. We document the reasoning so the choice is visible rather than hidden behind a clean-looking translation table.
          </p>
        </div>
        <div className="grid gap-5 md:grid-cols-2">
          {INTERPRETIVE_NOTES.map((note) => (
            <InterpretiveNote key={note.id} title={note.title}>
              {note.body}
            </InterpretiveNote>
          ))}
        </div>
      </SectionContainer>

      <SectionContainer size="default" spacing="default">
        <div className="grid gap-6 md:grid-cols-12">
          <div className="md:col-span-3">
            <div className="text-gold-leaf font-mono text-[11px] uppercase tracking-[0.3em]">
              {String(METHODOLOGY_SECTIONS.length + 2).padStart(2, "0")}
            </div>
            <h2 className="font-display text-ink-primary mt-3 text-2xl md:text-[32px]">
              Sources
            </h2>
            <p className="text-ink-tertiary font-body mt-4 text-base">
              Standard works consulted in the construction of the translation matrix and the interpretive copy.
            </p>
          </div>
          <ul className="md:col-span-8 md:col-start-5 space-y-6">
            {SOURCES.map((source) => (
              <li
                key={source.title}
                className="border-border-hairline border-l pl-5"
              >
                <div className="font-display text-ink-primary text-xl md:text-2xl">
                  {source.title}
                </div>
                <div className="text-gold-leaf font-mono mt-1 text-[11px] uppercase tracking-[0.25em]">
                  {source.author}
                </div>
                <p className="text-ink-secondary font-body mt-2 text-base leading-relaxed md:text-lg">
                  {source.detail}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </SectionContainer>

      <SectionContainer size="default" spacing="tight">
        <div className="border-border-hairline border-t pt-10">
          <p className="text-ink-tertiary font-body text-base md:text-lg">
            For the per-pantheon discussion of each tradition, see{" "}
            <Link href="/pantheon/egypt" className="text-gold-leaf underline-offset-4 hover:underline">
              Egypt
            </Link>
            ,{" "}
            <Link href="/pantheon/greece" className="text-gold-leaf underline-offset-4 hover:underline">
              Greece
            </Link>
            ,{" "}
            <Link href="/pantheon/canaan" className="text-gold-leaf underline-offset-4 hover:underline">
              Canaan
            </Link>
            , and{" "}
            <Link href="/pantheon/carthage" className="text-gold-leaf underline-offset-4 hover:underline">
              Carthage
            </Link>
            .
          </p>
        </div>
      </SectionContainer>
    </>
  );
}
