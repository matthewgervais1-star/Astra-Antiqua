import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Synastry",
  description:
    "Compare two saved birth charts. See the tightest cross-aspects between two people, rendered as deity-vs-deity sentences in the chosen pantheon's voice.",
};

export default function SynastryLayout({ children }: { children: ReactNode }) {
  return children;
}
