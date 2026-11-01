import Link from "next/link";
import { cn } from "@/lib/classNames";
import { text } from "@/strings";

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
  { key: "day", label: text("chrome.horizon.day"), href: "/" },
  { key: "week", label: text("chrome.horizon.week"), href: "/week" },
  { key: "season", label: text("chrome.horizon.season"), href: "/season" },
  { key: "year", label: text("chrome.horizon.year"), href: "/year" },
];

/**
 * DAY · WEEK · SEASON · YEAR segmented control: one bordered row of Link cells. The active
 * cell wears the accent as ink and as the rule under it, never as a fill: the
 * accent is never a background.
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
              "-mb-px px-[var(--space-3)] py-2 font-mono text-data-xs",
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
