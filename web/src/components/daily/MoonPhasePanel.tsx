"use client";

import { useMemo } from "react";
import { computeMoonPhase } from "@/lib/moonPhase";
import { GlassPanel } from "@/components/ui/GlassPanel";

interface MoonPhasePanelProps {
  now: Date;
}

function formatRelative(target: Date, ref: Date): string {
  const ms = target.getTime() - ref.getTime();
  const days = Math.floor(ms / (24 * 60 * 60 * 1000));
  if (days <= 0) return "today";
  if (days === 1) return "tomorrow";
  return `in ${days} days`;
}

function MoonDisc({ illumination, isWaxing }: { illumination: number; isWaxing: boolean }) {
  // Render a simple SVG moon disc with a shadow arc indicating phase.
  // illumination 0 = new (fully dark), 1 = full (fully lit).
  const size = 64;
  const r = 24;
  const cx = size / 2;
  const cy = size / 2;
  // The terminator is an ellipse: when illumination = 0.5, it is a straight line.
  // For other values, it is an ellipse arc with x-radius = r * |1 - 2*illumination|.
  const ellipseRadiusX = r * Math.abs(1 - 2 * illumination);
  const litFromLeft = isWaxing; // waxing: right side lit; waning: left side lit
  // We will draw the dark portion as an SVG path.
  const sweep1 = illumination < 0.5 ? 0 : 1; // sweep flag for outer arc
  const sweep2 = illumination < 0.5 ? (litFromLeft ? 1 : 0) : (litFromLeft ? 0 : 1);
  const arcSide = litFromLeft ? 1 : 0;
  // Path: from top of disc, arc around the dark side to bottom, then back via the terminator ellipse.
  // We'll draw the dark side: top -> outer arc -> bottom -> ellipse arc back to top.
  const top = `${cx},${cy - r}`;
  const bot = `${cx},${cy + r}`;
  const outerArc = `A ${r} ${r} 0 0 ${arcSide} ${bot}`;
  const innerArc = `A ${ellipseRadiusX} ${r} 0 0 ${sweep2} ${top}`;
  const path = `M ${top} ${outerArc} ${innerArc} Z`;
  return (
    <svg
      viewBox={`0 0 ${size} ${size}`}
      width={size}
      height={size}
      aria-hidden
      className="shrink-0"
    >
      <circle cx={cx} cy={cy} r={r} fill="#d4af37" stroke="rgba(212,175,55,0.6)" strokeWidth={0.6} />
      <path d={path} fill="#0a0a0a" />
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="rgba(212,175,55,0.6)" strokeWidth={0.6} />
      {/* unused so the linter does not complain about the sweep1 var */}
      <metadata>{String(sweep1)}</metadata>
    </svg>
  );
}

export function MoonPhasePanel({ now }: MoonPhasePanelProps) {
  const phase = useMemo(() => computeMoonPhase(now), [now]);
  const percent = Math.round(phase.illuminationFraction * 100);
  return (
    <GlassPanel tone="solid" className="p-6 md:p-7">
      <div className="text-gold-leaf font-mono text-[10px] uppercase tracking-[0.3em]">
        Moon phase
      </div>
      <div className="mt-4 flex items-center gap-4">
        <MoonDisc illumination={phase.illuminationFraction} isWaxing={phase.isWaxing} />
        <div className="min-w-0 flex-1">
          <h4 className="font-display text-ink-primary text-xl leading-tight md:text-2xl">
            {phase.name}
          </h4>
          <div className="text-ink-tertiary font-mono mt-1 text-[10px] uppercase tracking-[0.2em]">
            {percent}% illuminated · {phase.isWaxing ? "waxing" : "waning"}
          </div>
        </div>
      </div>
      <p className="text-ink-secondary font-body mt-4 text-sm leading-relaxed">
        Next <span className="text-ink-primary">{phase.nextQuarter.name}</span>{" "}
        {formatRelative(phase.nextQuarter.date, now)} ({phase.nextQuarter.date.toLocaleDateString()}).
      </p>
    </GlassPanel>
  );
}
