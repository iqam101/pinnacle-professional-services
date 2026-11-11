import type { Metadata } from "next";
import { getPublishedBlogs, getSeoSettings } from "@/lib/db";
import { BlogListClient } from "@/components/BlogListClient";

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  const seo = getSeoSettings();
  const blogSeo = seo.pageOverrides?.blog;
  const title =
    blogSeo?.title || "Insights & Compliance Guides for Sri Lankan Businesses";
  const description = blogSeo?.description || seo.defaultDescription;

  return {
    title,
    description,
    keywords: (blogSeo?.keywords || seo.defaultKeywords)
      .split(",")
      .map((k) => k.trim())
      .filter(Boolean),
    alternates: { canonical: "/blog" },
    openGraph: {
      title,
      description,
      url: "/blog",
      images: blogSeo?.ogImage ? [{ url: blogSeo.ogImage }] : undefined,
    },
  };
}

export default function BlogIndexPage() {
  const posts = getPublishedBlogs();

  return (
    <div className="bg-white">
      <section className="bg-[#FAF8F5] border-b border-[#E6DFD3] py-14 sm:py-16">
        <div className="container-fluid max-w-3xl text-center space-y-3">
          <div className="text-xs font-bold uppercase tracking-[0.16em] text-[#A41C21]">
            Pinnacle Knowledge Hub
          </div>
          <h1 className="font-display text-3xl sm:text-5xl font-extrabold text-[#181B20]">
            Business, Tax & Compliance Insights
          </h1>
          <p className="text-base text-[#3D424B] leading-relaxed">
            Practical Sri Lankan guides on eROC company registration, IRD VAT &
            TIN rules, monthly SME bookkeeping, and EPF/ETF payroll compliance.
          </p>
        </div>
      </section>

      <section className="py-14 sm:py-18">
        <div className="container-fluid">
          <BlogListClient posts={posts} />
        </div>
      </section>
    </div>
  );
}
