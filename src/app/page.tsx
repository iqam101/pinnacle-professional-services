import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  Award,
  CheckCircle2,
  Clock,
  MapPin,
  MessageCircle,
  Phone,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { BRAND, COMPANY_REGISTRATION_PACKAGE } from "@/lib/constants";
import {
  getBannerMap,
  getPublishedBlogs,
  getSeoSettings,
} from "@/lib/db";
import { SERVICES } from "@/lib/services-data";
import { CmsImage } from "@/components/CmsImage";
import { HomeFaq } from "@/components/HomeFaq";
import { JsonLd } from "@/components/JsonLd";
import { ServiceIcon } from "@/components/ServiceIcon";

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  const seo = getSeoSettings();
  const homeSeo = seo.pageOverrides?.home;
  const title = homeSeo?.title || seo.siteTitle;
  const description = homeSeo?.description || seo.defaultDescription;
  const keywords = (homeSeo?.keywords || seo.defaultKeywords)
    .split(",")
    .map((k) => k.trim())
    .filter(Boolean);
  const ogImage = homeSeo?.ogImage || seo.ogDefaultImage;

  return {
    title: { absolute: title },
    description,
    keywords,
    alternates: { canonical: "/" },
    openGraph: {
      title,
      description,
      url: "/",
      images: ogImage ? [{ url: ogImage }] : undefined,
    },
  };
}

const HOME_FAQS = [
  {
    question:
      "What is included in your Rs. 32,000 Company Registration package?",
    answer:
      "Our Rs. 32,000 All-Inclusive Private Limited Company Registration package includes company name approval, customized Articles of Association, Form 1, Form 12, Form 19, certified Form 1, Register BO 01 and BO 05 beneficial ownership filing, bank account opening board resolutions, official director seal, incorporation advice, and initial accountancy and taxation advice.",
  },
  {
    question:
      "Where is Pinnacle Professional Services Private Limited located?",
    answer:
      "Our office is located at No 15, Samagi Mawatha, Kawdana Road, Dehiwala, Colombo, Sri Lanka. We serve clients across Colombo and islandwide remotely via WhatsApp (+94 77 302 8033) and email.",
  },
  {
    question:
      "Can you handle monthly bookkeeping along with VAT, TIN, and tax filings?",
    answer:
      "Yes. Many clients combine our monthly bookkeeping retainer with IRD TIN registration, VAT monthly or quarterly returns, Corporate Income Tax, SSCL, WHT, and APIT filings so every ledger and tax submission stays aligned.",
  },
  {
    question:
      "Do you also provide HR, payroll, EPF, and ETF management for small businesses?",
    answer:
      "Yes. We manage monthly payroll calculations, employee payslips, EPF C-Forms, ETF returns, and employment contract documentation for startups and SMEs across Sri Lanka.",
  },
];

const PROCESS_STEPS = [
  {
    step: "01",
    title: "Consultation",
    description:
      "Call or message us on +94 77 302 8033 to clarify your business structure, tax needs, or monthly service scope.",
  },
  {
    step: "02",
    title: "Document Checklist",
    description:
      "We share a straightforward checklist and prepare all eROC, IRD, or accounting templates on your behalf.",
  },
  {
    step: "03",
    title: "Filing & Setup",
    description:
      "Our secretarial, accounting, and tax specialists submit filings promptly and deliver certified records.",
  },
  {
    step: "04",
    title: "Ongoing Support",
    description:
      "Stay effortlessly compliant every month with dedicated bookkeeping, payroll, VAT, and annual return reminders.",
  },
];

export default function HomePage() {
  const banners = getBannerMap();
  const blogs = getPublishedBlogs().slice(0, 3);

  const hero = banners["hero_banner"];
  const regBanner = banners["company_reg_banner"];
  const aboutBanner = banners["about_banner"];
  const ctaBanner = banners["cta_banner"];

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: HOME_FAQS.map((f) => ({
      "@type": "Question",
      name: f.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: f.answer,
      },
    })),
  };

  return (
    <>
      <JsonLd data={faqSchema} />

      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#FAF8F5] via-white to-white pt-10 pb-16 sm:pt-14 sm:pb-20 lg:pt-16 lg:pb-24">
        {/* Subtle decorative background orbs */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-24 right-0 h-96 w-96 rounded-full bg-[#D79A27]/10 blur-3xl"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute bottom-0 -left-24 h-80 w-80 rounded-full bg-[#A41C21]/8 blur-3xl"
        />

        <div className="container-fluid relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          <div className="lg:col-span-6 space-y-6 min-w-0">
            <div className="inline-flex max-w-full items-center gap-2 rounded-full border border-[#D79A27]/40 bg-[#FDF8EC] px-3.5 py-1.5 text-[11px] sm:text-xs font-bold uppercase tracking-[0.08em] sm:tracking-[0.14em] text-[#9A650B]">
              <Sparkles className="h-3.5 w-3.5 shrink-0 text-[#D79A27]" />
              <span className="truncate">
                {hero?.badgeText || "Colombo Corporate & Financial Advisory"}
              </span>
            </div>

            <h1 className="font-display text-3xl sm:text-5xl lg:text-[3.35rem] font-extrabold leading-[1.1] text-[#181B20]">
              {hero?.headline || "Your Business. Our Priority."}
            </h1>

            <p className="text-base sm:text-lg text-[#3D424B] leading-relaxed max-w-xl">
              {hero?.subheadline ||
                "Company Registration, Bookkeeping, Accountancy, Tax, VAT & TIN, Secretarial, and HR Solutions tailored for Sri Lankan businesses."}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              {[
                "Pvt Ltd Registration: Rs. 32,000",
                "Bookkeeping & SLFRS Accounts",
                "IRD TIN, VAT & Tax Compliance",
                "Secretarial, HR & Payroll Desk",
              ].map((point) => (
                <div
                  key={point}
                  className="flex items-center gap-2.5 text-sm font-medium text-[#181B20]"
                >
                  <CheckCircle2 className="h-4.5 w-4.5 shrink-0 text-[#A41C21]" />
                  <span>{point}</span>
                </div>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
              <Link
                href={hero?.ctaHref || "/services/company-registration"}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#A41C21] px-5 py-3.5 text-sm font-bold text-white shadow-[0_10px_24px_rgba(164,28,33,0.24)] hover:bg-[#821318] transition-all whitespace-nowrap"
              >
                <span>{hero?.ctaLabel || "Start Your Company"}</span>
                <ArrowRight className="h-4 w-4 shrink-0" />
              </Link>
              <a
                href={BRAND.whatsappHref}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-xl border-2 border-[#D79A27] bg-white px-5 py-3 text-sm font-bold text-[#181B20] hover:bg-[#FDF8EC] transition-colors whitespace-nowrap"
              >
                <MessageCircle className="h-5 w-5 shrink-0 text-[#25D366]" />
                <span>WhatsApp +94 77 302 8033</span>
              </a>
            </div>

            <div className="grid grid-cols-3 gap-2.5 sm:gap-4 pt-5 border-t border-[#E6DFD3]">
              <div>
                <div className="font-display text-base sm:text-2xl font-extrabold text-[#A41C21]">
                  Rs. 32,000
                </div>
                <div className="text-[11px] sm:text-xs text-[#646B76] mt-0.5">
                  All-Inclusive Pvt Ltd Setup
                </div>
              </div>
              <div>
                <div className="font-display text-base sm:text-2xl font-extrabold text-[#181B20]">
                  6 Pillars
                </div>
                <div className="text-[11px] sm:text-xs text-[#646B76] mt-0.5">
                  Corporate, Tax & HR
                </div>
              </div>
              <div>
                <div className="font-display text-base sm:text-2xl font-extrabold text-[#B57B15]">
                  Dehiwala
                </div>
                <div className="text-[11px] sm:text-xs text-[#646B76] mt-0.5">
                  Colombo & Islandwide
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-6">
            <div className="relative rounded-3xl overflow-hidden border border-[#E6DFD3] bg-[#F3EFE7] shadow-[0_24px_60px_rgba(24,27,32,0.12)] aspect-[16/11]">
              <CmsImage
                src={hero?.imageUrl || "/images/banners/hero-office-colombo.webp"}
                alt={
                  hero?.altText ||
                  "Pinnacle Professional Services office in Colombo"
                }
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#181B20]/70 via-[#181B20]/10 to-transparent" />

              <div className="absolute bottom-4 left-4 right-4 sm:bottom-6 sm:left-6 sm:right-6 rounded-2xl bg-white/95 backdrop-blur-md p-4 sm:p-5 border border-white/60 shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3.5">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="/images/brand/pinnacle-mark.png"
                    alt="Pinnacle Emblem"
                    className="h-11 w-11 shrink-0 object-contain"
                  />
                  <div>
                    <div className="text-xs font-bold uppercase tracking-[0.14em] text-[#B57B15]">
                      {BRAND.subTagline}
                    </div>
                    <div className="font-display text-sm sm:text-base font-bold text-[#181B20]">
                      All sorts of company related services
                    </div>
                  </div>
                </div>
                <a
                  href={BRAND.phoneHref}
                  className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-[#181B20] px-4 py-2.5 text-xs font-bold text-white hover:bg-[#A41C21] transition-colors shrink-0"
                >
                  <Phone className="h-3.5 w-3.5 text-[#D79A27]" />
                  <span>{BRAND.phoneDisplay}</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. CAPABILITY RIBBON */}
      <section className="border-y border-[#E6DFD3] bg-[#181B20] text-white">
        <div className="container-fluid py-3.5 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs sm:text-[13px] font-semibold tracking-wide">
          {[
            "Company Registration",
            "Secretarial Service",
            "Bookkeeping",
            "Accountancy",
            "Tax, VAT & TIN",
            "HR & Payroll",
            "Websites, POS & Marketing",
          ].map((item, idx) => (
            <span key={item} className="inline-flex items-center gap-5">
              <span className="text-[#F5F2EC]">{item}</span>
              {idx < 6 && (
                <span className="hidden lg:inline-block h-1.5 w-1.5 rounded-full bg-[#D79A27]" />
              )}
            </span>
          ))}
        </div>
      </section>

      {/* 3. FEATURED COMPANY REGISTRATION RS. 32,000 PACKAGE */}
      <section className="py-16 sm:py-20 lg:py-24 bg-[#FAF8F5]">
        <div className="container-fluid">
          <div className="rounded-3xl bg-white border border-[#E6DFD3] shadow-[0_18px_45px_rgba(24,27,32,0.06)] overflow-hidden grid grid-cols-1 lg:grid-cols-12">
            <div className="lg:col-span-7 p-6 sm:p-10 lg:p-12 flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-[#FDF2F2] border border-[#A41C21]/20 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-[#A41C21]">
                    <Award className="h-3.5 w-3.5" />
                    <span>
                      {regBanner?.badgeText ||
                        COMPANY_REGISTRATION_PACKAGE.badge}
                    </span>
                  </span>
                  <span className="inline-flex items-center rounded-full bg-[#D79A27] px-3.5 py-1 text-xs font-extrabold uppercase tracking-wider text-[#181B20]">
                    All For Just {COMPANY_REGISTRATION_PACKAGE.price}
                  </span>
                </div>

                <h2 className="font-display text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#181B20]">
                  {regBanner?.headline || COMPANY_REGISTRATION_PACKAGE.title}
                </h2>

                <p className="text-sm sm:text-base text-[#3D424B] leading-relaxed">
                  {regBanner?.subheadline ||
                    COMPANY_REGISTRATION_PACKAGE.subtitle}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                {COMPANY_REGISTRATION_PACKAGE.features.map((feat) => (
                  <div
                    key={feat}
                    className="flex items-start gap-2.5 rounded-xl bg-[#FAF8F5] border border-[#EFE9DD] px-3.5 py-2.5"
                  >
                    <CheckCircle2 className="h-4.5 w-4.5 shrink-0 text-[#D79A27] mt-0.5" />
                    <span className="text-sm font-medium text-[#181B20]">
                      {feat}
                    </span>
                  </div>
                ))}
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
                <Link
                  href="/services/company-registration"
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#A41C21] px-6 py-3.5 text-sm font-bold text-white hover:bg-[#821318] transition-colors"
                >
                  <span>Full Registration Details</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <a
                  href={`${BRAND.whatsappHref}&text=${encodeURIComponent("Hello Pinnacle Professional Services, I would like to register a Private Limited company under your Rs. 32,000 package.")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#25D366] bg-[#25D366]/10 px-6 py-3.5 text-sm font-bold text-[#146C34] hover:bg-[#25D366] hover:text-white transition-colors"
                >
                  <MessageCircle className="h-4 w-4" />
                  <span>Start via WhatsApp</span>
                </a>
              </div>
            </div>

            <div className="lg:col-span-5 bg-[#F3EFE7] border-t lg:border-t-0 lg:border-l border-[#E6DFD3] p-5 sm:p-8 flex items-center justify-center">
              <div className="relative w-full max-w-[420px] rounded-2xl overflow-hidden shadow-xl border border-[#DFD7C8] bg-white aspect-[2/3]">
                <CmsImage
                  src={
                    regBanner?.imageUrl ||
                    "/images/brand/company-registration-flyer.jpg"
                  }
                  alt={
                    regBanner?.altText ||
                    "Pinnacle Professional Services Rs. 32,000 Company Registration Flyer"
                  }
                  fill
                  sizes="(max-width: 1024px) 100vw, 420px"
                  className="object-cover object-top"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. ALL SERVICES DIRECTORY GRID */}
      <section className="py-16 sm:py-20 lg:py-24 bg-white">
        <div className="container-fluid">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
            <div className="max-w-2xl space-y-3">
              <div className="text-xs font-bold uppercase tracking-[0.16em] text-[#A41C21]">
                Our Wide Range of Solutions
              </div>
              <h2 className="font-display text-3xl sm:text-4xl font-extrabold text-[#181B20]">
                Complete Corporate, Financial & Growth Services
              </h2>
              <p className="text-base text-[#3D424B]">
                Every service is delivered with dedicated personal attention,
                clear statutory precision, and practical commercial advice.
              </p>
            </div>
            <Link
              href="/services"
              className="inline-flex items-center gap-2 self-start rounded-xl border border-[#DFD7C8] bg-[#FAF8F5] px-5 py-3 text-sm font-bold text-[#181B20] hover:border-[#A41C21] hover:text-[#A41C21] transition-colors"
            >
              <span>Explore All Services</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-7">
            {SERVICES.map((srv) => {
              const slot = banners[srv.bannerKey];
              const cardImg =
                slot?.imageUrl || "/images/banners/services-desk-ledger.webp";
              const cardAlt = slot?.altText || srv.title;

              return (
                <article
                  key={srv.slug}
                  className="group flex flex-col rounded-2xl border border-[#E6DFD3] bg-white overflow-hidden shadow-[0_6px_24px_rgba(24,27,32,0.04)] hover:shadow-[0_18px_40px_rgba(24,27,32,0.09)] hover:border-[#D79A27] transition-all duration-200"
                >
                  <div className="relative h-48 w-full overflow-hidden bg-[#F3EFE7]">
                    <CmsImage
                      src={cardImg}
                      alt={cardAlt}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#181B20]/65 via-transparent to-transparent" />
                    <div className="absolute top-3.5 left-3.5 inline-flex items-center gap-1.5 rounded-full bg-white/95 backdrop-blur-sm px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-[#A41C21] shadow-sm">
                      <span>{srv.category}</span>
                    </div>
                    <div className="absolute bottom-3.5 left-3.5 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[#A41C21] text-white shadow-md">
                      <ServiceIcon name={srv.iconName} className="h-5 w-5" />
                    </div>
                  </div>

                  <div className="flex-1 p-6 flex flex-col justify-between space-y-5">
                    <div className="space-y-3">
                      <h3 className="font-display text-xl font-bold text-[#181B20] group-hover:text-[#A41C21] transition-colors">
                        <Link href={`/services/${srv.slug}`}>{srv.title}</Link>
                      </h3>
                      <p className="text-sm text-[#3D424B] leading-relaxed">
                        {srv.summary}
                      </p>
                      <ul className="space-y-1.5 pt-1">
                        {srv.highlights.slice(0, 3).map((hl) => (
                          <li
                            key={hl}
                            className="flex items-start gap-2 text-xs font-medium text-[#4F5560]"
                          >
                            <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#D79A27]" />
                            <span>{hl}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="pt-4 border-t border-[#EFE9DD] flex items-center justify-between gap-2">
                      <span className="text-xs font-semibold text-[#B57B15]">
                        {srv.startingNote}
                      </span>
                      <Link
                        href={`/services/${srv.slug}`}
                        className="inline-flex items-center gap-1.5 text-sm font-bold text-[#A41C21] hover:text-[#821318]"
                      >
                        <span>Learn More</span>
                        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                      </Link>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* 5. ABOUT & WHY PINNACLE + PROCESS */}
      <section className="py-16 sm:py-20 lg:py-24 bg-[#FAF8F5] border-y border-[#E6DFD3]">
        <div className="container-fluid space-y-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
            <div className="lg:col-span-6">
              <div className="relative rounded-3xl overflow-hidden border border-[#E6DFD3] shadow-xl aspect-[16/10] bg-white">
                <CmsImage
                  src={
                    aboutBanner?.imageUrl ||
                    "/images/banners/about-team-advisory.webp"
                  }
                  alt={
                    aboutBanner?.altText ||
                    "Pinnacle Professional Services Advisory Team"
                  }
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover"
                />
              </div>
            </div>

            <div className="lg:col-span-6 space-y-5">
              <div className="text-xs font-bold uppercase tracking-[0.16em] text-[#B57B15]">
                {aboutBanner?.badgeText || "Dehiwala, Colombo Advisory Firm"}
              </div>
              <h2 className="font-display text-3xl sm:text-4xl font-extrabold text-[#181B20]">
                {aboutBanner?.headline ||
                  "Everything You Need to Start and Scale Right"}
              </h2>
              <p className="text-base text-[#3D424B] leading-relaxed">
                {aboutBanner?.subheadline ||
                  "Combining statutory company secretarial precision with practical accounting, IRD tax strategy, and modern digital tools."}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                {[
                  {
                    icon: ShieldCheck,
                    title: "Single-Roof Coordination",
                    desc: "Your company secretary, accountant, tax advisor, and HR specialist share one synchronized workflow.",
                  },
                  {
                    icon: Clock,
                    title: "Transparent Turnaround",
                    desc: "Clear timelines, upfront Rs. 32,000 incorporation pricing, and zero surprise statutory penalties.",
                  },
                ].map((card) => (
                  <div
                    key={card.title}
                    className="rounded-2xl bg-white border border-[#E6DFD3] p-5 space-y-2"
                  >
                    <card.icon className="h-6 w-6 text-[#A41C21]" />
                    <h3 className="font-display text-base font-bold text-[#181B20]">
                      {card.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-[#4F5560] leading-relaxed">
                      {card.desc}
                    </p>
                  </div>
                ))}
              </div>

              <div className="pt-2">
                <Link
                  href="/about"
                  className="inline-flex items-center gap-2 rounded-xl bg-[#181B20] px-6 py-3.5 text-sm font-bold text-white hover:bg-[#A41C21] transition-colors"
                >
                  <span>About Pinnacle Professional Services</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>

          {/* 4-Step Workflow */}
          <div className="space-y-8">
            <div className="text-center max-w-2xl mx-auto space-y-2">
              <div className="text-xs font-bold uppercase tracking-[0.16em] text-[#A41C21]">
                Simple Client Onboarding
              </div>
              <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-[#181B20]">
                From First Call to Full Compliance in 4 Clear Steps
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {PROCESS_STEPS.map((item) => (
                <div
                  key={item.step}
                  className="rounded-2xl bg-white border border-[#E6DFD3] p-6 space-y-3 relative overflow-hidden"
                >
                  <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[#FDF2F2] text-sm font-extrabold text-[#A41C21] border border-[#A41C21]/15">
                    {item.step}
                  </div>
                  <h3 className="font-display text-lg font-bold text-[#181B20]">
                    {item.title}
                  </h3>
                  <p className="text-sm text-[#4F5560] leading-relaxed">
                    {item.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 6. LATEST BLOG INSIGHTS */}
      <section className="py-16 sm:py-20 lg:py-24 bg-white">
        <div className="container-fluid">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
            <div className="max-w-2xl space-y-2.5">
              <div className="text-xs font-bold uppercase tracking-[0.16em] text-[#A41C21]">
                Knowledge Hub
              </div>
              <h2 className="font-display text-3xl sm:text-4xl font-extrabold text-[#181B20]">
                Sri Lankan Business, Tax & Compliance Insights
              </h2>
              <p className="text-base text-[#3D424B]">
                Practical guides written by our Colombo corporate and taxation
                specialists to keep your business informed.
              </p>
            </div>
            <Link
              href="/blog"
              className="inline-flex items-center gap-2 self-start rounded-xl border border-[#DFD7C8] bg-[#FAF8F5] px-5 py-3 text-sm font-bold text-[#181B20] hover:border-[#A41C21] hover:text-[#A41C21] transition-colors"
            >
              <span>Read All Articles</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-7">
            {blogs.map((post) => (
              <article
                key={post.id}
                className="group flex flex-col rounded-2xl border border-[#E6DFD3] bg-white overflow-hidden hover:shadow-lg hover:border-[#D79A27] transition-all"
              >
                <Link
                  href={`/blog/${post.slug}`}
                  className="relative h-52 w-full overflow-hidden bg-[#F3EFE7] block"
                >
                  <CmsImage
                    src={post.coverImage}
                    alt={post.coverAlt || post.title}
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                </Link>
                <div className="flex-1 p-6 flex flex-col justify-between space-y-4">
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between gap-2 text-xs">
                      <span className="font-bold uppercase tracking-wider text-[#A41C21]">
                        {post.category}
                      </span>
                      <span className="text-[#646B76]">{post.readTime}</span>
                    </div>
                    <h3 className="font-display text-lg font-bold text-[#181B20] group-hover:text-[#A41C21] transition-colors line-clamp-2">
                      <Link href={`/blog/${post.slug}`}>{post.title}</Link>
                    </h3>
                    <p className="text-sm text-[#4F5560] line-clamp-3 leading-relaxed">
                      {post.excerpt}
                    </p>
                  </div>
                  <Link
                    href={`/blog/${post.slug}`}
                    className="inline-flex items-center gap-1.5 text-sm font-bold text-[#A41C21]"
                  >
                    <span>Read Guide</span>
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* 7. FAQ SECTION */}
      <section className="py-16 sm:py-20 bg-[#FAF8F5] border-t border-[#E6DFD3]">
        <div className="container-fluid max-w-4xl">
          <div className="text-center space-y-2.5 mb-10">
            <div className="text-xs font-bold uppercase tracking-[0.16em] text-[#B57B15]">
              Clear Answers
            </div>
            <h2 className="font-display text-3xl sm:text-4xl font-extrabold text-[#181B20]">
              Frequently Asked Questions
            </h2>
          </div>
          <HomeFaq items={HOME_FAQS} />
        </div>
      </section>

      {/* 8. BOTTOM CTA & LOCATION BANNER */}
      <section className="relative overflow-hidden bg-[#181B20] text-white py-16 sm:py-20">
        <div className="absolute inset-0 opacity-20">
          <CmsImage
            src={
              ctaBanner?.imageUrl || "/images/banners/hero-office-colombo.webp"
            }
            alt={ctaBanner?.altText || "Pinnacle Office Consultation"}
            fill
            sizes="100vw"
            className="object-cover"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-r from-[#181B20] via-[#181B20]/95 to-[#A41C21]/75" />

        <div className="container-fluid relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-7 space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#D79A27]/50 bg-[#D79A27]/15 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-[#E8B84B]">
              <span>{ctaBanner?.badgeText || "Direct Partner Access"}</span>
            </div>
            <h2 className="font-display text-3xl sm:text-4xl font-extrabold leading-tight">
              {ctaBanner?.headline ||
                "Ready to Register or Streamline Your Accounts?"}
            </h2>
            <p className="text-base text-[#D9D5CD] max-w-2xl leading-relaxed">
              {ctaBanner?.subheadline ||
                "Speak directly with our Colombo advisory desk on 077 302 8033 or visit No 15, Samagi Mawatha, Kawdana Road, Dehiwala."}
            </p>
            <div className="flex flex-wrap items-center gap-4 text-sm text-[#E8E4DC] pt-1">
              <span className="inline-flex items-center gap-2">
                <MapPin className="h-4 w-4 text-[#D79A27]" />
                <span>{BRAND.address}</span>
              </span>
            </div>
          </div>

          <div className="lg:col-span-5 flex flex-col sm:flex-row lg:flex-col xl:flex-row gap-3.5 lg:justify-end">
            <Link
              href={ctaBanner?.ctaHref || "/contact"}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#A41C21] px-6 py-4 text-sm font-bold text-white shadow-lg hover:bg-[#821318] transition-colors"
            >
              <span>{ctaBanner?.ctaLabel || "Schedule a Free Consultation"}</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
            <a
              href={BRAND.whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#25D366] px-6 py-4 text-sm font-bold text-white shadow-lg hover:bg-[#1EBE5B] transition-colors"
            >
              <MessageCircle className="h-5 w-5" />
              <span>WhatsApp 077 302 8033</span>
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
