import { DeityGlyph } from "@/components/chrome/DeityGlyph";
import type { EphemerisRow } from "@/components/home/buildHomeBundle";
import type { Culture } from "@/data/cultures";
import type { SlotMap } from "@/lib/screens/types";
import { cn } from "@/lib/classNames";
import { fmt } from "@/strings";

export interface CompactSkyTableProps {
  className?: string;
  culture: Culture;
  rows: readonly EphemerisRow[];
  /** The Day's screen model (lib/screens/day.ts): the label, Moon and season lines print from it. */
  slots: SlotMap;
}

/** The stacked lines of a slot (SlotMap: "\n" separates them). */
function stacked(slots: SlotMap, key: string): string[] {
  return String(slots[key] ?? "").split("\n");
}

/** Mobile-only compact ephemeris: the Sun plus whichever bodies carry the
 * day's tightest aspects, four rows in a bordered box, then the Moon and the
 * season (board P10, P11). Replaces the full ten-row rail and the
 * stations/method line, which only render at 720px+. */
export function CompactSkyTable({ className, culture, rows, slots }: CompactSkyTableProps) {
  const [moonLabel, moonLine] = stacked(slots, "day.sky.moon");
  const [quarter, quarterDate] = stacked(slots, "day.sky.nextQuarter");
  const [seasonLabel, seasonLine] = stacked(slots, "day.sky.season");
  const [barStart, barToGo, barEnd] = slots["day.sky.bar"] as string[];
  return (
    <div className={className}>
      <div className="border border-rule px-4 py-[var(--space-2)] text-left">
        <div className="mb-[var(--space-2)] font-mono text-data-xs tracking-label text-dim">
          {slots["day.sky.label"]}
        </div>
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
                {row.retrograde ? ` ${fmt("motion.mark", true)}` : ""}
              </span>
            </div>
          ))}
        </div>
        <div className="mt-[var(--space-2)] grid grid-cols-2 gap-x-4 gap-y-[var(--space-1)] border-t border-rule pt-[var(--space-2)] font-mono text-data-xs leading-data">
          <div>
            <div className="text-dim">{moonLabel}</div>
            <div className="text-bone">{moonLine}</div>
          </div>
          <div>
            <div className="text-dim">{quarter}</div>
            <div className="text-bone">{quarterDate}</div>
          </div>
          <div className="col-span-2">
            <div className="text-dim">{seasonLabel}</div>
            <div className="text-bone">{seasonLine}</div>
            <div className="mt-[var(--space-1)] flex justify-between text-dim">
              <span>{barStart}</span>
              <span>{barToGo}</span>
              <span>{barEnd}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
