import { REVEAL_BAND_MARGIN } from "@/lib/scriptName";

/**
 * One IntersectionObserver for every script name on the page. A page with
 * fifty names registers fifty elements here and makes one observer; the last
 * element to leave disconnects it.
 */
type BandListener = (inBand: boolean) => void;

const listeners = new Map<Element, BandListener>();
let observer: IntersectionObserver | null = null;

function bandObserver(): IntersectionObserver {
  if (observer === null) {
    observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) listeners.get(entry.target)?.(entry.isIntersecting);
      },
      { rootMargin: REVEAL_BAND_MARGIN, threshold: 0 },
    );
  }
  return observer;
}

/** Calls listener with true while el sits in the middle band, false outside it. Returns the unsubscribe. */
export function observeBand(el: Element, listener: BandListener): () => void {
  listeners.set(el, listener);
  bandObserver().observe(el);
  return () => {
    listeners.delete(el);
    if (observer === null) return;
    observer.unobserve(el);
    if (listeners.size === 0) {
      observer.disconnect();
      observer = null;
    }
  };
}

