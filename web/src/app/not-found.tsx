import Link from "next/link";

const LINK_CLASS =
  "border-b border-bone/40 pb-[2px] transition-colors hover:text-[var(--accent)] hover:border-[var(--accent)]";

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-[560px] flex-col items-center px-5 py-24 text-center">
      <div className="font-mono text-[11px] tracking-[0.18em] text-dim">
        NOTHING IS CHARTED HERE
      </div>
      <div className="my-[18px] h-px w-11 bg-[var(--accent)]" />
      <h1 className="font-display text-[19px] leading-[1.5] tracking-[0.1em] text-bone">
        THIS PART OF THE SKY IS UNMAPPED
      </h1>
      <p className="mx-auto mt-3 max-w-[360px] font-body text-[14px] leading-[1.65] text-prose">
        Nothing was ever charted at this address. Here is the way back.
      </p>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-3 font-mono text-[11px] tracking-[0.14em] text-bone">
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
