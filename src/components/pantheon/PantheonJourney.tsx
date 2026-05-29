"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CULTURES, CULTURE_LABELS, type Culture } from "@/data/cultures";
import { useSetRoutePantheon } from "@/components/pantheon/PantheonContext";
import { SectionContainer } from "@/components/ui/SectionContainer";
import { cn } from "@/lib/classNames";

const STEPS = [
  { seg: "", label: "Overview" },
  { seg: "reading", label: "Cast your chart" },
  { seg: "today", label: "Your day" },
  { seg: "forecast", label: "The year ahead" },
] as const;

function roman(n: number): string {
  return ["", "I", "II", "III"][n] ?? String(n);
}

/**
 * Chrome shared by every /pantheon/[culture]/* page. It pushes the route
 * culture into context (which sets the body theme and feeds useActivePantheon
 * for all descendants), and renders the pantheon switcher + the 1-2-3 journey
 * nav above the page content.
 */
export function PantheonJourney({
  culture,
  children,
}: {
  culture: Culture;
  children: React.ReactNode;
}) {
  useSetRoutePantheon(culture);
  const pathname = usePathname() ?? "";
  const base = `/pantheon/${culture}`;
  const sub = pathname.startsWith(base)
    ? pathname.slice(base.length).replace(/^\/+/, "")
    : "";

  return (
    <>
      <SectionContainer size="default" spacing="tight">
        <div className="border-border-hairline flex flex-col gap-4 border-b pb-5">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-ink-tertiary mr-1 font-mono text-[10px] uppercase tracking-[0.3em]">
              Pantheon
            </span>
            {CULTURES.map((c) => {
              const href = sub ? `/pantheon/${c}/${sub}` : `/pantheon/${c}`;
              const isActive = c === culture;
              return (
                <Link
                  key={c}
                  href={href}
                  aria-current={isActive ? "true" : undefined}
                  className={cn(
                    "rounded-full border px-3 py-1 font-mono text-[10px] uppercase tracking-[0.2em] transition-colors",
                    isActive
                      ? "border-gold-soft text-gold-leaf"
                      : "border-hairline text-ink-tertiary hover:text-ink-primary",
                  )}
                >
                  {CULTURE_LABELS[c]}
                </Link>
              );
            })}
          </div>
          <nav
            aria-label="Reading journey"
            className="flex flex-wrap gap-x-5 gap-y-2"
          >
            {STEPS.map((s, i) => {
              const href = s.seg ? `${base}/${s.seg}` : base;
              const isActive = sub === s.seg;
              return (
                <Link
                  key={s.seg || "overview"}
                  href={href}
                  aria-current={isActive ? "page" : undefined}
                  className={cn(
                    "font-display text-lg transition-colors md:text-xl",
                    isActive
                      ? "text-gold-leaf"
                      : "text-ink-tertiary hover:text-ink-primary",
                  )}
                >
                  <span className="text-ink-tertiary mr-2 align-middle font-mono text-[10px]">
                    {i === 0 ? "·" : roman(i)}
                  </span>
                  {s.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </SectionContainer>
      {children}
    </>
  );
}
