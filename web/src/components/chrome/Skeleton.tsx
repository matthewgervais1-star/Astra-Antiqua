export interface SkeletonProps {
  label?: string;
}

/** Loading state for a reading: faint rules and a dim mono label. Never spins. */
export function Skeleton({ label = "COMPUTING THE SKY…" }: SkeletonProps) {
  return (
    <div className="flex flex-col gap-[18px]" role="status" aria-live="polite">
      <span className="h-px w-full bg-rule" />
      <span className="h-px w-full bg-rule" />
      <span className="h-px w-full bg-rule" />
      <span className="font-mono text-[11px] text-dim">{label}</span>
    </div>
  );
}
