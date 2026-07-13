import type { Metadata } from "next";
import { SeasonExperience } from "@/components/season/SeasonExperience";

export const metadata: Metadata = {
  title: "The season",
  description:
    "The zodiac season now underway: the Sun's month-long crossing of one sign, its instruction, where it lands in your chart, and the dated beats inside the window.",
};

export default function SeasonPage() {
  return <SeasonExperience showSelector />;
}
