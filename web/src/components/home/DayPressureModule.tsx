import { OrbBar } from "@/components/chrome/OrbBar";
import type { PressureGroup } from "@/lib/dayPressure";
import { text } from "@/strings";

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
        <span className="font-mono text-data-xs tracking-label text-accent">{text("day.chart.label")}</span>
      </div>
      <div className="my-4 h-px w-[34px] bg-accent" />
      <div className="flex flex-col gap-[var(--space-2)]">
        {groups.map((group) => (
          <div key={group.name}>
            <div className="mb-[var(--space-1)] flex items-center justify-between font-mono text-data-xs text-bone">
              <span>
                {group.name} · {group.sub}
              </span>
              <span className={LEVEL_TEXT_CLASS[group.level]}>{group.levelLabel}</span>
            </div>
            <OrbBar orb={group.orb ?? group.maxOrb} maxOrb={group.maxOrb} tone={group.tone} />
            <div className="mt-[var(--space-1)] font-body text-prose-s font-light leading-prose text-prose">
              {group.sentence}
            </div>
            {group.data ? (
              <div className="mt-[var(--space-1)] font-mono text-data-xs leading-data text-dim">{group.data}</div>
            ) : null}
          </div>
        ))}
      </div>
      <div className="mt-4 font-mono text-data-xs leading-data tracking-data text-dim">
        BARS = TIGHTNESS OF ASPECTS INTO EACH HOUSE GROUP · NAMES ARE PER CULTURE
      </div>
    </section>
  );
}
