export interface SectionDividerProps {
  label: string;
}

/** Centered Cinzel caption flanked by 1px rules; used to break a reading's spine into sections. */
export function SectionDivider({ label }: SectionDividerProps) {
  return (
    <div className="flex items-center gap-3.5">
      <span className="h-px flex-1 bg-rule" />
      <span className="font-display text-[11px] tracking-[0.24em] text-[var(--accent)]">{label}</span>
      <span className="h-px flex-1 bg-rule" />
    </div>
  );
}
