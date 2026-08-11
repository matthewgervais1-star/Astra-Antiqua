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

/** D · W · S · Y segmented control: one bordered row of Link cells. */
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
              "px-[15px] py-2 font-mono text-[11px]",
              i > 0 && "border-l border-bone/20",
              isActive ? "bg-[var(--accent)] font-medium text-[var(--ground)]" : "text-dim",
            )}
          >
            {cell.label}
          </Link>
        );
      })}
    </div>
  );
}
