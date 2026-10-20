"use client";

import { useEffect, useRef, useState } from "react";
import type { Culture } from "@/data/cultures";
import { observeBand } from "@/lib/revealBand";
import { usePrefersReducedMotion } from "@/lib/reducedMotion";
import { cn } from "@/lib/classNames";
import {
  latinFor,
  pickLanguage,
  scriptFormFor,
  scriptLayerFor,
  type ReaderLanguage,
  type ScriptNameKey,
} from "@/lib/scriptName";

export type ScriptNameProps = ScriptNameKey & {
  culture: Culture;
  /** Set the Latin form in capitals, as the surrounding mono and display lines do. */
  upper?: boolean;
  className?: string;
};

/**
 * A deity or culture name in its culture's writing that resolves to the
 * reader's Latin form in the middle band of the viewport
 * (docs/superpowers/specs/2026-10-20-script-reveal.md, rules 3 to 5).
 *
 * The Latin form is real text, so screen readers, crawlers, copy-paste and a
 * page with no JavaScript get it. The script form is an aria-hidden layer
 * drawn by CSS generated content from data-script, stacked in the same grid
 * cell: the box takes the wider of the two forms from the first paint, and
 * the swap moves nothing. Both start as Latin; the effect below marks the
 * element data-reveal="script" only after mount, and only while it sits
 * outside the band. The swap writes the attribute directly, so scrolling
 * re-renders nothing. Under prefers-reduced-motion the CSS hides the script
 * layer and the effect never runs. Styles: .script-name in app/globals.css.
 */
export function ScriptName({ culture, upper = false, className, ...key }: ScriptNameProps) {
  const ref = useRef<HTMLSpanElement | null>(null);
  const [lang, setLang] = useState<ReaderLanguage>("en");
  const reducedMotion = usePrefersReducedMotion();
  const form = scriptFormFor(culture, key as ScriptNameKey);
  const script = scriptLayerFor(form);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const next = pickLanguage(el.closest("[lang]")?.getAttribute("lang"));
    // The page language is only readable from the DOM; English is the server render.
    if (next !== "en") setLang(next);
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!el || script === null || reducedMotion) return;
    const stop = observeBand(el, (inBand) => {
      el.dataset.reveal = inBand ? "latin" : "script";
    });
    return () => {
      stop();
      delete el.dataset.reveal;
    };
  }, [script, reducedMotion]);

  const latin = latinFor(form, lang, upper);

  if (script === null) {
    return <span className={className}>{latin}</span>;
  }

  return (
    <span ref={ref} className={cn("script-name", className)}>
      <span className="script-name__latin">{latin}</span>
      <span className="script-name__script" data-culture={culture} data-script={script} aria-hidden="true" />
    </span>
  );
}
