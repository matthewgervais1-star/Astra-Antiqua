import { notFound } from "next/navigation";
import { CULTURES, isCulture, type Culture } from "@/data/cultures";
import { PantheonJourney } from "@/components/pantheon/PantheonJourney";

interface LayoutProps {
  children: React.ReactNode;
  params: Promise<{ culture: string }>;
}

// Supplies the [culture] param for this segment and all of its child pages
// (overview, reading, today, forecast), so each is statically generated.
export function generateStaticParams(): Array<{ culture: string }> {
  return CULTURES.map((culture) => ({ culture }));
}

export default async function PantheonCultureLayout({
  children,
  params,
}: LayoutProps) {
  const { culture: raw } = await params;
  if (!isCulture(raw)) notFound();
  const culture: Culture = raw;
  return <PantheonJourney culture={culture}>{children}</PantheonJourney>;
}
