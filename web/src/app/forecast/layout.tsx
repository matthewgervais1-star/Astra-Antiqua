import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Forecast",
  description:
    "Astronomically computed year ahead. Moon phases, eclipses, retrogrades, ingresses, and major transits to your saved chart. Real ephemeris, rendered in the chosen pantheon's voice.",
};

export default function ForecastLayout({ children }: { children: ReactNode }) {
  return children;
}
