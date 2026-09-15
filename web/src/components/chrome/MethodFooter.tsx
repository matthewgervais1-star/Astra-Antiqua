import Link from "next/link";

/** Every reading chassis ends here: the honesty line (engine name, house
 * system, orb documentation) and the anonymity line. */
export function MethodFooter() {
  return (
    <footer className="flex flex-col gap-2 border-t border-rule px-5 py-[var(--space-3)] font-mono text-data-xs text-dim md:flex-row md:items-center md:justify-between md:px-14">
      <span>
        ASTRONOMY-ENGINE EPHEMERIS · WHOLE-SIGN · ORBS DOCUMENTED →{" "}
        <Link href="/method" className="text-accent">
          METHOD
        </Link>
      </span>
      <span>NO ACCOUNT NEEDED · AN ACCOUNT ADDS SYNC</span>
    </footer>
  );
}
