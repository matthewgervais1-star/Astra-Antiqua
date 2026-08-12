import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "The Record",
  description: "Sign in to carry your voice, charts and feedback to another device.",
  robots: { index: false, follow: false },
};

export default function SignInLayout({ children }: { children: ReactNode }) {
  return children;
}
