import { notFound } from "next/navigation";
import { PLANETS, type Planet } from "@/data/cultures";
import { PlacementReading } from "@/components/charts/PlacementReading";

interface PageProps {
  params: Promise<{ id: string; body: string }>;
}

function isPlanet(value: string): value is Planet {
  return (PLANETS as readonly string[]).includes(value);
}

export default async function PlacementPage({ params }: PageProps) {
  const { id, body } = await params;
  if (!isPlanet(body)) notFound();
  return <PlacementReading chartId={id} body={body} />;
}
