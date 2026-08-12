import type { Metadata } from "next";
import { NaveShell } from "@/components/chrome/NaveShell";
import { CultureGate } from "@/components/chrome/CultureGate";
import { TransitsIndex } from "@/components/transits/TransitsIndex";

export const metadata: Metadata = {
  title: "The Long Transits",
  description: "Every passage of the slow bodies against your own chart, active now or still ahead.",
};

/**
 * The long-transit index: NaveShell chassis, CultureGate for the culture
 * chooser, ACTIVE NOW / AHEAD lists of every span computed against the
 * reader's saved chart. No horizon control: this route sits outside the
 * D/W/S/Y nav, so the Lintel highlights TODAY per the plan's contract.
 */
export default function TransitsPage() {
  return (
    <NaveShell context="THE LONG TRANSITS" active="today">
      <CultureGate>
        <TransitsIndex />
      </CultureGate>
    </NaveShell>
  );
}
