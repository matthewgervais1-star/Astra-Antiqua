"use client";

import { useEffect } from "react";
import Link from "next/link";
import { SectionContainer } from "@/components/ui/SectionContainer";
import { GoldText } from "@/components/ui/GoldText";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Surface to the console for diagnosis; never shown raw to the user.
    console.error(error);
  }, [error]);

  return (
    <SectionContainer size="default" spacing="default">
      <div className="text-ink-tertiary font-mono text-xs uppercase tracking-[0.3em]">
        Something broke
      </div>
      <GoldText as="h1" className="mt-4 max-w-3xl text-4xl leading-tight md:text-6xl">
        The reading could not be drawn.
      </GoldText>
      <p className="text-ink-secondary font-body mt-6 max-w-xl text-lg leading-relaxed">
        An unexpected error interrupted this page. Your saved charts are untouched. Try again, or head back home.
      </p>
      <div className="mt-8 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={reset}
          className="border-gold-soft text-gold-leaf hover:bg-gold-leaf/10 inline-flex items-center gap-2 rounded-full border px-6 py-3 text-sm uppercase tracking-[0.2em] transition-colors"
        >
          Try again
        </button>
        <Link
          href="/"
          className="border-hairline text-ink-secondary hover:text-ink-primary hover:border-gold-soft inline-flex items-center gap-2 rounded-full border px-6 py-3 text-sm uppercase tracking-[0.2em] transition-colors"
        >
          Home
        </Link>
      </div>
    </SectionContainer>
  );
}
