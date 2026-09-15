"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/chrome/Button";
import { Monogram } from "@/components/chrome/Monogram";

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

  const code = error.digest ?? "EPH-000";

  return (
    <div className="mx-auto flex max-w-[560px] flex-col items-center px-5 py-24 text-center">
      <Monogram height={56} className="mb-[var(--space-4)] text-bone" />
      <div className="font-mono text-data-xs tracking-microcopy text-conflict">
        THE COMPUTATION FAILED
      </div>
      <div className="my-[var(--space-3)] h-px w-11 bg-conflict" />
      <h1 className="font-display text-display-s leading-display tracking-display text-bone">
        THE OMEN IS ILLEGIBLE
      </h1>
      <p className="mx-auto mt-3 max-w-[360px] font-body text-prose-s leading-prose text-prose">
        The ephemeris did not answer. Nothing you did caused this, and nothing was lost. We do not
        guess at skies.
      </p>
      <Button variant="votive" onClick={reset} className="mt-6">
        TAKE THE AUSPICES AGAIN
      </Button>
      <div className="mt-3 font-mono text-data-xs tracking-data text-dim">
        ERROR {code} ·{" "}
        <Link href="/" className="border-b border-bone/40 text-bone">
          {"YESTERDAY'S READING IS STILL HERE"}
        </Link>
      </div>
    </div>
  );
}
