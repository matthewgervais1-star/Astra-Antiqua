import type { Metadata } from "next";
import { Lintel } from "@/components/chrome/Lintel";
import { CultureGate } from "@/components/chrome/CultureGate";
import { MethodFooter } from "@/components/chrome/MethodFooter";
import { TransitDetail } from "@/components/transits/TransitDetail";

export const metadata: Metadata = {
  title: "A Long Transit",
  description: "A reading scoped to one long transit's whole span, from its first exact pass to its release.",
};

interface TransitDetailPageProps {
  params: Promise<{ id: string }>;
}

/**
 * The long-transit reading itself (3a-long-transit-greece.html). The
 * sub-bar's context depends on the resolved span (transit deity, natal
 * point, span dates), which is only known once the client-side spans are
 * computed, so it is composed inside TransitDetail rather than here; this
 * shell only supplies the Lintel, the culture gate, and the method footer.
 */
export default async function TransitDetailPage({ params }: TransitDetailPageProps) {
  const { id } = await params;
  return (
    <>
      <Lintel active="today" />
      <CultureGate>
        <TransitDetail id={id} />
      </CultureGate>
      <MethodFooter />
    </>
  );
}
