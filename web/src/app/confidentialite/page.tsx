import type { Metadata } from "next";
import { LegalDocument } from "@/components/legal/LegalDocument";
import { PRIVACY_FR, storageSection } from "@/lib/legal/privacyCopy";
import { POLICY_FACTS, storedOutsideQuebec } from "@/lib/legal/policyFacts";

export const metadata: Metadata = {
  title: PRIVACY_FR.metaTitle,
  description: PRIVACY_FR.metaDescription,
  alternates: {
    canonical: "/confidentialite",
    languages: { "fr-CA": "/confidentialite", "en-CA": "/privacy" },
  },
};

export default function ConfidentialitePage() {
  return (
    <LegalDocument
      copy={PRIVACY_FR}
      extraSections={[
        storageSection(
          PRIVACY_FR,
          storedOutsideQuebec(),
          POLICY_FACTS.transferAssessmentCompleted,
        ),
      ]}
    />
  );
}
