import Link from "next/link";
import type { Culture } from "@/data/cultures";
import { cn } from "@/lib/classNames";

export type Horizon = "day" | "week" | "season" | "year";

const HORIZONS: ReadonlyArray<{ key: Horizon; label: string }> = [
  { key: "day", label: "Day" },
  { key: "week", label: "Week" },
  { key: "season", label: "Season" },
  { key: "year", label: "Year" },
];

function hrefFor(key: Horizon, culture: Culture | null): string {
  const base = culture ? `/pantheon/${culture}` : "";
  switch (key) {
    case "day":
      return culture ? `${base}/today` : "/";
    case "week":
      return culture ? `${base}/today#week` : "/#week";
    case "season":
      return `${base}/season`;
    case "year":
      return `${base}/forecast`;
  }
}

/**
 * The four reading horizons as one small strip, so Day, Week, Season, and
 * Year read as one system rather than four scattered pages.
 */
export function HorizonLinks({
  active,
  culture = null,
}: {
  active: Horizon;
  culture?: Culture | null;
}) {
  return (
    <nav
      aria-label="Reading horizons"
      className="flex flex-wrap items-center gap-2"
    >
      {HORIZONS.map((h) => (
        <Link
          key={h.key}
          href={hrefFor(h.key, culture)}
          aria-current={h.key === active ? "page" : undefined}
          className={cn(
            "rounded-full border px-4 py-1.5 font-mono text-[10px] uppercase tracking-[0.25em] transition-colors",
            h.key === active
              ? "border-gold-soft text-gold-leaf"
              : "border-hairline text-ink-tertiary hover:text-ink-primary hover:border-gold-soft",
          )}
        >
          {h.label}
        </Link>
      ))}
    </nav>
  );
}
