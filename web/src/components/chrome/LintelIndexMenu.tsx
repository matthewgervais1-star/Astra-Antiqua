"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { cn } from "@/lib/classNames";
import type { LintelSection } from "@/components/chrome/Lintel";

interface IndexItem {
  key: LintelSection;
  label: string;
  href: string;
}

const INDEX_ITEMS: readonly IndexItem[] = [
  { key: "today", label: "TODAY", href: "/" },
  { key: "voices", label: "VOICES", href: "/voices" },
  { key: "learn", label: "LEARN", href: "/learn" },
  { key: "charts", label: "CHARTS", href: "/charts" },
  { key: "account", label: "ACCOUNT", href: "/account" },
];

/**
 * The Lintel's small-screen navigation: a single INDEX disclosure listing
 * all five routes, since the side navs have nowhere to go below 720px.
 * Pattern-matches layout/MobileMenu.tsx (close on route change, close on
 * Escape) restyled to the new identity: bordered, no rounded corners.
 */
export function LintelIndexMenu({
  active,
  className,
}: {
  active?: LintelSection;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <div className={cn("relative", className)}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls="lintel-index-panel"
        aria-label={open ? "Close index" : "Open index"}
        className="font-mono text-data-s tracking-microcopy text-bone/60 hover:text-bone"
      >
        INDEX {open ? "▴" : "▾"}
      </button>
      {open ? (
        <div
          id="lintel-index-panel"
          className="absolute inset-x-0 top-full z-40 border border-rule bg-ground px-5 py-1"
        >
          <nav className="flex flex-col">
            {INDEX_ITEMS.map((item) => {
              const isActive = item.key === active;
              return (
                <Link
                  key={item.key}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  aria-current={isActive ? "page" : undefined}
                  className={cn(
                    "border-b border-rule-row py-3 font-mono text-data-s tracking-microcopy last:border-b-0",
                    isActive ? "text-accent" : "text-bone/80 hover:text-bone",
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
      ) : null}
    </div>
  );
}
