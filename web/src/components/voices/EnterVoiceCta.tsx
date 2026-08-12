"use client";

import { useRouter } from "next/navigation";
import type { Culture } from "@/data/cultures";
import { writePersistedPantheon } from "@/lib/pantheonPreference";

export interface EnterVoiceCtaProps {
  culture: Culture;
  label: string;
}

/** Sets the persisted culture and enters the day's reading in that voice. */
export function EnterVoiceCta({ culture, label }: EnterVoiceCtaProps) {
  const router = useRouter();

  const enter = () => {
    writePersistedPantheon(culture);
    router.push(`/?culture=${culture}`);
  };

  return (
    <button
      type="button"
      onClick={enter}
      className="mx-auto block w-full max-w-[460px] border border-[var(--accent-strong-border)] px-6 py-4 text-center font-display text-[13px] tracking-[0.2em] text-[var(--accent)] transition-colors hover:bg-bone/5"
    >
      {label}
    </button>
  );
}
