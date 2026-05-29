import { notFound } from "next/navigation";
import { isCulture, type Culture } from "@/data/cultures";
import { ReadingExperience } from "@/components/reading/ReadingExperience";

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
