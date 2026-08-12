import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
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
  "One computed sky, read through the theologies of ancient Egypt, Greece, Canaan, Carthage, and Rome.";

const SITE_TAGLINE =
  "Every culture reads the same computed sky. What changes is the theology it must pass through.";

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
      SITE_TAGLINE,
    type: "website",
    siteName: "Astra Antiqua",
  },
  twitter: {
    card: "summary_large_image",
    title: "Astra Antiqua",
    description:
      SITE_TAGLINE,
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
  themeColor: "#171310",
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
      <body className="flex min-h-screen flex-col text-bone">
        <AuthProvider>
          <PantheonProvider>
            <PantheonBodyAttribute />
            <a
              href="#main-content"
              className="sr-only z-50 border border-[var(--accent)] bg-[var(--ground)] px-4 py-2 font-mono text-[11px] tracking-[0.14em] text-[var(--accent)] focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
            >
              SKIP TO CONTENT
            </a>
            <div id="main-content" className="flex flex-1 flex-col">
              <AuthGate>{children}</AuthGate>
            </div>
          </PantheonProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
