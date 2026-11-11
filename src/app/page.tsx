import type { Metadata } from "next";
import {
  getBannerMap,
  getPublishedBlogs,
  getSeoSettings,
} from "@/lib/db";
import { HomeViewClient } from "@/components/views/HomeViewClient";

export const dynamic = "force-static";

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

export default function HomePage() {
  const banners = getBannerMap();
  const blogs = getPublishedBlogs().slice(0, 3);

  return (
    <HomeViewClient
      initialBanners={banners}
      initialBlogs={blogs}
      faqs={HOME_FAQS}
    />
  );
}
