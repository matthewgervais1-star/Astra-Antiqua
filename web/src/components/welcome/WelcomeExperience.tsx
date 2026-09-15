"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { Culture } from "@/data/cultures";
import { readPersistedPantheon, writePersistedPantheon } from "@/lib/pantheonPreference";
import { markOnboardingSeen } from "@/lib/onboarding";
import { Button } from "@/components/chrome/Button";
import { CultureSwitch } from "@/components/chrome/CultureSwitch";
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
        <div className="text-center font-mono text-data-xs tracking-microcopy text-dim">
          I OF III · CHOOSE YOUR DOORWAY
        </div>
        <p className="mx-auto mt-4 max-w-[360px] text-center font-body text-prose-s leading-prose text-prose">
          One sky is computed. Five ancient cultures read it, each in its own theology. Choose
          yours: the whole site renders in that culture’s voice until you change it.
        </p>

        <div className="mt-5">
          <CultureSwitch value={picked} onChange={choose} />
        </div>

        {picked ? (
          <Button href={`/?culture=${picked}`} variant="votive" block className="mt-5">
            READ TODAY’S SKY
          </Button>
        ) : (
          <Button block disabled className="mt-5">
            READ TODAY’S SKY
          </Button>
        )}

        <div className="mt-3 text-center font-mono text-data-xs leading-data tracking-data text-dim">
          NO ACCOUNT NEEDED · BIRTH DETAILS OPTIONAL, STEP II
          <br />
          AN ACCOUNT ADDS SYNC ONLY, STEP III ·{" "}
          <Link
            href="/"
            className="text-prose underline decoration-dotted underline-offset-4 hover:text-bone"
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
