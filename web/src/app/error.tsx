"use client";

import { useEffect } from "react";
import Link from "next/link";

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
      <div className="font-mono text-[11px] tracking-[0.18em] text-conflict">
        THE COMPUTATION FAILED
      </div>
      <div className="my-[18px] h-px w-11 bg-conflict" />
      <h1 className="font-display text-[19px] leading-[1.5] tracking-[0.1em] text-bone">
        THE OMEN IS ILLEGIBLE
      </h1>
      <p className="mx-auto mt-3 max-w-[360px] font-body text-[14px] leading-[1.65] text-prose">
        The ephemeris did not answer. Nothing you did caused this, and nothing was lost. We do not
        guess at skies.
      </p>
      <button
        type="button"
        onClick={reset}
        className="mt-6 border border-[var(--accent)] px-7 py-[13px] font-display text-[11.5px] tracking-[0.2em] text-[var(--accent)] transition-colors hover:bg-[var(--accent)]/10"
      >
        TAKE THE AUSPICES AGAIN
      </button>
      <div className="mt-3 font-mono text-[9.5px] tracking-[0.08em] text-dim">
        ERROR {code} ·{" "}
        <Link href="/" className="border-b border-bone/40 text-bone">
          {"YESTERDAY'S READING IS STILL HERE"}
        </Link>
      </div>
    </div>
  );
}
