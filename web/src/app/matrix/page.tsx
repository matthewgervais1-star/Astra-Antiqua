import type { Metadata } from "next";
import { NaveShell } from "@/components/chrome/NaveShell";
import { NaveHead } from "@/components/chrome/NaveHead";
import { TranslationMatrix } from "@/components/matrix/TranslationMatrix";

export const metadata: Metadata = {
  title: "The Translation Matrix",
  description:
    "Ten bodies across five ancient theologies, seated side by side. The gold rule marks where the ancient lists end.",
};

export default function MatrixPage() {
  return (
    <NaveShell context="THE TRANSLATION MATRIX">
      <NaveHead kicker="ONE SKY · FIVE THEOLOGIES">THE TRANSLATION MATRIX</NaveHead>
      <TranslationMatrix />
    </NaveShell>
  );
}
