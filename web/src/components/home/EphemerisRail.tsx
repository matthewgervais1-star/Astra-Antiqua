import Link from "next/link";
import { DeityGlyph } from "@/components/chrome/DeityGlyph";
import type { Culture } from "@/data/cultures";
import { cn } from "@/lib/classNames";
import type { EphemerisRow, StationOrIngressRow } from "@/components/home/buildHomeBundle";

export interface EphemerisRailProps {
  className?: string;
  culture: Culture;
  rows: readonly EphemerisRow[];
  stationsAndIngresses: readonly StationOrIngressRow[];
}

/** Desktop-only left rail: the 00:00 UTC ephemeris, the next three stations
 * and ingresses within 90 days, and the method line. Hidden below 720px;
 * the mobile experience gets the smaller CompactSkyTable instead. */
export function EphemerisRail({ className, culture, rows, stationsAndIngresses }: EphemerisRailProps) {
  return (
    <aside className={cn("px-7 py-[var(--space-4)]", className)}>
      <div className="mb-[var(--space-2)] font-mono text-data-xs tracking-label text-dim">EPHEMERIS · 00:00 UTC</div>
      <div className="flex flex-col border-b border-rule-row font-mono text-data-xs">
        {rows.map((row) => (
          <div key={row.planet} className="flex items-center justify-between border-t border-rule-row py-[var(--space-2)]">
            <span
              className={cn(
                "inline-flex items-center gap-[var(--space-1)]",
                row.received ? "text-accent" : "text-bone",
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

      <div className="mb-3 mt-[var(--space-4)] font-mono text-data-xs tracking-label text-dim">STATIONS &amp; INGRESSES</div>
      <div className="flex flex-col gap-[var(--space-2)] font-mono text-data-xs leading-data">
        {stationsAndIngresses.length === 0 ? (
          <div className="text-dim">Nothing turns in the next ninety days.</div>
        ) : (
          stationsAndIngresses.map((row) => (
            <div key={row.key} className="text-dim">
              <span className={row.conflict ? "text-conflict" : "text-dim"}>{row.dateLabel}</span>{" "}
              <span className="text-bone/80">{row.text}</span>
            </div>
          ))
        )}
      </div>

      <div className="mt-[var(--space-4)] border-t border-rule pt-[var(--space-2)] font-mono text-data-xs leading-data text-dim">
        ASTRONOMY-ENGINE · WHOLE-SIGN · ORBS DOCUMENTED →{" "}
        <Link href="/method" className="text-accent">
          METHOD
        </Link>
      </div>
    </aside>
  );
}
