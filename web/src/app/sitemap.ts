import type { MetadataRoute } from "next";
import { CULTURES } from "@/data/cultures";
import { SITE_URL } from "@/lib/siteUrl";

/**
 * Machine-readable URL list for crawlers. Covers the reading horizons, the
 * instruments, the learn section, the method and matrix references, and the
 * five voice doorways. Private/utility routes (account, signin, welcome, api)
 * and per-chart routes are intentionally excluded.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const base = SITE_URL;

  const staticPaths = [
    "",
    "/week",
    "/season",
    "/year",
    "/transits",
    "/reading",
    "/charts",
    "/synastry",
    "/forecast",
    "/voices",
    "/method",
    "/matrix",
    "/learn",
    "/learn/signs",
    "/learn/rising",
    "/learn/houses",
    "/learn/house-systems",
    "/learn/aspects",
    "/learn/transits",
    "/waitlist",
  ];

  const voicePaths = CULTURES.map((c) => `/voices/${c}`);

  return [...staticPaths, ...voicePaths].map((path) => ({
    url: `${base}${path}`,
    changeFrequency: path === "" ? "weekly" : "monthly",
    priority: path === "" ? 1 : 0.7,
  }));
}
