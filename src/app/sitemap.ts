import type { MetadataRoute } from "next";
import { CULTURES } from "@/data/cultures";
import { SITE_URL } from "@/lib/siteUrl";

/**
 * Machine-readable URL list for crawlers. Covers the static content pages, the
 * learn section, and every per-culture pantheon route (overview + today +
 * reading + forecast). Private/utility routes (account, sign-in, sign-up, api)
 * are intentionally excluded.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const base = SITE_URL;

  const staticPaths = [
    "",
    "/about",
    "/learn",
    "/learn/signs",
    "/learn/rising",
    "/learn/houses",
    "/learn/house-systems",
    "/learn/aspects",
    "/learn/transits",
    "/methodology",
    "/translation-matrix",
    "/reading",
    "/forecast",
    "/synastry",
    "/charts",
    "/wait-list",
  ];

  const pantheonPaths = CULTURES.flatMap((c) => [
    `/pantheon/${c}`,
    `/pantheon/${c}/today`,
    `/pantheon/${c}/reading`,
    `/pantheon/${c}/forecast`,
  ]);

  return [...staticPaths, ...pantheonPaths].map((path) => ({
    url: `${base}${path}`,
    changeFrequency: path === "" ? "weekly" : "monthly",
    priority: path === "" ? 1 : 0.7,
  }));
}
