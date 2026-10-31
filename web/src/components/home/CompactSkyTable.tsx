import { DeityGlyph } from "@/components/chrome/DeityGlyph";
import type { EphemerisRow } from "@/components/home/buildHomeBundle";
import type { Culture } from "@/data/cultures";
import { cn } from "@/lib/classNames";

export interface CompactSkyTableProps {
  className?: string;
  culture: Culture;
  rows: readonly EphemerisRow[];
}

/** Mobile-only compact ephemeris: the Sun plus whichever bodies carry the
 * day's tightest aspects, four rows in a bordered box. Replaces the full
 * ten-row rail and the stations/method line, which only render at 720px+. */
export function CompactSkyTable({ className, culture, rows }: CompactSkyTableProps) {
  return (
    <div className={className}>
      <div className="border border-rule px-4 py-[var(--space-2)] text-left">
        <div className="mb-[var(--space-2)] font-mono text-data-xs tracking-label text-dim">THE SKY, COMPUTED</div>
        <div className="flex flex-col gap-[var(--space-1)] font-mono text-data-xs leading-data">
          {rows.map((row) => (
            <div key={row.planet} className="flex items-center justify-between">
              <span
                className={cn(
                  "inline-flex items-center gap-[var(--space-1)]",
                  row.received ? "text-accent" : "text-bone",
                )}
              >
                <DeityGlyph body={row.planet} culture={culture} size={16} decorative />
                {row.name}
              </span>
              <span className={row.retrograde ? "text-conflict" : "text-dim"}>
                {row.deg}°{row.min}′ {row.sign3}
                {row.retrograde ? " ℞" : ""}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
