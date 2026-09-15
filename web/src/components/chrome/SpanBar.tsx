export type SpanTone = "harmony" | "conflict" | "quiet" | "accent";

export interface SpanBarProps {
  startPct: number;
  endPct: number;
  ticks: readonly number[];
  tone?: SpanTone;
}

const TONE_CLASS: Readonly<Record<SpanTone, string>> = {
  harmony: "bg-harmony",
  conflict: "bg-conflict",
  quiet: "bg-dim",
  accent: "bg-accent",
};

function clampPct(value: number): number {
  return Math.min(100, Math.max(0, value));
}

/** 12-month span track: a positioned fill between two percents, with white
 * (bone) tick marks for exact passes. */
export function SpanBar({ startPct, endPct, ticks, tone = "accent" }: SpanBarProps) {
  const a = clampPct(startPct);
  const b = clampPct(endPct);
  const left = Math.min(a, b);
  const width = Math.max(a, b) - left;
  return (
    <div className="relative h-[3px] w-full bg-rule-row">
      <span
        className={`absolute top-0 h-[3px] ${TONE_CLASS[tone]}`}
        style={{ left: `${left}%`, width: `${width}%` }}
      />
      {ticks.map((pct, i) => (
        <span
          key={i}
          className="absolute top-1/2 h-[7px] w-px -translate-y-1/2 bg-bone"
          style={{ left: `${clampPct(pct)}%` }}
        />
      ))}
    </div>
  );
}
