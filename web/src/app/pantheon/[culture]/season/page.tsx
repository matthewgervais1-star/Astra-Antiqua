import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CULTURE_LABELS, isCulture, type Culture } from "@/data/cultures";
import { SeasonExperience } from "@/components/season/SeasonExperience";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ culture: string }>;
}): Promise<Metadata> {
  const { culture: raw } = await params;
  if (!isCulture(raw)) return {};
  const label = CULTURE_LABELS[raw];
  return {
    title: `The season · ${label}`,
    description: `The zodiac season now underway, told in the names of ${label}.`,
  };
}

export default async function CultureSeasonPage({
  params,
}: {
  params: Promise<{ culture: string }>;
}) {
  const { culture: raw } = await params;
  if (!isCulture(raw)) notFound();
  const culture: Culture = raw;
  return <SeasonExperience culture={culture} showSelector={false} />;
}
