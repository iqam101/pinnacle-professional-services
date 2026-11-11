import type { Metadata } from "next";
import { getBannerMap, getSeoSettings } from "@/lib/db";
import { ServicesViewClient } from "@/components/views/ServicesViewClient";

export const dynamic = "force-static";

export async function generateMetadata(): Promise<Metadata> {
  const seo = getSeoSettings();
  const s = seo.pageOverrides?.services;
  const title = s?.title || "Corporate, Accounting, Tax, HR & Digital Services";
  const description = s?.description || seo.defaultDescription;
  const keywords = (s?.keywords || seo.defaultKeywords)
    .split(",")
    .map((k) => k.trim())
    .filter(Boolean);

  return {
    title,
    description,
    keywords,
    alternates: { canonical: "/services" },
    openGraph: {
      title,
      description,
      url: "/services",
      images: s?.ogImage ? [{ url: s.ogImage }] : undefined,
    },
  };
}

export default function ServicesPage() {
  const banners = getBannerMap();

  return <ServicesViewClient initialBanners={banners} />;
}
