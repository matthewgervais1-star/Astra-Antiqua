import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/siteUrl";

/**
 * Allow indexing of content, keep crawlers out of the API and the private
 * account/auth routes, and point them at the sitemap.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/account", "/signin", "/welcome"],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
