import type { Metadata } from "next";
import { HomeExperience } from "@/components/home/HomeExperience";

export const metadata: Metadata = {
  title: "Astra Antiqua",
  description:
    "The computed sky, read through five ancient theologies. The day's decree, its aspects in orb, and the long transit now active against your chart.",
};

export default function HomePage() {
  return <HomeExperience />;
}
