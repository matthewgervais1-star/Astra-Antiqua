import Link from "next/link";
import { Monogram } from "@/components/chrome/Monogram";

const LINK_CLASS =
  "border-b border-bone/40 pb-[2px] hover:border-rule-active";

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-[560px] flex-col items-center px-5 py-24 text-center">
      <Monogram height={56} className="mb-[var(--space-4)] text-bone" />
      <div className="font-mono text-data-xs tracking-microcopy text-dim">
        NOTHING IS CHARTED HERE
      </div>
      <div className="my-[var(--space-3)] h-px w-11 bg-accent" />
      <h1 className="font-display text-display-s leading-display tracking-display text-bone">
        THIS PART OF THE SKY IS UNMAPPED
      </h1>
      <p className="mx-auto mt-3 max-w-[360px] font-body text-prose-s leading-prose text-prose">
        Nothing was ever charted at this address. Here is the way back.
      </p>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-3 font-mono text-data-xs tracking-label text-bone">
        <Link href="/" className={LINK_CLASS}>
          THE DAY
        </Link>
        <Link href="/voices" className={LINK_CLASS}>
          THE FIVE VOICES
        </Link>
        <Link href="/method" className={LINK_CLASS}>
          THE METHOD
        </Link>
      </div>
    </div>
  );
}
