import type { Metadata } from "next";
import { LegalDocument } from "@/components/legal/LegalDocument";
import { TERMS_EN } from "@/lib/legal/termsCopy";

export const metadata: Metadata = {
  title: TERMS_EN.metaTitle,
  description: TERMS_EN.metaDescription,
  alternates: {
    canonical: "/terms",
    languages: { "en-CA": "/terms", "fr-CA": "/conditions" },
  },
};

export default function TermsPage() {
  return <LegalDocument copy={TERMS_EN} />;
}
