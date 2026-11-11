import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BRAND } from "@/lib/constants";
import { getBannerMap, getSeoSettings } from "@/lib/db";
import { SERVICES, getServiceBySlug } from "@/lib/services-data";
import { ServiceDetailViewClient } from "@/components/views/ServiceDetailViewClient";

export const dynamic = "force-static";
export const dynamicParams = false;

export async function generateStaticParams() {
  return SERVICES.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const service = getServiceBySlug(slug);
  if (!service) return {};

  const seo = getSeoSettings();
  const title = `${service.title} in Colombo, Sri Lanka`;
  const description = `${service.summary} ${service.startingNote}. Contact ${seo.businessName} on ${BRAND.phoneDisplay}.`;

  return {
    title,
    description,
    alternates: { canonical: `/services/${service.slug}` },
    openGraph: {
      title,
      description,
      url: `/services/${service.slug}`,
    },
  };
}

export default async function ServiceDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const service = getServiceBySlug(slug);
  if (!service) {
    notFound();
  }

  const banners = getBannerMap();

  return <ServiceDetailViewClient service={service} initialBanners={banners} />;
}
