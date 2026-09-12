import Link from "next/link";
import { Wordmark } from "@/components/chrome/Wordmark";

/**
 * The welcome funnel's own slim header: just the wordmark, no site nav. The
 * shared Lintel's side navs collapse into an INDEX disclosure below 720px and
 * read lopsided at this funnel's narrow centered column, so the funnel gets a
 * dedicated header instead of the shared chassis component.
 */
export function WelcomeHeader() {
  return (
    <header className="border-b border-rule px-4 py-6 text-center">
      <Link href="/" className="font-display text-[15px] font-medium tracking-[0.3em] text-bone">
        <Wordmark capHeight={10.5} />
      </Link>
    </header>
  );
}
