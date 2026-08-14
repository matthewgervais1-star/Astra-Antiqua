import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  CULTURES,
  CULTURE_LABELS,
  PLANETS,
  PLANET_LABELS,
  PLANET_SYMBOLS,
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
import { SectionDivider } from "@/components/chrome/SectionDivider";
import { ReceptionNote } from "@/components/chrome/ReceptionNote";
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

  return (
    <VoiceScope culture={culture}>
      <NaveShell context={`THE ${label} DOORWAY`} active="voices">
        <NaveHead kicker={`THE ${label} DOORWAY · ${voice.institution}`}>{label}</NaveHead>

        <div className="mx-auto flex max-w-[560px] flex-col gap-5">
          <p className="font-body text-[16px] leading-[1.75] text-prose">
            {orientation.paragraphs[0]}
          </p>
          <p className="font-body text-[16px] leading-[1.75] text-prose">
            {orientation.paragraphs[1]}
          </p>
        </div>

        <div className="mt-16 flex flex-col gap-6">
          <SectionDivider label="THE PANTHEON SEATED" />
          <div className="flex flex-col">
            {PLANETS.map((planet) => (
              <div key={planet}>
                {planet === firstReceived ? (
                  <div className="flex flex-col items-stretch pt-2">
                    <span className="h-px w-full bg-harmony" />
                    <span className="py-2 text-center font-mono text-[11px] tracking-[0.16em] text-dim">
                      BELOW THE RULE: THE THREE RECEIVED
                    </span>
                  </div>
                ) : null}
                <div className="grid grid-cols-[104px_1fr] items-baseline gap-x-4 gap-y-1 border-t border-rule-row py-3 last:border-b sm:grid-cols-[104px_150px_1fr]">
                  <span className="font-mono text-[11px] tracking-[0.08em] text-dim">
                    {PLANET_SYMBOLS[planet]} {PLANET_LABELS[planet].toUpperCase()}
                  </span>
                  <span
                    className={cn(
                      "font-display text-[15px] tracking-[0.04em]",
                      isReceived(planet) ? "text-[var(--accent)]" : "text-bone",
                    )}
                  >
                    {deities[planet].name}
                  </span>
                  <span className="col-span-2 font-body text-[14px] italic leading-[1.6] text-prose sm:col-span-1">
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
                <span className="font-mono text-[15px] text-dim">
                  {ASPECT_GLYPHS[rule.kind]} {rule.angle}°
                </span>
                <span className="font-display text-[13px] tracking-[0.1em] text-bone">
                  {rule.kind.toUpperCase()}
                </span>
                <span className="col-span-2 font-body text-[15px] leading-[1.65] text-prose sm:col-span-1">
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
            <p className="font-body text-[16px] leading-[1.75] text-prose">{CANAAN_CONTINUITY}</p>
            <div className="border border-rule px-[18px] py-[13px] font-mono text-[11px] uppercase leading-[1.7] tracking-[0.06em] text-dim">
              HISTORY, NOT A SEAT: NO LIVING GOD HOLDS A PLANET IN THIS ALMANAC →{" "}
              <Link href="/method" className="text-[var(--accent)]">
                METHOD
              </Link>
            </div>
          </div>
        ) : null}
      </NaveShell>
    </VoiceScope>
  );
}
