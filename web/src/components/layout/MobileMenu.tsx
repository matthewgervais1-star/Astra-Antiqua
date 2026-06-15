"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface NavItem {
  href: string;
  label: string;
}

/**
 * The small-screen navigation. The desktop header row is hidden below lg, so
 * without this the site has no way to navigate on a phone. A hamburger button
 * toggles a full-width panel of every route; it closes on selection, on route
 * change, and on Escape.
 */
export function MobileMenu({ items }: { items: readonly NavItem[] }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  // Close whenever the route changes (a link was followed).
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setOpen(false);
  }, [pathname]);

  // Close on Escape, and lock body scroll while the panel is open.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <div className="lg:hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls="mobile-nav-panel"
        aria-label={open ? "Close menu" : "Open menu"}
        className="border-border-hairline hover:border-gold-soft text-ink-secondary hover:text-ink-primary flex h-10 w-10 items-center justify-center rounded-full border transition-colors"
      >
        <span aria-hidden className="relative block h-3 w-4">
          <span
            className={`bg-current absolute left-0 block h-[1.5px] w-4 transition-all duration-300 ${
              open ? "top-1/2 -translate-y-1/2 rotate-45" : "top-0"
            }`}
          />
          <span
            className={`bg-current absolute left-0 top-1/2 block h-[1.5px] w-4 -translate-y-1/2 transition-opacity duration-200 ${
              open ? "opacity-0" : "opacity-100"
            }`}
          />
          <span
            className={`bg-current absolute left-0 block h-[1.5px] w-4 transition-all duration-300 ${
              open ? "top-1/2 -translate-y-1/2 -rotate-45" : "bottom-0"
            }`}
          />
        </span>
      </button>

      {open ? (
        <div
          id="mobile-nav-panel"
          className="bg-bg-void/95 border-border-hairline fixed inset-x-0 top-[68px] z-40 border-b backdrop-blur-md"
        >
          <nav className="mx-auto flex max-w-[1280px] flex-col gap-1 px-6 py-4">
            {items.map((item) => {
              const active =
                item.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  aria-current={active ? "page" : undefined}
                  className={`font-display rounded-lg px-3 py-3 text-lg transition-colors ${
                    active
                      ? "text-gold-leaf bg-gold-leaf/5"
                      : "text-ink-secondary hover:text-ink-primary hover:bg-bg-elevated"
                  }`}
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
