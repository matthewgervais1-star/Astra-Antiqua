"use client";

import { useMemo } from "react";
import { cn } from "@/lib/classNames";

interface DayStripProps {
  today: Date;
  viewDate: Date;
  onChange: (date: Date) => void;
  span?: number; // odd number of days centered on today; default 5
}

const MS_PER_DAY = 24 * 60 * 60 * 1000;

function sameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export function DayStrip({ today, viewDate, onChange, span = 5 }: DayStripProps) {
  const days = useMemo(() => {
    const half = Math.floor(span / 2);
    const out: { date: Date; weekday: string; dayNum: number; isToday: boolean }[] = [];
    for (let i = -half; i <= half; i += 1) {
      const d = new Date(today.getTime() + i * MS_PER_DAY);
      out.push({
        date: d,
        weekday: d
          .toLocaleDateString(undefined, { weekday: "short" })
          .toUpperCase()
          .slice(0, 3),
        dayNum: d.getDate(),
        isToday: i === 0,
      });
    }
    return out;
  }, [today, span]);

  return (
    <div
      role="tablist"
      aria-label="Switch the date for the daily reading"
      className="border-border-hairline mb-8 flex items-end justify-center gap-3 border-b pb-3 md:gap-5 md:pb-4"
    >
      {days.map((day) => {
        const selected = sameDay(day.date, viewDate);
        return (
          <button
            key={day.date.toISOString()}
            type="button"
            role="tab"
            aria-selected={selected}
            onClick={() => onChange(day.date)}
            className={cn(
              "flex flex-col items-center gap-1 transition-colors",
              selected ? "text-gold-leaf" : "text-ink-secondary hover:text-ink-primary",
            )}
          >
            <span className="font-mono text-[10px] uppercase tracking-[0.25em]">
              {day.weekday}
            </span>
            <span
              className={cn(
                "font-display text-lg leading-none md:text-2xl",
                selected && "border-gold-soft border-b-2 pb-1",
              )}
            >
              {day.dayNum}
            </span>
            {day.isToday ? (
              <span className="text-ink-tertiary font-mono text-[9px] uppercase tracking-[0.2em]">
                today
              </span>
            ) : null}
          </button>
        );
      })}
    </div>
  );
}
