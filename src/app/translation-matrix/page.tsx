import type { Metadata } from "next";
import { TranslationMatrix } from "@/components/matrix/TranslationMatrix";
import { SectionContainer } from "@/components/ui/SectionContainer";
import { GoldText } from "@/components/ui/GoldText";

export const metadata: Metadata = {
  title: "Translation Matrix",
  description:
    "The full seven-by-four matrix of planetary archetypes mapped across Egypt, Greece, Canaan, and Carthage.",
};

export default function TranslationMatrixPage() {
  return (
    <>
      <SectionContainer size="default" spacing="tight">
        <div className="text-ink-tertiary font-mono text-xs uppercase tracking-[0.3em]">
          The seven, the four
        </div>
        <GoldText as="h1" className="mt-4 max-w-3xl text-5xl leading-tight md:text-7xl">
          Translation Matrix
        </GoldText>
        <p className="text-ink-secondary font-body mt-8 max-w-2xl text-lg leading-relaxed md:text-xl">
          Each row is one of the seven classical planets. Each column is one of the four pantheons. Filter by planet or pantheon to isolate a slice. Hover any cell for the planetary archetype and the deity note.
        </p>
      </SectionContainer>

      <SectionContainer size="wide" spacing="tight">
        <TranslationMatrix />
      </SectionContainer>
    </>
  );
}
