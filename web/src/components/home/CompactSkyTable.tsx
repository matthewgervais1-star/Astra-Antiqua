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
      <div className="border border-rule px-4 py-[14px] text-left">
        <div className="mb-[10px] font-mono text-[11px] tracking-[0.16em] text-dim">THE SKY, COMPUTED</div>
        <div className="flex flex-col gap-[7px] font-mono text-[11px] leading-[1.4]">
          {rows.map((row) => (
            <div key={row.planet} className="flex items-center justify-between">
              <span
                className={cn(
                  "inline-flex items-center gap-[6px]",
                  row.received ? "text-[var(--accent)]" : "text-bone",
                )}
              >
                <DeityGlyph body={row.planet} culture={culture} size={16} />
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
