import Link from "next/link";
import { LEARN_SECTIONS } from "@/data/learnSections";
import { SectionDivider } from "@/components/chrome/SectionDivider";
import { cn } from "@/lib/classNames";

/** Every Learn page's footer: the full table of contents as mono, bordered
 *  rows, the current page marked in the active culture's accent. */
export function LearnTOC({ current }: { current?: string }) {
  return (
    <div className="mt-16 flex flex-col gap-6">
      <SectionDivider label="ALL SECTIONS" />
      <div className="flex flex-col">
        {LEARN_SECTIONS.map((s) => {
          const isActive = s.href === current;
          return (
            <Link
              key={s.href}
              href={s.href}
              aria-current={isActive ? "page" : undefined}
              className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 border-t border-rule-row py-3 last:border-b hover:bg-bone/5"
            >
              <span className="flex items-baseline gap-3">
                <span className="font-mono text-[11px] text-faint-ink">
                  {String(s.n).padStart(2, "0")}
                </span>
                <span
                  className={cn(
                    "font-display text-[14px] tracking-[0.06em]",
                    isActive ? "text-[var(--accent)]" : "text-bone",
                  )}
                >
                  {s.title.toUpperCase()}
                </span>
              </span>
              <span className="max-w-full font-mono text-[11px] text-dim sm:max-w-[46%]">
                {s.blurb}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
