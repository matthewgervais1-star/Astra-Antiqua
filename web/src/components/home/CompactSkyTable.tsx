import { DeityGlyph } from "@/components/chrome/DeityGlyph";
import type { EphemerisRow } from "@/components/home/buildHomeBundle";
import type { Culture } from "@/data/cultures";
import type { MoonPhase } from "@/lib/moonPhase";
import type { SeasonWindow } from "@/lib/season";
import { cn } from "@/lib/classNames";
import { fmt, moonPhaseKey, str } from "@/strings";

export interface CompactSkyTableProps {
  className?: string;
  culture: Culture;
  rows: readonly EphemerisRow[];
  moon: MoonPhase;
  season: SeasonWindow;
}

/** Mobile-only compact ephemeris: the Sun plus whichever bodies carry the
 * day's tightest aspects, four rows in a bordered box, then the Moon and the
 * season (board P10, P11). Replaces the full ten-row rail and the
 * stations/method line, which only render at 720px+. */
export function CompactSkyTable({ className, culture, rows, moon, season }: CompactSkyTableProps) {
  const remaining = Math.max(0, season.totalDays - season.dayOfSeason);
  return (
    <div className={className}>
      <div className="border border-rule px-4 py-[var(--space-2)] text-left">
        <div className="mb-[var(--space-2)] font-mono text-data-xs tracking-label text-dim">
          {str("day.sky.label", culture)}
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
            <div className="text-dim">{str("day.sky.moon.label", culture)}</div>
            <div className="text-bone">
              {str("day.sky.moon.line", culture, {
                phase: str(moonPhaseKey(moon.name), culture),
                percent: fmt("percent", moon.illuminationFraction),
              })}
            </div>
          </div>
          <div>
            <div className="text-dim">{str("day.sky.nextQuarter", culture, { quarter: str(moonPhaseKey(moon.nextQuarter.name), culture) })}</div>
            <div className="text-bone">
              {str("day.sky.nextQuarter.date", culture, { date: fmt("date.dayMonthYear", moon.nextQuarter.date, "local") })}
            </div>
          </div>
          <div className="col-span-2">
            <div className="text-dim">{str("day.sky.season.label", culture)}</div>
            <div className="text-bone">
              {str("day.sky.season.line", culture, {
                sign: fmt("sign.full", season.sign),
                n: season.dayOfSeason,
                total: season.totalDays,
              })}
            </div>
            <div className="mt-[var(--space-1)] flex justify-between text-dim">
              <span>{fmt("date.dayMonth", season.start, "UTC")}</span>
              <span>{str("day.sky.bar.toGo", culture, { remaining })}</span>
              <span>{fmt("date.dayMonth", season.end, "UTC")}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
