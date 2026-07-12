"use client";

import { Suspense, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { GoldText } from "@/components/ui/GoldText";
import { SectionContainer } from "@/components/ui/SectionContainer";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { PantheonSelector } from "@/components/pantheon/PantheonSelector";
import { isSafeNextPath } from "@/lib/auth/nextPath";
import { markOnboardingSeen } from "@/lib/onboarding";

function OnboardingFlowImpl() {
  const searchParams = useSearchParams();
  // Carry the visitor's original destination through sign-up/sign-in so they
  // land back where they were headed once their account exists.
  const next = searchParams.get("next");
  const authQuery = next ? `?next=${encodeURIComponent(next)}` : "";

  useEffect(() => {
    markOnboardingSeen();
  }, []);

  return (
    <SectionContainer size="narrow" spacing="default">
      <div className="text-ink-tertiary font-mono text-xs uppercase tracking-[0.3em]">
        Welcome
      </div>
      <GoldText as="h1" className="mt-4 text-4xl md:text-5xl leading-tight">
        Astra Antiqua
      </GoldText>
      <p className="text-ink-secondary mt-4 max-w-xl text-base md:text-lg">
        A personal astrology reading app that places the sky in the voice of
        ancient pantheons. Create and save readings, charts, and collections to
        return to later on any device.
      </p>

      <div className="mt-8 grid gap-6 md:grid-cols-2">
        <GlassPanel tone="solid" className="p-6">
          <h3 className="font-display text-2xl text-ink-primary">Create an account</h3>
          <p className="text-ink-secondary mt-3 text-sm">
            Keep your charts across devices and sessions. Any charts you saved
            while anonymous will be uploaded on first sign-up.
          </p>
          <div className="mt-6 flex gap-3">
            <Link
              href={`/sign-up${authQuery}`}
              className="border-gold-soft text-gold-leaf inline-flex items-center gap-2 rounded-full border px-4 py-2 text-[13px] uppercase tracking-[0.2em]"
            >
              Sign up
            </Link>
            <Link
              href={`/sign-in${authQuery}`}
              className="border-hairline text-ink-secondary inline-flex items-center gap-2 rounded-full border px-4 py-2 text-[13px] uppercase tracking-[0.2em]"
            >
              Sign in
            </Link>
          </div>
        </GlassPanel>

        <GlassPanel tone="glass" className="p-6">
          <h3 className="font-display text-2xl text-ink-primary">Try it without an account</h3>
          <p className="text-ink-secondary mt-3 text-sm">
            Explore your chart and the pantheon voices without creating an
            account. Your work will remain local until you sign up.
          </p>
          <div className="mt-6">
            <Link
              href={next && isSafeNextPath(next) ? next : "/reading"}
              className="border-hairline text-ink-secondary inline-flex items-center gap-2 rounded-full border px-4 py-2 text-[13px] uppercase tracking-[0.2em]"
            >
              Continue without an account
            </Link>
          </div>
        </GlassPanel>
      </div>

      <div className="mt-10">
        <div className="text-ink-tertiary font-mono text-[11px] uppercase tracking-[0.3em]">Choose a pantheon</div>
        <div className="mt-4">
          <PantheonSelector mode="filter" />
        </div>
      </div>
    </SectionContainer>
  );
}

export function OnboardingFlow() {
  return (
    <Suspense
      fallback={
        <SectionContainer size="narrow" spacing="default">
          <div className="text-ink-tertiary font-mono text-xs uppercase tracking-[0.3em]">
            Welcome
          </div>
        </SectionContainer>
      }
    >
      <OnboardingFlowImpl />
    </Suspense>
  );
}
