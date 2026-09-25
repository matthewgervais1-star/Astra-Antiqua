import type { Metadata } from "next";
import { LegalDocument } from "@/components/legal/LegalDocument";
import { PRIVACY_EN, storageSection } from "@/lib/legal/privacyCopy";
import { POLICY_FACTS, storedOutsideQuebec } from "@/lib/legal/policyFacts";

export const metadata: Metadata = {
  title: PRIVACY_EN.metaTitle,
  description: PRIVACY_EN.metaDescription,
  alternates: {
    canonical: "/privacy",
    languages: { "en-CA": "/privacy", "fr-CA": "/confidentialite" },
  },
};

export default function PrivacyPage() {
  return (
    <LegalDocument
      copy={PRIVACY_EN}
      extraSections={[
        storageSection(
          PRIVACY_EN,
          storedOutsideQuebec(),
          POLICY_FACTS.transferAssessmentCompleted,
        ),
      ]}
    />
  );
}
