import Link from "next/link";

export function SiteFooter() {
  return (
    <footer
      data-site-footer
      className="border-border-hairline site-footer border-t print-hide"
    >
      <div className="text-ink-tertiary mx-auto flex max-w-[1280px] flex-col gap-6 px-6 py-12 text-sm md:flex-row md:items-center md:justify-between">
        <div>
          <p className="font-display text-ink-secondary text-base">
            Astra Antiqua
          </p>
          <p className="mt-1 font-mono text-xs uppercase tracking-[0.2em]">
            Ancient sky, modern measurement
          </p>
        </div>
        <nav className="flex flex-wrap gap-x-6 gap-y-2">
          <Link href="/methodology" className="hover:text-ink-primary">
            Methodology
          </Link>
          <Link href="/translation-matrix" className="hover:text-ink-primary">
            Translation Matrix
          </Link>
          <Link href="/wait-list" className="hover:text-ink-primary">
            Wait List
          </Link>
        </nav>
      </div>
    </footer>
  );
}
