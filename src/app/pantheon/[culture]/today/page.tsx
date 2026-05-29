import { notFound } from "next/navigation";
import { CULTURE_LABELS, isCulture, type Culture } from "@/data/cultures";
import { TodayDashboard } from "@/components/daily/TodayDashboard";
import { WeekForecastSection } from "@/components/daily/WeekForecastSection";
import { SectionContainer } from "@/components/ui/SectionContainer";

export default async function CultureTodayPage({
  params,
}: {
  params: Promise<{ culture: string }>;
}) {
  const { culture: raw } = await params;
  if (!isCulture(raw)) notFound();
  const culture: Culture = raw;
  return (
    <>
      <SectionContainer size="default" spacing="tight">
        <div className="text-ink-tertiary font-mono text-[11px] uppercase tracking-[0.3em]">
          Today
        </div>
        <h1 className="font-display text-ink-primary mt-2 text-3xl md:text-4xl">
          The sky right now, in the voice of {CULTURE_LABELS[culture]}.
        </h1>
      </SectionContainer>

      <SectionContainer size="default" spacing="tight">
        <TodayDashboard culture={culture} />
      </SectionContainer>

      <SectionContainer size="default" spacing="default">
        <div className="mb-10 md:mb-12">
          <div className="text-ink-tertiary font-mono text-[11px] uppercase tracking-[0.3em]">
            The coming week
          </div>
          <h2 className="font-display text-ink-primary mt-3 text-3xl md:text-4xl">
            Seven days of sky.
          </h2>
        </div>
        <WeekForecastSection culture={culture} />
      </SectionContainer>
    </>
  );
}
