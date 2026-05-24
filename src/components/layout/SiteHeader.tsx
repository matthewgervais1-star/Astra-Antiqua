import Link from "next/link";

const NAV = [
  { href: "/", label: "Home" },
  { href: "/reading", label: "Compute Reading" },
  { href: "/methodology", label: "Methodology" },
  { href: "/translation-matrix", label: "Translation Matrix" },
  { href: "/wait-list", label: "Wait List" },
] as const;

export function SiteHeader() {
  return (
    <header className="bg-bg-void/80 border-border-hairline sticky top-0 z-40 w-full border-b backdrop-blur-md">
      <div className="mx-auto flex max-w-[1280px] items-center justify-between px-6 py-5">
        <Link
          href="/"
          className="font-display text-gold-leaf text-[20px] tracking-tight"
        >
          Astra Antiqua
        </Link>
        <nav className="hidden gap-8 md:flex">
          {NAV.slice(1).map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-ink-secondary hover:text-ink-primary text-sm transition-colors"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <Link
          href="/wait-list"
          className="border-gold-soft text-gold-leaf hover:bg-gold-leaf/10 rounded-full border px-4 py-1.5 text-xs uppercase tracking-[0.18em] transition-colors md:hidden"
        >
          Join
        </Link>
      </div>
    </header>
  );
}
