import Link from "next/link";
import { fmt } from "@/strings/formats";
import type { ReactNode } from "react";
import { cn } from "@/lib/classNames";
import type { Motion } from "@/lib/motion";

export type DataRowQuality = "harmony" | "conflict";

export interface DataRowProps {
  /** The body: its glyph and the name the culture gives it. */
  body: ReactNode;
  /** Degrees and minutes within the sign. */
  position: string;
  /** The three-letter sign. */
  sign: string;
  /** Whole-sign house, 1 to 12. */
  house: number;
  motion: Motion;
  /** A signal square, where a row has a quality to report. */
  quality?: DataRowQuality;
  /** A received body takes the accent. */
  received?: boolean;
  /** Makes the row a link. */
  href?: string;
}

/**
 * The column template, shared with the head so the two never drift.
 * Body, position, sign, house, motion, signal.
 */
const GRID = "grid grid-cols-[1fr_78px_46px_34px_22px_10px] items-center gap-[var(--space-1)]";

/** The column labels, in the faint ink of a table interior. */
export function DataRowHead() {
  return (
    <div className={cn(GRID, "py-2 text-faint-ink")}>
      <span>BODY</span>
      <span>LONG</span>
      <span>SIGN</span>
      <span>HSE</span>
      <span>MOT</span>
      <span />
    </div>
  );
}

/**
 * One ephemeris row (docs/design/system/components/specs/DataRow.prompt.md):
 * body, position, house, motion, with a quality mark; a received body takes
 * the accent. The rule between rows is the faint data rule. The quality mark
 * is a square, since the system has square corners everywhere and the voices
 * index already sets its culture marks as squares.
 */
export function DataRow({
  body,
  position,
  sign,
  house,
  motion,
  quality,
  received = false,
  href,
}: DataRowProps) {
  const retrograde = motion === "retrograde";
  const classes = cn(
    GRID,
    "border-t border-rule-row py-2",
    received ? "text-accent" : "text-bone",
    href && "hover:bg-bone/5",
  );
  const cells = (
    <>
      <span className="flex min-w-0 items-center gap-[var(--space-1)]">{body}</span>
      <span className="text-dim">{position}</span>
      <span className="text-dim">{sign}</span>
      <span className="text-dim">{fmt("house.roman", house)}</span>
      <span className={retrograde ? "text-bone" : "text-faint-ink"}>
        {fmt("motion.mark", retrograde)}
        <span className="sr-only">{retrograde ? ", retrograde" : ", direct"}</span>
      </span>
      <span
        aria-hidden="true"
        className={cn(
          "block h-[6px] w-[6px]",
          quality === "harmony" && "bg-harmony",
          quality === "conflict" && "bg-conflict",
        )}
      />
    </>
  );
  if (href) {
    return (
      <Link href={href} className={classes}>
        {cells}
      </Link>
    );
  }
  return <div className={classes}>{cells}</div>;
}
