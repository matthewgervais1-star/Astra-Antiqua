import type { Metadata } from "next";
import { WeekNave } from "@/components/horizons/WeekNave";

export const metadata: Metadata = {
  title: "Week",
  description:
    "The seven days ahead, each weighed against its tightest sky event, in the voice of your chosen culture.",
};

export default function WeekPage() {
  return <WeekNave />;
}
