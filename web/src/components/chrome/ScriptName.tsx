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
   * resolves to Latin; the band rule takes over afterwards. For the culture
   * picker, whose list does not scroll.
   */
  intro?: number;
  /**
   * Script until scrolled (owner, 2026-10-29): the script form paints from
   * the first frame, before hydration, and holds until the reader scrolls;
   * from then on the band rule applies as for every other name. Hover shows
   * the Latin form meanwhile, as it does for any name the band has not
   * reached. For the large culture title, which sits in or above the band
   * at load and would otherwise resolve before the reader has looked at it.
   */
  scriptFirst?: boolean;
  className?: string;
};

const INTRO_CLASS = "script-name--intro";
const SCRIPT_FIRST_CLASS = "script-name--script-first";

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
 *
 * With scriptFirst, the class alone shows the script before hydration (the
 * root layout's noscript style restores Latin for a page with no
 * JavaScript). After mount the element reads data-reveal="script" and the
 * band's verdicts wait; the reader's first scroll releases them, and each
 * crossing applies from then on. A page that already sits below the top
 * when the effect runs (a scroll before hydration, a restored position)
 * counts as scrolled, as does a hold released before the effect re-ran
 * (the culture switched in place); a scroll event that leaves the page at
 * the top, such as the router's scroll to the top on navigation, does not.
 */
export function ScriptName({ culture, upper = false, intro, scriptFirst = false, className, ...key }: ScriptNameProps) {
  const ref = useRef<HTMLSpanElement | null>(null);
  const releasedRef = useRef(false);
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
      // Hydration can land after the CSS intro has ended, when animationend has already
      // fired: nothing runs on the layer any more, and the hold has elapsed since the page
      // started. Before the hold has elapsed the intro cannot have ended, whatever the layer
      // reports: a stylesheet arriving during hydration cancels and restarts the animations
      // for a frame, and finishing then would skip the intro.
      const running = latinLayer?.getAnimations().some((a) => a.playState === "running") ?? false;
      if (!running && performance.now() > (intro ?? 0)) finishIntro();
    }
    // Script until scrolled: the band's verdict waits in `pending` until the reader scrolls.
    let held = scriptFirst && !releasedRef.current && window.scrollY === 0;
    let pending: boolean | null = null;
    if (held) el.dataset.reveal = "script";
    const release = () => {
      held = false;
      releasedRef.current = true;
      window.removeEventListener("scroll", onScroll);
      if (pending !== null) el.dataset.reveal = pending ? "latin" : "script";
    };
    const onScroll = () => {
      if (window.scrollY !== 0) release();
    };
    if (held) window.addEventListener("scroll", onScroll, { passive: true });
    const stop = observeBand(el, (inBand) => {
      // During the intro the band waits; afterwards only a crossing applies.
      if (el.classList.contains(INTRO_CLASS)) return;
      if (held) {
        pending = inBand;
        return;
      }
      el.dataset.reveal = inBand ? "latin" : "script";
    });
    return () => {
      stop();
      window.removeEventListener("scroll", onScroll);
      latinLayer?.removeEventListener("animationend", finishIntro);
      hoverTarget.removeEventListener("pointerenter", finishIntro);
      hoverTarget.removeEventListener("focusin", finishIntro);
      delete el.dataset.reveal;
    };
  }, [script, reducedMotion, scriptFirst, intro]);

  const latin = latinFor(form, lang, upper);

  if (script === null) {
    return <span className={className}>{latin}</span>;
  }

  const introStyle =
    intro === undefined ? undefined : ({ "--script-name-intro-delay": `${intro}ms` } as CSSProperties);

  return (
    <span
      ref={ref}
      className={cn("script-name", intro !== undefined && INTRO_CLASS, scriptFirst && SCRIPT_FIRST_CLASS, className)}
      data-intro={intro === undefined ? undefined : ""}
      style={introStyle}
    >
      <span className="script-name__latin">{latin}</span>
      <span className="script-name__script" data-culture={culture} data-script={script} aria-hidden="true" />
    </span>
  );
}
