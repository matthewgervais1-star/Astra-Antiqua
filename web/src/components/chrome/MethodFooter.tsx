import Link from "next/link";

/** Every reading chassis ends here: the honesty line (engine name, house
 * system, orb documentation) and the anonymity line. */
export function MethodFooter() {
  return (
    <footer className="flex flex-col gap-2 border-t border-rule px-5 py-[15px] font-mono text-[11px] text-dim md:flex-row md:items-center md:justify-between md:px-14">
      <span>
        ASTRONOMY-ENGINE EPHEMERIS · WHOLE-SIGN · ORBS DOCUMENTED →{" "}
        <Link href="/method" className="text-[var(--accent)]">
          METHOD
        </Link>
      </span>
      <span>NO ACCOUNT NEEDED · AN ACCOUNT ADDS SYNC</span>
    </footer>
  );
}
