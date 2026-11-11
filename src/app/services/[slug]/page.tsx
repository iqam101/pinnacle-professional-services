import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  MessageCircle,
  Phone,
} from "lucide-react";
import { BRAND, COMPANY_REGISTRATION_PACKAGE } from "@/lib/constants";
import { getBannerMap, getSeoSettings } from "@/lib/db";
import { SERVICES, getServiceBySlug } from "@/lib/services-data";
import { CmsImage } from "@/components/CmsImage";
import { HomeFaq } from "@/components/HomeFaq";
import { JsonLd } from "@/components/JsonLd";
import { ServiceIcon } from "@/components/ServiceIcon";

export const revalidate = 60;

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
  const banner = banners[service.bannerKey];
  const heroImg =
    banner?.imageUrl || "/images/banners/services-desk-ledger.webp";
  const heroAlt = banner?.altText || service.title;
  const isRegistration = service.slug === "company-registration";
  const regFlyer = banners["company_reg_banner"];

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: service.faqs.map((f) => ({
      "@type": "Question",
      name: f.question,
      acceptedAnswer: { "@type": "Answer", text: f.answer },
    })),
  };

  return (
    <>
      <JsonLd data={faqSchema} />

      <div className="bg-white">
        {/* Top Hero */}
        <section className="bg-[#FAF8F5] border-b border-[#E6DFD3] py-12 sm:py-16">
          <div className="container-fluid">
            <Link
              href="/services"
              className="inline-flex items-center gap-2 text-sm font-semibold text-[#646B76] hover:text-[#A41C21] mb-6"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>All Services</span>
            </Link>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
              <div className="lg:col-span-7 space-y-5">
                <div className="inline-flex items-center gap-2 rounded-full bg-[#FDF2F2] border border-[#A41C21]/20 px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider text-[#A41C21]">
                  <ServiceIcon name={service.iconName} className="h-4 w-4" />
                  <span>{service.category}</span>
                </div>

                <h1 className="font-display text-3xl sm:text-5xl font-extrabold text-[#181B20] leading-tight">
                  {service.title}
                </h1>

                <p className="text-lg font-semibold text-[#B57B15]">
                  {service.tagline}
                </p>

                <p className="text-base text-[#3D424B] leading-relaxed">
                  {service.heroDescription}
                </p>

                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  <a
                    href={`${BRAND.whatsappHref}&text=${encodeURIComponent(`Hello Pinnacle Professional Services, I would like assistance with ${service.title}.`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#25D366] px-6 py-3.5 text-sm font-bold text-white shadow-sm hover:bg-[#1EBE5B] transition-colors"
                  >
                    <MessageCircle className="h-4 w-4" />
                    <span>WhatsApp +94 77 302 8033</span>
                  </a>
                  <Link
                    href={`/contact?service=${encodeURIComponent(service.title)}`}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#A41C21] px-6 py-3.5 text-sm font-bold text-white shadow-sm hover:bg-[#821318] transition-colors"
                  >
                    <span>Request Free Quote</span>
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                  <a
                    href={BRAND.phoneHref}
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#DFD7C8] bg-white px-5 py-3.5 text-sm font-bold text-[#181B20] hover:border-[#A41C21]"
                  >
                    <Phone className="h-4 w-4 text-[#A41C21]" />
                    <span>{BRAND.phoneDisplay}</span>
                  </a>
                </div>
              </div>

              <div className="lg:col-span-5">
                <div className="relative rounded-3xl overflow-hidden border border-[#E6DFD3] shadow-xl aspect-[16/11] bg-white">
                  <CmsImage
                    src={heroImg}
                    alt={heroAlt}
                    fill
                    priority
                    sizes="(max-width: 1024px) 100vw, 42vw"
                    className="object-cover"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Deliverables & Scope */}
        <section className="py-14 sm:py-18">
          <div className="container-fluid grid grid-cols-1 lg:grid-cols-12 gap-10">
            <div className="lg:col-span-7 space-y-8">
              <div className="space-y-2">
                <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-[#181B20]">
                  What We Deliver
                </h2>
                <p className="text-sm sm:text-base text-[#4F5560]">
                  Structured execution designed for complete compliance with Sri
                  Lankan statutory bodies.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {service.deliverables.map((del) => (
                  <div
                    key={del.title}
                    className="rounded-2xl border border-[#E6DFD3] bg-[#FAF8F5] p-6 space-y-2"
                  >
                    <h3 className="font-display text-lg font-bold text-[#181B20]">
                      {del.title}
                    </h3>
                    <p className="text-sm text-[#3D424B] leading-relaxed">
                      {del.description}
                    </p>
                  </div>
                ))}
              </div>

              {/* Checklist Highlights */}
              <div className="rounded-2xl border border-[#E6DFD3] bg-white p-6 sm:p-8 space-y-4">
                <h3 className="font-display text-xl font-bold text-[#181B20]">
                  Complete Service Checklist
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {service.highlights.map((item) => (
                    <div
                      key={item}
                      className="flex items-start gap-2.5 text-sm text-[#181B20]"
                    >
                      <CheckCircle2 className="h-4.5 w-4.5 shrink-0 text-[#A41C21] mt-0.5" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="lg:col-span-5 space-y-6">
              {isRegistration && (
                <div className="rounded-3xl border border-[#D79A27] bg-[#FDF8EC] p-6 space-y-4">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-extrabold uppercase tracking-wider text-[#8E5D09]">
                      Turnkey Promotion
                    </span>
                    <span className="rounded-full bg-[#A41C21] px-3 py-1 text-xs font-extrabold text-white">
                      {COMPANY_REGISTRATION_PACKAGE.price}
                    </span>
                  </div>
                  <div className="relative rounded-2xl overflow-hidden border border-[#E6DFD3] bg-white aspect-[2/3]">
                    <CmsImage
                      src={
                        regFlyer?.imageUrl ||
                        "/images/brand/company-registration-flyer.jpg"
                      }
                      alt={
                        regFlyer?.altText ||
                        "Company Registration Package Flyer"
                      }
                      fill
                      sizes="(max-width: 1024px) 100vw, 380px"
                      className="object-cover object-top"
                    />
                  </div>
                </div>
              )}

              <div className="rounded-2xl border border-[#E6DFD3] bg-[#FAF8F5] p-6 space-y-4">
                <h3 className="font-display text-xl font-bold text-[#181B20]">
                  Ideal For
                </h3>
                <ul className="space-y-3">
                  {service.idealFor.map((audience) => (
                    <li
                      key={audience}
                      className="flex items-start gap-2.5 text-sm text-[#3D424B]"
                    >
                      <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-[#D79A27]" />
                      <span>{audience}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="rounded-2xl bg-[#181B20] text-white p-6 space-y-4">
                <div className="text-xs font-bold uppercase tracking-wider text-[#E8B84B]">
                  Speak With Our Colombo Office
                </div>
                <p className="text-sm text-[#D9D5CD] leading-relaxed">
                  Visit {BRAND.shortAddress} or connect instantly for personalized
                  pricing and document checklists.
                </p>
                <div className="space-y-2.5 pt-1">
                  <a
                    href={BRAND.whatsappHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-[#25D366] px-4 py-3 text-sm font-bold text-white hover:bg-[#1EBE5B]"
                  >
                    <MessageCircle className="h-4 w-4" />
                    <span>WhatsApp {BRAND.whatsappDisplay}</span>
                  </a>
                  <a
                    href={BRAND.phoneHref}
                    className="w-full inline-flex items-center justify-center gap-2 rounded-xl border border-white/20 px-4 py-3 text-sm font-bold text-white hover:bg-white/10"
                  >
                    <Phone className="h-4 w-4 text-[#D79A27]" />
                    <span>Call {BRAND.phoneDisplay}</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FAQs */}
        {service.faqs.length > 0 && (
          <section className="py-14 bg-[#FAF8F5] border-t border-[#E6DFD3]">
            <div className="container-fluid max-w-4xl space-y-6">
              <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-[#181B20] text-center">
                Common Questions About {service.shortTitle}
              </h2>
              <HomeFaq items={service.faqs} />
            </div>
          </section>
        )}
      </div>
    </>
  );
}
