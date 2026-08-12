"use client";

import { Suspense, useEffect } from "react";
import { useActivePantheon } from "@/components/pantheon/PantheonContext";

function Impl() {
  const culture = useActivePantheon();
  useEffect(() => {
    if (typeof document === "undefined") return;
    if (culture) {
      document.body.dataset.pantheon = culture;
    } else {
      delete document.body.dataset.pantheon;
    }
    return () => {
      // Leave the attribute in place on unmount; next mount will overwrite.
    };
  }, [culture]);
  return null;
}

/**
 * Sets data-pantheon on document.body to the active pantheon (from URL search
 * param). Used by CSS to swap visual register per pantheon: Carthage in
 * particular gets an animated fire gradient on gold text.
 */
export function PantheonBodyAttribute() {
  return (
    <Suspense fallback={null}>
      <Impl />
    </Suspense>
  );
}
