"use client";

import type { ReactNode } from "react";
import { GoldText } from "@/components/ui/GoldText";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { SectionContainer } from "@/components/ui/SectionContainer";

interface Benefit {
  title: string;
  body: string;
}

interface AuthOnboardingLayoutProps {
  eyebrow: string;
  title: string;
  body: string;
  benefits: readonly Benefit[];
  children: ReactNode;
  footer?: ReactNode;
  compact?: boolean;
}

export function AuthOnboardingLayout({
  eyebrow,
  title,
  body,
  benefits,
  children,
  footer,
  compact = false,
}: AuthOnboardingLayoutProps) {
  return (
    <SectionContainer size={compact ? "narrow" : "default"} spacing="default">
      <div className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr] lg:items-start">
        <div className="space-y-6">
          <div className="space-y-4">
            <div className="text-ink-tertiary font-mono text-[11px] uppercase tracking-[0.3em]">
              {eyebrow}
            </div>
            <GoldText as="h1" className="max-w-2xl text-4xl leading-tight md:text-5xl">
              {title}
            </GoldText>
            <p className="text-ink-secondary font-body max-w-xl text-base leading-relaxed md:text-lg">
              {body}
            </p>
          </div>

          <GlassPanel tone="solid" className="p-6 md:p-7">
            <div className="text-ink-tertiary font-mono text-[10px] uppercase tracking-[0.3em]">
              What your account keeps
            </div>
            <ul className="mt-4 space-y-4">
              {benefits.map((benefit) => (
                <li key={benefit.title} className="border-border-hairline border-t pt-4 first:border-t-0 first:pt-0">
                  <div className="font-display text-ink-primary text-lg">{benefit.title}</div>
                  <p className="text-ink-secondary font-body mt-1 text-sm leading-relaxed">
                    {benefit.body}
                  </p>
                </li>
              ))}
            </ul>
          </GlassPanel>
        </div>

        <div className="space-y-4">
          <GlassPanel tone="solid" className="p-6 md:p-8">
            {children}
          </GlassPanel>
          {footer ? <div className="text-ink-tertiary font-body text-sm">{footer}</div> : null}
        </div>
      </div>
    </SectionContainer>
  );
}
