import type { Metadata } from "next";
import { YearNave } from "@/components/horizons/YearNave";

export const metadata: Metadata = {
  title: "Year",
  description:
    "The year ahead, its quarters read through your chosen culture's own calendar, and the long transits that give it its spine.",
};

export default function YearPage() {
  return <YearNave />;
}
