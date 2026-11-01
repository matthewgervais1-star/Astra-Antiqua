export interface SectionDividerProps {
  label: string;
}

/** Centered caption, printed in the case it is given (catalog strings carry their case; no transform here), flanked by 1px rules; used to break a reading's spine into sections. */
export function SectionDivider({ label }: SectionDividerProps) {
  return (
    <div className="flex items-center gap-3.5">
      <span className="h-px flex-1 bg-rule" />
      <span className="font-mono text-data-xs tracking-microcopy text-accent">{label}</span>
      <span className="h-px flex-1 bg-rule" />
    </div>
  );
}
