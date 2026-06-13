import Link from "next/link";
import { CULTURES, CULTURE_LABELS } from "@/data/cultures";
import { SectionContainer } from "@/components/ui/SectionContainer";
import { GoldText } from "@/components/ui/GoldText";

export default function NotFound() {
  return (
    <SectionContainer size="default" spacing="default">
      <div className="text-ink-tertiary font-mono text-xs uppercase tracking-[0.3em]">
        404
      </div>
      <GoldText as="h1" className="mt-4 max-w-3xl text-4xl leading-tight md:text-6xl">
        This part of the sky is uncharted.
      </GoldText>
      <p className="text-ink-secondary font-body mt-6 max-w-xl text-lg leading-relaxed">
        The page you asked for is not here. Here is the way back.
      </p>
      <div className="mt-8 flex flex-wrap gap-3">
        <Link
          href="/"
          className="border-gold-soft text-gold-leaf hover:bg-gold-leaf/10 inline-flex items-center gap-2 rounded-full border px-6 py-3 text-sm uppercase tracking-[0.2em] transition-colors"
        >
          Home
        </Link>
        <Link
          href="/reading"
          className="border-hairline text-ink-secondary hover:text-ink-primary hover:border-gold-soft inline-flex items-center gap-2 rounded-full border px-6 py-3 text-sm uppercase tracking-[0.2em] transition-colors"
        >
          Cast your chart
        </Link>
        <Link
          href="/learn"
          className="border-hairline text-ink-secondary hover:text-ink-primary hover:border-gold-soft inline-flex items-center gap-2 rounded-full border px-6 py-3 text-sm uppercase tracking-[0.2em] transition-colors"
        >
          Learn
        </Link>
      </div>
      <div className="border-border-hairline mt-12 border-t pt-8">
        <div className="text-ink-tertiary font-mono text-[11px] uppercase tracking-[0.3em]">
          The five pantheons
        </div>
        <div className="mt-4 flex flex-wrap gap-x-6 gap-y-3">
          {CULTURES.map((c) => (
            <Link
              key={c}
              href={`/pantheon/${c}`}
              className="hover:text-gold-leaf font-display text-ink-secondary text-xl underline-offset-4 hover:underline md:text-2xl"
            >
              {CULTURE_LABELS[c]}
            </Link>
          ))}
        </div>
      </div>
    </SectionContainer>
  );
}
