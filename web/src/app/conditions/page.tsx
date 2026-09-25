import type { Metadata } from "next";
import { LegalDocument } from "@/components/legal/LegalDocument";
import { TERMS_FR } from "@/lib/legal/termsCopy";

export const metadata: Metadata = {
  title: TERMS_FR.metaTitle,
  description: TERMS_FR.metaDescription,
  alternates: {
    canonical: "/conditions",
    languages: { "fr-CA": "/conditions", "en-CA": "/terms" },
  },
};

export default function ConditionsPage() {
  return <LegalDocument copy={TERMS_FR} />;
}
