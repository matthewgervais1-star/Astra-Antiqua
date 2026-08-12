import type { Metadata } from "next";
import { NaveShell } from "@/components/chrome/NaveShell";
import { CultureGate } from "@/components/chrome/CultureGate";
import { LearnTOC } from "@/components/LearnTOC";
import { AspectGlossary } from "./AspectGlossary";

export const metadata: Metadata = {
  title: "The Aspects, Ruled",
  description:
    "The five aspects Astra Antiqua reads: angles and orbs fixed everywhere, each ruled in the voice of the culture you have chosen.",
};

export default function AspectsGlossaryPage() {
  return (
    <NaveShell context="LEARN · THE ASPECTS" active="learn">
      <CultureGate>
        <AspectGlossary />
      </CultureGate>
      <LearnTOC current="/learn/aspects" />
    </NaveShell>
  );
}
