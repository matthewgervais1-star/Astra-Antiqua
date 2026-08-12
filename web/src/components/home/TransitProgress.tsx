export interface TransitProgressProps {
  progressPct: number;
}

/**
 * The long-transit box's progress bar: a single accent fill from 0 to the
 * current position, with a small square marking "now". Distinct from
 * SpanBar (which marks a start/end segment plus exact-pass ticks); this is
 * the simpler "how far through this span are we" read used only here.
 *
 * The mock draws this marker as a circle; the system's geometry rule (radius
 * 0 everywhere, no exceptions) takes precedence, so it renders as a square.
 */
export function TransitProgress({ progressPct }: TransitProgressProps) {
  const pct = Math.min(100, Math.max(0, progressPct));
  return (
    <div className="relative h-[3px] w-full bg-rule-row">
      <span className="absolute left-0 top-0 block h-[3px] bg-[var(--accent)]" style={{ width: `${pct}%` }} />
      <span
        className="absolute top-1/2 h-[9px] w-[9px] -translate-y-1/2 bg-[var(--accent)]"
        style={{ left: `${pct}%`, transform: "translate(-50%, -50%)" }}
      />
    </div>
  );
}
