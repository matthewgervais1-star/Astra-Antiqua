import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Account",
  description: "Manage your account: display name, password, data export, deletion.",
};

export default function AccountLayout({ children }: { children: ReactNode }) {
  return children;
}
