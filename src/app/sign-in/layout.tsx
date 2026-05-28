import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Sign in",
  description: "Sign in to keep your saved charts across devices.",
};

export default function SignInLayout({ children }: { children: ReactNode }) {
  return children;
}
