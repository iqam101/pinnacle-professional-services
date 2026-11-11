import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, CheckCircle2, MessageCircle } from "lucide-react";
import { BRAND } from "@/lib/constants";
import { getBannerMap, getSeoSettings } from "@/lib/db";
import { SERVICES } from "@/lib/services-data";
import { CmsImage } from "@/components/CmsImage";
import { ServiceIcon } from "@/components/ServiceIcon";

export const revalidate = 60;

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
  const headerBanner = banners["services_banner"];

  return (
    <div className="bg-white">
      {/* Banner Header */}
      <section className="relative overflow-hidden bg-[#181B20] text-white py-16 sm:py-20">
        <div className="absolute inset-0 opacity-25">
          <CmsImage
            src={
              headerBanner?.imageUrl ||
              "/images/banners/services-desk-ledger.webp"
            }
            alt={
              headerBanner?.altText ||
              "Pinnacle Professional Services corporate ledger and advisory desk"
            }
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-r from-[#181B20] via-[#181B20]/90 to-[#A41C21]/70" />

        <div className="container-fluid relative z-10 max-w-4xl space-y-4">
          <div className="inline-flex items-center rounded-full border border-[#D79A27]/40 bg-[#D79A27]/15 px-3.5 py-1 text-xs font-bold uppercase tracking-[0.14em] text-[#E8B84B]">
            {headerBanner?.badgeText || "Comprehensive Corporate Solutions"}
          </div>
          <h1 className="font-display text-3xl sm:text-5xl font-extrabold leading-tight">
            {headerBanner?.headline ||
              "Built for Founders, SMEs, and Growing Enterprises"}
          </h1>
          <p className="text-base sm:text-lg text-[#D9D5CD] max-w-2xl leading-relaxed">
            {headerBanner?.subheadline ||
              "Partner with one dedicated team in Colombo for secretarial compliance, monthly bookkeeping, VAT & TIN filings, payroll, and digital growth."}
          </p>
        </div>
      </section>

      {/* Services Detailed List */}
      <section className="py-16 sm:py-20 bg-[#FAF8F5]">
        <div className="container-fluid space-y-10">
          {SERVICES.map((service, index) => {
            const slot = banners[service.bannerKey];
            const imgUrl =
              slot?.imageUrl || "/images/banners/services-desk-ledger.webp";
            const imgAlt = slot?.altText || service.title;
            const reversed = index % 2 === 1;

            return (
              <article
                key={service.slug}
                className="rounded-3xl bg-white border border-[#E6DFD3] shadow-sm overflow-hidden grid grid-cols-1 lg:grid-cols-12"
              >
                <div
                  className={`lg:col-span-5 relative min-h-[260px] lg:min-h-[340px] bg-[#F3EFE7] ${
                    reversed ? "lg:order-2" : ""
                  }`}
                >
                  <CmsImage
                    src={imgUrl}
                    alt={imgAlt}
                    fill
                    sizes="(max-width: 1024px) 100vw, 42vw"
                    className="object-cover"
                  />
                  <div className="absolute top-4 left-4 inline-flex items-center gap-2 rounded-full bg-white/95 backdrop-blur px-3.5 py-1.5 text-xs font-bold text-[#A41C21] shadow">
                    <ServiceIcon name={service.iconName} className="h-4 w-4" />
                    <span>{service.category}</span>
                  </div>
                </div>

                <div
                  className={`lg:col-span-7 p-6 sm:p-8 lg:p-10 flex flex-col justify-between space-y-6 ${
                    reversed ? "lg:order-1" : ""
                  }`}
                >
                  <div className="space-y-3">
                    <div className="text-xs font-bold uppercase tracking-wider text-[#B57B15]">
                      {service.startingNote}
                    </div>
                    <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-[#181B20]">
                      <Link
                        href={`/services/${service.slug}`}
                        className="hover:text-[#A41C21] transition-colors"
                      >
                        {service.title}
                      </Link>
                    </h2>
                    <p className="text-sm sm:text-base text-[#3D424B] leading-relaxed">
                      {service.heroDescription}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {service.highlights.map((item) => (
                      <div
                        key={item}
                        className="flex items-start gap-2 text-sm text-[#181B20]"
                      >
                        <CheckCircle2 className="h-4 w-4 shrink-0 text-[#D79A27] mt-1" />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>

                  <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-[#EFE9DD]">
                    <Link
                      href={`/services/${service.slug}`}
                      className="inline-flex items-center gap-2 rounded-xl bg-[#A41C21] px-5 py-3 text-sm font-bold text-white hover:bg-[#821318] transition-colors"
                    >
                      <span>View Service Details</span>
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                    <a
                      href={`${BRAND.whatsappHref}&text=${encodeURIComponent(`Hello Pinnacle Professional Services, I would like to inquire about ${service.title}.`)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 rounded-xl border border-[#D79A27] bg-[#FDF8EC] px-5 py-3 text-sm font-bold text-[#8E5D09] hover:bg-[#D79A27] hover:text-white transition-colors"
                    >
                      <MessageCircle className="h-4 w-4" />
                      <span>Inquire via WhatsApp</span>
                    </a>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </section>
    </div>
  );
}
