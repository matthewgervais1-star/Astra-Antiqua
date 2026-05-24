import type { ReactNode } from "react";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { cn } from "@/lib/classNames";

interface InterpretiveNoteProps {
  title: string;
  children: ReactNode;
  className?: string;
}

export function InterpretiveNote({ title, children, className }: InterpretiveNoteProps) {
  return (
    <GlassPanel tone="solid" className={cn("p-6 md:p-8", className)}>
      <div className="text-gold-leaf font-mono text-[10px] uppercase tracking-[0.3em]">
        Interpretive Note
      </div>
      <h3 className="font-display text-ink-primary mt-2 text-xl md:text-2xl">
        {title}
      </h3>
      <div className="text-ink-secondary font-body mt-4 text-[17px] leading-relaxed">
        {children}
      </div>
    </GlassPanel>
  );
}
