// Specimen stub for next/link: a plain anchor. Next-only props are dropped.
import type { AnchorHTMLAttributes, ReactNode } from "react";

type Href = string | { pathname?: string; query?: Record<string, string> };
type Props = AnchorHTMLAttributes<HTMLAnchorElement> & {
  href: Href;
  children?: ReactNode;
  prefetch?: boolean;
  replace?: boolean;
  scroll?: boolean;
};

function toHref(h: Href): string {
  return typeof h === "string" ? h : (h.pathname ?? "") + (h.query ? "?" + new URLSearchParams(h.query) : "");
}

export default function Link({ href, prefetch, replace, scroll, children, ...rest }: Props) {
  void prefetch; void replace; void scroll;
  return <a href={toHref(href)} {...rest}>{children}</a>;
}
