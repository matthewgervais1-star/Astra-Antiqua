import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CULTURE_LABELS, isCulture, type Culture } from "@/data/cultures";
import { ForecastExperience } from "@/components/forecast/ForecastExperience";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ culture: string }>;
}): Promise<Metadata> {
  const { culture: raw } = await params;
  if (!isCulture(raw)) return {};
  const label = CULTURE_LABELS[raw];
  return {
    title: `The year ahead · ${label}`,
    description: `Your year ahead in the sky, told in the names of ${label}.`,
  };
}

export default async function CultureForecastPage({
  params,
}: {
  params: Promise<{ culture: string }>;
}) {
  const { culture: raw } = await params;
  if (!isCulture(raw)) notFound();
  const culture: Culture = raw;
  return <ForecastExperience culture={culture} showSelector={false} />;
}
