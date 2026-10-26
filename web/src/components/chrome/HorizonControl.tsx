import Link from "next/link";
import { cn } from "@/lib/classNames";

export type Horizon = "day" | "week" | "season" | "year";

export interface HorizonControlProps {
  active: Horizon;
}

interface Cell {
  key: Horizon;
  label: string;
  href: string;
}

const CELLS: readonly Cell[] = [
  { key: "day", label: "D", href: "/" },
  { key: "week", label: "W", href: "/week" },
  { key: "season", label: "S", href: "/season" },
  { key: "year", label: "Y", href: "/year" },
];

/**
 * D · W · S · Y segmented control: one bordered row of Link cells. The active
 * cell wears the accent as ink and as the rule under it, never as a fill: the
 * accent is never a background.
 *
 * Below sm the cells take --space-2 side padding, one step down, so the
 * sub-bar's context line keeps room for the home clock's time beside this
 * control and the culture chip at 375px.
 */
export function HorizonControl({ active }: HorizonControlProps) {
  return (
    <div className="flex border border-bone/20">
      {CELLS.map((cell, i) => {
        const isActive = cell.key === active;
        return (
          <Link
            key={cell.key}
            href={cell.href}
            aria-current={isActive ? "page" : undefined}
            className={cn(
              "-mb-px px-[var(--space-2)] py-2 font-mono text-data-xs sm:px-[var(--space-3)]",
              i > 0 && "border-l border-bone/20",
              isActive ? "border-b border-rule-active text-accent" : "text-dim",
            )}
          >
            {cell.label}
          </Link>
        );
      })}
    </div>
  );
}
