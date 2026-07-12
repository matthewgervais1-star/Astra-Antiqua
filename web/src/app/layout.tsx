import type { Metadata, Viewport } from "next";
import { Playfair_Display, Cormorant_Garamond, JetBrains_Mono } from "next/font/google";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { PantheonBodyAttribute } from "@/components/layout/PantheonBodyAttribute";
import { PantheonProvider } from "@/components/pantheon/PantheonContext";
import { AuthProvider } from "@/components/auth/AuthProvider";
import { AuthGate } from "@/components/auth/AuthGate";
import { SITE_URL } from "@/lib/siteUrl";
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

const SITE_DESCRIPTION =
  "Professional astronomical ephemeris rendered through the religious frameworks of ancient Egypt, Greece, Canaan, Carthage, and Rome.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Astra Antiqua",
    template: "%s · Astra Antiqua",
  },
  description: SITE_DESCRIPTION,
  openGraph: {
    title: "Astra Antiqua",
    description:
      "Read the sky as Carthage did. Or Memphis. Or Delphi. Or Ugarit. Or Rome.",
    type: "website",
    siteName: "Astra Antiqua",
  },
  twitter: {
    card: "summary_large_image",
    title: "Astra Antiqua",
    description:
      "Read the sky as Carthage did. Or Memphis. Or Delphi. Or Ugarit. Or Rome.",
  },
  icons: {
    apple: "/icons/apple-touch-icon.png",
  },
  appleWebApp: {
    capable: true,
    title: "Astra Antiqua",
    statusBarStyle: "black-translucent",
  },
};

export const viewport: Viewport = {
  themeColor: "#050505",
  viewportFit: "cover",
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
          <PantheonProvider>
            <PantheonBodyAttribute />
            <a
              href="#main-content"
              className="border-gold-soft bg-bg-deep text-gold-leaf focus:ring-gold-soft sr-only z-50 rounded-full border px-4 py-2 text-sm focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
            >
              Skip to content
            </a>
            <SiteHeader />
            <main id="main-content" className="flex-1">
              <AuthGate>{children}</AuthGate>
            </main>
            <SiteFooter />
          </PantheonProvider>
        </AuthProvider>
        <div className="film-grain print-hide" aria-hidden />
      </body>
    </html>
  );
}
