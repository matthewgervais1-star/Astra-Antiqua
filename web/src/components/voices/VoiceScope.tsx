"use client";

import type { ReactNode } from "react";
import { useSetRoutePantheon } from "@/components/pantheon/PantheonContext";
import type { Culture } from "@/data/cultures";

export interface VoiceScopeProps {
  culture: Culture;
  children: ReactNode;
}

/**
 * Pushes a /voices/[culture] route's culture into PantheonContext for the
 * page's lifetime, exactly like the old PantheonJourney did for
 * /pantheon/[culture] (copy the pattern, not the component). PantheonBodyAttribute
 * (mounted in the root layout) reads the same context and sets
 * document.body[data-pantheon], which is what actually switches the ground
 * and accent tokens while this page is mounted.
 */
export function VoiceScope({ culture, children }: VoiceScopeProps) {
  useSetRoutePantheon(culture);
  return <>{children}</>;
}
