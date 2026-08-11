export type OrbTone = "harmony" | "conflict" | "quiet";

export interface OrbBarProps {
  orb: number;
  maxOrb: number;
  tone: OrbTone;
}

const TONE_CLASS: Readonly<Record<OrbTone, string>> = {
  harmony: "bg-harmony",
  conflict: "bg-conflict",
  quiet: "bg-dim",
};

/** 3px orb-tightness track: fill width shrinks as the orb widens toward maxOrb. */
export function OrbBar({ orb, maxOrb, tone }: OrbBarProps) {
  const ratio = maxOrb > 0 ? Math.min(1, Math.max(0, orb / maxOrb)) : 0;
  const pct = Math.max(6, Math.round((1 - ratio) * 100));
  return (
    <div className="h-[3px] w-full bg-rule-row">
      <span className={`block h-[3px] ${TONE_CLASS[tone]}`} style={{ width: `${pct}%` }} />
    </div>
  );
}
