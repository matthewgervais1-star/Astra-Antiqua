"use client";

import { useState } from "react";
import Link from "next/link";

/** Step III of the welcome funnel: a one-line honesty statement and a link
 * to /signin. Fully skippable; nothing here is required to continue. */
export function AccountStep() {
  const [open, setOpen] = useState(false);

  return (
    <div className="mt-6 border-t border-rule pt-6">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="w-full text-left font-mono text-[11px] tracking-[0.16em] text-dim hover:text-bone"
      >
        III OF III · AN ACCOUNT, IF YOU WANT SYNC {open ? "▴" : "▾"}
      </button>
      {open ? (
        <div className="mt-5 flex flex-col gap-3">
          <p className="font-mono text-[11px] tracking-[0.08em] text-dim">
            An account adds sync and nothing else.
          </p>
          <Link href="/signin" className="font-mono text-[11px] tracking-[0.1em] text-[var(--accent)]">
            OPEN THE RECORD →
          </Link>
        </div>
      ) : null}
    </div>
  );
}
