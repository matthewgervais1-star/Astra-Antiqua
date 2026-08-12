import type { Metadata } from "next";
import { SeasonNave } from "@/components/horizons/SeasonNave";

export const metadata: Metadata = {
  title: "Season",
  description:
    "The zodiac season now underway: what is changing, where it began, what it touches, and what it leaves behind, in the voice of your chosen culture.",
};

export default function SeasonPage() {
  return <SeasonNave />;
}
