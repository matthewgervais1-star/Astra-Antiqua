import { CULTURE_LABELS, type Culture } from "@/data/cultures";
import { CULTURE_VOICES } from "@/data/cultureVoice";
import { TONE_LABELS, type Tone } from "@/lib/tone";
import type { DayPermissions } from "@/lib/permissions";

export interface PermissionsModuleProps {
  culture: Culture;
  permissions: DayPermissions;
  tone: Tone;
}

/** Day's permissions, per 6a-permissions-rome: two columns drawn from
 * today's aspects, not a randomizer, in the culture's own permission pair
 * (PROCEED/REFRAIN, OFFER/WITHHOLD, ASK/DO NOT ASK, BRING/HOLD BACK,
 * PAY/DEFER). Only rendered when a natal chart exists. */
export function PermissionsModule({ culture, permissions, tone }: PermissionsModuleProps) {
  const [proceedLabel, refrainLabel] = CULTURE_VOICES[culture].permissionPair;
  return (
    <section className="mx-auto max-w-[720px] px-5 py-10 md:px-14">
      <div className="flex items-baseline justify-between">
        <span className="font-mono text-[11px] tracking-[0.16em] text-[var(--accent)]">
          {CULTURE_LABELS[culture].toUpperCase()} · THE DAY&rsquo;S PERMISSIONS
        </span>
        <span className="font-mono text-[11px] text-dim">{TONE_LABELS[tone].toUpperCase()}</span>
      </div>
      <div className="my-4 h-px w-[34px] bg-[var(--accent)]" />
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 md:gap-[22px]">
        <div>
          <div className="mb-[10px] font-display text-[11px] tracking-[0.2em] text-harmony">{proceedLabel}</div>
          <div className="flex flex-col gap-[7px] font-body text-[14px] font-light leading-[1.5] text-prose">
            {permissions.proceed.map((item) => (
              <span key={item}>{item}</span>
            ))}
          </div>
        </div>
        <div>
          <div className="mb-[10px] font-display text-[11px] tracking-[0.2em] text-conflict">{refrainLabel}</div>
          <div className="flex flex-col gap-[7px] font-body text-[14px] font-light leading-[1.5] text-prose">
            {permissions.refrain.map((item) => (
              <span key={item}>{item}</span>
            ))}
          </div>
        </div>
      </div>
      <div className="mt-4 font-mono text-[11px] leading-[1.6] tracking-[0.06em] text-dim">
        DERIVED FROM TODAY&rsquo;S ASPECTS, NOT A RANDOMIZER →{" "}
        <a href="#aspects" className="text-[var(--accent)]">
          WHY THESE
        </a>
      </div>
    </section>
  );
}
