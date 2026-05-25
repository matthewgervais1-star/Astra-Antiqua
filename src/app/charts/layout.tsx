import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Charts",
  description:
    "Manage your saved birth charts. Set a primary, add partners, family, and friends for comparison and personalization.",
};

export default function ChartsLayout({ children }: { children: ReactNode }) {
  return children;
}
