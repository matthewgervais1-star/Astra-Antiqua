import type { Metadata } from "next";
import { Playfair_Display, Cormorant_Garamond, JetBrains_Mono } from "next/font/google";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { PantheonBodyAttribute } from "@/components/layout/PantheonBodyAttribute";
import { AuthProvider } from "@/components/auth/AuthProvider";
import "./globals.css";

const playfair = Playfair_Display({
  variable: "--font-playfair",
  weight: ["400", "700"],
  subsets: ["latin"],
  display: "swap",
});

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  weight: ["400", "500"],
  style: ["normal", "italic"],
  subsets: ["latin"],
  display: "swap",
});

const jetbrains = JetBrains_Mono({
  variable: "--font-jetbrains",
  weight: ["400"],
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://astra-antiqua.example"),
  title: {
    default: "Astra Antiqua",
    template: "%s · Astra Antiqua",
  },
  description:
    "Professional astronomical ephemeris rendered through the religious frameworks of ancient Egypt, Greece, Canaan, Carthage, and Rome.",
  openGraph: {
    title: "Astra Antiqua",
    description:
      "Read the sky as Carthage did. Or Memphis. Or Delphi. Or Ugarit. Or Rome.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${playfair.variable} ${cormorant.variable} ${jetbrains.variable}`}
    >
      <body className="bg-bg-void text-ink-primary flex min-h-screen flex-col">
        <AuthProvider>
          <PantheonBodyAttribute />
          <SiteHeader />
          <main className="flex-1">{children}</main>
          <SiteFooter />
        </AuthProvider>
        <div className="film-grain print-hide" aria-hidden />
      </body>
    </html>
  );
}
