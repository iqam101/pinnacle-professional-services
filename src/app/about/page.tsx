import type { Metadata } from "next";
import { getBannerMap, getSeoSettings } from "@/lib/db";
import { AboutViewClient } from "@/components/views/AboutViewClient";

export const dynamic = "force-static";

export async function generateMetadata(): Promise<Metadata> {
  const seo = getSeoSettings();
  const aboutSeo = seo.pageOverrides?.about;
  const title =
    aboutSeo?.title || "About Us | Trusted Business Partners in Colombo";
  const description = aboutSeo?.description || seo.defaultDescription;

  return {
    title,
    description,
    keywords: (aboutSeo?.keywords || seo.defaultKeywords)
      .split(",")
      .map((k) => k.trim())
      .filter(Boolean),
    alternates: { canonical: "/about" },
    openGraph: {
      title,
      description,
      url: "/about",
      images: aboutSeo?.ogImage ? [{ url: aboutSeo.ogImage }] : undefined,
    },
  };
}

export default function AboutPage() {
  const banners = getBannerMap();
  const aboutBanner = banners["about_banner"];

  return <AboutViewClient initialBanner={aboutBanner} />;
}
