import type { MetadataRoute } from "next";
import { getSeoSettings } from "@/lib/db";

export default function robots(): MetadataRoute.Robots {
  const seo = getSeoSettings();
  const baseUrl = seo.canonicalBaseUrl.replace(/\/+$/, "");

  return {
    rules: [
      {
        userAgent: "*",
        allow: seo.robotsIndex ? "/" : undefined,
        disallow: seo.robotsIndex ? ["/admin", "/api/"] : ["/"],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
