"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
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
  /**
   * Milliseconds to hold the script form after the page paints before it
   * resolves to Latin; the band rule takes over afterwards. For a name near
   * the top of the page, which would otherwise sit above the band in script.
   */
  intro?: number;
  className?: string;
};

const INTRO_CLASS = "script-name--intro";

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
 *
 * With intro, a CSS animation shows the script from the first paint, holds
 * it, and fades to Latin, so it runs before hydration and without
 * JavaScript too. When it ends (or the reader hovers or focuses the name)
 * the intro class comes off, and from then on each band crossing applies.
 */
export function ScriptName({ culture, upper = false, intro, className, ...key }: ScriptNameProps) {
  const ref = useRef<HTMLSpanElement | null>(null);
  const [lang, setLang] = useState<ReaderLanguage>("en");
  const reducedMotion = usePrefersReducedMotion();
  const form = scriptFormFor(culture, key as ScriptNameKey);
  const script = scriptLayerFor(form);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const browser = typeof navigator === "undefined" ? null : (navigator.languages?.[0] ?? navigator.language);
    const next = pickLanguage(el.closest("[lang]")?.getAttribute("lang"), browser);
    // The page and browser language are only readable on the client; English is the server render.
    if (next !== "en") setLang(next);
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!el || script === null || reducedMotion) return;
    const finishIntro = () => el.classList.remove(INTRO_CLASS);
    const hoverTarget = el.closest("a, button") ?? el;
    const latinLayer = el.querySelector(".script-name__latin");
    if (el.classList.contains(INTRO_CLASS)) {
      latinLayer?.addEventListener("animationend", finishIntro);
      hoverTarget.addEventListener("pointerenter", finishIntro);
      hoverTarget.addEventListener("focusin", finishIntro);
    }
    const stop = observeBand(el, (inBand) => {
      // During the intro the band waits; afterwards only a crossing applies.
      if (el.classList.contains(INTRO_CLASS)) return;
      el.dataset.reveal = inBand ? "latin" : "script";
    });
    return () => {
      stop();
      latinLayer?.removeEventListener("animationend", finishIntro);
      hoverTarget.removeEventListener("pointerenter", finishIntro);
      hoverTarget.removeEventListener("focusin", finishIntro);
      delete el.dataset.reveal;
    };
  }, [script, reducedMotion]);

  const latin = latinFor(form, lang, upper);

  if (script === null) {
    return <span className={className}>{latin}</span>;
  }

  const introStyle =
    intro === undefined ? undefined : ({ "--script-name-intro-delay": `${intro}ms` } as CSSProperties);

  return (
    <span
      ref={ref}
      className={cn("script-name", intro !== undefined && INTRO_CLASS, className)}
      data-intro={intro === undefined ? undefined : ""}
      style={introStyle}
    >
      <span className="script-name__latin">{latin}</span>
      <span className="script-name__script" data-culture={culture} data-script={script} aria-hidden="true" />
    </span>
  );
}
