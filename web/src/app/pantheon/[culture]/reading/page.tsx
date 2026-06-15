import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CULTURE_LABELS, isCulture, type Culture } from "@/data/cultures";
import { ReadingExperience } from "@/components/reading/ReadingExperience";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ culture: string }>;
}): Promise<Metadata> {
  const { culture: raw } = await params;
  if (!isCulture(raw)) return {};
  const label = CULTURE_LABELS[raw];
  return {
    title: `Cast your chart · ${label}`,
    description: `Cast your natal chart and read it in the names of ${label}.`,
  };
}

export default async function CultureReadingPage({
  params,
}: {
  params: Promise<{ culture: string }>;
}) {
  const { culture: raw } = await params;
  if (!isCulture(raw)) notFound();
  const culture: Culture = raw;
  return <ReadingExperience culture={culture} showSelector={false} />;
}
