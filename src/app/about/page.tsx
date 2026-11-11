import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  Award,
  CheckCircle2,
  MapPin,
  MessageCircle,
  ShieldCheck,
  Users,
} from "lucide-react";
import { BRAND } from "@/lib/constants";
import { getBannerMap, getSeoSettings } from "@/lib/db";
import { CmsImage } from "@/components/CmsImage";

export const revalidate = 60;

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

  return (
    <div className="bg-white">
      <section className="bg-[#FAF8F5] border-b border-[#E6DFD3] py-14 sm:py-20">
        <div className="container-fluid grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-6 space-y-5">
            <div className="inline-flex items-center rounded-full bg-[#FDF2F2] border border-[#A41C21]/20 px-3.5 py-1 text-xs font-bold uppercase tracking-[0.14em] text-[#A41C21]">
              {aboutBanner?.badgeText || "Dehiwala, Colombo Advisory Firm"}
            </div>
            <h1 className="font-display text-3xl sm:text-5xl font-extrabold text-[#181B20] leading-tight">
              {aboutBanner?.headline ||
                "Everything You Need to Start and Scale Right"}
            </h1>
            <p className="text-base sm:text-lg text-[#3D424B] leading-relaxed">
              {BRAND.legalName} is a dedicated corporate secretarial, accounting,
              taxation, HR, and digital business advisory practice based in
              Dehiwala, Colombo. Guided by our promise, &ldquo;Your business. Our
              priority.&rdquo;, we remove administrative friction so entrepreneurs
              can focus on growth.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Link
                href="/contact"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#A41C21] px-6 py-3.5 text-sm font-bold text-white hover:bg-[#821318] transition-colors"
              >
                <span>Speak With Our Team</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
              <a
                href={BRAND.whatsappHref}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#D79A27] bg-white px-6 py-3.5 text-sm font-bold text-[#181B20] hover:bg-[#FDF8EC]"
              >
                <MessageCircle className="h-4 w-4 text-[#25D366]" />
                <span>WhatsApp {BRAND.phoneDisplay}</span>
              </a>
            </div>
          </div>

          <div className="lg:col-span-6">
            <div className="relative rounded-3xl overflow-hidden border border-[#E6DFD3] shadow-xl aspect-[16/10] bg-white">
              <CmsImage
                src={
                  aboutBanner?.imageUrl ||
                  "/images/banners/about-team-advisory.webp"
                }
                alt={
                  aboutBanner?.altText ||
                  "Pinnacle Professional Services Private Limited Advisory Team"
                }
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 sm:py-20">
        <div className="container-fluid space-y-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: ShieldCheck,
                title: "Compliance First",
                text: "Every incorporation form, annual return, BO register, VAT return, and EPF filing is verified against current eROC and IRD rules.",
              },
              {
                icon: Award,
                title: "Honest Fixed Pricing",
                text: "Clear package fees such as our Rs. 32,000 Private Limited incorporation kit mean you know exact costs upfront with no hidden charges.",
              },
              {
                icon: Users,
                title: "Responsive Local Access",
                text: "Reach your dedicated advisor directly by phone, WhatsApp, or in person at our Dehiwala office whenever business questions arise.",
              },
            ].map((val) => (
              <div
                key={val.title}
                className="rounded-2xl border border-[#E6DFD3] bg-[#FAF8F5] p-7 space-y-3"
              >
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-white border border-[#E6DFD3] text-[#A41C21]">
                  <val.icon className="h-6 w-6" />
                </div>
                <h2 className="font-display text-xl font-bold text-[#181B20]">
                  {val.title}
                </h2>
                <p className="text-sm text-[#3D424B] leading-relaxed">
                  {val.text}
                </p>
              </div>
            ))}
          </div>

          <div className="rounded-3xl border border-[#E6DFD3] bg-white p-8 sm:p-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-4 flex justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/images/brand/pinnacle-logo-transparent.png"
                alt={BRAND.legalName}
                className="h-48 w-auto object-contain"
              />
            </div>
            <div className="lg:col-span-8 space-y-4">
              <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-[#181B20]">
                One Trusted Partner From Incorporation to Expansion
              </h2>
              <p className="text-sm sm:text-base text-[#3D424B] leading-relaxed">
                Founders often struggle when their company secretary,
                bookkeeper, tax consultant, and marketing provider operate in
                disconnected silos. At Pinnacle Professional Services, our
                multidisciplinary practice aligns your corporate records,
                accounting ledgers, IRD tax compliance, employee payroll, and
                commercial digital presence together.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                {[
                  "eROC Company Incorporation & Secretarial Care",
                  "Monthly Bookkeeping & Audit-Ready Accounts",
                  "IRD TIN, VAT, CIT, APIT & SSCL Filings",
                  "Outsourced Payroll, EPF & ETF Administration",
                  "Business Websites & SEO Growth",
                  "Retail POS Systems & Social Media Campaigns",
                ].map((item) => (
                  <div
                    key={item}
                    className="flex items-center gap-2 text-sm font-medium text-[#181B20]"
                  >
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-[#D79A27]" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
              <div className="pt-3 flex items-center gap-2 text-sm text-[#646B76]">
                <MapPin className="h-4 w-4 text-[#A41C21]" />
                <span>{BRAND.address}</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
