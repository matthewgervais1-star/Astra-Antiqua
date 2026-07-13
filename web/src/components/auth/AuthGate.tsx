"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/components/auth/AuthProvider";
import { hasSeenOnboarding } from "@/lib/onboarding";

// App-surface routes where a brand-new anonymous visitor is worth greeting
// with the onboarding page once. Marketing/reference pages (home, learn,
// pantheon, about, …) never funnel, and /account already self-gates to
// sign-in. The whole product works anonymously, so this is a one-shot
// introduction, never a wall.
const FUNNEL_PREFIXES = ["/reading", "/charts", "/forecast", "/season", "/synastry"];

function isFunnelPath(pathname: string): boolean {
  return FUNNEL_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

export function AuthGate({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { status } = useAuth();

  useEffect(() => {
    if (status !== "anonymous") return;
    if (!pathname || !isFunnelPath(pathname)) return;
    if (hasSeenOnboarding()) return;
    // The "seen" flag is set when OnboardingFlow mounts, not here, so if this
    // navigation is interrupted the funnel gets another chance.
    const nextPath = `${pathname}${window.location.search}`;
    router.replace(`/onboarding?next=${encodeURIComponent(nextPath)}`);
  }, [pathname, router, status]);

  return <>{children}</>;
}
