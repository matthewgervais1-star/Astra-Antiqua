import Link from "next/link";
import { CULTURES, CULTURE_LABELS } from "@/data/cultures";
import { SectionContainer } from "@/components/ui/SectionContainer";

export default function NotFound() {
  return (
    <SectionContainer size="narrow" spacing="loose">
      <div className="text-ink-tertiary font-mono text-xs uppercase tracking-[0.3em]">
        404
      </div>
      <h1 className="font-display text-gold-leaf mt-4 text-4xl md:text-5xl">
        That pantheon is not in this matrix.
      </h1>
      <p className="text-ink-secondary font-body mt-6 text-lg">
        Astra Antiqua currently speaks in the voices of four ancient cultures.
        Choose one to continue.
      </p>
      <div className="mt-10 flex flex-wrap gap-6">
        {CULTURES.map((c) => (
          <Link
            key={c}
            href={`/pantheon/${c}`}
            className="font-display text-ink-primary hover:text-gold-leaf text-2xl transition-colors"
          >
            {CULTURE_LABELS[c]}
          </Link>
        ))}
      </div>
    </SectionContainer>
  );
}
