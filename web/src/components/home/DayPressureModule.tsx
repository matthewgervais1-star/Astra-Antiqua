import { OrbBar } from "@/components/chrome/OrbBar";
import type { PressureGroup } from "@/lib/dayPressure";

export interface DayPressureModuleProps {
  groups: readonly PressureGroup[];
}

const LEVEL_TEXT_CLASS: Readonly<Record<PressureGroup["level"], string>> = {
  loud: "text-harmony",
  strained: "text-conflict",
  quiet: "text-dim",
};

/** Where the day falls, per 7a-day-pressure-egypt: today's transits bucketed
 * into the four whole-sign house groups the culture names its own way.
 * Only rendered when a natal chart exists. */
export function DayPressureModule({ groups }: DayPressureModuleProps) {
  return (
    <section className="mx-auto max-w-[720px] border-t border-rule px-5 py-10 md:px-14">
      <div className="flex items-baseline justify-between">
        <span className="font-mono text-[10px] tracking-[0.16em] text-[var(--accent)]">WHERE THE DAY FALLS</span>
        <span className="font-mono text-[9.5px] text-dim">FROM YOUR CHART&rsquo;S HOUSES</span>
      </div>
      <div className="my-4 h-px w-[34px] bg-[var(--accent)]" />
      <div className="flex flex-col gap-[14px]">
        {groups.map((group) => (
          <div key={group.name}>
            <div className="mb-[7px] flex items-center justify-between font-mono text-[10.5px] text-bone">
              <span>
                {group.name} · {group.sub}
              </span>
              <span className={LEVEL_TEXT_CLASS[group.level]}>{group.levelLabel}</span>
            </div>
            <OrbBar orb={group.orb ?? group.maxOrb} maxOrb={group.maxOrb} tone={group.tone} />
            <div className="mt-[6px] font-body text-[12.5px] font-light leading-[1.5] text-prose">
              {group.sentence}
            </div>
          </div>
        ))}
      </div>
      <div className="mt-4 font-mono text-[9.5px] leading-[1.6] tracking-[0.06em] text-dim">
        BARS = TIGHTNESS OF ASPECTS INTO EACH HOUSE GROUP · NAMES ARE PER CULTURE
      </div>
    </section>
  );
}
