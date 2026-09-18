import type { Metadata } from "next";
import { PrivacyPolicy } from "@/components/legal/PrivacyPolicy";
import { PRIVACY_EN } from "@/lib/legal/privacyCopy";

export const metadata: Metadata = {
  title: PRIVACY_EN.metaTitle,
  description: PRIVACY_EN.metaDescription,
  alternates: {
    canonical: "/privacy",
    languages: { "en-CA": "/privacy", "fr-CA": "/confidentialite" },
  },
};

export default function PrivacyPage() {
  return <PrivacyPolicy copy={PRIVACY_EN} />;
}
