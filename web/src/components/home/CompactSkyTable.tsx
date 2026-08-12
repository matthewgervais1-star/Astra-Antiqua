import type { EphemerisRow } from "@/components/home/buildHomeBundle";

export interface CompactSkyTableProps {
  className?: string;
  rows: readonly EphemerisRow[];
}

/** Mobile-only compact ephemeris: the Sun plus whichever bodies carry the
 * day's tightest aspects, four rows in a bordered box. Replaces the full
 * ten-row rail and the stations/method line, which only render at 720px+. */
export function CompactSkyTable({ className, rows }: CompactSkyTableProps) {
  return (
    <div className={className}>
      <div className="border border-rule px-4 py-[14px] text-left">
        <div className="mb-[10px] font-mono text-[9px] tracking-[0.16em] text-dim">THE SKY, COMPUTED</div>
        <div className="flex flex-col gap-[7px] font-mono text-[10.5px] leading-[1.4]">
          {rows.map((row) => (
            <div key={row.planet} className="flex items-center justify-between">
              <span className={row.received ? "text-[var(--accent)]" : "text-bone"}>
                {row.symbol} {row.name}
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
