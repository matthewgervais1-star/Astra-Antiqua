const STORAGE_KEY = "astra-antiqua.onboarded";

/**
 * Whether this browser has already been shown the first-run onboarding page.
 * The funnel is one-shot: once seen (or once the user signs in anywhere), the
 * app never redirects to onboarding again.
 */
export function hasSeenOnboarding(): boolean {
  if (typeof window === "undefined") return true;
  try {
    return window.localStorage.getItem(STORAGE_KEY) === "1";
  } catch {
    return true;
  }
}

export function markOnboardingSeen(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, "1");
  } catch {
    // localStorage may be unavailable; the funnel simply won't persist.
  }
}
