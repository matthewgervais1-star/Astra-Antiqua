/**
 * The canonical site origin, used for metadataBase, the sitemap, robots, and
 * OpenGraph/canonical URLs. Resolves to a real, reachable host in every
 * environment so social scrapers and crawlers never hit a dead domain:
 *   1. NEXT_PUBLIC_SITE_URL  (set this to the production domain at deploy)
 *   2. VERCEL_URL            (the per-deployment URL on Vercel previews)
 *   3. http://localhost:3000 (local development)
 */
function resolveSiteUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL;
  if (explicit && explicit.length > 0) return explicit.replace(/\/$/, "");
  const vercel = process.env.VERCEL_URL;
  if (vercel && vercel.length > 0) return `https://${vercel}`;
  return "http://localhost:3000";
}

export const SITE_URL = resolveSiteUrl();
