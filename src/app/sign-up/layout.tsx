import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Create an account",
  description: "Create an account to keep your saved charts across devices.",
};

export default function SignUpLayout({ children }: { children: ReactNode }) {
  return children;
}
