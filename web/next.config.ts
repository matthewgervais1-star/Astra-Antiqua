import type { NextConfig } from "next";

// next dev (Turbopack + React dev mode) NODE_ENV is "development"; next build
// sets it to "production". The relaxations below apply ONLY in development.
const isDev = process.env.NODE_ENV !== "production";

// Modest CSP: same-origin scripts/styles, allow inline styles for Tailwind
// generated CSS variables, allow font/image data URLs. The OSM geocode proxy
// lives on /api/* (same-origin) so no third-party connect-src is required.
//
// Dev-only: React dev mode and Turbopack require eval() (HMR, source maps,
// callstack reconstruction), and HMR opens a websocket back to the origin.
// Production stays free of 'unsafe-eval' and websocket connect-src.
const cspDirectives = [
  "default-src 'self'",
  isDev
    ? "script-src 'self' 'unsafe-inline' 'unsafe-eval'"
    : "script-src 'self' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob:",
  "font-src 'self' data:",
  isDev ? "connect-src 'self' ws: wss:" : "connect-src 'self'",
  "object-src 'none'",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
];

const securityHeaders = [
  // Forbid embedding in iframes (clickjacking).
  { key: "X-Frame-Options", value: "DENY" },
  // Prevent MIME-type sniffing.
  { key: "X-Content-Type-Options", value: "nosniff" },
  // Limit referrer leakage.
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // Disable unneeded browser features.
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), payment=()",
  },
  // Enforce HTTPS for one year (only meaningful in production).
  {
    key: "Strict-Transport-Security",
    value: "max-age=31536000; includeSubDomains",
  },
  {
    key: "Content-Security-Policy",
    value: cspDirectives.join("; "),
  },
];

const nextConfig: NextConfig = {
  // better-sqlite3 has native bindings and cannot be bundled by the build;
  // mark it as an external server package so Next does not try to webpack it.
  serverExternalPackages: ["better-sqlite3"],
  // The rebrand reorganized the route map. Every old path keeps working.
  // The pantheon journeys split: the overview became a voice doorway, and
  // the per-culture horizon pages became the shared horizons carrying a
  // culture param. More specific sources first.
  async redirects() {
    return [
      { source: "/pantheon/:culture/today", destination: "/?culture=:culture", permanent: true },
      { source: "/pantheon/:culture/reading", destination: "/reading?culture=:culture", permanent: true },
      { source: "/pantheon/:culture/season", destination: "/season?culture=:culture", permanent: true },
      { source: "/pantheon/:culture/forecast", destination: "/forecast?culture=:culture", permanent: true },
      { source: "/pantheon/:culture", destination: "/voices/:culture", permanent: true },
      { source: "/pantheon", destination: "/voices", permanent: true },
      { source: "/onboarding/success", destination: "/", permanent: true },
      { source: "/onboarding", destination: "/welcome", permanent: true },
      { source: "/sign-in", destination: "/signin", permanent: true },
      { source: "/sign-up", destination: "/signin?mode=new", permanent: true },
      { source: "/wait-list", destination: "/waitlist", permanent: true },
      { source: "/methodology", destination: "/method", permanent: true },
      { source: "/about", destination: "/method", permanent: true },
      { source: "/translation-matrix", destination: "/matrix", permanent: true },
    ];
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
