import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  CULTURES,
  CULTURE_LABELS,
  PLANETS,
  PLANET_LABELS,
  RECEIVED_BODIES,
  isCulture,
  isReceived,
  type Culture,
} from "@/data/cultures";
import { CULTURE_VOICES } from "@/data/cultureVoice";
import { CULTURAL_ORIENTATIONS } from "@/data/culturalOrientations";
import { DEITY_MATRIX } from "@/data/deities";
import { ASPECT_RULINGS } from "@/data/aspectRulings";
import { ASPECT_RULES, type AspectKind } from "@/data/sampleChart";
import { NaveShell } from "@/components/chrome/NaveShell";
import { NaveHead } from "@/components/chrome/NaveHead";
import { CultureEmblem } from "@/components/chrome/CultureEmblem";
import { IconTile, type IconTileMark } from "@/components/chrome/IconTile";
import { SectionDivider } from "@/components/chrome/SectionDivider";
import { ReceptionNote } from "@/components/chrome/ReceptionNote";
import { DeityGlyph } from "@/components/chrome/DeityGlyph";
import { VoiceScope } from "@/components/voices/VoiceScope";
import { TodaySpecimen } from "@/components/voices/TodaySpecimen";
import { EnterVoiceCta } from "@/components/voices/EnterVoiceCta";
import { cn } from "@/lib/classNames";

const ASPECT_GLYPHS: Readonly<Record<AspectKind, string>> = {
  conjunction: "☌",
  sextile: "⚹",
  square: "□",
  trine: "△",
  opposition: "☍",
};

const CANAAN_CONTINUITY =
  "This council did not vanish. A god from the southern deserts, Yahweh, was drawn into it and " +
  "then identified with El himself. He took El's titles, his tent, and his seat at the head of " +
  "the assembly. In the oldest reading of Deuteronomy, he still stands among the sons of El, " +
  "receiving Israel as his portion. Later, the rest of the council was demoted to angels, and " +
  "the assembly became a heaven with one throne. The scale, the vow, and the court you read " +
  "here are the older furniture of that house.";

interface Figure {
  mark: IconTileMark;
  caption: string;
}

/**
 * The tier-3 figures per doorway, from docs/design/system/readme.md,
 * Iconography: the signs that exist as encoded characters, set as type in
 * their epigraphic faces, and the three marks that only ever existed as
 * objects, traced from a source photograph. The captions are the ones
 * guidelines/marks-traced.html and canvas-1a/DECISIONS.md give them. Carthage
 * has no encoded sign and no traced mask, so its row is empty and nothing
 * renders. Bone ink: the doorway's accent is already spent on the emblem in
 * the head, and the accent is never applied twice on one screen.
 */
const CULTURE_FIGURES: Readonly<Record<Culture, readonly Figure[]>> = {
  egypt: [
    { mark: "ankh", caption: "THE ANKH · U+2625" },
    { mark: "balance", caption: "THE BALANCE · GARDINER U38, U+1335D" },
  ],
  greece: [{ mark: "omega", caption: "OMEGA · U+03A9, GFS DIDOT" }],
  canaan: [
    { mark: "il", caption: "THE NAME OF EL · UGARITIC U+1039B U+1038D" },
    { mark: "baal-stele", caption: "THE BAAL STELE · LOUVRE AO 15775" },
  ],
  carthage: [],
  rome: [
    { mark: "shewolf", caption: "THE SHE-WOLF · CAPITOLINE BRONZE" },
    { mark: "augustus", caption: "AUGUSTUS · PRIMA PORTA" },
  ],
};

interface VoicePageParams {
  culture: string;
}

interface VoicePageProps {
  params: Promise<VoicePageParams>;
}

export function generateStaticParams(): Array<{ culture: string }> {
  return CULTURES.map((culture) => ({ culture }));
}

export async function generateMetadata({ params }: VoicePageProps): Promise<Metadata> {
  const { culture: raw } = await params;
  if (!isCulture(raw)) return { title: "Not found" };
  const label = CULTURE_LABELS[raw];
  return {
    title: `The ${label} Doorway`,
    description: CULTURAL_ORIENTATIONS[raw].shortTagline,
  };
}

export default async function VoiceCulturePage({ params }: VoicePageProps) {
  const { culture: raw } = await params;
  if (!isCulture(raw)) notFound();
  const culture: Culture = raw;

  const voice = CULTURE_VOICES[culture];
  const orientation = CULTURAL_ORIENTATIONS[culture];
  const deities = DEITY_MATRIX[culture];
  const rulings = ASPECT_RULINGS[culture];
  const label = CULTURE_LABELS[culture].toUpperCase();
  const firstReceived = RECEIVED_BODIES[0];
  const figures = CULTURE_FIGURES[culture];

  return (
    <VoiceScope culture={culture}>
      <NaveShell context={`THE ${label} DOORWAY`} active="voices">
        <NaveHead
          kicker={`THE ${label} DOORWAY · ${voice.institution}`}
          emblem={
            <CultureEmblem culture={culture} size={72} decorative className="text-accent" />
          }
        >
          {label}
        </NaveHead>

        <div className="mx-auto flex max-w-[560px] flex-col gap-5">
          <p className="font-body text-prose-m leading-prose text-prose">
            {orientation.paragraphs[0]}
          </p>
          <p className="font-body text-prose-m leading-prose text-prose">
            {orientation.paragraphs[1]}
          </p>
        </div>

        {figures.length > 0 ? (
          <div className="mx-auto mt-[var(--space-6)] flex max-w-[560px] flex-wrap justify-center gap-[var(--space-4)]">
            {figures.map((figure) => (
              <figure
                key={figure.mark}
                className="m-0 flex w-[150px] flex-col items-center gap-[var(--space-2)]"
              >
                <IconTile mark={figure.mark} size="md" ink="bone" decorative />
                <figcaption className="text-center font-mono text-data-xs tracking-label text-dim">
                  {figure.caption}
                </figcaption>
              </figure>
            ))}
          </div>
        ) : null}

        <div className="mt-16 flex flex-col gap-6">
          <SectionDivider label="THE PANTHEON SEATED" />
          <div className="flex flex-col">
            {PLANETS.map((planet) => (
              <div key={planet}>
                {planet === firstReceived ? (
                  <div className="flex flex-col items-stretch pt-2">
                    <span className="h-px w-full bg-harmony" />
                    <span className="py-2 text-center font-mono text-data-xs tracking-label text-dim">
                      BELOW THE RULE: THE THREE RECEIVED
                    </span>
                  </div>
                ) : null}
                <div className="grid grid-cols-[104px_1fr] items-center gap-x-4 gap-y-1 border-t border-rule-row py-3 last:border-b sm:grid-cols-[104px_150px_1fr]">
                  <span className="inline-flex items-center gap-[var(--space-1)] font-mono text-data-xs tracking-data text-dim">
                    <DeityGlyph body={planet} culture={culture} size={16} decorative />
                    {PLANET_LABELS[planet].toUpperCase()}
                  </span>
                  <span
                    className={cn(
                      "font-display text-[15px] tracking-[0.04em]",
                      isReceived(planet) ? "text-accent" : "text-bone",
                    )}
                  >
                    {deities[planet].name}
                  </span>
                  <span className="col-span-2 font-body text-prose-s italic leading-prose text-prose sm:col-span-1">
                    {deities[planet].epithet}
                  </span>
                </div>
              </div>
            ))}
          </div>
          <ReceptionNote intro={voice.receptionLine} />
        </div>

        <div className="mt-16 flex flex-col gap-6">
          <SectionDivider label={`HOW ${label} RULES THE ASPECTS`} />
          <div className="flex flex-col">
            {ASPECT_RULES.map((rule) => (
              <div
                key={rule.kind}
                className="grid grid-cols-[76px_1fr] gap-x-4 gap-y-1 border-t border-rule-row py-4 last:border-b sm:grid-cols-[92px_150px_1fr]"
              >
                <span className="font-mono text-data-m text-dim">
                  {ASPECT_GLYPHS[rule.kind]} {rule.angle}°
                </span>
                <span className="font-display text-[13px] tracking-[0.1em] text-bone">
                  {rule.kind.toUpperCase()}
                </span>
                <span className="col-span-2 font-body text-prose-s leading-prose text-prose sm:col-span-1">
                  {rulings[rule.kind]}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-16 flex flex-col gap-6">
          <SectionDivider label="TODAY, IN THIS VOICE" />
          <TodaySpecimen culture={culture} />
        </div>

        <div className="mt-16">
          <EnterVoiceCta culture={culture} label={`ENTER · READ TODAY IN THE ${label} VOICE`} />
        </div>

        {culture === "canaan" ? (
          <div className="mt-16 flex flex-col gap-6">
            <SectionDivider label="WHERE THIS RELIGION WENT" />
            <p className="font-body text-prose-m leading-prose text-prose">{CANAAN_CONTINUITY}</p>
            <div className="border border-rule px-[var(--space-3)] py-[var(--space-2)] font-mono text-data-xs uppercase leading-data tracking-data text-dim">
              HISTORY, NOT A SEAT: NO LIVING GOD HOLDS A PLANET IN THIS ALMANAC →{" "}
              <Link href="/method" className="text-accent">
                METHOD
              </Link>
            </div>
          </div>
        ) : null}
      </NaveShell>
    </VoiceScope>
  );
}
