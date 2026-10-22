import type { Metadata } from "next";
import type { CSSProperties } from "react";
import Link from "next/link";
import { NaveShell } from "@/components/chrome/NaveShell";
import { NaveHead } from "@/components/chrome/NaveHead";
import { CULTURES, CULTURE_LABELS } from "@/data/cultures";
import { CULTURE_VOICES } from "@/data/cultureVoice";
import { CULTURE_ACCENTS } from "@/data/palettes";

export const metadata: Metadata = {
  title: "The Five Voices",
  description:
    "Egypt, Greece, Canaan, Carthage, and Rome each read the same computed sky through their own theology. Choose the doorway.",
};

export default function VoicesPage() {
  return (
    <NaveShell context="THE FIVE VOICES" active="voices">
      <NaveHead kicker="ONE SKY · FIVE THEOLOGIES">THE FIVE VOICES</NaveHead>

      <p className="mx-auto max-w-[560px] text-center font-body text-prose-m italic leading-prose text-prose">
        Every culture reads the same computed sky. What changes is the theology it must pass
        through.
      </p>

      <div className="mx-auto mt-12 flex max-w-[560px] flex-col">
        {CULTURES.map((culture) => {
          const rowStyle = { "--row-accent": CULTURE_ACCENTS[culture] } as CSSProperties;
          return (
            <Link
              key={culture}
              href={`/voices/${culture}`}
              style={rowStyle}
              className="flex items-baseline gap-4 border-t border-rule px-4 py-5 last:border-b hover:bg-bone/5"
            >
              <span className="h-2 w-2 shrink-0 self-center bg-[var(--row-accent)]" />
              <span className="font-display text-display-xs tracking-[0.14em] text-bone">
                {CULTURE_LABELS[culture].toUpperCase()}
              </span>
              <span className="ml-auto font-mono text-data-xs tracking-data text-dim lowercase">
                {CULTURE_VOICES[culture].institution}
              </span>
            </Link>
          );
        })}
      </div>
    </NaveShell>
  );
}
