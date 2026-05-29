import { notFound } from "next/navigation";
import { isCulture, type Culture } from "@/data/cultures";
import { ForecastExperience } from "@/components/forecast/ForecastExperience";

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
