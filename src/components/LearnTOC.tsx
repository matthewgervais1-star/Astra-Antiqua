import Link from "next/link";
import { LEARN_SECTIONS } from "@/data/learnSections";
import { SectionContainer } from "@/components/ui/SectionContainer";
import { cn } from "@/lib/classNames";

/** Shared footer for every Learn page: a "next section" card plus the full
 *  table of contents, mirroring Co-Star's section navigation. */
export function LearnTOC({ current }: { current?: string }) {
  const idx = LEARN_SECTIONS.findIndex((s) => s.href === current);
  const next = idx >= 0 && idx + 1 < LEARN_SECTIONS.length ? LEARN_SECTIONS[idx + 1] : null;

  return (
    <SectionContainer size="default" spacing="default">
      <div className="border-border-hairline grid gap-10 border-t pt-10 md:grid-cols-2">
        <div>
          <div className="text-ink-tertiary font-mono text-[11px] uppercase tracking-[0.3em]">
            {next ? "Next section" : "The end of the guide"}
          </div>
          {next ? (
            <Link
              href={next.href}
              className="border-border-hairline hover:border-gold-soft mt-4 block rounded-2xl border p-6 transition-colors"
            >
              <div className="font-display text-gold-leaf text-2xl">
                <span className="text-ink-tertiary mr-2 font-mono text-sm">{next.n}</span>
                {next.title}
              </div>
              <p className="text-ink-secondary font-body mt-2 text-sm leading-relaxed">
                {next.blurb}
              </p>
              <span className="text-gold-leaf font-mono mt-3 inline-block text-[11px] uppercase tracking-[0.25em]">
                Read →
              </span>
            </Link>
          ) : (
            <Link
              href="/reading"
              className="border-gold-soft text-gold-leaf hover:bg-gold-leaf/10 mt-4 inline-flex items-center gap-2 rounded-full border px-6 py-3 text-sm uppercase tracking-[0.2em] transition-colors"
            >
              Now cast your chart →
            </Link>
          )}
        </div>
        <div>
          <div className="text-ink-tertiary font-mono text-[11px] uppercase tracking-[0.3em]">
            All sections
          </div>
          <ul className="mt-4 flex flex-col gap-2.5">
            {LEARN_SECTIONS.map((s) => (
              <li key={s.href}>
                <Link
                  href={s.href}
                  aria-current={s.href === current ? "page" : undefined}
                  className={cn(
                    "font-mono text-sm uppercase tracking-[0.15em] transition-colors",
                    s.href === current
                      ? "text-gold-leaf"
                      : "text-ink-secondary hover:text-ink-primary",
                  )}
                >
                  <span className="text-ink-tertiary mr-3">{s.n}</span>
                  {s.title}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </SectionContainer>
  );
}
