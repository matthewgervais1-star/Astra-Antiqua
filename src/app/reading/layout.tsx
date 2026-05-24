import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Reading",
  description:
    "Enter your birth date, time, and place to compute your natal chart in the voice of Egypt, Greece, Canaan, or Carthage. All computation runs in your browser.",
};

export default function ReadingLayout({ children }: { children: ReactNode }) {
  return children;
}
