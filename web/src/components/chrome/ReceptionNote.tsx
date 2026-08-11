import Link from "next/link";

export interface ReceptionNoteProps {
  body?: string;
  intro?: string;
}

/**
 * The honesty note shown on outer-planet surfaces. `intro` overrides the
 * opening sentence entirely (routes compose the culture-specific phrasing,
 * e.g. "PLOUTON IS A MODERN BODY, RECEIVED INTO THE GREEK MANNER."); `body`
 * alone produces a generic fallback. The closing sentence is fixed.
 */
export function ReceptionNote({ body, intro }: ReceptionNoteProps) {
  const opening = intro ?? (body ? `${body} IS A MODERN BODY, RECEIVED INTO THE ANCIENT MANNER.` : null);
  return (
    <div className="border border-rule px-[18px] py-[13px] font-mono text-[11px] uppercase leading-[1.7] tracking-[0.08em] text-dim">
      {opening ? <>{opening} </> : null}
      THE OUTER PLANETS ARE AN EXTENSION MADE IN THE ANCIENT WAY; THE METHOD PAGE STATES IT PLAINLY →{" "}
      <Link href="/method" className="text-[var(--accent)]">
        METHOD
      </Link>
    </div>
  );
}
