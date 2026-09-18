import type { Metadata } from "next";
import { PrivacyPolicy } from "@/components/legal/PrivacyPolicy";
import { PRIVACY_FR } from "@/lib/legal/privacyCopy";

export const metadata: Metadata = {
  title: PRIVACY_FR.metaTitle,
  description: PRIVACY_FR.metaDescription,
  alternates: {
    canonical: "/confidentialite",
    languages: { "fr-CA": "/confidentialite", "en-CA": "/privacy" },
  },
};

export default function ConfidentialitePage() {
  return <PrivacyPolicy copy={PRIVACY_FR} />;
}
