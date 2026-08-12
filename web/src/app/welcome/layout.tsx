import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Welcome",
  description:
    "Choose the culture that reads your sky. Birth details and an account are both optional.",
};

export default function WelcomeLayout({ children }: { children: ReactNode }) {
  return children;
}
