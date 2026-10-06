import { CULTURE_LABELS, type Culture } from "@/data/cultures";
import { CULTURE_VOICES } from "@/data/cultureVoice";
import { TONE_LABELS, type Tone } from "@/lib/tone";
import type { DayPermissions } from "@/lib/permissions";

export interface PermissionsModuleProps {
  culture: Culture;
  permissions: DayPermissions;
  /** "natal" when the lists come from the day's transits to the reader's chart. */
  source?: "sky" | "natal";
  tone: Tone;
}

/** Day's permissions, per 6a-permissions-rome: two columns in the culture's
 * own permission pair (PROCEED/REFRAIN, OFFER/WITHHOLD, ASK/DO NOT ASK,
 * BRING/HOLD BACK, PAY/DEFER), every item drawn from a body in the day's
 * transits to the reader's chart, or in the decree's figures when there is no
 * chart (lib/permissions.ts). Rendered for every reader. WHY THESE points at
 * what names those bodies: the dive deeper's contacts, or the decree. */
export function PermissionsModule({ culture, permissions, source = "sky", tone }: PermissionsModuleProps) {
  const [proceedLabel, refrainLabel] = CULTURE_VOICES[culture].permissionPair;
  return (
    <section className="mx-auto max-w-[720px] px-5 py-10 md:px-14">
      <div className="flex items-baseline justify-between">
        <span className="font-mono text-data-xs tracking-label text-accent">
          {CULTURE_LABELS[culture].toUpperCase()} · THE DAY&rsquo;S PERMISSIONS
        </span>
        <span className="font-mono text-data-xs text-dim">{TONE_LABELS[tone].toUpperCase()}</span>
      </div>
      <div className="my-4 h-px w-[34px] bg-accent" />
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 md:gap-[var(--space-4)]">
        <div>
          <div className="mb-[var(--space-2)] font-display text-[11px] tracking-[0.2em] text-harmony">{proceedLabel}</div>
          <div className="flex flex-col gap-[var(--space-1)] font-body text-prose-s font-light leading-prose text-prose">
            {permissions.proceed.map((item) => (
              <span key={item}>{item}</span>
            ))}
          </div>
        </div>
        <div>
          <div className="mb-[var(--space-2)] font-display text-[11px] tracking-[0.2em] text-conflict">{refrainLabel}</div>
          <div className="flex flex-col gap-[var(--space-1)] font-body text-prose-s font-light leading-prose text-prose">
            {permissions.refrain.map((item) => (
              <span key={item}>{item}</span>
            ))}
          </div>
        </div>
      </div>
      <div className="mt-4 font-mono text-data-xs leading-data tracking-data text-dim">
        {source === "natal" ? "DERIVED FROM TODAY’S TRANSITS TO YOUR CHART" : "DERIVED FROM TODAY’S ASPECTS"}
        , NOT A RANDOMIZER →{" "}
        <a href={source === "natal" ? "#dive-deeper" : "#day-figure"} className="text-accent">
          WHY THESE
        </a>
      </div>
    </section>
  );
}
