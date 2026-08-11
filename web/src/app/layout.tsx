import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { PantheonBodyAttribute } from "@/components/layout/PantheonBodyAttribute";
import { PantheonProvider } from "@/components/pantheon/PantheonContext";
import { AuthProvider } from "@/components/auth/AuthProvider";
import { AuthGate } from "@/components/auth/AuthGate";
import { SITE_URL } from "@/lib/siteUrl";
import "./globals.css";

// Self-hosted (fetched once by scripts/fetch-fonts.mjs, committed to
// src/fonts/) so `next build` never depends on Google Fonts being reachable.
// Cinzel ships as a VARIABLE font: one file carries the whole weight range,
// declared as a range so no bytes are duplicated. Spectral and IBM Plex Mono
// are static families: one file per weight/style.
const cinzel = localFont({
  variable: "--font-cinzel",
  display: "swap",
  src: [{ path: "../fonts/cinzel-latin-var.woff2", weight: "400 600", style: "normal" }],
});

const spectral = localFont({
  variable: "--font-spectral",
  display: "swap",
  src: [
    { path: "../fonts/spectral-latin-300.woff2", weight: "300", style: "normal" },
    { path: "../fonts/spectral-latin-400.woff2", weight: "400", style: "normal" },
    { path: "../fonts/spectral-latin-300-italic.woff2", weight: "300", style: "italic" },
    { path: "../fonts/spectral-latin-400-italic.woff2", weight: "400", style: "italic" },
  ],
});

const plexMono = localFont({
  variable: "--font-plex-mono",
  display: "swap",
  src: [
    { path: "../fonts/ibm-plex-mono-latin-400.woff2", weight: "400", style: "normal" },
    { path: "../fonts/ibm-plex-mono-latin-500.woff2", weight: "500", style: "normal" },
  ],
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
      className={`${cinzel.variable} ${spectral.variable} ${plexMono.variable}`}
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
      </body>
    </html>
  );
}
