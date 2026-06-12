import Link from "next/link";
import { AccountChip } from "@/components/auth/AccountChip";

const NAV = [
  { href: "/", label: "Home" },
  { href: "/forecast", label: "Forecast" },
  { href: "/reading", label: "Reading" },
  { href: "/charts", label: "Charts" },
  { href: "/synastry", label: "Synastry" },
  { href: "/methodology", label: "Methodology" },
  { href: "/translation-matrix", label: "Matrix" },
] as const;

export function SiteHeader() {
  return (
    <header
      data-site-header
      className="bg-bg-void/80 border-border-hairline site-header sticky top-0 z-40 w-full border-b backdrop-blur-md print-hide"
    >
      <div className="mx-auto flex max-w-[1280px] items-center justify-between gap-4 px-6 py-5">
        <Link
          href="/"
          className="font-display text-gold-leaf shrink-0 whitespace-nowrap text-[18px] tracking-tight md:text-[20px]"
        >
          Astra Antiqua
        </Link>
        <nav className="hidden gap-6 md:flex">
          {NAV.slice(1).map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="nav-link text-ink-secondary hover:text-ink-primary text-sm transition-colors"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          <AccountChip />
        </div>
      </div>
    </header>
  );
}
