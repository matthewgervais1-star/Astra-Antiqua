"use client";

import Link from "next/link";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { GoldText } from "@/components/ui/GoldText";

export function SuccessState({ message }: { message?: string }) {
  return (
    <GlassPanel tone="solid" className="p-8 text-center">
      <div className="text-ink-tertiary font-mono text-[10px] uppercase tracking-[0.3em]">
        Success
      </div>
      <GoldText as="h2" className="mt-4 text-2xl">
        {message ?? "Your account is ready."}
      </GoldText>
      <p className="text-ink-secondary mt-3">You can now save readings and access them from any device.</p>
      <div className="mt-6">
        <Link
          href="/charts"
          className="border-gold-soft text-gold-leaf inline-flex items-center gap-2 rounded-full border px-4 py-2 text-[13px] uppercase tracking-[0.2em]"
        >
          View saved charts
        </Link>
      </div>
    </GlassPanel>
  );
}
