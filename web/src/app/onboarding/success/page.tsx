"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { SuccessState } from "@/components/onboarding/SuccessState";
import { safeNextPath } from "@/lib/auth/nextPath";

export default function OnboardingSuccessPage() {
  const router = useRouter();

  useEffect(() => {
    // Brief success splash, then continue to the (same-origin) target.
    const t = setTimeout(() => {
      router.replace(safeNextPath());
    }, 1200);
    return () => clearTimeout(t);
  }, [router]);

  return <SuccessState message="Welcome. Your account is ready." />;
}
