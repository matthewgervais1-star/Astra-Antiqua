import Link from "next/link";
import { RECEPTION_CLOSING, RECEPTION_LINK } from "@/lib/screens/common";

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
    <div className="border border-rule px-[var(--space-3)] py-[var(--space-2)] font-mono text-data-xs uppercase leading-data tracking-data text-dim">
      {opening ? <>{opening} </> : null}
      {RECEPTION_CLOSING}{" "}
      <Link href="/method" className="text-accent">
        {RECEPTION_LINK}
      </Link>
    </div>
  );
}
