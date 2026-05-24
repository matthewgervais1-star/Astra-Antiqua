import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CULTURES, CULTURE_LABELS, isCulture, type Culture } from "@/data/cultures";
import { getCultureDeities } from "@/data/deities";
import { CULTURAL_ORIENTATIONS } from "@/data/culturalOrientations";
import { INTERPRETIVE_NOTES } from "@/data/methodologyContent";
import { ORACLE_DECREES } from "@/data/oracleDecrees";
import { DeityCard } from "@/components/pantheon/DeityCard";
import { InterpretiveNote } from "@/components/pantheon/InterpretiveNote";
import { SectionContainer } from "@/components/ui/SectionContainer";
import { GoldText } from "@/components/ui/GoldText";
import { DeityGlyph } from "@/components/glyphs/DeityGlyph";

interface PantheonPageParams {
  culture: string;
}

interface PantheonPageProps {
  params: Promise<PantheonPageParams>;
}

export function generateStaticParams(): PantheonPageParams[] {
  return CULTURES.map((culture) => ({ culture }));
}

export async function generateMetadata({ params }: PantheonPageProps): Promise<Metadata> {
  const { culture: raw } = await params;
  if (!isCulture(raw)) return { title: "Not Found" };
  const label = CULTURE_LABELS[raw];
  const decree = ORACLE_DECREES[raw];
  return {
    title: `${label} · ${decree.oracleName}`,
    description: CULTURAL_ORIENTATIONS[raw].shortTagline,
  };
}

export default async function PantheonPage({ params }: PantheonPageProps) {
  const { culture: raw } = await params;
  if (!isCulture(raw)) notFound();
  const culture: Culture = raw;
  const orientation = CULTURAL_ORIENTATIONS[culture];
  const deities = getCultureDeities(culture);
  const decree = ORACLE_DECREES[culture];
  const notes = INTERPRETIVE_NOTES.filter((n) => n.cultures.includes(culture));

  return (
    <>
      <SectionContainer size="default" spacing="tight">
        <div className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
          <div className="flex-1">
            <div className="text-ink-tertiary font-mono text-xs uppercase tracking-[0.3em]">
              Pantheon
            </div>
            <GoldText as="h1" className="mt-3 text-5xl md:text-7xl">
              {orientation.cultureLabel}
            </GoldText>
            <p className="text-ink-secondary font-body mt-4 max-w-xl text-lg italic md:text-xl">
              {orientation.shortTagline}
            </p>
            <div className="text-ink-tertiary mt-6 flex flex-wrap items-center gap-3 font-mono text-[11px] uppercase tracking-[0.25em]">
              <span>{decree.oracleName}</span>
              <span className="text-border-gold">·</span>
              <Link
                href={`/?pantheon=${culture}`}
                className="text-gold-leaf hover:opacity-80"
              >
                Open in the live wheel
              </Link>
            </div>
          </div>
          <div className="hidden text-right md:block">
            <DeityGlyph culture={culture} planet="sun" size={140} />
          </div>
        </div>
      </SectionContainer>

      <SectionContainer size="default" spacing="tight">
        <div className="grid gap-6 md:grid-cols-12">
          <p className="text-ink-primary font-body md:col-span-7 md:col-start-3 text-lg leading-relaxed md:text-xl">
            {orientation.paragraphs[0]}
          </p>
          <p className="text-ink-secondary font-body md:col-span-7 md:col-start-3 mt-2 text-lg leading-relaxed md:text-xl">
            {orientation.paragraphs[1]}
          </p>
        </div>
      </SectionContainer>

      <SectionContainer size="default" spacing="default">
        <div className="mb-12 md:mb-16">
          <h2 className="font-display text-ink-primary text-3xl md:text-4xl">
            The seven of {orientation.cultureLabel}
          </h2>
          <p className="text-ink-tertiary font-mono mt-3 text-[11px] uppercase tracking-[0.3em]">
            Planetary correspondences
          </p>
        </div>
        <div className="flex flex-col gap-4 md:gap-5">
          {deities.map((deity) => (
            <DeityCard key={`${deity.culture}-${deity.planet}`} deity={deity} />
          ))}
        </div>
      </SectionContainer>

      {notes.length > 0 ? (
        <SectionContainer size="default" spacing="tight">
          <div className="mb-10">
            <h2 className="font-display text-ink-primary text-3xl md:text-4xl">
              Interpretive notes
            </h2>
            <p className="text-ink-tertiary font-body mt-3 max-w-xl text-base md:text-lg">
              Mappings in this pantheon that involve reconstructive or contested choices.
              The full methodology is documented{" "}
              <Link href="/methodology" className="text-gold-leaf underline-offset-4 hover:underline">
                here
              </Link>
              .
            </p>
          </div>
          <div className="grid gap-5 md:grid-cols-2">
            {notes.map((note) => (
              <InterpretiveNote key={note.id} title={note.title}>
                {note.body}
              </InterpretiveNote>
            ))}
          </div>
        </SectionContainer>
      ) : null}

      <SectionContainer size="default" spacing="tight">
        <div className="border-border-hairline border-t pt-10">
          <div className="text-ink-tertiary font-mono text-[11px] uppercase tracking-[0.25em]">
            Continue
          </div>
          <div className="mt-4 flex flex-wrap gap-4 md:gap-8">
            {CULTURES.filter((c) => c !== culture).map((other) => (
              <Link
                key={other}
                href={`/pantheon/${other}`}
                className="font-display text-ink-secondary hover:text-gold-leaf text-2xl transition-colors md:text-3xl"
              >
                {CULTURE_LABELS[other]}
              </Link>
            ))}
          </div>
        </div>
      </SectionContainer>
    </>
  );
}
