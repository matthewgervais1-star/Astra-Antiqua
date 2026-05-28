import type { NextConfig } from "next";

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
  // Modest CSP: same-origin scripts/styles, allow inline styles for Tailwind
  // generated CSS variables, allow font/image data URLs. The OSM geocode
  // proxy lives on /api/* (same-origin) so no third-party connect-src is
  // required from the browser.
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline'",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: blob:",
      "font-src 'self' data:",
      "connect-src 'self'",
      "object-src 'none'",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'",
    ].join("; "),
  },
];

const nextConfig: NextConfig = {
  // better-sqlite3 has native bindings and cannot be bundled by the build;
  // mark it as an external server package so Next does not try to webpack it.
  serverExternalPackages: ["better-sqlite3"],
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
