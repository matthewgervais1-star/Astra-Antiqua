"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CULTURES, CULTURE_LABELS, type Culture } from "@/data/cultures";
import { CULTURE_VOICES } from "@/data/cultureVoice";
import { accentFor } from "@/data/palettes";
import { readPersistedPantheon, writePersistedPantheon } from "@/lib/pantheonPreference";
import { markOnboardingSeen } from "@/lib/onboarding";
import { cn } from "@/lib/classNames";
import { WelcomeHeader } from "@/components/welcome/WelcomeHeader";
import { BirthDetailsStep } from "@/components/welcome/BirthDetailsStep";
import { AccountStep } from "@/components/welcome/AccountStep";

/**
 * The whole /welcome funnel: three steps, all but the first skippable.
 * Neutral ground, no CultureGate (this route decides the culture, it does
 * not presume one). Step I persists the choice as soon as a row is picked,
 * matching the header chip's own persist-on-select behavior elsewhere.
 */
export function WelcomeExperience() {
  const [picked, setPicked] = useState<Culture | null>(null);

  useEffect(() => {
    markOnboardingSeen();
    const persisted = readPersistedPantheon();
    if (persisted) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setPicked(persisted);
    }
  }, []);

  const choose = (culture: Culture) => {
    setPicked(culture);
    writePersistedPantheon(culture);
  };

  return (
    <div className="mx-auto flex min-h-dvh max-w-[430px] flex-col">
      <WelcomeHeader />
      <main className="flex-1 px-5 py-8">
        <div className="text-center font-mono text-[11px] tracking-[0.18em] text-dim">
          I OF III · CHOOSE YOUR DOORWAY
        </div>
        <p className="mx-auto mt-4 max-w-[360px] text-center font-body text-[14.5px] leading-[1.65] text-prose">
          One sky is computed. Five ancient cultures read it, each in its own theology. Choose
          yours: the whole site renders in that culture’s voice until you change it.
        </p>

        <div className="mt-5 flex flex-col gap-[9px]">
          {CULTURES.map((c) => {
            const isSelected = c === picked;
            const accent = accentFor(c);
            return (
              <button
                key={c}
                type="button"
                onClick={() => choose(c)}
                aria-pressed={isSelected}
                style={isSelected ? { borderColor: accent } : undefined}
                className={cn(
                  "flex items-baseline gap-[10px] border px-4 py-[14px] text-left",
                  isSelected ? "" : "border-rule",
                )}
              >
                <span
                  aria-hidden
                  className="h-2 w-2 shrink-0 self-center"
                  style={{ backgroundColor: accent }}
                />
                <span
                  className="font-display text-[12.5px] tracking-[0.12em]"
                  style={isSelected ? { color: accent } : undefined}
                >
                  {CULTURE_LABELS[c].toUpperCase()}
                </span>
                <span className="ml-auto font-mono text-[11px] text-dim">
                  {CULTURE_VOICES[c].institution.toLowerCase()}
                </span>
              </button>
            );
          })}
        </div>

        {picked ? (
          <Link
            href={`/?culture=${picked}`}
            className="mt-5 block border border-[var(--accent)] py-[15px] text-center font-display text-[12px] tracking-[0.2em] text-[var(--accent)] hover:bg-bone/5"
          >
            READ TODAY’S SKY
          </Link>
        ) : (
          <span
            aria-disabled="true"
            className="mt-5 block cursor-not-allowed border border-rule py-[15px] text-center font-display text-[12px] tracking-[0.2em] text-faint-ink"
          >
            READ TODAY’S SKY
          </span>
        )}

        <div className="mt-3 text-center font-mono text-[11px] leading-[1.7] tracking-[0.08em] text-dim">
          NO ACCOUNT NEEDED · BIRTH DETAILS OPTIONAL, STEP II
          <br />
          AN ACCOUNT ADDS SYNC ONLY, STEP III ·{" "}
          <Link
            href="/"
            className="text-bone underline decoration-dotted underline-offset-4 hover:text-[var(--accent)]"
          >
            SKIP ALL
          </Link>
        </div>

        <BirthDetailsStep />
        <AccountStep />
      </main>
    </div>
  );
}
