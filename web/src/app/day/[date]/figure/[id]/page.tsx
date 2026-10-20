import type { Metadata } from "next";
import { NaveShell } from "@/components/chrome/NaveShell";
import { CultureGate } from "@/components/chrome/CultureGate";
import { FigureDetail } from "@/components/figure/FigureDetail";

export const metadata: Metadata = {
  title: "A Figure",
  description: "One figure of the day read through: what it says to you, how it sits in the sky, how often it returns and what to do with it.",
};

interface FigurePageProps {
  params: Promise<{ date: string; id: string }>;
}

/**
 * The day's figure, opened from the day page's headline or a week row:
 * `date` is YYYY-MM-DD (UTC) and `id` is `${a}-${kind}-${b}` in canonical
 * planet order. The reading needs the reader's saved chart, which lives on
 * the device, so FigureDetail composes it on the client.
 */
export default async function FigurePage({ params }: FigurePageProps) {
  const { date, id } = await params;
  return (
    <NaveShell context={`THE FIGURE · ${date}`} active="today">
      <CultureGate>
        <FigureDetail date={date} id={id} />
      </CultureGate>
    </NaveShell>
  );
}
