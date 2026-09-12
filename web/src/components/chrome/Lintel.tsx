import Link from "next/link";
import { LintelIndexMenu } from "@/components/chrome/LintelIndexMenu";
import { Wordmark } from "@/components/chrome/Wordmark";

export type LintelSection = "today" | "voices" | "learn" | "charts" | "account";

export interface LintelProps {
  active?: LintelSection;
}

interface NavItem {
  key: LintelSection;
  label: string;
  href: string;
}

const LEFT_NAV: readonly NavItem[] = [
  { key: "today", label: "TODAY", href: "/" },
  { key: "voices", label: "VOICES", href: "/voices" },
  { key: "learn", label: "LEARN", href: "/learn" },
];

const RIGHT_NAV: readonly NavItem[] = [
  { key: "charts", label: "CHARTS", href: "/charts" },
  { key: "account", label: "ACCOUNT", href: "/account" },
];

function navLink(item: NavItem, active: LintelSection | undefined) {
  const isActive = item.key === active;
  return (
    <Link
      key={item.key}
      href={item.href}
      aria-current={isActive ? "page" : undefined}
      className={isActive ? "text-[var(--accent)]" : "text-bone/60 hover:text-bone"}
    >
      {item.label}
    </Link>
  );
}

/**
 * The nave chassis header: CSS grid 1fr/auto/1fr, wordmark centered. Side
 * navs collapse below 720px into the INDEX disclosure (LintelIndexMenu), so
 * this component itself stays a server component with no client state.
 */
export function Lintel({ active }: LintelProps) {
  return (
    <header className="relative grid grid-cols-[1fr_auto_1fr] items-center border-b border-rule px-5 py-5 md:px-14">
      <nav className="hidden items-center gap-[26px] font-display text-[12px] tracking-[0.22em] min-[720px]:flex">
        {LEFT_NAV.map((item) => navLink(item, active))}
      </nav>
      <Link
        href="/"
        className="justify-self-center whitespace-nowrap px-4 text-center font-display text-[17px] font-medium tracking-[0.3em] text-bone md:px-10"
      >
        <Wordmark capHeight={11.9} />
      </Link>
      <div className="flex items-center justify-end">
        <nav className="hidden items-center gap-[26px] font-display text-[12px] tracking-[0.22em] min-[720px]:flex">
          {RIGHT_NAV.map((item) => navLink(item, active))}
        </nav>
        <LintelIndexMenu active={active} className="min-[720px]:hidden" />
      </div>
    </header>
  );
}
